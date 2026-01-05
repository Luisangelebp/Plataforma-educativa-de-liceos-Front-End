from rest_framework import viewsets, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from django.shortcuts import get_object_or_404

from .models import Calificacion, Evaluacion
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
        materia = self.request.query_params.get('materia')
        lapso = self.request.query_params.get('lapso')
        estudiante = self.request.query_params.get('estudiante')
        profesor_id = self.request.query_params.get('profesor')

        # 🔹 Filtros adicionales por nivel/grado/sección
        nivel = self.request.query_params.get("nivel")
        grado = self.request.query_params.get("grado")
        seccion = self.request.query_params.get("seccion")
        grado_seccion_ids = self.request.query_params.getlist("grado_seccion_id") or self.request.query_params.getlist("grado_seccion")

        if materia:
            queryset = queryset.filter(materia_id=materia)
        if lapso:
            queryset = queryset.filter(lapso=lapso)
        if estudiante:
            queryset = queryset.filter(estudiante_id=estudiante)
        if profesor_id:
            queryset = queryset.filter(profesor_id=profesor_id)

        if grado_seccion_ids:
            queryset = queryset.filter(estudiante__grado_seccion_id__in=grado_seccion_ids)
        if nivel:
            queryset = queryset.filter(estudiante__grado_seccion__nivel__iexact=nivel)
        if grado:
            queryset = queryset.filter(estudiante__grado_seccion__grado=grado)
        if seccion:
            queryset = queryset.filter(estudiante__grado_seccion__seccion__iexact=seccion)

        # 🔹 Restricciones por rol
        if self.request.user.rol == 'profesor':
            try:
                profesor = self.request.user.profesor_profile
                queryset = queryset.filter(profesor=profesor)
            except:
                queryset = queryset.none()

        if self.request.user.rol == 'estudiante':
            try:
                estudiante_profile = self.request.user.estudiante_profile
                queryset = queryset.filter(estudiante=estudiante_profile)
            except:
                queryset = queryset.none()

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

    # 🔹 Acciones para secundaria (evaluaciones dinámicas)
    @action(detail=True, methods=['post'])
    def agregar_evaluacion(self, request, pk=None):
        calificacion = self.get_object()
        nombre = request.data.get("nombre")
        nota = request.data.get("nota", 0)
        lapso = request.data.get("lapso", calificacion.lapso)

        if not nombre:
            return Response({"error": "Se requiere nombre de la evaluación"}, status=400)

        evaluacion = Evaluacion.objects.create(
            calificacion=calificacion,
            nombre=nombre,
            nota=nota,
            lapso=lapso
        )
        return Response({"id": evaluacion.id, "nombre": evaluacion.nombre, "nota": evaluacion.nota}, status=201)

    @action(detail=True, methods=['get'])
    def listar_evaluaciones(self, request, pk=None):
        calificacion = self.get_object()
        evaluaciones = calificacion.evaluaciones.all()
        data = [{"id": ev.id, "nombre": ev.nombre, "lapso": ev.lapso, "nota": ev.nota} for ev in evaluaciones]
        return Response(data)
