import os
from urllib.parse import urlencode

import requests


class YGOProDeckClient:
    """Small client wrapper for the YGOPRODeck API."""

    def __init__(self, base_url=None, timeout=5):
        self.base_url = base_url or os.environ.get('YGOPRODECK_API_BASE_URL', 'https://db.ygoprodeck.com/api/v7/')
        self.timeout = timeout

    def search_cards(self, name=''):
        params = {'name': name} if name else {}
        url = f"{self.base_url.rstrip('/')}/cardinfo.php"
        response = requests.get(url, params=params, timeout=self.timeout)
        response.raise_for_status()
        return response.json()

    def card_by_id(self, card_id):
        url = f"{self.base_url.rstrip('/')}/cardinfo.php"
        response = requests.get(url, params={'id': card_id}, timeout=self.timeout)
        response.raise_for_status()
        return response.json()
