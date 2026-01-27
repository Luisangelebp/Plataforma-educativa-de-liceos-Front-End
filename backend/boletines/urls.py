from django.urls import path
from . import views

app_name = 'boletines'

urlpatterns = [
    # Gestión administrativa de boletines generados (Listado de PDFs ya existentes)
    path('', views.BoletinListCreateView.as_view(), name='boletin-list-create'),
    path('<int:pk>/descargar/', views.DescargarBoletinView.as_view(), name='boletin-descargar'),

    # Motor Dual (Generación de nuevos documentos)
    # Se cambió <str:lapso> por <int:lapso> para mayor seguridad en la entrada
    path('generar/<int:estudiante_id>/lapso/<int:lapso>/', 
         views.GenerarBoletinView.as_view(), 
         name='generar-boletin'),
    
    path('vista-previa/<int:estudiante_id>/lapso/<int:lapso>/', 
         views.VistaPreviaBoletinView.as_view(), 
         name='vista-previa-boletin'),
]