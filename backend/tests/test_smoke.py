from django.test import SimpleTestCase


class SmokeTest(SimpleTestCase):
    def test_django_boots(self):
        response = self.client.get("/")
        self.assertLess(response.status_code, 500)
