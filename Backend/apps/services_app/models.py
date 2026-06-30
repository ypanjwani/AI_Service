from django.db import models
from apps.auth_app.crypto import EncryptedPhoneField


class ServiceInquiry(models.Model):
    SERVICE_CHOICES = [
        ('chatbot',          'Chatbot Development'),
        ('ai_website',       'AI Website'),
        ('automation',       'AI Consulting & Automation'),
        ('ai_agent',         'AI Agent Development'),
        ('multilingual',     'Multilingual AI Solutions'),
        ('rag',              'Knowledge Base & RAG Systems'),
        ('whatsapp',         'WhatsApp AI Automation'),
        ('consulting',       'AI Strategy & Consulting'),
        ('customer_support', 'AI Customer Support Systems'),
        ('other',            'Other'),
    ]

    service    = models.CharField(max_length=50, choices=SERVICE_CHOICES, default='other')
    name       = models.CharField(max_length=255)
    email      = models.EmailField()
    phone      = EncryptedPhoneField(max_length=255, blank=True, default='')
    message    = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'service_inquiries'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.name} — {self.service} ({self.created_at.date()})'
