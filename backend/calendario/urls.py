from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'eventos', views.EventoCalendarioViewSet, basename='evento')

app_name = 'calendario'

urlpatterns = [
    path('', include(router.urls)),
]



