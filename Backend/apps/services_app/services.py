import logging
from django.conf import settings
from django.core.mail import send_mail

from .repositories import create_inquiry
from .models import ServiceInquiry

logger = logging.getLogger(__name__)

SERVICE_LABELS = {
    'chatbot':      'Chatbot Development',
    'ai_website':   'AI Website',
    'automation':   'AI Consulting & Automation',
    'ai_agent':     'AI Agent Development',
    'multilingual': 'Multilingual AI Solutions',
    'rag':          'Knowledge Base & RAG Systems',
    'other':        'Other',
}


def submit_inquiry(validated_data: dict) -> ServiceInquiry:
    inquiry = create_inquiry(
        service = validated_data['service'],
        name    = validated_data['name'],
        email   = validated_data['email'],
        phone   = validated_data.get('phone', ''),
        message = validated_data['message'],
    )

    _notify_owner(inquiry)
    _confirm_client(inquiry)

    return inquiry


def _notify_owner(inquiry: ServiceInquiry) -> None:
    """Send booking details to the owner's Gmail."""
    if not settings.OWNER_EMAIL:
        return

    service_label = SERVICE_LABELS.get(inquiry.service, inquiry.service)
    phone_line    = f"Phone:    {inquiry.phone}" if inquiry.phone else "Phone:    —"

    subject = f"[AI Automation Labs] New booking — {service_label} from {inquiry.name}"

    body = f"""\
New service inquiry received on AI Automation Labs.

──────────────────────────────────────
  CLIENT DETAILS
──────────────────────────────────────
  Name:     {inquiry.name}
  Email:    {inquiry.email}
  {phone_line}
  Service:  {service_label}
  Received: {inquiry.created_at.strftime('%d %b %Y, %I:%M %p UTC')}

──────────────────────────────────────
  MESSAGE
──────────────────────────────────────
{inquiry.message}

──────────────────────────────────────
Reply directly to this email to reach the client.
"""

    try:
        send_mail(
            subject      = subject,
            message      = body,
            from_email   = settings.DEFAULT_FROM_EMAIL,
            recipient_list = [settings.OWNER_EMAIL],
            fail_silently = False,
        )
    except Exception:
        logger.exception("Failed to send owner notification email for inquiry id=%s", inquiry.id)


def _confirm_client(inquiry: ServiceInquiry) -> None:
    """Send a confirmation email to the client."""
    if not settings.DEFAULT_FROM_EMAIL:
        return

    service_label = SERVICE_LABELS.get(inquiry.service, inquiry.service)

    subject = f"We received your request — {service_label} | AI Automation Labs"

    body = f"""\
Hi {inquiry.name},

Thank you for reaching out to AI Automation Labs!

We've received your booking request for {service_label} and will get back to you within 24 hours.

──────────────────────────────────────
  YOUR REQUEST SUMMARY
──────────────────────────────────────
{inquiry.message}
──────────────────────────────────────

In the meantime, feel free to reply to this email if you have any questions.

Best regards,
AI Automation Labs Team
"""

    try:
        send_mail(
            subject       = subject,
            message       = body,
            from_email    = settings.DEFAULT_FROM_EMAIL,
            recipient_list= [inquiry.email],
            fail_silently = False,
        )
    except Exception:
        logger.exception("Failed to send client confirmation email for inquiry id=%s", inquiry.id)
