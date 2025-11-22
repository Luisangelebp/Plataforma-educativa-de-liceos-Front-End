from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LoginUsuarioView, RegistroUsuarioView, GradoSeccionViewSet

router = DefaultRouter()
router.register(r'grado-seccion', GradoSeccionViewSet, basename='grado-seccion')

urlpatterns = [
    path('login/', LoginUsuarioView.as_view(), name='login'),
    path('registro/', RegistroUsuarioView.as_view(), name='registro'),
    path('', include(router.urls)),  # incluye las rutas del ViewSet
]
