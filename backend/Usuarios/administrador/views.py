from rest_framework import generics, permissions
from .models import Administrador
from .serializers import RegistroAdministradorSerializer, AdministradorListSerializer

class RegistroAdministradorView(generics.CreateAPIView):
    queryset = Administrador.objects.all()
    serializer_class = RegistroAdministradorSerializer
    authentication_classes = []  
    permission_classes = [permissions.AllowAny]


class ListAdministradoresView(generics.ListAPIView):
    queryset = Administrador.objects.all()
    serializer_class = AdministradorListSerializer
    permission_classes = [permissions.AllowAny]  # sin protección por ahora
