import jwt

from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import AllowAny, IsAuthenticated
from django_ratelimit.core import is_ratelimited

_TOO_MANY = Response(
    {'status': 'error', 'message': 'Too many requests. Please try again later.'},
    status=429,
)

def _rate_limited(request, group, rate):
    return is_ratelimited(request, group=group, key='ip', rate=rate, method='POST', increment=True)

from .models import User as AppUser
from .serializers import (
    RegisterSerializer, LoginSerializer, UserResponseSerializer,
    ProfileUpdateSerializer, VerifyRegisterSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
)
from .services import (
    initiate_registration, verify_registration_otp,
    login_user, google_auth_user, generate_jwt,
    request_password_reset, confirm_password_reset,
    EmailAlreadyExistsError, InvalidCredentialsError, InvalidGoogleTokenError,
    OTPDeliveryError, OTPInvalidError, OTPExpiredError, OTPMaxAttemptsError, OTPMismatchError,
    PasswordResetInvalidError, PasswordResetExpiredError, ResetEmailDeliveryError,
)
from .repositories import update_user_phone, invalidate_user_tokens


def _format_errors(errors: dict) -> list:
    """Flatten DRF's nested error dict → [{field, message}] for the frontend."""
    result = []
    for field, messages in errors.items():
        if isinstance(messages, list):
            msg = messages[0] if messages else ''
            if isinstance(msg, dict):
                result.extend(_format_errors(msg))
                continue
        elif isinstance(messages, dict):
            result.extend(_format_errors(messages))
            continue
        else:
            msg = str(messages)
        result.append({'field': field, 'message': str(msg)})
    return result


# ══════════════════════════════════════════════════════════════
#  POST /api/auth/register/initiate
# ══════════════════════════════════════════════════════════════

class InitiateRegisterView(APIView):
    """
    Step 1 of registration: validate form, send OTPs via email & SMS.
    Returns a session token that must be passed to /register/verify.
    In DEBUG mode the response also contains _debug.email_otp & _debug.phone_otp.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        if _rate_limited(request, 'register_initiate', '5/h'):
            return Response(
                {'status': 'error', 'message': 'Too many registration attempts. Try again in an hour.'},
                status=429,
            )

        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'status': 'error', 'message': 'Validation failed',
                 'errors': _format_errors(serializer.errors)},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        try:
            token, email_otp, phone_otp = initiate_registration(serializer.validated_data)
        except EmailAlreadyExistsError as exc:
            return Response(
                {'status': 'error', 'message': str(exc)},
                status=status.HTTP_409_CONFLICT,
            )
        except OTPDeliveryError as exc:
            return Response(
                {'status': 'error', 'message': str(exc)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        response_data = {'status': 'success', 'token': token}
        if settings.DEBUG:
            response_data['_debug'] = {'email_otp': email_otp, 'phone_otp': phone_otp}

        return Response(response_data, status=status.HTTP_200_OK)


# ══════════════════════════════════════════════════════════════
#  POST /api/auth/register/verify
# ══════════════════════════════════════════════════════════════

class VerifyRegisterView(APIView):
    """
    Step 2 of registration: verify both OTPs, create account, set JWT cookie.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        if _rate_limited(request, 'register_verify', '10/h'):
            return _TOO_MANY

        serializer = VerifyRegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'status': 'error', 'message': 'Validation failed',
                 'errors': _format_errors(serializer.errors)},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        try:
            user, jwt_token = verify_registration_otp(
                serializer.validated_data['token'],
                serializer.validated_data['email_otp'],
                serializer.validated_data['phone_otp'],
            )
        except (OTPInvalidError, OTPExpiredError, OTPMaxAttemptsError) as exc:
            return Response(
                {'status': 'error', 'message': str(exc), 'restart': True},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except OTPMismatchError as exc:
            return Response(
                {'status': 'error', 'message': 'Incorrect verification code(s)',
                 'errors': exc.field_errors, 'remaining': exc.remaining},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )
        except EmailAlreadyExistsError as exc:
            return Response(
                {'status': 'error', 'message': str(exc)},
                status=status.HTTP_409_CONFLICT,
            )

        response = Response(
            {'status': 'success', 'message': 'Account created successfully',
             'data': UserResponseSerializer(user).data},
            status=status.HTTP_201_CREATED,
        )
        response.set_cookie(
            key      = 'access_token',
            value    = jwt_token,
            httponly = True,
            samesite = 'Lax',
            secure   = not settings.DEBUG,
            max_age  = settings.JWT_EXPIRY_SECONDS,
            path     = '/',
        )
        return response


# ══════════════════════════════════════════════════════════════
#  POST /api/auth/login
# ══════════════════════════════════════════════════════════════

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        if _rate_limited(request, 'login', '10/15m'):
            return Response(
                {'status': 'error', 'message': 'Too many login attempts. Try again in 15 minutes.'},
                status=429,
            )

        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'status': 'error', 'message': 'Validation failed',
                 'errors': _format_errors(serializer.errors)},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        try:
            user, token = login_user(
                email    = serializer.validated_data['email'],
                password = serializer.validated_data['password'],
            )
        except InvalidCredentialsError as exc:
            return Response(
                {'status': 'error', 'message': str(exc)},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        response = Response(
            {'status': 'success', 'message': 'Login successful',
             'data': UserResponseSerializer(user).data},
            status=status.HTTP_200_OK,
        )
        response.set_cookie(
            key      = 'access_token',
            value    = token,
            httponly = True,
            samesite = 'Lax',
            secure   = not settings.DEBUG,
            max_age  = settings.JWT_EXPIRY_SECONDS,
            path     = '/',
        )
        return response


# ══════════════════════════════════════════════════════════════
#  GET /api/auth/me
# ══════════════════════════════════════════════════════════════

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(
            {'status': 'success', 'data': UserResponseSerializer(request.user).data},
            status=status.HTTP_200_OK,
        )


# ══════════════════════════════════════════════════════════════
#  POST /api/auth/google
# ══════════════════════════════════════════════════════════════

class GoogleAuthView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        if _rate_limited(request, 'google_auth', '10/15m'):
            return _TOO_MANY

        access_token = request.data.get('access_token', '').strip()
        if not access_token:
            return Response(
                {'status': 'error', 'message': 'Google access_token is required'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user, token = google_auth_user(access_token)
        except InvalidGoogleTokenError as exc:
            return Response(
                {'status': 'error', 'message': str(exc)},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        response = Response(
            {'status': 'success', 'message': 'Signed in with Google',
             'data': UserResponseSerializer(user).data},
            status=status.HTTP_200_OK,
        )
        response.set_cookie(
            key      = 'access_token',
            value    = token,
            httponly = True,
            samesite = 'Lax',
            secure   = not settings.DEBUG,
            max_age  = settings.JWT_EXPIRY_SECONDS,
            path     = '/',
        )
        return response


# ══════════════════════════════════════════════════════════════
#  POST /api/auth/logout
# ══════════════════════════════════════════════════════════════

class LogoutView(APIView):
    permission_classes = [AllowAny]

    def perform_authentication(self, request):
        # Never let an expired/invalid token block the logout endpoint.
        # Token invalidation is handled manually below using the raw cookie.
        try:
            super().perform_authentication(request)
        except AuthenticationFailed:
            pass

    def post(self, request):
        raw_token = request.COOKIES.get('access_token')
        if raw_token:
            try:
                payload = jwt.decode(
                    raw_token,
                    settings.JWT_SECRET_KEY,
                    algorithms=[settings.JWT_ALGORITHM],
                    options={'verify_exp': False},  # invalidate even after natural expiry
                )
                user = AppUser.objects.filter(id=payload.get('user_id')).first()
                if user:
                    invalidate_user_tokens(user)
            except jwt.InvalidTokenError:
                pass  # malformed/tampered token — still clear the cookie

        response = Response(
            {'status': 'success', 'message': 'Logged out successfully'},
            status=status.HTTP_200_OK,
        )
        response.delete_cookie('access_token', path='/')
        return response


# ══════════════════════════════════════════════════════════════
#  POST /api/auth/password-reset/request
# ══════════════════════════════════════════════════════════════

class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        if _rate_limited(request, 'password_reset_request', '5/h'):
            return Response(
                {'status': 'error', 'message': 'Too many requests. Please try again later.'},
                status=429,
            )

        serializer = PasswordResetRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'status': 'error', 'message': 'Validation failed',
                 'errors': _format_errors(serializer.errors)},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        try:
            request_password_reset(serializer.validated_data['email'])
        except ResetEmailDeliveryError:
            return Response(
                {'status': 'error',
                 'message': 'We were unable to send the reset email. Please try again later.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        return Response(
            {'status': 'success',
             'message': "If that email is registered, you'll receive a reset link shortly."},
            status=status.HTTP_200_OK,
        )


# ══════════════════════════════════════════════════════════════
#  POST /api/auth/password-reset/confirm
# ══════════════════════════════════════════════════════════════

class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        if _rate_limited(request, 'password_reset_confirm', '10/h'):
            return _TOO_MANY

        serializer = PasswordResetConfirmSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'status': 'error', 'message': 'Validation failed',
                 'errors': _format_errors(serializer.errors)},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        try:
            confirm_password_reset(
                serializer.validated_data['token'],
                serializer.validated_data['password'],
            )
        except PasswordResetExpiredError as exc:
            return Response({'status': 'error', 'message': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except PasswordResetInvalidError as exc:
            return Response({'status': 'error', 'message': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {'status': 'success', 'message': 'Password updated successfully. You can now sign in.'},
            status=status.HTTP_200_OK,
        )


# ══════════════════════════════════════════════════════════════
#  PATCH /api/auth/profile
# ══════════════════════════════════════════════════════════════

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        serializer = ProfileUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'status': 'error', 'message': 'Validation failed',
                 'errors': _format_errors(serializer.errors)},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        user = update_user_phone(request.user, serializer.validated_data['phone'])
        return Response(
            {'status': 'success', 'data': UserResponseSerializer(user).data},
            status=status.HTTP_200_OK,
        )
