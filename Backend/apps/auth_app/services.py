import bcrypt
import jwt
import logging
import secrets
from datetime import datetime, timedelta, timezone, date

from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction, IntegrityError

import requests as http_requests

logger = logging.getLogger(__name__)

from .repositories import (
    find_user_by_email, find_user_by_google_id, create_user, create_google_user, link_google_id,
    upsert_otp_verification, find_otp_by_token, lock_otp_by_token,
    increment_otp_attempts, atomic_increment_otp_attempts, delete_otp,
    upsert_reset_token, find_reset_token, delete_reset_token, update_user_password,
    invalidate_user_tokens,
)


# ── Custom exceptions ─────────────────────────────────────────────────

class EmailAlreadyExistsError(Exception):
    pass


class InvalidCredentialsError(Exception):
    pass


class OTPDeliveryError(Exception):
    pass


class OTPInvalidError(Exception):
    pass


class OTPExpiredError(Exception):
    pass


class OTPMaxAttemptsError(Exception):
    pass


class OTPMismatchError(Exception):
    def __init__(self, field_errors: dict, remaining: int):
        self.field_errors = field_errors
        self.remaining    = remaining
        super().__init__('OTP mismatch')


class PasswordResetInvalidError(Exception):
    pass


class PasswordResetExpiredError(Exception):
    pass


class ResetEmailDeliveryError(Exception):
    pass


# ── JWT helper ────────────────────────────────────────────────────────

def generate_jwt(user) -> str:
    payload = {
        'user_id': user.id,
        'email':   user.email,
        'iat':     datetime.now(timezone.utc),
        'exp':     datetime.now(timezone.utc) + timedelta(seconds=settings.JWT_EXPIRY_SECONDS),
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


# ── OTP helpers ───────────────────────────────────────────────────────

OTP_EXPIRY_MINUTES = 10
OTP_MAX_ATTEMPTS   = 3


def _generate_otp() -> str:
    return str(secrets.randbelow(900000) + 100000)


def _hash_otp(otp: str) -> str:
    return bcrypt.hashpw(otp.encode(), bcrypt.gensalt(rounds=8)).decode()


def _verify_otp_hash(otp: str, otp_hash: str) -> bool:
    return bcrypt.checkpw(otp.encode(), otp_hash.encode())


def _send_email_otp(email: str, otp: str, name: str) -> None:
    if not settings.EMAIL_HOST_USER:
        if settings.DEBUG:
            return
        raise OTPDeliveryError('Email service is not configured')
    try:
        send_mail(
            subject='AI Automation Labs – Your Verification Code',
            message=(
                f'Hi {name},\n\n'
                f'Your email verification code is:\n\n'
                f'  {otp}\n\n'
                f'This code expires in {OTP_EXPIRY_MINUTES} minutes.\n'
                f'Do not share this code with anyone.\n\n'
                f'— AI Automation Labs Team'
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
    except Exception as exc:
        if settings.DEBUG:
            return
        raise OTPDeliveryError(f'Failed to send email: {exc}')


def _send_sms_otp(phone: str, otp: str) -> None:
    if not settings.TWILIO_ACCOUNT_SID:
        if settings.DEBUG:
            return
        raise OTPDeliveryError('SMS service is not configured')
    try:
        from twilio.rest import Client
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        client.messages.create(
            body=(
                f'Your AI Automation Labs verification code is: {otp}. '
                f'Valid for {OTP_EXPIRY_MINUTES} minutes. Do not share this code.'
            ),
            from_=settings.TWILIO_FROM_NUMBER,
            to=f'{settings.OTP_PHONE_COUNTRY_CODE}{phone}',
        )
    except Exception as exc:
        if settings.DEBUG:
            return
        raise OTPDeliveryError(f'Failed to send SMS: {exc}')


# ── Register ──────────────────────────────────────────────────────────

def initiate_registration(validated_data: dict):
    """
    Validate → check duplicate email → hash password → send email + SMS OTPs → persist pending.
    Returns (token, email_otp, phone_otp) — OTPs only exposed to view for the debug panel.
    """
    email = validated_data['email']
    if find_user_by_email(email):
        raise EmailAlreadyExistsError('An account with this email already exists')

    password_hash = bcrypt.hashpw(
        validated_data['password'].encode('utf-8'),
        bcrypt.gensalt(rounds=12),
    ).decode('utf-8')

    email_otp  = _generate_otp()
    phone_otp  = _generate_otp()
    token      = secrets.token_hex(32)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRY_MINUTES)

    record = upsert_otp_verification(
        token=token,
        email=email,
        phone=validated_data['phone'],
        email_otp_hash=_hash_otp(email_otp),
        phone_otp_hash=_hash_otp(phone_otp),
        pending_name=validated_data['name'],
        pending_dob=str(validated_data['dob']),
        pending_pw_hash=password_hash,
        expires_at=expires_at,
    )

    try:
        _send_email_otp(email, email_otp, validated_data['name'])
    except OTPDeliveryError:
        delete_otp(record)
        raise

    try:
        _send_sms_otp(validated_data['phone'], phone_otp)
    except OTPDeliveryError:
        delete_otp(record)
        raise

    return token, email_otp, phone_otp


def verify_registration_otp(token: str, email_otp: str, phone_otp: str):
    """
    Verify email + phone OTPs → create the user → return (user, jwt_token).
    Raises specific exceptions on any failure.

    Split into two phases to avoid a TOCTOU race:
    - Phase 1: slow bcrypt checks outside any lock (no DB writes).
    - Phase 2: re-fetch with SELECT FOR UPDATE inside a transaction so only
      one concurrent request can reach create_user for this token.
    """
    # ── Phase 1: stateless validation (no lock, no DB writes) ────────
    record = find_otp_by_token(token)
    if not record:
        raise OTPInvalidError('Session expired or invalid. Please register again.')

    now = datetime.now(timezone.utc)
    if now > record.expires_at:
        delete_otp(record)
        raise OTPExpiredError('Verification code has expired. Please register again.')

    if record.attempts >= OTP_MAX_ATTEMPTS:
        delete_otp(record)
        raise OTPMaxAttemptsError('Too many incorrect attempts. Please register again.')

    # Bcrypt checks outside the lock (slow — run here to avoid holding the lock)
    phase1_errors = {}
    if not _verify_otp_hash(email_otp, record.email_otp_hash):
        phase1_errors['email_otp'] = 'Incorrect code'
    if not _verify_otp_hash(phone_otp, record.phone_otp_hash):
        phase1_errors['phone_otp'] = 'Incorrect code'

    # ── Phase 2: all DB writes under a row lock ───────────────────────
    try:
        with transaction.atomic():
            locked = lock_otp_by_token(token)
            if not locked:
                raise OTPInvalidError('Session expired or invalid. Please register again.')

            # Re-verify hashes against the locked row (defense-in-depth: catches
            # any edge case where the row was swapped between phases)
            phase2_errors = {}
            if not _verify_otp_hash(email_otp, locked.email_otp_hash):
                phase2_errors['email_otp'] = 'Incorrect code'
            if not _verify_otp_hash(phone_otp, locked.phone_otp_hash):
                phase2_errors['phone_otp'] = 'Incorrect code'

            field_errors = phase1_errors or phase2_errors
            if field_errors:
                # Atomic DB-level increment — no read-modify-write race
                atomic_increment_otp_attempts(locked)
                remaining = max(0, OTP_MAX_ATTEMPTS - locked.attempts - 1)
                raise OTPMismatchError(field_errors, remaining)

            if find_user_by_email(locked.email):
                delete_otp(locked)
                raise EmailAlreadyExistsError('An account with this email already exists')

            user = create_user(
                name=locked.pending_name,
                email=locked.email,
                dob=date.fromisoformat(locked.pending_dob),
                password_hash=locked.pending_pw_hash,
                phone=locked.phone,
            )
            delete_otp(locked)
    except IntegrityError:
        raise EmailAlreadyExistsError('An account with this email already exists')

    jwt_token = generate_jwt(user)
    return user, jwt_token


# ── Login ─────────────────────────────────────────────────────────────

def login_user(email: str, password: str):
    """
    1. Look up user by email.
    2. Verify password with bcrypt.checkpw.
    3. Issue a signed JWT.
    Returns (user, token) on success.
    Raises InvalidCredentialsError on any failure
    (deliberately vague — never reveal which part failed).
    """
    user = find_user_by_email(email)

    if not user:
        raise InvalidCredentialsError('Invalid email or password')

    if not user.password:
        raise InvalidCredentialsError('This account was created with Google. Please sign in with Google.')

    password_matches = bcrypt.checkpw(
        password.encode('utf-8'),
        user.password.encode('utf-8'),
    )

    if not password_matches:
        raise InvalidCredentialsError('Invalid email or password')

    token = generate_jwt(user)
    return user, token


# ── Password reset ────────────────────────────────────────────────────

RESET_EXPIRY_MINUTES = 60


def request_password_reset(email: str) -> None:
    """
    Generate a reset token and email the user a reset link.
    Always returns silently — never reveals whether the email exists.
    """
    user = find_user_by_email(email)
    if not user:
        return

    token      = secrets.token_hex(32)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=RESET_EXPIRY_MINUTES)
    record     = upsert_reset_token(user=user, token=token, expires_at=expires_at)

    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
    reset_link   = f'{frontend_url}/reset-password?token={token}'

    if not user.password:
        # Google-only account — guide them to use Google sign-in
        body = (
            f'Hi {user.name},\n\n'
            f'We received a password reset request for {email}.\n\n'
            f'Your account was created with Google Sign-In and does not have a separate password.\n'
            f'Please use the "Continue with Google" button on the login page to access your account.\n\n'
            f'— AI Automation Labs Team'
        )
    else:
        body = (
            f'Hi {user.name},\n\n'
            f'You requested a password reset for your AI Automation Labs account.\n\n'
            f'Click the link below to set a new password:\n\n'
            f'  {reset_link}\n\n'
            f'This link expires in {RESET_EXPIRY_MINUTES} minutes.\n'
            f'If you did not request this, you can safely ignore this email.\n\n'
            f'— AI Automation Labs Team'
        )

    try:
        send_mail(
            subject='AI Automation Labs – Password Reset',
            message=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
    except Exception as exc:
        delete_reset_token(record)
        logger.error('Password reset email failed for user %s: %s', user.id, exc, exc_info=True)
        if settings.DEBUG:
            return
        raise ResetEmailDeliveryError('Failed to send password reset email')


def confirm_password_reset(token: str, new_password: str) -> None:
    """
    Validate the reset token, update the user's password, delete the token.
    Raises PasswordResetInvalidError or PasswordResetExpiredError on failure.
    """
    record = find_reset_token(token)
    if not record:
        raise PasswordResetInvalidError('This reset link is invalid or has already been used.')

    if datetime.now(timezone.utc) > record.expires_at:
        delete_reset_token(record)
        raise PasswordResetExpiredError('This reset link has expired. Please request a new one.')

    password_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt(rounds=12)).decode('utf-8')
    update_user_password(record.user, password_hash)
    invalidate_user_tokens(record.user)
    delete_reset_token(record)


# ── Google OAuth ──────────────────────────────────────────────────────

class InvalidGoogleTokenError(Exception):
    pass


def google_auth_user(access_token: str):
    """
    Verify a Google access token by calling Google's userinfo endpoint.
    Finds or creates the user, returns (user, jwt_token).
    """
    try:
        # Reject tokens not issued for this application
        ti = http_requests.get(
            'https://oauth2.googleapis.com/tokeninfo',
            params={'access_token': access_token},
            timeout=5,
        )
        ti_data = ti.json()
        if not ti.ok or ti_data.get('aud') != settings.GOOGLE_CLIENT_ID:
            raise InvalidGoogleTokenError('Token was not issued for this application')

        resp = http_requests.get(
            'https://www.googleapis.com/oauth2/v3/userinfo',
            headers={'Authorization': f'Bearer {access_token}'},
            timeout=5,
        )
        if not resp.ok:
            raise InvalidGoogleTokenError('Invalid Google token')
        info = resp.json()

        # Cross-check: both responses must describe the same Google identity
        if not ti_data.get('sub') or ti_data.get('sub') != info.get('sub'):
            raise InvalidGoogleTokenError('Token identity mismatch')
    except InvalidGoogleTokenError:
        raise
    except Exception:
        raise InvalidGoogleTokenError('Could not verify Google token')

    if not info.get('email_verified'):
        raise InvalidGoogleTokenError('Google account email is not verified')

    if not info.get('email', '').lower().endswith('@gmail.com'):
        raise InvalidGoogleTokenError('Only Gmail accounts (@gmail.com) are supported')

    google_id = info['sub']
    email     = info['email']
    name      = info.get('name', email.split('@')[0])

    # 1. Existing Google user
    user = find_user_by_google_id(google_id)
    if user:
        token = generate_jwt(user)
        return user, token

    # 2. Existing email/password account — Google verified the email, so link and sign in
    user = find_user_by_email(email)
    if user:
        if not user.google_id:
            user = link_google_id(user, google_id)
        token = generate_jwt(user)
        return user, token

    # 3. Brand-new user
    user  = create_google_user(name=name, email=email, google_id=google_id)
    token = generate_jwt(user)
    return user, token
