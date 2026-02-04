from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.authentication import SessionAuthentication

from .models import Profesor
from .serializers import ProfesorListSerializer

class ProfesorPerfilView(APIView):
    """
    Endpoint para que el profesor obtenga su propio perfil
    GET /api/usuarios/profesor/perfil/
    """
    authentication_classes = [JWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """
        Retorna el perfil del profesor autenticado
        """
        if request.user.rol != 'profesor':
            raise PermissionDenied("Solo los profesores pueden acceder a este endpoint.")
        
        try:
            profesor = request.user.profesor_profile
            serializer = ProfesorListSerializer(profesor)
            return Response(serializer.data)
        except Profesor.DoesNotExist:
            return Response(
                {"error": "No se encontró el perfil de profesor para este usuario"}, 
                status=status.HTTP_404_NOT_FOUND
            )

class ProfesorPorUsuarioView(generics.RetrieveAPIView):
    """
    Endpoint para obtener el perfil de profesor por ID de usuario
    GET /api/usuarios/profesor/por-usuario/{user_id}/
    """
    serializer_class = ProfesorListSerializer
    authentication_classes = [JWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        user_id = self.kwargs['user_id']
        
        # Verificar permisos
        if self.request.user.rol not in ['admin', 'profesor']:
            raise PermissionDenied("No tienes permiso para ver perfiles de profesor.")
        
        # Si es profesor, solo puede ver su propio perfil
        if self.request.user.rol == 'profesor' and str(self.request.user.id) != str(user_id):
            raise PermissionDenied("Solo puedes ver tu propio perfil.")
        
        try:
            profesor = Profesor.objects.get(usuario_id=user_id)
            return profesor
        except Profesor.DoesNotExist:
            raise PermissionDenied("No se encontró el perfil de profesor para este usuario.")
