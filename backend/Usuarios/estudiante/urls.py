from django.urls import path
from .views import RegistroEstudianteView, ListEstudiantesView, EstudiantesPDFView, EstudianteDetailView

urlpatterns = [
    path('registro/', RegistroEstudianteView.as_view(), name='registro_estudiante'),
    path('', ListEstudiantesView.as_view(), name='lista_estudiantes'),
    path('pdf/', EstudiantesPDFView.as_view(), name='estudiantes_pdf'),
    path('<int:pk>/', EstudianteDetailView.as_view(), name='detalle_estudiante'),
]
