from django.db import migrations
import apps.auth_app.crypto


class Migration(migrations.Migration):

    dependencies = [
        ('services_app', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='serviceinquiry',
            name='phone',
            field=apps.auth_app.crypto.EncryptedPhoneField(blank=True, default='', max_length=255),
        ),
    ]
