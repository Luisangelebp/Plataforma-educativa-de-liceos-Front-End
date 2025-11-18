from django.urls import path
from .views import RegistroRepresentanteView, ListRepresentantesView, RepresentanteDetailView

urlpatterns = [
    path('registro/', RegistroRepresentanteView.as_view(), name='registro_representante'),
    path('', ListRepresentantesView.as_view(), name='lista_representantes'),
    path('<int:pk>/', RepresentanteDetailView.as_view(), name='detalle_representante'),
]


