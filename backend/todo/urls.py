from django.urls import path, include
from rest_framework import routers
from . import views

router = routers.DefaultRouter()
router.register(r'tasks', views.TodoView, basename='task')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', views.RegisterView.as_view()),
]