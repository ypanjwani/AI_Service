from django.db import models
from .crypto import EncryptedPhoneField


class User(models.Model):
    is_authenticated = True   # required by DRF's IsAuthenticated permission
    is_anonymous     = False  # required by Django's auth framework

    name       = models.CharField(max_length=255)
    email      = models.EmailField(unique=True)
    dob        = models.DateField(null=True, blank=True)
    password   = models.CharField(max_length=255, blank=True, default='')  # empty for OAuth users
    phone      = EncryptedPhoneField(max_length=255, blank=True, default='')
    phone_hash = models.CharField(max_length=64, blank=True, default='', db_index=True)
    google_id          = models.CharField(max_length=255, null=True, blank=True, unique=True)
    tokens_valid_after = models.DateTimeField(null=True, blank=True, default=None)
    created_at         = models.DateTimeField(auto_now_add=True)
    updated_at         = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.email


class OTPVerification(models.Model):
    """Stores pending registration data + hashed OTPs until both are verified."""
    token           = models.CharField(max_length=64, unique=True, db_index=True)
    email           = models.CharField(max_length=255, db_index=True)
    phone           = EncryptedPhoneField(max_length=255, blank=True, default='')
    email_otp_hash  = models.CharField(max_length=255)
    phone_otp_hash  = models.CharField(max_length=255, blank=True, default='')
    pending_name    = models.CharField(max_length=255)
    pending_dob     = models.CharField(max_length=20)   # ISO date string e.g. "2000-01-15"
    pending_pw_hash = models.CharField(max_length=255)
    attempts        = models.IntegerField(default=0)
    expires_at      = models.DateTimeField()
    created_at      = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'otp_verifications'

    def __str__(self):
        return f'OTP for {self.email}'


class PasswordResetToken(models.Model):
    token      = models.CharField(max_length=64, unique=True, db_index=True)
    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reset_tokens')
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'password_reset_tokens'

    def __str__(self):
        return f'Reset token for {self.user.email}'
