from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LoginUsuarioView, RegistroUsuarioView, GradoSeccionViewSet, UsuarioUpdateView, AdminSetUserPasswordView

router = DefaultRouter()
router.register(r'grado-seccion', GradoSeccionViewSet, basename='grado-seccion')

urlpatterns = [
    path('login/', LoginUsuarioView.as_view(), name='login'),
    path('registro/', RegistroUsuarioView.as_view(), name='registro'),
    path('usuario/<int:pk>/', UsuarioUpdateView.as_view(), name='usuario-update'),
    path('usuario/<int:pk>/password/', AdminSetUserPasswordView.as_view(), name='admin-set-user-password'),
    path('', include(router.urls)),  # incluye las rutas del ViewSet
]
