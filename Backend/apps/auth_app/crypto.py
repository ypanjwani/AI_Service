import hmac as _hmac
import hashlib
from cryptography.fernet import Fernet, InvalidToken
from django.conf import settings
from django.db import models


def _cipher() -> Fernet:
    key = settings.PHONE_ENCRYPTION_KEY
    return Fernet(key.encode() if isinstance(key, str) else key)


def encrypt_phone(value: str) -> str:
    if not value:
        return value
    return _cipher().encrypt(value.encode()).decode()


def decrypt_phone(value: str) -> str:
    if not value:
        return value
    try:
        return _cipher().decrypt(value.encode()).decode()
    except (InvalidToken, Exception):
        return value  # plaintext fallback during data migration of old records


def hash_phone(value: str) -> str:
    """HMAC-SHA256 of the plaintext phone for deterministic uniqueness checks."""
    if not value:
        return ''
    key = settings.PHONE_ENCRYPTION_KEY
    if isinstance(key, str):
        key = key.encode()
    return _hmac.new(key, value.encode(), hashlib.sha256).hexdigest()


class EncryptedPhoneField(models.CharField):
    """
    CharField that encrypts before writing to the DB and decrypts after reading.
    Uses Fernet (AES-128-CBC + HMAC-SHA256). Requires max_length=255.
    NOTE: Cannot be used in filter()/get() lookups — Fernet is non-deterministic.
    """

    def from_db_value(self, value, expression, connection):
        return decrypt_phone(value) if value else value

    def get_prep_value(self, value):
        prepped = super().get_prep_value(value)
        return encrypt_phone(prepped) if prepped else prepped

    def deconstruct(self):
        name, path, args, kwargs = super().deconstruct()
        path = 'apps.auth_app.crypto.EncryptedPhoneField'
        return name, path, args, kwargs
