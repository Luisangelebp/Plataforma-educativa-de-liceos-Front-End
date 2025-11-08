from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UsuarioSerializer, LoginSerializer

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
            return Response({'mensaje': 'Usuario creado exitosamente', 'id': usuario.id}, status=status.HTTP_201_CREATED)
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

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'usuario': {
                'id': usuario.id,
                'email': usuario.email,
                'nombre': usuario.nombre,
                'apellido': usuario.apellido,
                'rol': usuario.rol
            }
        }, status=status.HTTP_200_OK)
