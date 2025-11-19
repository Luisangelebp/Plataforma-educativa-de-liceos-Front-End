from rest_framework import generics, permissions
from rest_framework.response import Response
from .models import Representante
from .serializers import RegistroRepresentanteSerializer, RepresentanteListSerializer, RepresentanteUpdateSerializer

class RegistroRepresentanteView(generics.CreateAPIView):
    queryset = Representante.objects.all()
    serializer_class = RegistroRepresentanteSerializer
    permission_classes = [permissions.AllowAny]  # para testing; en producción usar IsAdminUser

class ListRepresentantesView(generics.ListAPIView):
    queryset = Representante.objects.all()
    serializer_class = RepresentanteListSerializer
    permission_classes = [permissions.AllowAny]  # sin protección por ahora


class RepresentanteDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Representante.objects.all()
    serializer_class = RepresentanteUpdateSerializer
    permission_classes = [permissions.AllowAny]  # en producción usar IsAdminUser
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        instance.refresh_from_db()
        return Response(RepresentanteListSerializer(instance).data)


