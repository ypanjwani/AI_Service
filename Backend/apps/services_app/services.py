import logging
from typing import Optional

from django.conf import settings
from django.core.mail import send_mail

from .repositories import create_inquiry
from .models import ServiceInquiry

logger = logging.getLogger(__name__)

SERVICE_LABELS = {
    'chatbot':          'Chatbot Development',
    'ai_website':       'AI Website',
    'automation':       'AI Consulting & Automation',
    'ai_agent':         'AI Agent Development',
    'multilingual':     'Multilingual AI Solutions',
    'rag':              'Knowledge Base & RAG Systems',
    'whatsapp':         'WhatsApp AI Automation',
    'consulting':       'AI Strategy & Consulting',
    'customer_support': 'AI Customer Support Systems',
    'other':            'Other',
}

# Owner notification is retried this many times before the lead is logged for manual follow-up
_OWNER_EMAIL_RETRIES = 2


def submit_inquiry(validated_data: dict):
    """
    Persist the inquiry first (the DB row is the durable record of the lead),
    then notify the owner and confirm the client.

    Returns (inquiry, owner_notified) so the caller can react when the owner
    notification could not be delivered. A booking is never silently lost:
    the row is always saved, and a failed owner notification is logged at
    ERROR with the full lead details for manual follow-up.
    """
    inquiry = create_inquiry(
        service = validated_data['service'],
        name    = validated_data['name'],
        email   = validated_data['email'],
        phone   = validated_data.get('phone', ''),
        message = validated_data['message'],
    )

    owner_notified = _notify_owner(inquiry)
    _confirm_client(inquiry)

    return inquiry, owner_notified


def _log_undelivered_lead(inquiry: ServiceInquiry, reason: str, exc: Optional[Exception] = None) -> None:
    """Emit the full lead at ERROR level so it is recoverable from logs even if email fails."""
    service_label = SERVICE_LABELS.get(inquiry.service, inquiry.service)
    logger.error(
        "OWNER NOTIFICATION UNDELIVERED (%s) — lead is saved in the service_inquiries "
        "table (id=%s) but the owner was NOT emailed. Follow up manually.\n"
        "  id=%s service=%s name=%s email=%s phone=%s",
        reason, inquiry.id,
        inquiry.id, service_label, inquiry.name, inquiry.email, inquiry.phone or '—',
        exc_info=exc,
    )


def _notify_owner(inquiry: ServiceInquiry) -> bool:
    """
    Send booking details to the owner's Gmail.
    Returns True if the email was sent, False otherwise.
    Retries up to _OWNER_EMAIL_RETRIES times before giving up.
    """
    if not settings.OWNER_EMAIL:
        _log_undelivered_lead(inquiry, 'OWNER_EMAIL not configured')
        return False

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

    last_exc = None
    for attempt in range(1, _OWNER_EMAIL_RETRIES + 1):
        try:
            send_mail(
                subject      = subject,
                message      = body,
                from_email   = settings.DEFAULT_FROM_EMAIL,
                recipient_list = [settings.OWNER_EMAIL],
                fail_silently = False,
            )
            return True
        except Exception as exc:
            last_exc = exc
            logger.warning(
                "Owner notification attempt %s/%s failed for inquiry id=%s: %s",
                attempt, _OWNER_EMAIL_RETRIES, inquiry.id, exc,
            )

    _log_undelivered_lead(inquiry, f'failed after {_OWNER_EMAIL_RETRIES} attempts', exc=last_exc)
    return False


def _confirm_client(inquiry: ServiceInquiry) -> bool:
    """Send a confirmation email to the client. Returns True if sent."""
    if not settings.DEFAULT_FROM_EMAIL:
        return False

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
        return True
    except Exception:
        logger.exception("Failed to send client confirmation email for inquiry id=%s", inquiry.id)
        return False
