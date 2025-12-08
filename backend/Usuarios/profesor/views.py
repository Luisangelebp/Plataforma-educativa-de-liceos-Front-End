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
    serializer_class = ProfesorListSerializer
    permission_classes = [permissions.AllowAny]  # en producción usar IsAuthenticated

    def get_queryset(self):
        queryset = Profesor.objects.all()
        nivel = self.request.GET.get("nivel")
        grado = self.request.GET.get("grado")
        seccion = self.request.GET.get("seccion")

        if nivel:
            queryset = queryset.filter(grado_secciones__nivel__iexact=nivel)
        if grado:
            queryset = queryset.filter(grado_secciones__grado=grado)
        if seccion:
            queryset = queryset.filter(grado_secciones__seccion=seccion)

        return queryset.distinct()


class ProfesorDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Profesor.objects.all()
    serializer_class = ProfesorUpdateSerializer
    permission_classes = [permissions.AllowAny]  # en producción usar IsAdminUser
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Usar el serializer de listado para incluir las secciones
        return Response(ProfesorListSerializer(instance).data)
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        # Devolver siempre con el serializer de listado (incluye secciones)
        return Response(ProfesorListSerializer(instance).data)