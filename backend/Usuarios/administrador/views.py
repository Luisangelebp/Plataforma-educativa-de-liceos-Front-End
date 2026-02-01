from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError, PermissionDenied
from rest_framework_simplejwt.authentication import JWTAuthentication

from core.models import Usuario
from core.serializers import UsuarioSerializer # Importante para el update
from .models import Administrador
from .serializers import RegistroAdministradorSerializer, AdministradorListSerializer

# ... RegistroAdministradorView y ListAdministradoresView se mantienen igual ...

class AdministradorDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Endpoint: /usuarios/administrador/<id_usuario>/
    Centro de Control: Usa el ID del Usuario (Core) para gestionar 
    a cualquier usuario con cuenta de acceso.
    """
    queryset = Usuario.objects.all()
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        # Para ver detalles usamos el de Admin, para editar usamos el de Usuario
        if self.request.method in ['PATCH', 'PUT']:
            return UsuarioSerializer
        return AdministradorListSerializer

    def perform_destroy(self, instance):
        """
        Elimina el registro de la tabla core_usuario. 
        Esto dispara el CASCADE hacia los perfiles asociados.
        """
        # 1. Validar que el usuario sea administrador
        if getattr(self.request.user, 'rol', None) != 'admin':
            raise PermissionDenied("No tienes permisos de administrador para borrar usuarios.")

        # 2. Evitar que el admin se borre a sí mismo
        if self.request.user.id == instance.id:
            raise ValidationError("Acción denegada: No puedes eliminar tu propia cuenta de administrador.")

        # 3. ELIMINACIÓN TOTAL Y REAL
        instance.delete()

    def update(self, request, *args, **kwargs):
        """
        Sobrescribimos para asegurar que la actualización se procese
        correctamente sobre el modelo Usuario.
        """
        partial = kwargs.pop('partial', True) # Permitir PATCH por defecto
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)