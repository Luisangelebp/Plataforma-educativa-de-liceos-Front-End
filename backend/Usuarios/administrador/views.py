from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError, PermissionDenied
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.authentication import SessionAuthentication # 👈 Para tus pruebas en browser

from core.models import Usuario
from core.serializers import UsuarioSerializer
from .models import Administrador
from .serializers import AdministradorListSerializer

class AdministradorDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Centro de Control: Solo accesible por Administradores.
    """
    queryset = Usuario.objects.all()
    # 🛡️ Añadimos SessionAuthentication para que tú entres desde el admin de Django
    authentication_classes = [JWTAuthentication, SessionAuthentication]
    
    # 🛡️ CAMBIO CLAVE: Usamos IsAdminUser. 
    # Esto bloquea a Profesores, Estudiantes y Representantes desde la entrada.
    permission_classes = [permissions.IsAdminUser] 

    def get_serializer_class(self):
        if self.request.method in ['PATCH', 'PUT']:
            return UsuarioSerializer
        return AdministradorListSerializer

    def get_object(self):
        """
        Validación extra de seguridad a nivel de objeto.
        """
        user = self.request.user
        # Doble verificación: Debe ser staff y tener el rol 'admin'
        if not user.is_staff or getattr(user, 'rol', None) != 'admin':
            raise PermissionDenied("No tienes rango de administrador para acceder aquí.")
        return super().get_object()

    def perform_destroy(self, instance):
        """
        Eliminación total con protecciones.
        """
        # 1. Evitar que el admin se borre a sí mismo
        if self.request.user.id == instance.id:
            raise ValidationError("Acción denegada: No puedes eliminar tu propia cuenta.")

        # 2. Borrado físico (dispara CASCADE a perfiles)
        instance.delete()

    def update(self, request, *args, **kwargs):
        # Aseguramos que el PATCH sea la norma
        partial = kwargs.pop('partial', True) 
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Refrescamos para devolver la info actualizada
        return Response(serializer.data)