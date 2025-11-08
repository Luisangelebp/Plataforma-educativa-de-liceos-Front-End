from django.urls import path
from .views import RegistroAdministradorView, ListAdministradoresView

urlpatterns = [
    path('registro/', RegistroAdministradorView.as_view(), name='registro_administrador'),
    path('', ListAdministradoresView.as_view(), name='lista_administradores'),
]


