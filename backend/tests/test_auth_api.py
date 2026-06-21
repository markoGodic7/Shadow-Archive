from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient


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
        self.assertIn('refresh', response.json()['tokens'])

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
        User.objects.create_user(username='existing', password='password123')

        response = self.client.post('/api/auth/login/', {
            'username': 'existing',
            'password': 'password123',
        })

        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.json())
        self.assertIn('refresh', response.json())

    def test_logout_user_blacklists_token(self):
        user = User.objects.create_user(username='testuser', password='password123')
        from rest_framework_simplejwt.tokens import RefreshToken

        refresh = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {str(refresh.access_token)}')

        response = self.client.post('/api/auth/logout/', {
            'refresh': str(refresh),
        })

        self.assertEqual(response.status_code, 200)

    def test_current_user_requires_authentication(self):
        response = self.client.get('/api/auth/me/')

        self.assertEqual(response.status_code, 401)

    def test_current_user_returns_authenticated_user(self):
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='password123',
        )
        from rest_framework_simplejwt.tokens import RefreshToken

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
        user = User.objects.create_user(username='testuser', password='password123')
        from rest_framework_simplejwt.tokens import RefreshToken

        refresh = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {str(refresh.access_token)}')

        response = self.client.post('/api/auth/migrate-guest/', {
            'device_id': 'device123',
            'recent_cards': [{'id': 1, 'name': 'Dark Magician'}],
        }, format='json')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['migrated_cards'], 1)
