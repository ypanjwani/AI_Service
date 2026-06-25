from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True
    dependencies = []

    operations = [
        migrations.CreateModel(
            name='User',
            fields=[
                ('id',         models.BigAutoField(auto_created=True, primary_key=True, serialize=False)),
                ('name',       models.CharField(max_length=255)),
                ('email',      models.EmailField(max_length=254, unique=True)),
                ('dob',        models.DateField()),
                ('password',   models.CharField(max_length=255)),
                ('phone',      models.CharField(max_length=10)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={'db_table': 'users'},
        ),
    ]
