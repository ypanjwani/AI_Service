import os
import re
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

_DEBUG_ENV = os.environ.get('DEBUG', 'False') == 'True'

SECRET_KEY = os.environ.get('SECRET_KEY')
if not SECRET_KEY:
    if not _DEBUG_ENV:
        raise RuntimeError('SECRET_KEY environment variable must be set in production')
    SECRET_KEY = 'django-insecure-dev-only-key-do-not-use-in-prod'

DEBUG = _DEBUG_ENV
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

# ── Apps ──────────────────────────────────────────────────────────────
INSTALLED_APPS = [
    'django.contrib.contenttypes',
    'django.contrib.auth',
    'rest_framework',
    'corsheaders',
    'apps.auth_app',
    'apps.services_app',
]

# ── Middleware ─────────────────────────────────────────────────────────
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',        # must be first
    'django.middleware.security.SecurityMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.middleware.common.CommonMiddleware',
    'config.middleware.ContentSecurityPolicyMiddleware',
]

# ── URL routing ────────────────────────────────────────────────────────
ROOT_URLCONF = 'config.urls'
WSGI_APPLICATION = 'config.wsgi.application'

# ── Database — PostgreSQL ──────────────────────────────────────────────
DATABASES = {
    'default': {
        'ENGINE':   'django.db.backends.postgresql',
        'NAME':     os.environ.get('DB_NAME',     'ai_labs'),
        'USER':     os.environ.get('DB_USER',     'postgres'),
        'PASSWORD': os.environ.get('DB_PASSWORD', ''),
        'HOST':     os.environ.get('DB_HOST',     'localhost'),
        'PORT':     os.environ.get('DB_PORT',     '5432'),
    }
}

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ── Internationalisation ───────────────────────────────────────────────
LANGUAGE_CODE = 'en-us'
TIME_ZONE     = 'UTC'
USE_I18N      = True
USE_TZ        = True

# ── CORS ───────────────────────────────────────────────────────────────
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:5173')
CORS_ALLOWED_ORIGINS = [FRONTEND_URL]
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS     = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
CORS_ALLOW_HEADERS     = ['Content-Type', 'Authorization', 'X-CSRFToken']

# ── CSRF ───────────────────────────────────────────────────────
CSRF_TRUSTED_ORIGINS = [FRONTEND_URL]
CSRF_COOKIE_SAMESITE = 'Lax'

# ── Google OAuth2 ──────────────────────────────────────────────────────
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID', '')
if not GOOGLE_CLIENT_ID and not _DEBUG_ENV:
    raise RuntimeError('GOOGLE_CLIENT_ID environment variable must be set in production')

# ── JWT ────────────────────────────────────────────────────────────────
JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')
if not JWT_SECRET_KEY:
    if not DEBUG:
        raise RuntimeError('JWT_SECRET_KEY environment variable must be set in production')
    JWT_SECRET_KEY = SECRET_KEY
JWT_ALGORITHM      = 'HS256'
JWT_EXPIRY_SECONDS = 60 * 60 * 4    # 4 hours

# ── Email — Gmail SMTP ─────────────────────────────────────────────────
EMAIL_BACKEND      = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST         = 'smtp.gmail.com'
EMAIL_PORT         = 587
EMAIL_USE_TLS      = True
EMAIL_HOST_USER    = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD= os.environ.get('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL = os.environ.get('EMAIL_HOST_USER', '')
OWNER_EMAIL        = os.environ.get('OWNER_EMAIL', '')

# ── Twilio SMS ─────────────────────────────────────────────────────────
TWILIO_ACCOUNT_SID     = os.environ.get('TWILIO_ACCOUNT_SID', '')
TWILIO_AUTH_TOKEN      = os.environ.get('TWILIO_AUTH_TOKEN', '')
TWILIO_FROM_NUMBER     = os.environ.get('TWILIO_FROM_NUMBER', '')
OTP_PHONE_COUNTRY_CODE = os.environ.get('OTP_PHONE_COUNTRY_CODE', '+91')
if not re.match(r'^\+\d{1,3}$', OTP_PHONE_COUNTRY_CODE):
    raise RuntimeError(
        f"OTP_PHONE_COUNTRY_CODE '{OTP_PHONE_COUNTRY_CODE}' is invalid. "
        "Must be an E.164 country code starting with '+', e.g. '+91' or '+1'."
    )

# ── Phone field encryption ─────────────────────────────────────────────
# Generate a key with: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
PHONE_ENCRYPTION_KEY = os.environ.get('PHONE_ENCRYPTION_KEY', '')
if not PHONE_ENCRYPTION_KEY:
    if not DEBUG:
        raise RuntimeError(
            'PHONE_ENCRYPTION_KEY must be set in production. '
            'Generate with: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"'
        )
    PHONE_ENCRYPTION_KEY = 'ZGV2LW9ubHkta2V5LWRvLW5vdC11c2UtaW4tcHJvZCE='  # dev only — 32-byte key

# ── Security headers (only active in production when DEBUG=False) ──────
if not DEBUG:
    SECURE_SSL_REDIRECT         = True
    SECURE_HSTS_SECONDS         = 31536000   # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD         = True

SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS             = 'DENY'
SECURE_BROWSER_XSS_FILTER   = True

# ── Content Security Policy ────────────────────────────────────────────
CONTENT_SECURITY_POLICY = (
    "default-src 'none'; "
    f"connect-src 'self' {FRONTEND_URL}; "
    "frame-ancestors 'none'; "
)

# ── Django REST Framework ──────────────────────────────────────────────
REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES':     ['rest_framework.renderers.JSONRenderer'],
    'DEFAULT_PARSER_CLASSES':       ['rest_framework.parsers.JSONParser'],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'apps.auth_app.authentication.JWTCookieAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}
