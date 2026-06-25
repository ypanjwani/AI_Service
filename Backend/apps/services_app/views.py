from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django_ratelimit.core import is_ratelimited

from .serializers import InquirySerializer, InquiryResponseSerializer
from .services import submit_inquiry


def _format_errors(errors: dict) -> list:
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


class InquiryView(APIView):
    """POST /api/services/inquiry — submit a service enquiry (public endpoint)."""
    permission_classes = [AllowAny]

    def post(self, request):
        if is_ratelimited(request, group='inquiry', key='ip', rate='10/h', method='POST', increment=True):
            return Response(
                {'status': 'error', 'message': 'Too many requests. Please try again later.'},
                status=429,
            )

        serializer = InquirySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'status': 'error', 'message': 'Validation failed',
                 'errors': _format_errors(serializer.errors)},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        inquiry = submit_inquiry(serializer.validated_data)
        return Response(
            {
                'status':  'success',
                'message': "Thank you! We'll get back to you within 24 hours.",
                'data':    InquiryResponseSerializer(inquiry).data,
            },
            status=status.HTTP_201_CREATED,
        )
