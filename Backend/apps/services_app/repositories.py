from .models import ServiceInquiry


def create_inquiry(
    *,
    service: str,
    name: str,
    email: str,
    phone: str,
    message: str,
) -> ServiceInquiry:
    inquiry = ServiceInquiry(
        service=service,
        name=name,
        email=email,
        phone=phone,
        message=message,
    )
    inquiry.save()
    return inquiry
