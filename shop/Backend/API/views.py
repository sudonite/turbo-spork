from django.conf import settings
from django.db import transaction
from django.db.models import Count
from django.shortcuts import render
from django.contrib.auth.models import User
from django.core.files.storage import default_storage
from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework import status

from .models import *

import os
import jwt
import uuid
import json
import calendar
import traceback
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta

class Register(APIView):
	def post(self, request):
		try:
			data = request.data
			existing_user = Profile.objects.filter(email=data["email"]).exists()

			if existing_user:
				return Response(status=status.HTTP_409_CONFLICT)
			
			is_man = True if data["gender"] == "man" else False
			birth_date = (datetime.strptime(data["birth_date"], '%Y-%m-%dT%H:%M:%S.%fZ') + timedelta(hours=1)).date()

			Profile.objects.create(
				first_name=data['first_name'],
				last_name=data['last_name'],
				birth_date=birth_date,
				gender=is_man,
				phone_number=data['phone_number'],
				email=data['email']
			)

			new_user = User(username=data["email"], first_name=data["first_name"], last_name=data["last_name"], email=data["email"])
			new_user.set_password(data["password"])
			new_user.save()

			return Response(status=status.HTTP_200_OK)

		except Exception as e:
			print(traceback.format_exc())
			return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class Login(APIView):
	def generate_token(self, profile_id, anonymous):
		payload = {
			"profile_id": profile_id,
			"exp": datetime.utcnow() + settings.JWT_TOKEN_LIFETIME,
			"is_anonymous": anonymous,
		}
		token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
		return token

	def post(self, request):
		try:
			data = request.data
			if data["mode"] == "profile":
				user = authenticate(username=data["email"], password=data["password"])
				if user != None:
					token = self.generate_token(Profile.objects.get(email=data["email"]).id, False)
					result = {"token": token}
					return Response(result, status=status.HTTP_200_OK)
				else:
					return Response(status=status.HTTP_401_UNAUTHORIZED)
			elif data["mode"] == "anonymous":
				profile = Profile.objects.create()
				token = self.generate_token(profile_id=profile.id, anonymous=True)
				result = {"token": token}
				return Response(result, status=status.HTTP_200_OK)
			else:
				return Response(status=status.HTTP_400_BAD_REQUEST)
		except Exception as e:
			print(traceback.format_exc())
			return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class Addresses(APIView):
	def get(self, request):
		try:
			profile = request.profile
			exist_address = Address.objects.filter(profile=profile).exists()
			result = {
				"country": "",
				"city": "",
				"street": "",
				"house_number": "",
				"flat_number": ""
			}
			
			if exist_address:
				address = Address.objects.get(profile=profile)
				result["country"] = address.country
				result["city"] = address.city
				result["street"] = address.street
				result["house_number"] = address.house_number
				result["flat_number"] = address.flat_number
			
			return Response(result, status=status.HTTP_200_OK)
		except Exception as e:
			print(traceback.format_exc())
			return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

	def post(self, request):
		try:
			data = request.data
			profile = request.profile
			exist_address = Address.objects.filter(profile=profile).exists()
			if exist_address:
				address = Address.objects.get(profile=profile)
				address.country = data["country"]
				address.city = data["city"]
				address.street = data["street"]
				address.house_number = data["house_number"]
				address.flat_number = data["flat_number"]
				address.save()
			else:
				Address.objects.create(
					profile=profile,
					country=data["country"],
					city=data["city"],
					street=data["street"],
					house_number=data["house_number"],
					flat_number=data["flat_number"]
				)
			return Response(status=status.HTTP_200_OK)
		except Exception as e:
			print(traceback.format_exc())
			return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class Orders(APIView):
	def get(self, request):
		try:
			profile = request.profile
			orders = Order.objects.filter(profile=profile, status__in=["completed", "sent"])
			result = {"orders": []}

			for order in orders:
				address = Address.objects.get(profile=profile)
				
				discount = 0
				if CouponOrder.objects.filter(order=order).exists():
					discount = CouponOrder.objects.get(order=order).discount

				data = {
					"id": order.id,
					"date": order.date,
					"shipped": True if order.status == "sent" else False,
					"profile": {
						"email": profile.email,
						"first_name": profile.first_name,
						"last_name": profile.last_name,
						"phone_number": profile.phone_number,
					},
					"address": {
						"country": address.country,
						"city": address.city,
						"street": address.street,
						"house_number": address.house_number,
						"flat_number": address.flat_number
					
					},
					"discount": discount,
					"products": []
				}

				products = ProductOrder.objects.filter(order=order)
				for product in products:
					data["products"].append({
						"id": product.product.id,
						"name": product.product.name,
						"price": product.product.price,
						"quantity": product.quantity,
						"images": [x.image.name.split("/")[-1] for x in ProductImage.objects.filter(product=product.product)]
					})
				result["orders"].append(data)

			return Response(result, status=status.HTTP_200_OK)
		except Exception as e:
			print(traceback.format_exc())
			return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class Cart(APIView):
	def check_availability(self, product_id, quantity):
		product = Product.objects.get(id=product_id)
		return product.quantity >= quantity
			

	def get(self, request):
		try:
			profile = request.profile
			exists = Order.objects.filter(profile=profile, status="in_progress").exists()
			result = {"orders": []}

			if exists:
				order = Order.objects.get(profile=profile, status="in_progress")
				products = ProductOrder.objects.filter(order=order)
				for product in products:
					result["orders"].append({
						"id": product.product.id,
						"name": product.product.name,
						"description": product.product.description,
						"price": product.product.price,
						"quantity": product.quantity,
						"categories": [p.category.name for p in ProductCategory.objects.filter(product=product.product)],
						"images": [x.image.name.split("/")[-1] for x in ProductImage.objects.filter(product=product.product)]
					})

			return Response(result, status=status.HTTP_200_OK)
		except Exception as e:
			print(traceback.format_exc())
			return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

	def post(self, request):
		try:
			with transaction.atomic():
				profile = request.profile
				data = request.data
				if data["action"] == "add":
					product_available = self.check_availability(data["product_id"], data["quantity"])
					if not product_available:
						return Response(status=status.HTTP_409_CONFLICT)
					order_exists = Order.objects.filter(profile=profile, status="in_progress").exists()
					if not order_exists:
						order = Order.objects.create(
							profile=profile,
							status="in_progress"			
						)
					else:
						order = Order.objects.get(profile=profile, status="in_progress")

					product = Product.objects.get(id=data["product_id"])
					order_product_exists = ProductOrder.objects.filter(order=order, product=product).exists()

					if order_product_exists:
						product_order = ProductOrder.objects.get(order=order, product=product)
						product_order.quantity += data["quantity"]
						product_order.save()
					else:
						ProductOrder.objects.create(
							order=order,
							product=Product.objects.get(id=data["product_id"]),
							quantity=data["quantity"]
						)
				elif data["action"] == "delete": 
					order = Order.objects.get(profile=profile, status="in_progress")
					product_order = ProductOrder.objects.get(order=order, product=Product.objects.get(id=data["product_id"]))
					product_order.delete()
				elif data["action"] == "finish":
					address_exists = Address.objects.filter(profile=profile).exists()
					profile_exists = profile.email != "" and profile.first_name != "" and profile.last_name != "" and profile.phone_number != "" and profile.birth_date != "" and profile.gender
					if not address_exists or not profile_exists:
						return Response(status=status.HTTP_400_BAD_REQUEST)

					order = Order.objects.get(profile=profile, status="in_progress")
					order.status = "completed"

					if Coupon.objects.filter(code=data["coupon_code"]).exists():
						coupon = Coupon.objects.get(code=data["coupon_code"])
						CouponOrder.objects.create(order=order, discount=coupon.discount)
					
					for product_order in ProductOrder.objects.filter(order=order):
						product = product_order.product
						product.quantity -= product_order.quantity
						product.save()

					order.save()				
				else:
					return Response(status=status.HTTP_400_BAD_REQUEST)
				return Response(status=status.HTTP_200_OK)
		except Exception as e:
			print(traceback.format_exc())
			return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
		
class AdminProfile(APIView):
	def get(self, request):
		try:
			profiles = []
			for profile in Profile.objects.all():
				if User.objects.filter(email=profile.email).exists():
					profiles.append({
						"email": profile.email,
						"first_name": profile.first_name,
						"last_name": profile.last_name,
						"is_admin": User.objects.get(email=profile.email).is_superuser
					})


			result = {"profiles": profiles}
			return Response(result, status=status.HTTP_200_OK)
		except Exception as e:
			print(traceback.format_exc())
			return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

	def post(self, request):
		try:
			profiles = request.data["profiles"]
			for profile in profiles:
				user = User.objects.get(email=profile["email"])
				user.is_superuser = profile["is_admin"]
				user.save()
			return Response(status=status.HTTP_200_OK)
		except Exception as e:
			print(traceback.format_exc())
			return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class Statistics(APIView):
	def get(self, request):
		try:
			result = {
				"statistics": {
					"money": {
						"labels": [],
						"values": [],
					},
					"categories": {
						"labels": [],
						"values": [],
					},
					"top": {
						"labels": [],
						"values": [],
					},
					"quantity": [],
			}}

			months = [
				("January", "Január"),
				("February", "Február"),
				("March", "Március"),
				("April", "Április"),
				("May", "Május"),
				("June", "Június"),
				("July", "Július"),
				("August", "Augusztus"),
				("September", "Szeptember"),
				("October", "Október"),
				("November", "November"),
				("December", "December")]

			six_months_ago = (datetime.now() + timedelta(hours=1)) - relativedelta(months=5)
			en_month_names = [(six_months_ago + relativedelta(months=i)).strftime("%B") for i in range(6)]
			hu_month_names = [next(month[1] for month in months if month[0] == x) for x in en_month_names]
			
			for month in en_month_names:
				orders = Order.objects.filter(date__month=list(calendar.month_name)[1:].index(month) + 1, status="sent")
				money = 0
				for order in orders:
					products = ProductOrder.objects.filter(order=order)
					for product in products:
						money += product.product.price * product.quantity
				result["statistics"]["money"]["values"].append(money)
			result["statistics"]["money"]["labels"] = hu_month_names

			categories = list(Category.objects.all().values_list("name", flat=True))
			orders = Order.objects.filter(date__month=(datetime.now() + timedelta(days=1)).month ,status="sent")
			for category in categories:
				count = 0
				for order in orders:
					product_order = ProductOrder.objects.filter(order=order)
					for prod_ord in product_order:
						product = prod_ord.product
						if ProductCategory.objects.filter(product=product, category=Category.objects.get(name=category)).exists():
							count += prod_ord.quantity
				result["statistics"]["categories"]["values"].append(count)
			result["statistics"]["categories"]["labels"] = categories

			top_products = list(ProductOrder.objects.values_list('product__name').annotate(total_orders=Count('product')) .order_by('-total_orders')[:5])
			result["statistics"]["top"]["labels"] = [x[0] for x in top_products]
			result["statistics"]["top"]["values"] = [x[1] for x in top_products]

			products = list(Product.objects.order_by('quantity').values_list("name", "quantity"))[:10]
			result["statistics"]["quantity"] = products

			return Response(result, status=status.HTTP_200_OK)

		except Exception as e:
			print(traceback.format_exc())
			return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ProfileContext(APIView):
	def get(self, request):
		try:
			profile = request.profile
			result = {"is_admin": False}

			if User.objects.filter(email=profile.email).exists():
				result["is_admin"] = User.objects.get(email=profile.email).is_superuser

			return Response(result, status=status.HTTP_200_OK)
		except Exception as e:
			print(traceback.format_exc())
			return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)	

class UserProfile(APIView):
	def get(self, request):
		try:
			profile = request.profile
			result = {
				"email": profile.email,
				"first_name": profile.first_name,
				"last_name": profile.last_name,
				"birth_date": profile.birth_date,
				"gender": "man" if profile.gender else "woman",
				"phone_number": profile.phone_number,
			}
			return Response(result, status=status.HTTP_200_OK)
		except Exception as e:
			print(traceback.format_exc())
			return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
	
	def post(self, request):
		try:
			with transaction.atomic():
				profile = request.profile
				data = request.data

				profile.first_name = data["first_name"]
				profile.last_name = data["last_name"]
				profile.birth_date = (datetime.strptime(data["birth_date"], '%Y-%m-%dT%H:%M:%S.%fZ') + timedelta(hours=1)).date()
				profile.phone_number = data["phone_number"]
				profile.gender = True if data["gender"] == "man" else False
				profile.email = data["email"]
				profile.save()

				if User.objects.filter(email=profile.email).exists():
					user = User.objects.get(email=profile.email)
					user.username = data["email"]
					user.email = data["email"]

					if "password" in data.keys():
						user.set_password(data["password"])

					user.save()

				return Response(status=status.HTTP_200_OK)
		except Exception as e:
			print(traceback.format_exc())
			return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class Products(APIView):
	def get(self, request):
		try:
			profile = request.profile
			products = Product.objects.all()
			result = {"products": []}

			for product in products:
				result["products"].append({
					"id": product.id,
					"name": product.name,
					"description": product.description,
					"price": product.price,
					"showed": product.showed,
					"quantity": product.quantity,
					"favorite": Favorite.objects.filter(profile=profile, product=product).exists(),
					"categories": [p.category.name for p in ProductCategory.objects.filter(product=product)],
					"images": [p.image.name.split("/")[-1] for p in ProductImage.objects.filter(product=product)]
				})

			return Response(result, status=status.HTTP_200_OK)
		except Exception as e:
			print(traceback.format_exc())
			return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

	def post(self, request):
		try:
			with transaction.atomic():
				if request.data.get('action') == "new":
					name = request.data.get('name')
					description = request.data.get('description')
					price = float(request.data.get('price'))
					quantity = int(request.data.get('quantity'))
					showed = json.loads(request.data.get('showed'))
					categories = json.loads(request.data.get('categories'))
					image = request.FILES["picture"]

					extension = os.path.splitext(image.name)[1]
					image.name = str(uuid.uuid4()) + extension
					path = default_storage.save(image.name, image)

					product = Product.objects.create(
						name=name,
						description=description,
						price=price,
						quantity=quantity,
						showed=showed
					)

					for c in categories:
						category = Category.objects.get(name=c)
						ProductCategory.objects.create(product=product, category=category)

					product_image = ProductImage.objects.create(image=path, product=product)

					result = {
						"product": {
							"id": product.id,
							"name": product.name,
							"description": product.description,
							"price": product.price,
							"quantity": product.quantity,
							"categories": [p.category.name for p in ProductCategory.objects.filter(product=product)],
							"images": [ProductImage.objects.get(product=product).image.name.split("/")[-1]]
						}
					}
				
					return Response(result, status=status.HTTP_200_OK)
				elif request.data.get('action') == "delete":
					product = Product.objects.get(id=request.data["product_id"])
					product.delete()
					return Response(status=status.HTTP_200_OK)
				elif request.data.get('action') == "edit":
					product = Product.objects.get(id=request.data["product_id"])
					product.name = request.data["name"]
					product.description = request.data["description"]
					product.price = request.data["price"]
					product.showed = request.data["showed"]
					product.quantity = request.data["quantity"]
					product.save()

					old_categories = ProductCategory.objects.filter(product=product)
					new_categories = json.loads(request.data["categories"])

					for category in old_categories:
						if category.category.name not in request.data["categories"]:
							category.delete()
					
					for category in new_categories:
						if not ProductCategory.objects.filter(product=product, category=Category.objects.get(name=category)).exists():
							ProductCategory.objects.create(product=product, category=Category.objects.get(name=category))

					return Response(status=status.HTTP_200_OK)
				else:
					return Response(status=status.HTTP_400_BAD_REQUEST)
		except Exception as e:
			print(traceback.format_exc())
			return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class Categories(APIView):
	def get(self, request):
		try:
			categories = Category.objects.all()
			result = {"categories": []}

			for category in categories:
				result["categories"].append(category.name)

			return Response(result, status=status.HTTP_200_OK)
		except Exception as e:
			print(traceback.format_exc())
			return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
	
	def post(self, request):
		try:
			data = request.data
			if data["action"] == "new":
				if not Category.objects.filter(name=data["name"]).exists():
					category = Category.objects.create(name=data["name"])
					return Response(status=status.HTTP_200_OK)
				return Response(status=status.HTTP_409_CONFLICT)
			elif data["action"] == "delete":
				category = Category.objects.get(name=data["name"])
				category.delete()
				return Response(status=status.HTTP_200_OK)
			else:
				return Response(status=status.HTTP_400_BAD_REQUEST)
			return Response(status=status.HTTP_200_OK)
		except Exception as e:
			print(traceback.format_exc())
			return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class Shipping(APIView):
	def get(self, request):
		try:
			orders = Order.objects.filter(status="completed")
			result = {"orders": []}

			for order in orders:
				profile = order.profile
				address = Address.objects.get(profile=profile)

				discount = 0
				if CouponOrder.objects.filter(order=order).exists():
					discount = CouponOrder.objects.get(order=order).discount
				
				data = {
					"id": order.id,
					"profile": {
						"email": profile.email,
						"first_name": profile.first_name,
						"last_name": profile.last_name,
						"phone_number": profile.phone_number,
					},
					"address": {
						"country": address.country,
						"city": address.city,
						"street": address.street,
						"house_number": address.house_number,
						"flat_number": address.flat_number
					},
					"products": [],
					"discount": discount,
				}

				products = ProductOrder.objects.filter(order=order)
				for product in products:
					data["products"].append({
						"id": product.product.id,
						"name": product.product.name,
						"price": product.product.price,
						"quantity": product.quantity,
						"images": [x.image.name.split("/")[-1] for x in ProductImage.objects.filter(product=product.product)]
					})
				result["orders"].append(data)

			return Response(result, status=status.HTTP_200_OK)
		except Exception as e:
			print(traceback.format_exc())
			return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
	
	def post(self, request):
		try:
			data = request.data
			order = Order.objects.get(id=data["order_id"])
			order.status = "sent"
			order.save()
			return Response(status=status.HTTP_200_OK)
		except Exception as e:
			print(traceback.format_exc())
			return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class Favorites(APIView):
	def post(self, request):
		try:
			profile = request.profile
			data = request.data
			if data["action"] == "add":
				product = Product.objects.get(id=data["product_id"])
				Favorite.objects.create(profile=profile, product=product)
			elif data["action"] == "delete":
				product = Product.objects.get(id=data["product_id"])
				Favorite.objects.get(profile=profile, product=product).delete()
			else:
				return Response(status=status.HTTP_400_BAD_REQUEST)
			return Response(status=status.HTTP_200_OK)
		except Exception as e:
			print(traceback.format_exc())
			return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class Coupons(APIView):
	def get(self, request):
		try:
			coupons = Coupon.objects.all().values()
			result = {"coupons": coupons}
			return Response(result, status=status.HTTP_200_OK)
		except Exception as e:
			print(traceback.format_exc())
			return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
	
	def post(self, request):
		try:
			profile = request.profile
			data = request.data
			if data["action"] == "new":
				if not Coupon.objects.filter(code=data["code"]).exists():
					coupon = Coupon.objects.create(code=data["code"], discount=data["discount"])
					result = {"coupon": {"id": coupon.id, "code": coupon.code, "discount": coupon.discount}}
					return Response(result, status=status.HTTP_200_OK)
				return Response(status=status.HTTP_409_CONFLICT)
			elif data["action"] == "delete":
				Coupon.objects.get(id=data["coupon_id"]).delete()
				return Response(status=status.HTTP_200_OK)
			elif data["action"] == "edit":
				coupon = Coupon.objects.get(id=data["coupon_id"])
				coupon.code = data["code"]
				coupon.discount = data["discount"]
				coupon.save()
				return Response(status=status.HTTP_200_OK)
			elif data["action"] == "validate":
				if Coupon.objects.filter(code=data["code"]).exists():
					coupon = Coupon.objects.get(code=data["code"])
					result = {"coupon": {"id": coupon.id, "code": coupon.code, "discount": coupon.discount}}
					return Response(result, status=status.HTTP_200_OK)
				return Response(status=status.HTTP_204_NO_CONTENT)
			else:
				return Response(status=status.HTTP_400_BAD_REQUEST)
		except Exception as e:
			print(traceback.format_exc())
			return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)