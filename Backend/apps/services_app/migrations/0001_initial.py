from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True
    dependencies = []

    operations = [
        migrations.CreateModel(
            name='ServiceInquiry',
            fields=[
                ('id',         models.BigAutoField(auto_created=True, primary_key=True, serialize=False)),
                ('service',    models.CharField(
                    max_length=50,
                    choices=[
                        ('chatbot',      'Chatbot Development'),
                        ('ai_website',   'AI Website'),
                        ('automation',   'AI Consulting & Automation'),
                        ('ai_agent',     'AI Agent Development'),
                        ('multilingual', 'Multilingual AI Solutions'),
                        ('rag',          'Knowledge Base & RAG Systems'),
                        ('other',        'Other'),
                    ],
                    default='other',
                )),
                ('name',       models.CharField(max_length=255)),
                ('email',      models.EmailField(max_length=254)),
                ('phone',      models.CharField(max_length=10, blank=True, default='')),
                ('message',    models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={'db_table': 'service_inquiries', 'ordering': ['-created_at']},
        ),
    ]
