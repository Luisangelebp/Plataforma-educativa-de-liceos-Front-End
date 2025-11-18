from rest_framework import generics, permissions
from rest_framework.response import Response
from .models import Profesor
from .serializers import RegistroProfesorSerializer, ProfesorListSerializer, ProfesorUpdateSerializer

class RegistroProfesorView(generics.CreateAPIView):
    queryset = Profesor.objects.all()
    serializer_class = RegistroProfesorSerializer
    authentication_classes = []  
    permission_classes = [permissions.AllowAny]
    
class ListProfesoresView(generics.ListAPIView):
    queryset = Profesor.objects.all()
    serializer_class = ProfesorListSerializer
    permission_classes = [permissions.AllowAny]  # sin protección por ahora


class ProfesorDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Profesor.objects.all()
    serializer_class = ProfesorUpdateSerializer
    permission_classes = [permissions.AllowAny]  # en producción usar IsAdminUser
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        instance.refresh_from_db()
        return Response(ProfesorListSerializer(instance).data)


