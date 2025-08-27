# This file defines the URL routes for the 'users' app. It includes
# endpoints for user registration, token-based authentication, and
# retrieving the authenticated user's profile.
#
from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from .views import UserCreateView, UserProfileView, UserDetailView

urlpatterns = [
    # Endpoint for user registration
    path('register/', UserCreateView.as_view(), name='user_register'),

    # Endpoints for token-based authentication
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),

    # Endpoint to retrieve the authenticated user's profile
    path('me/', UserProfileView.as_view(), name='user_profile'),

    # Optional endpoint to retrieve a specific user by ID (for admins)
    path('<int:pk>/', UserDetailView.as_view(), name='user_detail'),
]