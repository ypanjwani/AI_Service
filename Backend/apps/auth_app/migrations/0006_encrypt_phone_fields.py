from django.db import migrations
import apps.auth_app.crypto


class Migration(migrations.Migration):

    dependencies = [
        ('auth_app', '0005_user_tokens_valid_after'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='phone',
            field=apps.auth_app.crypto.EncryptedPhoneField(blank=True, default='', max_length=255),
        ),
        migrations.AlterField(
            model_name='otpverification',
            name='phone',
            field=apps.auth_app.crypto.EncryptedPhoneField(max_length=255),
        ),
    ]
