import jwt
from datetime import datetime, timezone
from django.conf import settings
from django.middleware.csrf import CsrfViewMiddleware
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed, PermissionDenied

from .models import User


class _CSRFCheck(CsrfViewMiddleware):
    """CsrfViewMiddleware subclass that returns the failure reason instead of an HttpResponse."""
    def _reject(self, request, reason):
        return reason


class JWTCookieAuthentication(BaseAuthentication):
    """
    DRF authentication middleware.
    Reads the JWT from the 'access_token' httpOnly cookie,
    verifies it, and attaches the User to request.user.

    Returns None (unauthenticated) when no cookie is present,
    so public endpoints continue to work without a token.
    Raises AuthenticationFailed for an invalid / expired token.
    """

    def authenticate(self, request):
        token = request.COOKIES.get('access_token')
        if not token:
            return None  # no token → let the view decide if auth is required

        try:
            payload = jwt.decode(
                token,
                settings.JWT_SECRET_KEY,
                algorithms=[settings.JWT_ALGORITHM],
            )
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token has expired. Please log in again.')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token.')

        try:
            user = User.objects.get(id=payload['user_id'])
        except User.DoesNotExist:
            raise AuthenticationFailed('User not found.')

        if user.tokens_valid_after:
            iat = datetime.fromtimestamp(payload['iat'], tz=timezone.utc)
            if iat < user.tokens_valid_after:
                raise AuthenticationFailed('Session expired. Please log in again.')

        self._enforce_csrf(request)
        return (user, token)

    def _enforce_csrf(self, request):
        """Enforce CSRF for cookie-authenticated requests (mirrors SessionAuthentication)."""
        check = _CSRFCheck(lambda req: None)
        check.process_request(request)
        reason = check.process_view(request, None, (), {})
        if reason:
            raise PermissionDenied('CSRF Failed: %s' % reason)

    def authenticate_header(self, request):
        return 'Cookie realm="api"'
