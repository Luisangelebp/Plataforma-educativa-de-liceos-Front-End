from rest_framework import viewsets, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from django.shortcuts import get_object_or_404

from .models import Calificacion
from .serializers import CalificacionSerializer
from horarios.models import Materia
from Usuarios.estudiante.models import Estudiante
from Usuarios.profesor.models import Profesor


class CalificacionViewSet(viewsets.ModelViewSet):
    serializer_class = CalificacionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Calificacion.objects.all()
        
        # Filtros opcionales
        materia = self.request.query_params.get('materia', None)
        lapso = self.request.query_params.get('lapso', None)
        estudiante = self.request.query_params.get('estudiante', None)
        profesor_id = self.request.query_params.get('profesor', None)
        
        # Si es profesor, solo puede ver sus propias calificaciones
        if self.request.user.rol == 'profesor':
            try:
                profesor = self.request.user.profesor_profile
                queryset = queryset.filter(profesor=profesor)
            except:
                queryset = queryset.none()
        
        # Si es estudiante, solo puede ver sus propias calificaciones
        if self.request.user.rol == 'estudiante':
            try:
                estudiante_profile = self.request.user.estudiante_profile
                queryset = queryset.filter(estudiante=estudiante_profile)
            except:
                queryset = queryset.none()
        
        if materia:
            queryset = queryset.filter(materia_id=materia)
        if lapso:
            queryset = queryset.filter(lapso=lapso)
        if estudiante:
            queryset = queryset.filter(estudiante_id=estudiante)
        if profesor_id:
            queryset = queryset.filter(profesor_id=profesor_id)
        
        return queryset.select_related('estudiante', 'materia', 'profesor')
    
    def perform_create(self, serializer):
        # Obtener el profesor del usuario autenticado
        if self.request.user.rol == 'profesor':
            try:
                profesor = self.request.user.profesor_profile
                serializer.save(profesor=profesor)
            except:
                raise serializers.ValidationError("No se encontró el perfil de profesor")
        else:
            # Si es admin, puede especificar el profesor
            serializer.save()
    
    def perform_update(self, serializer):
        # Verificar que no esté enviado si se intenta modificar
        instance = self.get_object()
        if instance.enviado:
            raise serializers.ValidationError("No se pueden modificar calificaciones ya enviadas")
        
        # Obtener el profesor del usuario autenticado si es profesor
        if self.request.user.rol == 'profesor':
            try:
                profesor = self.request.user.profesor_profile
                serializer.save(profesor=profesor)
            except:
                pass
        else:
            serializer.save()
    
    @action(detail=False, methods=['post'])
    def enviar_finales(self, request):
        """
        Envía las calificaciones finales de una materia y lapso específicos.
        Esto marca las calificaciones como enviadas y no se pueden modificar.
        """
        materia_id = request.data.get('materia')
        lapso = request.data.get('lapso')
        
        if not materia_id or not lapso:
            return Response(
                {'error': 'Se requiere materia y lapso'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Obtener el profesor del usuario autenticado
        if request.user.rol == 'profesor':
            try:
                profesor = request.user.profesor_profile
            except:
                return Response(
                    {'error': 'No se encontró el perfil de profesor'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            # Si es admin, puede especificar el profesor
            profesor_id = request.data.get('profesor')
            if not profesor_id:
                return Response(
                    {'error': 'Se requiere el ID del profesor'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            try:
                profesor = Profesor.objects.get(id=profesor_id)
            except Profesor.DoesNotExist:
                return Response(
                    {'error': 'Profesor no encontrado'},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        # Obtener todas las calificaciones de la materia y lapso del profesor
        calificaciones = Calificacion.objects.filter(
            materia_id=materia_id,
            lapso=lapso,
            profesor=profesor
        )
        
        if not calificaciones.exists():
            return Response(
                {'error': 'No hay calificaciones para enviar'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Marcar como enviadas
        calificaciones.update(enviado=True)
        
        return Response({
            'message': f'Se enviaron {calificaciones.count()} calificaciones finales',
            'calificaciones_enviadas': calificaciones.count()
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def por_materia_lapso(self, request):
        """
        Obtiene todas las calificaciones de una materia y lapso específicos.
        """
        materia_id = request.query_params.get('materia')
        lapso = request.query_params.get('lapso')
        
        if not materia_id or not lapso:
            return Response(
                {'error': 'Se requiere materia y lapso'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.get_queryset().filter(
            materia_id=materia_id,
            lapso=lapso
        )
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
