from django.urls import path
from .views import RegistroProfesorView, ListProfesoresView

urlpatterns = [
    path('registro/', RegistroProfesorView.as_view(), name='registro_profesor'),
    path('', ListProfesoresView.as_view(), name='lista_profesores'),
]


