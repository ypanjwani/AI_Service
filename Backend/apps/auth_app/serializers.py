import re
from rest_framework import serializers

SEQ_PATTERNS = [
    '0123', '1234', '2345', '3456', '4567', '5678', '6789', '7890',
    '9876', '8765', '7654', '6543', '5432', '4321', '3210',
]


def _validate_gmail(value: str) -> str:
    value = value.strip().lower()
    if not value.endswith('@gmail.com') or len(value) <= 10:
        raise serializers.ValidationError('Email must be a Gmail address (@gmail.com)')
    return value


# ══════════════════════════════════════════════════════════════
#  Register
# ══════════════════════════════════════════════════════════════

class RegisterSerializer(serializers.Serializer):
    """
    Deserialise → transform → validate for POST /register.
    password / confirmPassword are write_only and never echoed back.
    """

    name            = serializers.CharField(max_length=255)
    email           = serializers.EmailField()
    dob             = serializers.DateField()
    password        = serializers.CharField(min_length=8, max_length=128, write_only=True)
    confirmPassword = serializers.CharField(write_only=True)
    phone           = serializers.CharField()

    def validate_name(self, value):
        return value.strip()

    def validate_email(self, value):
        return _validate_gmail(value)

    def validate_password(self, value):
        errors = []
        if not re.search(r'[a-z]', value):
            errors.append('Must include a lowercase letter')
        if not re.search(r'[A-Z]', value):
            errors.append('Must include an uppercase letter')
        if not re.search(r'[0-9]', value):
            errors.append('Must include a digit')
        if not re.search(r'[^a-zA-Z0-9]', value):
            errors.append('Must include a special character')
        if not re.match(r'^\d', value):
            errors.append('Must start with a digit')
        if any(seq in value for seq in SEQ_PATTERNS):
            errors.append('Must not contain sequential numbers (e.g. 1234, 5678)')
        if errors:
            raise serializers.ValidationError(errors)
        return value

    def validate_phone(self, value):
        value = re.sub(r'\D', '', value.strip())
        if len(value) != 10:
            raise serializers.ValidationError('Phone must be exactly 10 digits, no letters')
        return value

    def validate(self, data):
        if data.get('password') != data.get('confirmPassword'):
            raise serializers.ValidationError({'confirmPassword': 'Passwords do not match'})
        return data


# ══════════════════════════════════════════════════════════════
#  Login
# ══════════════════════════════════════════════════════════════

class LoginSerializer(serializers.Serializer):
    """
    Deserialise → transform → validate for POST /login.
    Only checks format; credential verification is done in the service.
    """

    email    = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate_email(self, value):
        return _validate_gmail(value)

    def validate_password(self, value):
        if not value:
            raise serializers.ValidationError('Password is required')
        return value


# ══════════════════════════════════════════════════════════════
#  Shared response serialiser
# ══════════════════════════════════════════════════════════════

class UserResponseSerializer(serializers.Serializer):
    """Serialises User for outbound responses — password is never included."""
    id         = serializers.IntegerField()
    name       = serializers.CharField()
    email      = serializers.EmailField()
    dob        = serializers.DateField()
    phone      = serializers.CharField(default='')
    created_at = serializers.DateTimeField()


class ProfileUpdateSerializer(serializers.Serializer):
    phone = serializers.CharField()

    def validate_phone(self, value):
        value = re.sub(r'\D', '', value.strip())
        if len(value) != 10:
            raise serializers.ValidationError('Phone must be exactly 10 digits, no letters')
        return value


class VerifyRegisterSerializer(serializers.Serializer):
    token     = serializers.CharField(min_length=64, max_length=64)
    email_otp = serializers.CharField(min_length=6, max_length=6)
    phone_otp = serializers.CharField(min_length=6, max_length=6)

    def validate_email_otp(self, value):
        if not value.isdigit():
            raise serializers.ValidationError('OTP must be 6 digits')
        return value

    def validate_phone_otp(self, value):
        if not value.isdigit():
            raise serializers.ValidationError('OTP must be 6 digits')
        return value


# ══════════════════════════════════════════════════════════════
#  Password reset
# ══════════════════════════════════════════════════════════════

def _validate_password_strength(value):
    errors = []
    if not re.search(r'[a-z]', value):        errors.append('Must include a lowercase letter')
    if not re.search(r'[A-Z]', value):        errors.append('Must include an uppercase letter')
    if not re.search(r'[0-9]', value):        errors.append('Must include a digit')
    if not re.search(r'[^a-zA-Z0-9]', value): errors.append('Must include a special character')
    if not re.match(r'^\d', value):           errors.append('Must start with a digit')
    if any(seq in value for seq in SEQ_PATTERNS):
        errors.append('Must not contain sequential numbers (e.g. 1234, 5678)')
    if errors:
        raise serializers.ValidationError(errors)
    return value


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        return _validate_gmail(value)


class PasswordResetConfirmSerializer(serializers.Serializer):
    token           = serializers.CharField()
    password        = serializers.CharField(min_length=8, max_length=128, write_only=True)
    confirmPassword = serializers.CharField(write_only=True)

    def validate_password(self, value):
        return _validate_password_strength(value)

    def validate(self, data):
        if data.get('password') != data.get('confirmPassword'):
            raise serializers.ValidationError({'confirmPassword': 'Passwords do not match'})
        return data
