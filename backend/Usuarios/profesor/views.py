from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.authentication import SessionAuthentication
import json
from .models import Profesor
from .serializers import RegistroProfesorSerializer, ProfesorListSerializer, ProfesorUpdateSerializer

class RegistroProfesorView(APIView):
    """
    Solo el Administrador puede registrar nuevos profesores.
    """
    authentication_classes = [JWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAdminUser] 
    
    def post(self, request):
        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        
        # Procesar grado_secciones
        if 'grado_secciones' in data and isinstance(data['grado_secciones'], str):
            try:
                data['grado_secciones'] = json.loads(data['grado_secciones'])
            except json.JSONDecodeError:
                pass
        
        # Procesar materias (mantenemos tu lógica exacta de validación)
        if 'materias' in data:
            if hasattr(request.data, 'getlist'):
                if isinstance(data['materias'], str):
                    try:
                        materias_list = json.loads(data['materias'])
                        if isinstance(materias_list, list):
                            if len(materias_list) > 0:
                                data['materias'] = [int(m) for m in materias_list if m]
                            else:
                                del data['materias']
                    except (json.JSONDecodeError, ValueError, TypeError):
                        if 'materias' in data: del data['materias']
                elif isinstance(data['materias'], list):
                    if len(data['materias']) > 0:
                        data['materias'] = [int(m) for m in data['materias'] if m]
                    else:
                        del data['materias']
        
        serializer = RegistroProfesorSerializer(data=data)
        if serializer.is_valid():
            profesor = serializer.save()
            return Response(ProfesorListSerializer(profesor).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ListProfesoresView(generics.ListAPIView):
    """
    Solo Admins y Profesores pueden ver el listado.
    Los estudiantes tienen el acceso denegado.
    """
    serializer_class = ProfesorListSerializer
    authentication_classes = [JWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # 🛡️ Seguridad: Si es estudiante o representante, no ve la lista
        if self.request.user.rol not in ['admin', 'profesor']:
            raise PermissionDenied("No tienes permiso para ver la lista de profesores.")

        nivel = self.request.GET.get("nivel")
        grado = self.request.GET.get("grado")
        seccion = self.request.GET.get("seccion")

        queryset = Profesor.objects.prefetch_related(
            'grado_secciones',
            'materias'
        ).select_related('usuario')

        if nivel or grado or seccion:
            if nivel:
                queryset = queryset.filter(grado_secciones__nivel__iexact=nivel)
            if grado:
                queryset = queryset.filter(grado_secciones__grado=grado)
            if seccion:
                queryset = queryset.filter(grado_secciones__seccion=seccion)
            queryset = queryset.distinct()

        return queryset


class ProfesorDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    - GET: El Admin o el propio Profesor pueden ver.
    - PATCH/PUT: El Admin o el propio Profesor pueden editar.
    - DELETE: Solo el Admin puede borrar.
    """
    queryset = Profesor.objects.all()
    serializer_class = ProfesorUpdateSerializer
    authentication_classes = [JWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        obj = super().get_object()
        user = self.request.user
        
        # 🛡️ Seguridad: Bloquear si no es Admin y no es el dueño del perfil
        if user.rol != 'admin' and user.id != obj.usuario.id:
            raise PermissionDenied("No tienes permiso para acceder a este perfil.")
        return obj

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        return Response(ProfesorListSerializer(instance).data)
    
    def perform_destroy(self, instance):
        # 🛡️ Seguridad: Solo el admin borra. 
        # Al borrar el usuario de Core, el perfil de Profesor se va por CASCADE.
        if self.request.user.rol != 'admin':
            raise PermissionDenied("Solo el administrador puede eliminar registros de profesores.")
        
        if instance.usuario:
            instance.usuario.delete()
        else:
            instance.delete()
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        
        # Procesamiento de grado_secciones (JSON string)
        if 'grado_secciones' in data and isinstance(data['grado_secciones'], str):
            try: data['grado_secciones'] = json.loads(data['grado_secciones'])
            except json.JSONDecodeError: pass
        
        # Procesamiento de materias (Mantenemos tu lógica de conversión a enteros)
        if 'materias' in data:
            if hasattr(request.data, 'getlist'):
                if isinstance(data['materias'], str):
                    try:
                        m_list = json.loads(data['materias'])
                        data['materias'] = [int(m) for m in m_list if m]
                    except: pass
                elif isinstance(data['materias'], list):
                    data['materias'] = [int(m) for m in data['materias'] if m]

        serializer = self.get_serializer(instance, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(ProfesorListSerializer(instance).data)