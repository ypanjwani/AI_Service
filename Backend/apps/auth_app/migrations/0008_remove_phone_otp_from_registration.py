from django.db import migrations, models
import apps.auth_app.crypto


class Migration(migrations.Migration):

    dependencies = [
        ('auth_app', '0007_user_phone_hash'),
    ]

    operations = [
        migrations.AlterField(
            model_name='otpverification',
            name='phone',
            field=apps.auth_app.crypto.EncryptedPhoneField(blank=True, default='', max_length=255),
        ),
        migrations.AlterField(
            model_name='otpverification',
            name='phone_otp_hash',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
    ]
