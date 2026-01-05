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
        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        
        # Si grado_secciones viene como string JSON, parsearlo
        if 'grado_secciones' in data and isinstance(data['grado_secciones'], str):
            try:
                data['grado_secciones'] = json.loads(data['grado_secciones'])
            except json.JSONDecodeError:
                pass
        
        # Si materias viene como FormData (JSON string) o JSON, procesarlo
        if 'materias' in data:
            # Verificar si es FormData (tiene método getlist)
            if hasattr(request.data, 'getlist'):
                # Es FormData, puede venir como JSON string o como lista
                if isinstance(data['materias'], str):
                    try:
                        materias_list = json.loads(data['materias'])
                        if isinstance(materias_list, list):
                            if len(materias_list) > 0:
                                # Convertir a lista de enteros
                                data['materias'] = [int(m) for m in materias_list if m is not None and m != '']
                            else:
                                # Array vacío, eliminar para que el backend lo maneje
                                del data['materias']
                    except (json.JSONDecodeError, ValueError, TypeError):
                        # No es JSON válido, eliminar
                        if 'materias' in data:
                            del data['materias']
                elif isinstance(data['materias'], list):
                    # Ya viene como lista (puede pasar con DRF), convertir a enteros
                    if len(data['materias']) > 0:
                        data['materias'] = [int(m) for m in data['materias'] if m is not None and m != '']
                    else:
                        del data['materias']
            # Si es JSON, el DRF parser ya lo maneja correctamente, no necesitamos procesar
        
        serializer = RegistroProfesorSerializer(data=data)
        if serializer.is_valid():
            profesor = serializer.save()
            return Response(ProfesorListSerializer(profesor).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ListProfesoresView(generics.ListAPIView):
    serializer_class = ProfesorListSerializer
    permission_classes = [permissions.AllowAny]  # en producción usar IsAuthenticated

    def get_queryset(self):
        nivel = self.request.GET.get("nivel")
        grado = self.request.GET.get("grado")
        seccion = self.request.GET.get("seccion")

        # Construir el queryset base - usar select_related y prefetch_related
        # Prefetch_related es crucial para ManyToMany fields
        queryset = Profesor.objects.prefetch_related(
            'grado_secciones',
            'materias'
        ).select_related('usuario')

        # Aplicar filtros si existen
        if nivel or grado or seccion:
            if nivel:
                queryset = queryset.filter(grado_secciones__nivel__iexact=nivel)
            if grado:
                queryset = queryset.filter(grado_secciones__grado=grado)
            if seccion:
                queryset = queryset.filter(grado_secciones__seccion=seccion)
            # Solo usar distinct si hay filtros aplicados
            queryset = queryset.distinct()
        else:
            # Si no hay filtros, simplemente obtener todos
            queryset = queryset.all()

        return queryset


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
        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        
        # Si grado_secciones viene como string JSON, parsearlo
        if 'grado_secciones' in data and isinstance(data['grado_secciones'], str):
            try:
                data['grado_secciones'] = json.loads(data['grado_secciones'])
            except json.JSONDecodeError:
                pass
        
        # Si materias viene como FormData (JSON string) o JSON, procesarlo
        if 'materias' in data:
            # Verificar si es FormData (tiene método getlist)
            if hasattr(request.data, 'getlist'):
                # Es FormData, puede venir como JSON string o como lista
                if isinstance(data['materias'], str):
                    try:
                        materias_list = json.loads(data['materias'])
                        if isinstance(materias_list, list):
                            if len(materias_list) > 0:
                                # Convertir a lista de enteros
                                data['materias'] = [int(m) for m in materias_list if m is not None and m != '']
                            else:
                                # Array vacío, eliminar para que el backend lo maneje
                                del data['materias']
                    except (json.JSONDecodeError, ValueError, TypeError):
                        # No es JSON válido, eliminar
                        if 'materias' in data:
                            del data['materias']
                elif isinstance(data['materias'], list):
                    # Ya viene como lista (puede pasar con DRF), convertir a enteros
                    if len(data['materias']) > 0:
                        data['materias'] = [int(m) for m in data['materias'] if m is not None and m != '']
                    else:
                        del data['materias']
            # Si es JSON, el DRF parser ya lo maneja correctamente, no necesitamos procesar
        
        serializer = self.get_serializer(instance, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        # Devolver siempre con el serializer de listado (incluye secciones)
        return Response(ProfesorListSerializer(instance).data)