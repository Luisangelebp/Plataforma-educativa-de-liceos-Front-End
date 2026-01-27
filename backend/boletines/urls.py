from django.urls import path
from . import views

app_name = 'boletines'

urlpatterns = [
    # Gestión administrativa (Listado y control)
    path('', views.BoletinListCreateView.as_view(), name='boletin-list-create'),
    
    # Descarga del archivo físico (IMPORTANTE: El admin usa 'boletin-descargar')
    path('<int:pk>/descargar/', views.DescargarBoletinView.as_view(), name='boletin-descargar'),

    # Motor de Generación (POST)
    path('generar/<int:estudiante_id>/lapso/<int:lapso>/', 
         views.GenerarBoletinView.as_view(), 
         name='generar-boletin'),
    
    # Vista previa (GET)
    path('vista-previa/<int:estudiante_id>/lapso/<int:lapso>/', 
         views.VistaPreviaBoletinView.as_view(), 
         name='vista-previa-boletin'),
]