from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LoginUsuarioView, RegistroUsuarioView, GradoSeccionViewSet, UsuarioUpdateView

router = DefaultRouter()
router.register(r'grado-seccion', GradoSeccionViewSet, basename='grado-seccion')

urlpatterns = [
    path('login/', LoginUsuarioView.as_view(), name='login'),
    path('registro/', RegistroUsuarioView.as_view(), name='registro'),
    path('usuario/<int:pk>/', UsuarioUpdateView.as_view(), name='usuario-update'),
    path('', include(router.urls)),  # incluye las rutas del ViewSet
]
