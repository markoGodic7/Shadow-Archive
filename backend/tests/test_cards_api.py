from unittest.mock import patch

from django.test import SimpleTestCase
from rest_framework.test import APIClient


class CardApiTests(SimpleTestCase):
    def setUp(self):
        self.client = APIClient()

    @patch('src.apps.cards.views.YGOProDeckClient')
    def test_search_cards_returns_paginated_results(self, mock_client_cls):
        mock_client = mock_client_cls.return_value
        mock_client.search_cards.return_value = {'data': [{'id': 1, 'name': 'Dark Magician'}]}

        response = self.client.get('/api/cards/search/', {'q': 'dark', 'page': 1, 'limit': 10})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['results'][0]['name'], 'Dark Magician')
        self.assertEqual(response.json()['total'], 1)

    @patch('src.apps.cards.views.YGOProDeckClient')
    def test_card_detail_returns_card_payload(self, mock_client_cls):
        mock_client = mock_client_cls.return_value
        mock_client.card_by_id.return_value = {'data': [{'id': 7, 'name': 'Blue-Eyes'}]}

        response = self.client.get('/api/cards/7/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['name'], 'Blue-Eyes')
