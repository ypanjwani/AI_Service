from django.urls import path
from .views import (
    InitiateRegisterView, VerifyRegisterView,
    LoginView, MeView, LogoutView, GoogleAuthView, ProfileView, RefreshView,
    PasswordResetRequestView, PasswordResetConfirmView,
)

urlpatterns = [
    path('register/initiate',        InitiateRegisterView.as_view(),     name='register-initiate'),
    path('register/verify',          VerifyRegisterView.as_view(),       name='register-verify'),
    path('login',                    LoginView.as_view(),                name='login'),
    path('me',                       MeView.as_view(),                   name='me'),
    path('logout',                   LogoutView.as_view(),               name='logout'),
    path('refresh',                  RefreshView.as_view(),              name='refresh'),
    path('google',                   GoogleAuthView.as_view(),           name='google-auth'),
    path('profile',                  ProfileView.as_view(),              name='profile'),
    path('password-reset/request',   PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('password-reset/confirm',   PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
]
