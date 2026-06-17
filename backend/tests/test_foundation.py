from django.test import TestCase
from django.conf import settings
from rest_framework_simplejwt.authentication import JWTAuthentication


class JWTAuthBootstrapTests(TestCase):
    """Tests for JWT authentication setup and configuration."""

    def test_jwt_auth_class_configured(self):
        """Verify JWTAuthentication is in default auth classes."""
        auth_classes = settings.REST_FRAMEWORK['DEFAULT_AUTHENTICATION_CLASSES']
        self.assertIn(JWTAuthentication, auth_classes)

    def test_jwt_token_lifetime_configured(self):
        """Verify access token lifetime is set."""
        self.assertTrue(hasattr(settings, 'SIMPLE_JWT'))
        self.assertIn('ACCESS_TOKEN_LIFETIME', settings.SIMPLE_JWT)

    def test_refresh_token_lifetime_configured(self):
        """Verify refresh token lifetime is set."""
        self.assertIn('REFRESH_TOKEN_LIFETIME', settings.SIMPLE_JWT)

    def test_token_blacklist_app_registered(self):
        """Verify token blacklist app is in INSTALLED_APPS."""
        self.assertIn(
            'rest_framework_simplejwt.token_blacklist',
            settings.INSTALLED_APPS
        )

    def test_blacklist_after_rotation_enabled(self):
        """Verify blacklist after rotation is active."""
        self.assertTrue(settings.SIMPLE_JWT.get('BLACKLIST_AFTER_ROTATION'))

    def test_rotate_refresh_tokens_enabled(self):
        """Verify token rotation is active."""
        self.assertTrue(settings.SIMPLE_JWT.get('ROTATE_REFRESH_TOKENS'))