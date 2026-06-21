from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken


class AuthApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_register_user_creates_account(self):
        response = self.client.post('/api/auth/register/', {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'secure123456',
            'password_confirm': 'secure123456',
        })

        self.assertEqual(response.status_code, 201)
        self.assertIn('tokens', response.json())
        self.assertIn('access', response.json()['tokens'])
        self.assertNotIn('refresh', response.json()['tokens'], 'Refresh token should not be in response body')
        self.assertIn('refresh_token', response.cookies, 'Refresh token should be in httpOnly cookie')

    def test_register_user_password_mismatch(self):
        response = self.client.post('/api/auth/register/', {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'secure123456',
            'password_confirm': 'different',
        })

        self.assertEqual(response.status_code, 400)
        self.assertIn('password', response.json())

    def test_login_user_returns_tokens(self):
        password = 'test-password-123'
        User.objects.create_user(username='existing', password=password)

        response = self.client.post('/api/auth/login/', {
            'username': 'existing',
            'password': password,
        })

        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.json())
        self.assertNotIn('refresh', response.json(), 'Refresh token should not be in response body')
        self.assertIn('refresh_token', response.cookies, 'Refresh token should be in httpOnly cookie')

    def test_refresh_token_returns_new_access_token(self):
        """Verify /api/auth/refresh/ returns a new access token from a valid refresh token."""
        password = 'test-password-123'
        User.objects.create_user(username='refresher', password=password)

        login_response = self.client.post('/api/auth/login/', {
            'username': 'refresher',
            'password': password,
        })
        self.assertEqual(login_response.status_code, 200)
        refresh_token = login_response.cookies.get('refresh_token')
        self.assertIsNotNone(refresh_token, 'Expected refresh_token cookie after login')

        # Refresh the access token
        self.client.cookies['refresh_token'] = refresh_token.value
        refresh_response = self.client.post('/api/auth/refresh/')
        self.assertEqual(refresh_response.status_code, 200)
        self.assertIn('access', refresh_response.json())
        self.assertNotIn('refresh', refresh_response.json(), 'Refresh token should not be in response body')

    def test_logout_user_blacklists_token(self):
        password = 'test-password-123'
        user = User.objects.create_user(username='testuser', password=password)
        refresh = RefreshToken.for_user(user)

        self.client.cookies['refresh_token'] = str(refresh)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {str(refresh.access_token)}')

        response = self.client.post('/api/auth/logout/')

        self.assertEqual(response.status_code, 200)

        self.client.cookies['refresh_token'] = str(refresh)
        refresh_response = self.client.post('/api/auth/refresh/')
        self.assertIn(refresh_response.status_code, [400, 401])

    def test_current_user_requires_authentication(self):
        response = self.client.get('/api/auth/me/')
        self.assertEqual(response.status_code, 401)

    def test_current_user_returns_authenticated_user(self):
        password = 'test-password-123'
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password=password,
        )
        refresh = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {str(refresh.access_token)}')

        response = self.client.get('/api/auth/me/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['username'], 'testuser')

    def test_migrate_guest_data_requires_authentication(self):
        response = self.client.post('/api/auth/migrate-guest/', {
            'device_id': 'device123',
        })

        self.assertEqual(response.status_code, 401)

    def test_migrate_guest_data_returns_migration_summary(self):
        password = 'test-password-123'
        user = User.objects.create_user(username='testuser', password=password)
        refresh = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {str(refresh.access_token)}')

        response = self.client.post('/api/auth/migrate-guest/', {
            'device_id': 'device123',
            'recent_cards': [{'id': 1, 'name': 'Dark Magician'}],
        }, format='json')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['migrated_cards'], 1)