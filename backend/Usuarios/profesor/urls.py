from django.urls import path
from .views import RegistroProfesorView, ListProfesoresView, ProfesorDetailView
from .perfil_views import ProfesorPerfilView, ProfesorPorUsuarioView

urlpatterns = [
    path('registro/', RegistroProfesorView.as_view(), name='registro_profesor'),
    path('', ListProfesoresView.as_view(), name='lista_profesores'),
    path('<int:pk>/', ProfesorDetailView.as_view(), name='detalle_profesor'),
    path('perfil/', ProfesorPerfilView.as_view(), name='perfil_profesor'),
    path('por-usuario/<int:user_id>/', ProfesorPorUsuarioView.as_view(), name='profesor_por_usuario'),
]


