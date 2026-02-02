from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError, PermissionDenied
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.authentication import SessionAuthentication

from core.models import Usuario
from core.serializers import UsuarioSerializer
from .models import Administrador
from .serializers import (
    RegistroAdministradorSerializer, 
    AdministradorListSerializer
)

class RegistroAdministradorView(generics.CreateAPIView):
    """
    Usa el RegistroAdministradorSerializer para crear el usuario
    y el perfil de administrador en un solo paso.
    """
    serializer_class = RegistroAdministradorSerializer
    authentication_classes = [JWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAdminUser]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # Tu serializer ya hace toda la magia en el método create()
        profesor = serializer.save()
        # Devolvemos el formato de lista para que el front reciba la info bonita
        return Response(
            AdministradorListSerializer(profesor).data, 
            status=status.HTTP_201_CREATED
        )

class ListAdministradoresView(generics.ListAPIView):
    """
    Lista todos los perfiles de administrador creados.
    """
    queryset = Administrador.objects.select_related('usuario').all()
    serializer_class = AdministradorListSerializer
    authentication_classes = [JWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAdminUser]

class AdministradorDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Permite ver, actualizar o borrar administradores.
    """
    queryset = Administrador.objects.select_related('usuario').all()
    authentication_classes = [JWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAdminUser] 

    def get_serializer_class(self):
        # Para ver detalles usamos la lista, para actualizar usamos el de Usuario
        if self.request.method in ['PATCH', 'PUT']:
            return UsuarioSerializer
        return AdministradorListSerializer

    def get_object(self):
        obj = super().get_object()
        # Verificación de seguridad extra: que el perfil pertenezca a un admin
        if obj.usuario.rol != 'admin':
            raise PermissionDenied("Este perfil no corresponde a un administrador.")
        return obj

    def perform_destroy(self, instance):
        # No permitir que un admin borre su propia cuenta
        if self.request.user.id == instance.usuario.id:
            raise ValidationError("No puedes eliminar tu propia cuenta de administrador.")
        # Al borrar el usuario, el CASCADE borra el perfil
        instance.usuario.delete()

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        # Actualizamos directamente el modelo Usuario asociado
        serializer = UsuarioSerializer(instance.usuario, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(AdministradorListSerializer(instance).data)