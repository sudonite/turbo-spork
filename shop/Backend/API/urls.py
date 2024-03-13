from django.urls import path
from .views import *

urlpatterns = [
    path('login/', Login.as_view()),
    path('register/', Register.as_view()),
    path('profile/', UserProfile.as_view()),
    path('cart/', Cart.as_view()),
    path('orders/', Orders.as_view()),
    path('shipping/', Shipping.as_view()),
    path('coupon/', Coupons.as_view()),
    path('address/', Addresses.as_view()),
    path('product/', Products.as_view()),
    path('category/', Categories.as_view()),
    path('favorite/', Favorites.as_view()),
    path('admin/', AdminProfile.as_view()),
    path('statistics/', Statistics.as_view()),
    path('context/', ProfileContext.as_view())
]