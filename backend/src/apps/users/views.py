from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import (
    GuestMigrationSerializer,
    UserDetailSerializer,
    UserLoginSerializer,
    UserRegistrationSerializer,
)


class UserLoginView(TokenObtainPairView):
    serializer_class = UserLoginSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserDetailSerializer(user).data,
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            },
        }, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    try:
        refresh_token = request.data.get('refresh')
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'detail': 'Logout successful.'}, status=status.HTTP_200_OK)
    except Exception as exc:
        return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    return Response(UserDetailSerializer(request.user).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def migrate_guest_data(request):
    serializer = GuestMigrationSerializer(data=request.data)
    if serializer.is_valid():
        device_id = serializer.validated_data['device_id']
        recent_cards = serializer.validated_data.get('recent_cards', [])

        return Response({
            'user': UserDetailSerializer(request.user).data,
            'migrated_cards': len(recent_cards),
            'device_id': device_id,
        }, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
