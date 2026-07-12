from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.authtoken.views import obtain_auth_token
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.throttling import AnonRateThrottle
from django.contrib.auth.models import User


# Anonymous users can only attempt login or registration 10 times per minute
class LoginRateThrottle(AnonRateThrottle):
    rate = '10/minute'


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([LoginRateThrottle])
def register_view(request):
    """Allow new users to self-register."""
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '')

    if not username or not password:
        return Response(
            {'error': 'Username and password are required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if len(password) < 8:
        return Response(
            {'error': 'Password must be at least 8 characters.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(username=username).exists():
        return Response(
            {'error': 'A user with that username already exists.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = User.objects.create_user(username=username, password=password)
    token, _ = Token.objects.get_or_create(user=user)
    return Response({'token': token.key, 'username': user.username}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Invalidate the user's auth token."""
    request.user.auth_token.delete()
    return Response({'detail': 'Successfully logged out.'}, status=status.HTTP_200_OK)


urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth endpoints
    path('api/auth/login/', obtain_auth_token, name='api_token_auth'),
    path('api/auth/register/', register_view, name='api_register'),
    path('api/auth/logout/', logout_view, name='api_logout'),

    # Feature endpoints
    path('api/tasks/', include('tasks.urls')),
    path('api/annotations/', include('annotations.urls')),
]

# Serve uploaded media files — in dev AND in Render production
# (Render uses a persistent disk at /media on the same dyno, so this is safe)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
