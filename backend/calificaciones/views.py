from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Calificacion, Evaluacion
from .serializers import CalificacionSerializer
from Usuarios.profesor.models import Profesor

class CalificacionViewSet(viewsets.ModelViewSet):
    serializer_class = CalificacionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Usamos select_related para optimizar las consultas a la base de datos
        queryset = Calificacion.objects.all().select_related(
            'estudiante', 'materia', 'profesor', 'estudiante__grado_seccion'
        )
        
        # Filtros básicos desde query params
        params = self.request.query_params
        materia = params.get('materia')
        lapso = params.get('lapso')
        estudiante = params.get('estudiante')
        profesor_id = params.get('profesor')

        # Filtros de ubicación académica
        nivel = params.get("nivel")
        grado = params.get("grado")
        seccion = params.get("seccion")
        grado_seccion_ids = params.getlist("grado_seccion_id") or params.getlist("grado_seccion")

        if materia: queryset = queryset.filter(materia_id=materia)
        if lapso: queryset = queryset.filter(lapso=lapso)
        if estudiante: queryset = queryset.filter(estudiante_id=estudiante)
        if profesor_id: queryset = queryset.filter(profesor_id=profesor_id)

        if grado_seccion_ids:
            queryset = queryset.filter(estudiante__grado_seccion_id__in=grado_seccion_ids)
        if nivel:
            queryset = queryset.filter(estudiante__grado_seccion__nivel__iexact=nivel)
        if grado:
            queryset = queryset.filter(estudiante__grado_seccion__grado=grado)
        if seccion:
            queryset = queryset.filter(estudiante__grado_seccion__seccion__iexact=seccion)

        # Restricciones de visibilidad por ROL
        user = self.request.user
        if user.rol == 'profesor':
            try:
                queryset = queryset.filter(profesor=user.profesor_profile)
            except AttributeError:
                queryset = queryset.none()

        elif user.rol == 'estudiante':
            try:
                queryset = queryset.filter(estudiante=user.estudiante_profile)
            except AttributeError:
                queryset = queryset.none()

        return queryset
    
    def perform_create(self, serializer):
        if self.request.user.rol == 'profesor':
            serializer.save(profesor=self.request.user.profesor_profile)
        else:
            serializer.save()
    
    def perform_update(self, serializer):
        instance = self.get_object()
        # BLOQUEO: Si ya se envió, no se puede tocar
        if instance.enviado:
            raise serializers.ValidationError("Esta calificación ya ha sido enviada al sistema central y no puede modificarse.")
        
        if self.request.user.rol == 'profesor':
            serializer.save(profesor=self.request.user.profesor_profile)
        else:
            serializer.save()

    @action(detail=False, methods=['post'])
    def enviar_finales(self, request):
        """Bloquea las notas para que ya no sean editables y aparezcan en el boletín."""
        materia_id = request.data.get('materia')
        lapso = request.data.get('lapso')
        
        if not materia_id or not lapso:
            return Response({'error': 'Se requiere materia y lapso'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Determinar perfil del profesor
        if request.user.rol == 'profesor':
            profesor = request.user.profesor_profile
        else:
            profesor_id = request.data.get('profesor')
            if not profesor_id:
                return Response({'error': 'ID de profesor requerido para administradores'}, status=400)
            profesor = get_object_or_404(Profesor, id=profesor_id)
        
        calificaciones = Calificacion.objects.filter(materia_id=materia_id, lapso=lapso, profesor=profesor)
        
        if not calificaciones.exists():
            return Response({'error': 'No hay calificaciones para enviar'}, status=status.HTTP_404_NOT_FOUND)
        
        calificaciones.update(enviado=True)
        return Response({'message': f'Se finalizaron {calificaciones.count()} registros de notas.'}, status=200)

    # --- ACCIONES PARA SECUNDARIA (EVALUACIONES DINÁMICAS) ---

    @action(detail=True, methods=['post'])
    def agregar_evaluacion(self, request, pk=None):
        calificacion = self.get_object()
        
        if calificacion.enviado:
            return Response({"error": "No se pueden agregar evaluaciones a una materia ya finalizada."}, status=status.HTTP_403_FORBIDDEN)

        nombre = request.data.get("nombre")
        nota = request.data.get("nota", 0)
        lapso = request.data.get("lapso", calificacion.lapso)

        if not nombre:
            return Response({"error": "El nombre de la evaluación es obligatorio."}, status=400)

        evaluacion = Evaluacion.objects.create(
            calificacion=calificacion,
            nombre=nombre,
            nota=nota,
            lapso=lapso
        )
        
        # AJUSTE: Se cambió promedio_lap por promedio_lapso para coincidir con el modelo
        return Response({
            "id": evaluacion.id, 
            "nombre": evaluacion.nombre, 
            "nota": evaluacion.nota,
            "nuevo_promedio": calificacion.promedio_lapso(lapso) 
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def listar_evaluaciones(self, request, pk=None):
        calificacion = self.get_object()
        evaluaciones = calificacion.evaluaciones.all()
        data = [{"id": ev.id, "nombre": ev.nombre, "lapso": ev.lapso, "nota": ev.nota} for ev in evaluaciones]
        return Response(data, status=200)