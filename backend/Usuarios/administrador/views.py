from rest_framework import generics, permissions
from .models import Administrador
from .serializers import RegistroAdministradorSerializer, AdministradorListSerializer

class RegistroAdministradorView(generics.CreateAPIView):
    queryset = Administrador.objects.all()
    serializer_class = RegistroAdministradorSerializer
    permission_classes = [permissions.IsAdminUser]

class ListAdministradoresView(generics.ListAPIView):
    queryset = Administrador.objects.all()
    serializer_class = AdministradorListSerializer
    permission_classes = [permissions.AllowAny]  # sin protección por ahora


