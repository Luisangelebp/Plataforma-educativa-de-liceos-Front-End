from django.urls import path
from .views import RegistroProfesorView, ListProfesoresView, ProfesorDetailView

urlpatterns = [
    path('registro/', RegistroProfesorView.as_view(), name='registro_profesor'),
    path('', ListProfesoresView.as_view(), name='lista_profesores'),
    path('<int:pk>/', ProfesorDetailView.as_view(), name='detalle_profesor'),
]


