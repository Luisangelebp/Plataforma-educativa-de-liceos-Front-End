from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from .models import Calificacion, Evaluacion
from .serializers import CalificacionSerializer

class CalificacionViewSet(viewsets.ModelViewSet):
    serializer_class = CalificacionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        Filtros de seguridad por ROL:
        - Admin: Todo.
        - Profesor: Solo lo que él registró.
        - Representante: Solo las notas de sus hijos.
        - Estudiante: Solo sus propias notas.
        """
        user = self.request.user
        queryset = Calificacion.objects.all().select_related(
            'estudiante', 
            'materia', 
            'profesor', 
            'profesor__usuario',
            'estudiante__grado_seccion'
        ).prefetch_related('evaluaciones')
        
        # --- FILTROS DE SEGURIDAD POR ROL ---
        if user.rol == 'profesor':
            queryset = queryset.filter(profesor__usuario=user)
        
        elif user.rol == 'representante':
            # 🛡️ El representante solo ve notas de sus hijos
            repre_perfil = getattr(user, 'representante_profile', None)
            if repre_perfil:
                queryset = queryset.filter(estudiante__representante=repre_perfil)
            else:
                return Calificacion.objects.none()
                
        elif user.rol == 'estudiante':
            queryset = queryset.filter(estudiante__usuario=user)

        # --- FILTROS POR QUERY PARAMS (URL) ---
        params = self.request.query_params
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

        return queryset.distinct()
    
    def perform_create(self, serializer):
        """
        Asigna el profesor automáticamente y valida que dicte la materia.
        """
        user = self.request.user
        if user.rol == 'profesor':
            profesor = user.profesor_profile
            # 🛡️ Validación extra: ¿El profesor dicta esta materia?
            materia = serializer.validated_data.get('materia')
            if not profesor.materias.filter(id=materia.id).exists():
                raise PermissionDenied("No puedes registrar notas en una materia que no tienes asignada.")
            
            serializer.save(profesor=profesor)
        else:
            # Para el admin
            serializer.save()
    
    @action(detail=True, methods=['post'])
    def agregar_evaluacion(self, request, pk=None):
        """
        Añade evaluaciones dinámicas. El get_object() ya asegura que 
        el usuario tenga permiso sobre esta calificación.
        """
        calificacion = self.get_object()
        
        if calificacion.enviado:
            return Response({"error": "No se pueden añadir notas a un lapso cerrado/enviado."}, 
                            status=status.HTTP_403_FORBIDDEN)

        nombre = request.data.get("nombre")
        nota = request.data.get("nota", 0)

        if not nombre:
            return Response({"error": "El nombre de la evaluación es obligatorio."}, status=400)

        Evaluacion.objects.create(
            calificacion=calificacion,
            nombre=nombre,
            nota=nota
        )
        
        calificacion.refresh_from_db()
        
        return Response({
            "status": "Evaluación agregada correctamente",
            "nuevo_promedio": calificacion.promedio 
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def enviar_finales(self, request):
        """
        Bloquea masivamente las notas. Solo afecta a los registros sobre 
        los que el usuario tiene permiso (gracias a get_queryset).
        """
        materia_id = request.data.get('materia')
        lapso = request.data.get('lapso')
        
        if not materia_id or not lapso:
            return Response({'error': 'Materia y lapso son requeridos.'}, status=400)
            
        qs = self.get_queryset().filter(materia_id=materia_id, lapso=lapso)
        
        if not qs.exists():
            return Response({'error': 'No se encontraron registros para finalizar o no tienes permiso.'}, status=404)
        
        total = qs.count()
        qs.update(enviado=True)
        
        return Response({'message': f'Se han bloqueado {total} registros para el boletín.'})