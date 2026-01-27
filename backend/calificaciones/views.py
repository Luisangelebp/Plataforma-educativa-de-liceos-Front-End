from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Calificacion, Evaluacion
from .serializers import CalificacionSerializer, EvaluacionSerializer
from Usuarios.profesor.models import Profesor

class CalificacionViewSet(viewsets.ModelViewSet):
    serializer_class = CalificacionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Optimizamos con select_related y prefetch_related para las evaluaciones
        queryset = Calificacion.objects.all().select_related(
            'estudiante', 
            'materia', 
            'profesor', 
            'profesor__usuario',
            'estudiante__grado_seccion'
        ).prefetch_related('evaluaciones') # Importante para no hacer 1000 consultas
        
        params = self.request.query_params
        # ... (tus filtros se mantienen igual, funcionan bien)
        materia = params.get('materia')
        lapso = params.get('lapso')
        estudiante = params.get('estudiante')
        profesor_id = params.get('profesor')
        nivel = params.get("nivel")

        if materia: queryset = queryset.filter(materia_id=materia)
        if lapso: queryset = queryset.filter(lapso=lapso)
        if estudiante: queryset = queryset.filter(estudiante_id=estudiante)
        if profesor_id: queryset = queryset.filter(profesor_id=profesor_id)
        if nivel: queryset = queryset.filter(estudiante__grado_seccion__nivel__iexact=nivel)

        # Restricciones de ROL
        user = self.request.user
        if user.rol == 'profesor':
            queryset = queryset.filter(profesor__usuario=user)
        elif user.rol == 'estudiante':
            queryset = queryset.filter(estudiante__usuario=user)

        return queryset
    
    def perform_create(self, serializer):
        # Al crear, asignamos el profesor automáticamente si es quien postea
        if self.request.user.rol == 'profesor':
            serializer.save(profesor=self.request.user.profesor_profile)
        else:
            serializer.save()
    
    @action(detail=True, methods=['post'])
    def agregar_evaluacion(self, request, pk=None):
        """
        Permite añadir una nota extra tanto en Primaria como Secundaria.
        """
        calificacion = self.get_object()
        
        if calificacion.enviado:
            return Response({"error": "No se pueden añadir notas a un lapso cerrado."}, 
                            status=status.HTTP_403_FORBIDDEN)

        nombre = request.data.get("nombre")
        nota = request.data.get("nota", 0)

        if not nombre:
            return Response({"error": "El nombre de la evaluación es obligatorio."}, status=400)

        # Creamos la evaluación vinculada a esta calificación
        Evaluacion.objects.create(
            calificacion=calificacion,
            nombre=nombre,
            nota=nota
        )
        
        # Recargamos la instancia para obtener el promedio actualizado
        calificacion.refresh_from_db()
        
        return Response({
            "status": "Evaluación agregada correctamente",
            "nuevo_promedio": calificacion.promedio 
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def enviar_finales(self, request):
        """Bloquea masivamente las notas de una sección/materia para el boletín."""
        materia_id = request.data.get('materia')
        lapso = request.data.get('lapso')
        
        # Filtramos las calificaciones que el profesor quiere cerrar
        qs = self.get_queryset().filter(materia_id=materia_id, lapso=lapso)
        
        if not qs.exists():
            return Response({'error': 'No se encontraron registros para finalizar.'}, status=404)
        
        qs.update(enviado=True)
        return Response({'message': f'Se han bloqueado {qs.count()} registros para el boletín.'})