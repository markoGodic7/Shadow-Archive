from rest_framework_simplejwt.authentication import JWTAuthentication


class DuelArchiveJWTAuthentication(JWTAuthentication):
    """Thin wrapper around DRF SimpleJWT for the Duel Archive backend."""

    def authenticate(self, request):
        return super().authenticate(request)
