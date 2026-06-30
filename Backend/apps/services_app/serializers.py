import re
from rest_framework import serializers

VALID_SERVICES = {'chatbot', 'ai_website', 'automation', 'ai_agent', 'multilingual', 'rag', 'whatsapp', 'consulting', 'customer_support', 'other'}


class InquirySerializer(serializers.Serializer):
    service = serializers.CharField(max_length=50)
    name    = serializers.CharField(max_length=255)
    email   = serializers.EmailField()
    phone   = serializers.CharField(required=False, allow_blank=True, default='')
    message = serializers.CharField(min_length=10, max_length=2000)

    def validate_service(self, value):
        value = value.strip().lower()
        if value not in VALID_SERVICES:
            raise serializers.ValidationError(
                f'Invalid service. Valid values: {", ".join(sorted(VALID_SERVICES))}'
            )
        return value

    def validate_name(self, value):
        return ' '.join(value.split())  # strips and collapses all whitespace including newlines

    def validate_email(self, value):
        return value.strip().lower()

    def validate_phone(self, value):
        if not value:
            return ''
        cleaned = re.sub(r'[^0-9]', '', value.strip())
        if cleaned and len(cleaned) != 10:
            raise serializers.ValidationError('Phone must be exactly 10 digits')
        return cleaned

    def validate_message(self, value):
        return value.strip()


class InquiryResponseSerializer(serializers.Serializer):
    id      = serializers.IntegerField()
    service = serializers.CharField()
    name    = serializers.CharField()
    email   = serializers.EmailField()
