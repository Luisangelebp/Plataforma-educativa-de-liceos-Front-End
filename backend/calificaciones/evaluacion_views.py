from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from .models import Calificacion, Evaluacion
from .serializers import EvaluacionSerializer, CalificacionSerializer

class EvaluacionViewSet(viewsets.ModelViewSet):
    """
    ViewSet para manejar evaluaciones individuales
    """
    serializer_class = EvaluacionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        Filtrar evaluaciones por rol y permisos
        """
        user = self.request.user
        queryset = Evaluacion.objects.select_related(
            'calificacion',
            'calificacion__estudiante',
            'calificacion__materia',
            'calificacion__profesor',
            'calificacion__profesor__usuario'
        )
        
        # --- FILTROS DE SEGURIDAD POR ROL ---
        if user.rol == 'profesor':
            # Solo evaluaciones de calificaciones del profesor
            queryset = queryset.filter(calificacion__profesor__usuario=user)
        
        elif user.rol == 'representante':
            # Solo evaluaciones de sus hijos
            repre_perfil = getattr(user, 'representante_profile', None)
            if repre_perfil:
                queryset = queryset.filter(calificacion__estudiante__representante=repre_perfil)
            else:
                return Evaluacion.objects.none()
                
        elif user.rol == 'estudiante':
            queryset = queryset.filter(calificacion__estudiante__usuario=user)
        
        # --- FILTROS POR QUERY PARAMS ---
        params = self.request.query_params
        calificacion_id = params.get('calificacion')
        materia = params.get('materia')
        lapso = params.get('lapso')
        estudiante = params.get('estudiante')
        
        if calificacion_id:
            queryset = queryset.filter(calificacion_id=calificacion_id)
        if materia:
            queryset = queryset.filter(calificacion__materia_id=materia)
        if lapso:
            queryset = queryset.filter(calificacion__lapso=lapso)
        if estudiante:
            queryset = queryset.filter(calificacion__estudiante_id=estudiante)
        
        return queryset.distinct()
    
    def perform_update(self, serializer):
        """
        Validar que se pueda actualizar la evaluación
        """
        evaluacion = self.get_object()
        
        # Verificar que la calificación no esté enviada
        if evaluacion.calificacion.enviado:
            raise PermissionDenied("No se pueden modificar notas de un lapso ya cerrado.")
        
        # Verificar permisos (ya se hace en get_queryset)
        serializer.save()
        
        # Actualizar el promedio de la calificación
        evaluacion.calificacion.save()
    
    def perform_destroy(self, instance):
        """
        Validar que se pueda eliminar la evaluación
        """
        if instance.calificacion.enviado:
            raise PermissionDenied("No se pueden eliminar notas de un lapso ya cerrado.")
        
        # Eliminar y actualizar promedio
        super().perform_destroy(instance)
        instance.calificacion.save()

# Extender el CalificacionViewSet existente con acciones adicionales
class CalificacionViewSetExtended:
    @action(detail=True, methods=['patch'])
    def actualizar_evaluaciones(self, request, pk=None):
        """
        Actualizar múltiples evaluaciones de una calificación
        Body esperado:
        {
            "evaluaciones": [
                {"id": 1, "nota": 15.5},
                {"id": 2, "nota": 18.0},
                {"id": 3, "nota": 12.5}
            ]
        }
        """
        calificacion = self.get_object()
        
        if calificacion.enviado:
            return Response({"error": "No se pueden modificar notas de un lapso ya cerrado."}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        evaluaciones_data = request.data.get('evaluaciones', [])
        if not evaluaciones_data:
            return Response({"error": "Se requiere el array de evaluaciones"}, status=400)
        
        actualizadas = []
        errores = []
        
        for eval_data in evaluaciones_data:
            eval_id = eval_data.get('id')
            nueva_nota = eval_data.get('nota')
            
            if not eval_id or nueva_nota is None:
                errores.append(f'Evaluación ID {eval_id}: datos incompletos')
                continue
            
            try:
                evaluacion = Evaluacion.objects.get(id=eval_id, calificacion=calificacion)
                evaluacion.nota = float(nueva_nota)
                evaluacion.save()
                
                actualizadas.append({
                    'id': evaluacion.id,
                    'nombre': evaluacion.nombre,
                    'nota': evaluacion.nota
                })
                
            except Evaluacion.DoesNotExist:
                errores.append(f'Evaluación ID {eval_id}: no encontrada en esta calificación')
            except (ValueError, TypeError):
                errores.append(f'Evaluación ID {eval_id}: nota inválida')
            except Exception as e:
                errores.append(f'Evaluación ID {eval_id}: {str(e)}')
        
        # Retornar la calificación actualizada
        calificacion.refresh_from_db()
        
        return Response({
            'actualizadas': len(actualizadas),
            'errores': len(errores),
            'detalle_errores': errores,
            'calificacion': CalificacionSerializer(calificacion).data
        })
    
    @action(detail=False, methods=['patch'])
    def actualizar_evaluaciones_masivas(self, request):
        """
        Actualizar evaluaciones de múltiples calificaciones
        Body esperado:
        {
            "evaluaciones": [
                {"id": 1, "nota": 15.5},
                {"id": 2, "nota": 18.0}
            ]
        }
        """
        user = request.user
        if user.rol != 'profesor':
            return Response({"error": "Solo los profesores pueden usar este endpoint"}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        evaluaciones_data = request.data.get('evaluaciones', [])
        if not evaluaciones_data:
            return Response({"error": "Se requiere el array de evaluaciones"}, status=400)
        
        profesor = user.profesor_profile
        actualizadas = []
        errores = []
        calificaciones_actualizadas = []
        
        for eval_data in evaluaciones_data:
            eval_id = eval_data.get('id')
            nueva_nota = eval_data.get('nota')
            
            if not eval_id or nueva_nota is None:
                errores.append(f'Evaluación ID {eval_id}: datos incompletos')
                continue
            
            try:
                evaluacion = Evaluacion.objects.get(id=eval_id)
                
                # Verificar que pertenezca al profesor
                if evaluacion.calificacion.profesor != profesor:
                    errores.append(f'Evaluación ID {eval_id}: no tienes permiso')
                    continue
                
                # Verificar que no esté bloqueado
                if evaluacion.calificacion.enviado:
                    errores.append(f'Evaluación ID {eval_id}: lapso cerrado')
                    continue
                
                # Actualizar
                evaluacion.nota = float(nueva_nota)
                evaluacion.save()
                
                actualizadas.append({
                    'id': evaluacion.id,
                    'nombre': evaluacion.nombre,
                    'nota': evaluacion.nota,
                    'calificacion_id': evaluacion.calificacion.id
                })
                
                # Guardar calificación para retornar
                if evaluacion.calificacion.id not in [c.id for c in calificaciones_actualizadas]:
                    calificaciones_actualizadas.append(evaluacion.calificacion)
                
            except Evaluacion.DoesNotExist:
                errores.append(f'Evaluación ID {eval_id}: no encontrada')
            except (ValueError, TypeError):
                errores.append(f'Evaluación ID {eval_id}: nota inválida')
            except Exception as e:
                errores.append(f'Evaluación ID {eval_id}: {str(e)}')
        
        # Retornar las calificaciones actualizadas
        return Response({
            'actualizadas': len(actualizadas),
            'errores': len(errores),
            'detalle_errores': errores,
            'calificaciones': CalificacionSerializer(calificaciones_actualizadas, many=True).data
        })
