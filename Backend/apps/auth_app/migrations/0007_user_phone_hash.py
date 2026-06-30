from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('auth_app', '0006_encrypt_phone_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='phone_hash',
            field=models.CharField(blank=True, default='', max_length=64, db_index=True),
        ),
    ]
