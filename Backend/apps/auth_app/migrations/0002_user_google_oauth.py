from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('auth_app', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='google_id',
            field=models.CharField(max_length=255, null=True, blank=True, unique=True),
        ),
        migrations.AlterField(
            model_name='user',
            name='dob',
            field=models.DateField(null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='user',
            name='password',
            field=models.CharField(max_length=255, blank=True, default=''),
        ),
        migrations.AlterField(
            model_name='user',
            name='phone',
            field=models.CharField(max_length=10, blank=True, default=''),
        ),
    ]
