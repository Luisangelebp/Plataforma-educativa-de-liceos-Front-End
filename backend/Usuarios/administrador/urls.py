from django.urls import path
from .views import RegistroAdministradorView, ListAdministradoresView, AdministradorDetailView

urlpatterns = [
    path('registro/', RegistroAdministradorView.as_view(), name='registro_administrador'),
    path('', ListAdministradoresView.as_view(), name='lista_administradores'),
    path('<int:pk>/', AdministradorDetailView.as_view(), name='administrador_detalle'),
]