# Generated by Django 5.0.1 on 2024-02-03 23:04

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('API', '0004_favorite'),
    ]

    operations = [
        migrations.CreateModel(
            name='Coupon',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.CharField(max_length=100)),
                ('discount', models.FloatField()),
            ],
        ),
        migrations.CreateModel(
            name='CouponOrder',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('coupon', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='API.coupon')),
                ('order', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='API.order')),
            ],
        ),
    ]
