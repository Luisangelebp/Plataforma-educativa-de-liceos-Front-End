from rest_framework import generics, permissions
from .models import Representante
from .serializers import RegistroRepresentanteSerializer, RepresentanteListSerializer

class RegistroRepresentanteView(generics.CreateAPIView):
    queryset = Representante.objects.all()
    serializer_class = RegistroRepresentanteSerializer
    permission_classes = [permissions.AllowAny]  # para testing; en producción usar IsAdminUser

class ListRepresentantesView(generics.ListAPIView):
    queryset = Representante.objects.all()
    serializer_class = RepresentanteListSerializer
    permission_classes = [permissions.AllowAny]  # sin protección por ahora


