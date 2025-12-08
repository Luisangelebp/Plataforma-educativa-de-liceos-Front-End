from django.urls import path
from . import views

app_name = 'boletines'

urlpatterns = [
    # Plantillas
    path('plantillas/', views.PlantillaBoletinListCreateView.as_view(), name='plantilla-list-create'),
    path('plantillas/<int:pk>/', views.PlantillaBoletinDetailView.as_view(), name='plantilla-detail'),
    path('plantillas/<int:pk>/descargar/', views.DescargarPlantillaView.as_view(), name='plantilla-descargar'),
    path('plantillas/periodo/<str:periodo>/', views.PlantillasPorPeriodoView.as_view(), name='plantillas-por-periodo'),
    path('plantillas/periodo/<str:periodo>/grado/<int:grado_id>/', views.PlantillaPorPeriodoGradoView.as_view(), name='plantilla-por-periodo-grado'),
    
    # Boletines
    path('', views.BoletinListCreateView.as_view(), name='boletin-list-create'),
    path('<int:pk>/', views.BoletinDetailView.as_view(), name='boletin-detail'),
    path('<int:pk>/descargar/', views.DescargarBoletinView.as_view(), name='boletin-descargar'),
    path('estudiante/<int:estudiante_id>/', views.BoletinesPorEstudianteView.as_view(), name='boletines-por-estudiante'),
    path('estudiante/<int:estudiante_id>/lapso/<str:lapso>/', views.BoletinPorEstudianteLapsoView.as_view(), name='boletin-por-estudiante-lapso'),
    path('calcular-promedio/<int:estudiante_id>/lapso/<str:lapso>/', views.CalcularPromedioView.as_view(), name='calcular-promedio'),
]



