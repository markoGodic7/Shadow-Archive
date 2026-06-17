from rest_framework_simplejwt.authentication import JWTAuthentication


class ShadowArchiveJWTAuthentication(JWTAuthentication):
    """Thin wrapper around DRF SimpleJWT for the Shadow Archive backend."""

    def authenticate(self, request):
        return super().authenticate(request)
