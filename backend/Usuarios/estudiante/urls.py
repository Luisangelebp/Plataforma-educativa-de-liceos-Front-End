from django.urls import path
from .views import RegistroEstudianteView, ListEstudiantesView, EstudiantesPDFView

urlpatterns = [
    path('registro/', RegistroEstudianteView.as_view(), name='registro_estudiante'),
    path('', ListEstudiantesView.as_view(), name='lista_estudiantes'),
    path('pdf/', EstudiantesPDFView.as_view(), name='estudiantes_pdf'),
]
