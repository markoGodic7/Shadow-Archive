from django.test import SimpleTestCase
from django.urls import resolve

from src.urls import health_check


class FoundationBootstrapTests(SimpleTestCase):
    def test_health_endpoint_returns_ok(self):
        response = self.client.get('/api/health/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['status'], 'ok')

    def test_root_url_resolves_to_health_view(self):
        match = resolve('/')

        self.assertEqual(match.func, health_check)
