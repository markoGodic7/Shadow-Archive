from unittest.mock import Mock, patch

import requests
from django.core.cache import cache
from django.test import SimpleTestCase

from src.apps.cards.services import RateLimiter, YGOProDeckClient


class RateLimiterTests(SimpleTestCase):
    def setUp(self):
        cache.clear()

    def test_request_with_retry_raises_after_failures(self):
        limiter = RateLimiter(max_rate=1)
        limiter.acquire = Mock(return_value=None)

        def fail():
            raise requests.exceptions.RequestException('boom')

        with patch('time.sleep', return_value=None):
            with self.assertRaises(requests.exceptions.RequestException):
                limiter.request_with_retry(fail)

    def test_client_uses_cache_and_search_helpers(self):
        client = YGOProDeckClient(base_url='https://example.test/api/v7/')

        with patch.object(client, '_make_request', return_value={'data': [{'id': 1}]}) as make_request:
            self.assertEqual(client.search_cards(name='Dark'), {'data': [{'id': 1}]})
            self.assertEqual(client.card_by_id(1), {'data': [{'id': 1}]})
            make_request.assert_called()

    def test_make_request_returns_cached_response(self):
        client = YGOProDeckClient(base_url='https://example.test/api/v7/')
        cached = {'data': [{'id': 99}]}

        with patch('src.apps.cards.services.cache.get', return_value=cached):
            with patch('src.apps.cards.services._rate_limiter.request_with_retry') as retry:
                result = client._make_request('cardinfo.php', params={'name': 'Dark'})

        self.assertEqual(result, cached)
        retry.assert_not_called()

    @patch('src.apps.cards.services.requests.get')
    def test_make_request_fetches_and_caches(self, mock_get):
        client = YGOProDeckClient(base_url='https://example.test/api/v7/')
        response = Mock()
        response.raise_for_status.return_value = None
        response.json.return_value = {'data': [{'id': 2}]}
        mock_get.return_value = response

        with patch('src.apps.cards.services._rate_limiter') as limiter:
            limiter.request_with_retry.side_effect = lambda func: func()

            result = client._make_request('cardinfo.php', params={'name': 'Blue'})

        self.assertEqual(result['data'][0]['id'], 2)
        self.assertTrue(cache.get('ygoprodeck:https://example.test/api/v7/cardinfo.php:name=Blue'))

    @patch('src.apps.cards.services.requests.get')
    def test_random_card_uses_rate_limiter(self, mock_get):
        client = YGOProDeckClient(base_url='https://example.test/api/v7/')
        response = Mock()
        response.raise_for_status.return_value = None
        response.json.return_value = {'data': [{'id': 3}]}
        mock_get.return_value = response

        with patch('src.apps.cards.services._rate_limiter') as limiter:
            limiter.request_with_retry.side_effect = lambda func: func()

            result = client.random_card()

        self.assertEqual(result['data'][0]['id'], 3)
