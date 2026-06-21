from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    UserLoginView,
    current_user,
    logout_user,
    migrate_guest_data,
    register_user,
)

urlpatterns = [
    path('auth/register/', register_user, name='user-register'),
    path('auth/login/', UserLoginView.as_view(), name='user-login'),
    path('auth/logout/', logout_user, name='user-logout'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('auth/me/', current_user, name='current-user'),
    path('auth/migrate-guest/', migrate_guest_data, name='guest-migration'),
]
