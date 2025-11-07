from rest_framework import generics, permissions
from .models import Estudiante
from .serializers import RegistroEstudianteSerializer, EstudianteListSerializer

class RegistroEstudianteView(generics.CreateAPIView):
    queryset = Estudiante.objects.all()
    serializer_class = RegistroEstudianteSerializer
    permission_classes = [permissions.AllowAny]  # para testing; en producción usar IsAdminUser

class ListEstudiantesView(generics.ListAPIView):
    queryset = Estudiante.objects.all()
    serializer_class = EstudianteListSerializer
    permission_classes = [permissions.AllowAny]  # sin protección por ahora
