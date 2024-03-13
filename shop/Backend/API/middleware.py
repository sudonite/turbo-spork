from django.conf import settings
from rest_framework import exceptions

from .models import Profile

import jwt
import traceback

class MyJWTMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        try:
            if "Authorization" in request.headers:
                token = request.headers["Authorization"][7:]
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms="HS256")
                request.profile = Profile.objects.get(id=payload["profile_id"])
        except Exception as e:
            print(traceback.format_exc())

        response = self.get_response(request)
        return response
