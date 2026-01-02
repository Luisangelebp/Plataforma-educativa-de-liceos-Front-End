from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
import json
from .models import Profesor
from .serializers import RegistroProfesorSerializer, ProfesorListSerializer, ProfesorUpdateSerializer

class RegistroProfesorView(APIView):
    authentication_classes = []  
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        # Si viene como FormData, procesar grado_secciones y materias
        data = request.data.copy()
        
        # Si grado_secciones viene como string JSON, parsearlo
        if 'grado_secciones' in data and isinstance(data['grado_secciones'], str):
            try:
                data['grado_secciones'] = json.loads(data['grado_secciones'])
            except json.JSONDecodeError:
                pass
        
        # Si materias viene como lista de strings, convertirlos a enteros
        if 'materias' in data:
            if isinstance(data.getlist('materias'), list):
                materias_list = data.getlist('materias')
                data['materias'] = [int(m) for m in materias_list if m]
            elif isinstance(data['materias'], str):
                try:
                    data['materias'] = [int(data['materias'])]
                except ValueError:
                    data['materias'] = []
        
        serializer = RegistroProfesorSerializer(data=data)
        if serializer.is_valid():
            profesor = serializer.save()
            return Response(ProfesorListSerializer(profesor).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
        
        # Si viene como FormData, procesar grado_secciones y materias
        data = request.data.copy()
        
        # Si grado_secciones viene como string JSON, parsearlo
        if 'grado_secciones' in data and isinstance(data['grado_secciones'], str):
            try:
                data['grado_secciones'] = json.loads(data['grado_secciones'])
            except json.JSONDecodeError:
                pass
        
        # Si materias viene como lista de strings, convertirlos a enteros
        if 'materias' in data:
            if isinstance(data.getlist('materias'), list):
                materias_list = data.getlist('materias')
                data['materias'] = [int(m) for m in materias_list if m]
            elif isinstance(data['materias'], str):
                try:
                    data['materias'] = [int(data['materias'])]
                except ValueError:
                    data['materias'] = []
        
        serializer = self.get_serializer(instance, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        # Devolver siempre con el serializer de listado (incluye secciones)
        return Response(ProfesorListSerializer(instance).data)