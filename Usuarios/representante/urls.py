from django.urls import path
from .views import RegistroRepresentanteView, ListRepresentantesView

urlpatterns = [
    path('registro/', RegistroRepresentanteView.as_view(), name='registro_representante'),
    path('', ListRepresentantesView.as_view(), name='lista_representantes'),
]


