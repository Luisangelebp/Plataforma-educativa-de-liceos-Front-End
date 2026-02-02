from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.authentication import SessionAuthentication
from django.shortcuts import get_object_or_404

from .serializers import (
    UsuarioSerializer, LoginSerializer, GradoSeccionSerializer, 
    AdminSetUserPasswordSerializer, InstitucionSerializer, PeriodoEscolarSerializer
)
from core.models import GradoSeccion, Usuario, Institucion, PeriodoEscolar

# Importar los serializers de cada rol para el login unificado
from Usuarios.profesor.serializers import ProfesorListSerializer
from Usuarios.estudiante.serializers import EstudianteListSerializer
from Usuarios.representante.serializers import RepresentanteListSerializer
from Usuarios.administrador.serializers import AdministradorListSerializer

class RegistroUsuarioView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        return Response({
            'mensaje': 'Este endpoint requiere método POST para registrar usuarios',
            'instrucciones': {
                'metodo': 'POST',
                'campos_requeridos': ['email', 'password', 'nombre', 'apellido', 'rol'],
                'roles_disponibles': ['admin', 'profesor', 'representante', 'estudiante']
            }
        }, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = UsuarioSerializer(data=request.data)
        if serializer.is_valid():
            usuario = serializer.save()
            return Response({
                'mensaje': 'Usuario creado exitosamente',
                'id': usuario.id
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginUsuarioView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({
            'mensaje': 'Este endpoint requiere método POST para iniciar sesión',
            'instrucciones': {
                'metodo': 'POST',
                'campos_requeridos': ['email', 'password', 'rol'],
                'roles_disponibles': ['admin', 'profesor', 'representante', 'estudiante']
            }
        }, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        usuario = serializer.validated_data['usuario']
        refresh = RefreshToken.for_user(usuario)

        perfil_data = None
        if usuario.rol == 'profesor':
            perfil = getattr(usuario, 'profesor_profile', None)
            if perfil: perfil_data = ProfesorListSerializer(perfil).data
        elif usuario.rol == 'estudiante':
            perfil = getattr(usuario, 'estudiante_profile', None)
            if perfil: perfil_data = EstudianteListSerializer(perfil).data
        elif usuario.rol == 'representante':
            perfil = getattr(usuario, 'representante_profile', None)
            if perfil: perfil_data = RepresentanteListSerializer(perfil).data
        elif usuario.rol == 'admin':
            perfil = getattr(usuario, 'administrador_profile', None)
            if perfil: perfil_data = AdministradorListSerializer(perfil).data

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'usuario': perfil_data if perfil_data else UsuarioSerializer(usuario).data
        }, status=status.HTTP_200_OK)


class GradoSeccionViewSet(viewsets.ModelViewSet):
    queryset = GradoSeccion.objects.all()
    serializer_class = GradoSeccionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class UsuarioUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            usuario = Usuario.objects.get(pk=pk)
        except Usuario.DoesNotExist:
            return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        
        if request.user.id != usuario.id:
            return Response({'error': 'No tienes permiso para actualizar este usuario'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = UsuarioSerializer(usuario, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminSetUserPasswordView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, pk):
        try:
            usuario = Usuario.objects.get(pk=pk)
        except Usuario.DoesNotExist:
            return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        serializer = AdminSetUserPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        usuario.set_password(serializer.validated_data['password'])
        usuario.save()

        return Response({'mensaje': 'Contraseña actualizada correctamente'}, status=status.HTTP_200_OK)

# --- NUEVAS VISTAS PARA EL FRONT (CONFIGURACIÓN) ---

class InstitucionViewSet(viewsets.ModelViewSet):
    """
    ViewSet para manejar la info del Liceo. Solo permite una instancia.
    """
    serializer_class = InstitucionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return Institucion.objects.all()

    def get_object(self):
        # Siempre intenta devolver el primer registro o crear uno base
        obj, created = Institucion.objects.get_or_create(id=1, defaults={"nombre": "Mi Institución"})
        return obj

    def list(self, request, *args, **kwargs):
        # En lugar de una lista, devolvemos el objeto único directamente
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class PeriodoEscolarViewSet(viewsets.ModelViewSet):
    """
    ViewSet para que el front cree y active periodos escolares.
    """
    queryset = PeriodoEscolar.objects.all().order_by('-id')
    serializer_class = PeriodoEscolarSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]