from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('auth_app', '0004_passwordresettoken'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='tokens_valid_after',
            field=models.DateTimeField(blank=True, null=True, default=None),
        ),
    ]
