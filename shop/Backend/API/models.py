from django.db import models

class Profile(models.Model):
	first_name = models.CharField(max_length=100, null=True)
	last_name = models.CharField(max_length=100, null=True)
	birth_date = models.DateField(null=True)
	gender = models.BooleanField(null=True) # True -> Man
	phone_number = models.CharField(max_length=20, null=True)
	email = models.EmailField(null=True)

class Address(models.Model):
	profile = models.ForeignKey(Profile, on_delete=models.CASCADE) 
	country = models.CharField(max_length=100)
	city = models.CharField(max_length=100)
	street = models.CharField(max_length=100)
	house_number = models.CharField(max_length=100)
	flat_number = models.CharField(max_length=100)

class Product(models.Model):
	name = models.CharField(max_length=100)
	description = models.TextField()
	price = models.FloatField()
	quantity = models.IntegerField()
	showed = models.BooleanField()

class ProductImage(models.Model):
	product = models.ForeignKey(Product, on_delete=models.CASCADE)
	image = models.ImageField()

class Order(models.Model):
	profile = models.ForeignKey(Profile, on_delete=models.CASCADE, null=True)
	date = models.DateTimeField(auto_now_add=True)
	status = models.CharField(max_length=100) # "in_progress", "completed", "sent"

class ProductOrder(models.Model):
	order = models.ForeignKey(Order, on_delete=models.CASCADE)
	product = models.ForeignKey(Product, on_delete=models.CASCADE)
	quantity = models.IntegerField()

class Category(models.Model):
	name = models.CharField(max_length=100)

class ProductCategory(models.Model):
	product = models.ForeignKey(Product, on_delete=models.CASCADE)
	category = models.ForeignKey(Category, on_delete=models.CASCADE)

class Favorite(models.Model):
	profile = models.ForeignKey(Profile, on_delete=models.CASCADE)
	product = models.ForeignKey(Product, on_delete=models.CASCADE)

class Coupon(models.Model):
	code = models.CharField(max_length=100)
	discount = models.FloatField()

class CouponOrder(models.Model):
	order = models.ForeignKey(Order, on_delete=models.CASCADE)
	discount = models.FloatField()