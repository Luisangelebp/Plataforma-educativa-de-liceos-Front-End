from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.authentication import SessionAuthentication
from .models import Representante
from .serializers import RegistroRepresentanteSerializer, RepresentanteListSerializer, RepresentanteUpdateSerializer

class RegistroRepresentanteView(generics.CreateAPIView):
    """
    Solo el Administrador puede registrar nuevos representantes.
    """
    queryset = Representante.objects.all()
    serializer_class = RegistroRepresentanteSerializer
    authentication_classes = [JWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAdminUser]

class ListRepresentantesView(generics.ListAPIView):
    """
    - Admin: Ve todos los representantes.
    - Representante: Ve solo su propios datos.
    """
    serializer_class = RepresentanteListSerializer
    authentication_classes = [JWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.rol == 'admin':
            return Representante.objects.all()
        return Representante.objects.filter(usuario=user)


class RepresentanteDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    - GET/PATCH: Admin o el propio Representante.
    - DELETE: Solo el Admin.
    """
    queryset = Representante.objects.all()
    serializer_class = RepresentanteUpdateSerializer
    authentication_classes = [JWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        obj = super().get_object()
        user = self.request.user
        
        # 🛡️ Seguridad: Solo Admin o el dueño del perfil
        if user.rol != 'admin' and user.id != obj.usuario.id:
            raise PermissionDenied("No tienes permiso para ver este perfil de representante.")
        return obj

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        # Forzamos partial=True para permitir PATCH
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        instance.refresh_from_db()
        return Response(RepresentanteListSerializer(instance).data)

    def perform_destroy(self, instance):
        # 🛡️ Solo el admin borra cuentas
        if self.request.user.rol != 'admin':
            raise PermissionDenied("Solo el administrador puede eliminar representantes.")
        
        # Borrado en cascada manual del usuario de Core
        if instance.usuario:
            instance.usuario.delete()
        else:
            instance.delete()