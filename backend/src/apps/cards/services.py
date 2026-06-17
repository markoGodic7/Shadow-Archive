import os
import time
import logging
from urllib.parse import urlencode

import requests
from django.core.cache import cache
from django.core.exceptions import ImproperlyConfigured

logger = logging.getLogger(__name__)


class RateLimiter:
    """Simple token-bucket rate limiter to stay below 15 req/s."""

    def __init__(self, max_rate=15):
        self.max_rate = max_rate
        self.tokens = max_rate
        self.last_refill = time.monotonic()
        self.retry_delays = [1, 2, 4, 8]  # Exponential backoff with jitter

    def acquire(self):
        """Block until a request token is available."""
        now = time.monotonic()
        elapsed = now - self.last_refill
        self.tokens = min(self.max_rate, self.tokens + elapsed * self.max_rate)
        self.last_refill = now

        if self.tokens >= 1.0:
            self.tokens -= 1.0
            return

        # Calculate wait time
        wait = (1.0 - self.tokens) / self.max_rate
        time.sleep(wait)
        self.tokens = 0.0
        self.last_refill = time.monotonic()

    def request_with_retry(self, request_func, *args, **kwargs):
        """Execute a request with exponential backoff on failure."""
        last_exception = None
        for attempt, delay in enumerate(self.retry_delays):
            try:
                self.acquire()
                return request_func(*args, **kwargs)
            except requests.exceptions.RequestException as e:
                last_exception = e
                logger.warning(
                    "YGOPRODeck request failed (attempt %d/%d): %s",
                    attempt + 1, len(self.retry_delays), e
                )
                if attempt < len(self.retry_delays) - 1:
                    time.sleep(delay)
        raise last_exception


# Module-level rate limiter (shared across all instances)
_rate_limiter = RateLimiter(max_rate=15)


class YGOProDeckClient:
    """Client wrapper for the YGOPRODeck API with caching and rate limiting."""

    CACHE_TTL = 48 * 60 * 60  # 48 hours in seconds

    def __init__(self, base_url=None, timeout=5):
        self.base_url = base_url or os.environ.get(
            'YGOPRODECK_API_BASE_URL', 'https://db.ygoprodeck.com/api/v7/'
        )
        self.timeout = timeout
        self.user_agent = os.environ.get(
            'YGOPRODECK_USER_AGENT', 'ShadowArchive/1.0'
        )

    def _build_url(self, endpoint):
        """Construct full API URL for an endpoint."""
        return f"{self.base_url.rstrip('/')}/{endpoint}"

    def _make_request(self, endpoint, params=None):
        """Make a rate-limited, cached request to the YGOPRODeck API."""
        url = self._build_url(endpoint)
        cache_key = f"ygoprodeck:{url}:{urlencode(sorted(params.items())) if params else ''}"

        # Check cache first
        cached = cache.get(cache_key)
        if cached is not None:
            logger.debug("Cache hit for %s", cache_key)
            return cached

        def do_request():
            headers = {'User-Agent': self.user_agent}
            response = requests.get(
                url, params=params, timeout=self.timeout, headers=headers
            )
            response.raise_for_status()
            return response.json()

        # Execute with rate limiting and retry
        data = _rate_limiter.request_with_retry(do_request)

        # Cache the response
        cache.set(cache_key, data, timeout=self.CACHE_TTL)
        logger.debug("Cached response for %s (TTL: %ds)", cache_key, self.CACHE_TTL)

        return data

    def search_cards(self, **filters):
        """Search cards with optional filters. Accepts keyword arguments matching API params."""
        return self._make_request('cardinfo.php', params=filters if filters else None)

    def card_by_id(self, card_id):
        """Fetch a single card by its YGOPRODeck ID."""
        return self._make_request('cardinfo.php', params={'id': card_id})

    def random_card(self):
        """Fetch a random card. Not cached per API rules."""
        def do_request():
            headers = {'User-Agent': self.user_agent}
            response = requests.get(
                self._build_url('randomcard.php'),
                timeout=self.timeout,
                headers=headers
            )
            response.raise_for_status()
            return response.json()

        return _rate_limiter.request_with_retry(do_request)