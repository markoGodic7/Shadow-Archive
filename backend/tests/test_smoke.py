from django.test import SimpleTestCase


class SmokeTest(SimpleTestCase):
    def test_django_boots(self):
        self.assertTrue(True)
