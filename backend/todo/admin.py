from django.contrib import admin
from django.contrib.auth.models import User
from .models import Todo

admin.site.register(Todo)
