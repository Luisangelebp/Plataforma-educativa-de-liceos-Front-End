from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UsuarioSerializer, LoginSerializer

# Importar los serializers de cada rol
from Usuarios.profesor.serializers import ProfesorListSerializer
from Usuarios.estudiante.serializers import EstudianteListSerializer
from Usuarios.representante.serializers import RepresentanteListSerializer
from Usuarios.administrador.serializers import AdministradorListSerializer


class RegistroUsuarioView(APIView):
    def get(self, request):
        """
        Endpoint GET para mostrar información sobre el registro.
        El registro debe realizarse mediante POST.
        """
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
    def get(self, request):
        """
        Endpoint GET para mostrar información sobre el login.
        El login debe realizarse mediante POST.
        """
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

        # Seleccionar el perfil según el rol usando el related_name correcto
        perfil_data = None
        if usuario.rol == 'profesor':
            perfil = getattr(usuario, 'profesor_profile', None)
            if perfil:
                perfil_data = ProfesorListSerializer(perfil).data
        elif usuario.rol == 'estudiante':
            perfil = getattr(usuario, 'estudiante_profile', None)
            if perfil:
                perfil_data = EstudianteListSerializer(perfil).data
        elif usuario.rol == 'representante':
            perfil = getattr(usuario, 'representante_profile', None)
            if perfil:
                perfil_data = RepresentanteListSerializer(perfil).data
        elif usuario.rol == 'admin':
            perfil = getattr(usuario, 'administrador_profile', None)
            if perfil:
                perfil_data = AdministradorListSerializer(perfil).data

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'usuario': perfil_data if perfil_data else UsuarioSerializer(usuario).data
        }, status=status.HTTP_200_OK)
