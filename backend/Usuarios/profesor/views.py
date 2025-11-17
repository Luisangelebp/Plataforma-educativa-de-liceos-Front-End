from rest_framework import generics, permissions
from .models import Profesor
from .serializers import RegistroProfesorSerializer, ProfesorListSerializer

class RegistroProfesorView(generics.CreateAPIView):
    queryset = Profesor.objects.all()
    serializer_class = RegistroProfesorSerializer
    authentication_classes = []  
    permission_classes = [permissions.AllowAny]
    
class ListProfesoresView(generics.ListAPIView):
    queryset = Profesor.objects.all()
    serializer_class = ProfesorListSerializer
    permission_classes = [permissions.AllowAny]  # sin protección por ahora


