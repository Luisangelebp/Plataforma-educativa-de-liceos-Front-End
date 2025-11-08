from rest_framework import generics, permissions
from .models import Profesor
from .serializers import RegistroProfesorSerializer, ProfesorListSerializer

class RegistroProfesorView(generics.CreateAPIView):
    queryset = Profesor.objects.all()
    serializer_class = RegistroProfesorSerializer
    permission_classes = [permissions.IsAdminUser]

class ListProfesoresView(generics.ListAPIView):
    queryset = Profesor.objects.all()
    serializer_class = ProfesorListSerializer
    permission_classes = [permissions.AllowAny]  # sin protección por ahora


