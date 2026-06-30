from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('services_app', '0002_encrypt_inquiry_phone'),
    ]

    operations = [
        migrations.AlterField(
            model_name='serviceinquiry',
            name='service',
            field=models.CharField(
                choices=[
                    ('chatbot', 'Chatbot Development'),
                    ('ai_website', 'AI Website'),
                    ('automation', 'AI Consulting & Automation'),
                    ('ai_agent', 'AI Agent Development'),
                    ('multilingual', 'Multilingual AI Solutions'),
                    ('rag', 'Knowledge Base & RAG Systems'),
                    ('whatsapp', 'WhatsApp AI Automation'),
                    ('consulting', 'AI Strategy & Consulting'),
                    ('customer_support', 'AI Customer Support Systems'),
                    ('other', 'Other'),
                ],
                default='other',
                max_length=50,
            ),
        ),
    ]
