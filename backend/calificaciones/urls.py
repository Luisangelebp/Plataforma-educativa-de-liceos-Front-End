from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CalificacionViewSet

router = DefaultRouter()
router.register(r'', CalificacionViewSet, basename='calificacion')

urlpatterns = [
    path('', include(router.urls)),
]
