from django.urls import path
from . import views

app_name = 'boletines'

urlpatterns = [
    # Gestión administrativa de boletines generados
    path('', views.BoletinListCreateView.as_view(), name='boletin-list-create'),
    path('<int:pk>/descargar/', views.DescargarBoletinView.as_view(), name='boletin-descargar'),

    # Motor Dual (Funciona para Primaria y Secundaria automáticamente)
    # POST para generar, guardar en BD y crear el archivo físico oficial
    path('generar/<int:estudiante_id>/lapso/<str:lapso>/', 
         views.GenerarBoletinView.as_view(), 
         name='generar-boletin'),
    
    # GET para ver el boletín en el navegador (HTML) sin guardarlo en disco
    path('vista-previa/<int:estudiante_id>/lapso/<str:lapso>/', 
         views.VistaPreviaBoletinView.as_view(), 
         name='vista-previa-boletin'),
]