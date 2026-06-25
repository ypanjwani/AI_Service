from typing import Optional
from datetime import datetime

from django.db.models import F

from .models import User, OTPVerification, PasswordResetToken


def find_user_by_email(email: str) -> Optional[User]:
    return User.objects.filter(email=email).first()


def find_user_by_google_id(google_id: str) -> Optional[User]:
    return User.objects.filter(google_id=google_id).first()


def create_user(*, name: str, email: str, dob, password_hash: str, phone: str) -> User:
    user = User(name=name, email=email, dob=dob, password=password_hash, phone=phone)
    user.save()
    return user


def create_google_user(*, name: str, email: str, google_id: str) -> User:
    user = User(name=name, email=email, google_id=google_id)
    user.save()
    return user


def link_google_id(user: User, google_id: str) -> User:
    user.google_id = google_id
    user.save(update_fields=['google_id', 'updated_at'])
    return user


def update_user_phone(user: User, phone: str) -> User:
    user.phone = phone
    user.save(update_fields=['phone', 'updated_at'])
    return user


# ── OTP ───────────────────────────────────────────────────────

def upsert_otp_verification(
    *, token: str, email: str, phone: str,
    email_otp_hash: str, phone_otp_hash: str,
    pending_name: str, pending_dob: str, pending_pw_hash: str,
    expires_at: datetime,
) -> OTPVerification:
    OTPVerification.objects.filter(email=email).delete()
    return OTPVerification.objects.create(
        token=token, email=email, phone=phone,
        email_otp_hash=email_otp_hash, phone_otp_hash=phone_otp_hash,
        pending_name=pending_name, pending_dob=pending_dob,
        pending_pw_hash=pending_pw_hash, expires_at=expires_at,
    )


def find_otp_by_token(token: str) -> Optional[OTPVerification]:
    return OTPVerification.objects.filter(token=token).first()


def lock_otp_by_token(token: str) -> Optional[OTPVerification]:
    """SELECT FOR UPDATE — must be called inside transaction.atomic()."""
    return OTPVerification.objects.select_for_update().filter(token=token).first()


def increment_otp_attempts(record: OTPVerification) -> None:
    record.attempts += 1
    record.save(update_fields=['attempts'])


def atomic_increment_otp_attempts(record: OTPVerification) -> None:
    """Single atomic UPDATE — must be called inside transaction.atomic()."""
    OTPVerification.objects.filter(pk=record.pk).update(attempts=F('attempts') + 1)


def delete_otp(record: OTPVerification) -> None:
    record.delete()


# ── Password reset ────────────────────────────────────────────

def upsert_reset_token(*, user: User, token: str, expires_at: datetime) -> PasswordResetToken:
    PasswordResetToken.objects.filter(user=user).delete()
    return PasswordResetToken.objects.create(user=user, token=token, expires_at=expires_at)


def find_reset_token(token: str) -> Optional[PasswordResetToken]:
    return PasswordResetToken.objects.select_related('user').filter(token=token).first()


def delete_reset_token(record: PasswordResetToken) -> None:
    record.delete()


def update_user_password(user: User, password_hash: str) -> User:
    user.password = password_hash
    user.save(update_fields=['password', 'updated_at'])
    return user


def invalidate_user_tokens(user: User) -> None:
    from django.utils import timezone
    user.tokens_valid_after = timezone.now()
    user.save(update_fields=['tokens_valid_after', 'updated_at'])
