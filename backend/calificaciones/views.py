from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from .models import Calificacion, Evaluacion
from .serializers import CalificacionSerializer
from .evaluacion_views import CalificacionViewSetExtended

class CalificacionViewSet(viewsets.ModelViewSet, CalificacionViewSetExtended):
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
            materia = serializer.validated_data.get('materia')
            if not profesor.materias.filter(id=materia.id).exists():
                raise PermissionDenied("No puedes registrar notas en una materia que no tienes asignada.")
            
            serializer.save(profesor=profesor)
        else:
            serializer.save()
    
    @action(detail=True, methods=['post'])
    def agregar_evaluacion(self, request, pk=None):
        """
        Añade evaluaciones dinámicas a una calificación específica.
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
        Bloquea notas masivamente o individualmente.
        Si se envía 'estudiante' en el body, solo cierra la de ese alumno.
        De lo contrario, cierra todos los registros de la materia y lapso para el profesor.
        """
        materia_id = request.data.get('materia')
        lapso = request.data.get('lapso')
        estudiante_id = request.data.get('estudiante') # Opcional para cierre individual

        if not materia_id or not lapso:
            return Response({'error': 'Materia y lapso son requeridos.'}, status=400)
            
        # Filtros base basados en la materia y el lapso
        filtros = {
            'materia_id': materia_id,
            'lapso': lapso
        }

        # Si el frontend envía un estudiante específico, lo agregamos al filtro
        if estudiante_id:
            filtros['estudiante_id'] = estudiante_id

        # Obtenemos el queryset respetando la seguridad de rol (get_queryset)
        qs = self.get_queryset().filter(**filtros)
        
        if not qs.exists():
            return Response({'error': 'No se encontraron registros para finalizar o no tienes permiso.'}, status=404)
        
        total = qs.count()
        # Actualización masiva de los registros filtrados
        qs.update(enviado=True)
        
        tipo_cierre = "individual" if estudiante_id else "masivo"
        return Response({
            'message': f'Se ha realizado un cierre {tipo_cierre}. Bloqueados {total} registros para el boletín.',
            'total_afectados': total
        }, status=status.HTTP_200_OK)