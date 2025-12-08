from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q
from datetime import datetime, date

from .models import EventoCalendario
from .serializers import EventoCalendarioSerializer

class EventoCalendarioViewSet(viewsets.ModelViewSet):
    serializer_class = EventoCalendarioSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = EventoCalendario.objects.all()
        
        # Profesores y representantes ven eventos de sus grados + generales
        if self.request.user.rol == 'profesor':
            try:
                profesor = self.request.user.profesor_profile
                grados_ids = profesor.grado_secciones.values_list('id', flat=True)
                queryset = queryset.filter(
                    Q(grado_seccion__in=grados_ids) | Q(grado_seccion__isnull=True)
                )
            except:
                pass
        elif self.request.user.rol == 'representante':
            try:
                representante = self.request.user.representante_profile
                estudiantes = representante.estudiantes.all()
                grados_ids = estudiantes.values_list('grado_seccion_id', flat=True).distinct()
                queryset = queryset.filter(
                    Q(grado_seccion__in=grados_ids) | Q(grado_seccion__isnull=True)
                )
            except:
                queryset = queryset.filter(grado_seccion__isnull=True)
        # Admin ve todos
        
        # Filtros opcionales
        fecha_desde = self.request.query_params.get('fecha_desde', None)
        fecha_hasta = self.request.query_params.get('fecha_hasta', None)
        grado_id = self.request.query_params.get('grado_id', None)
        
        if fecha_desde:
            queryset = queryset.filter(fecha_inicio__gte=fecha_desde)
        if fecha_hasta:
            queryset = queryset.filter(fecha_fin__lte=fecha_hasta)
        if grado_id:
            queryset = queryset.filter(
                Q(grado_seccion_id=grado_id) | Q(grado_seccion__isnull=True)
            )
        
        return queryset.order_by('fecha_inicio', 'hora_inicio')
    
    def perform_create(self, serializer):
        # Solo admin y profesor pueden crear eventos
        if self.request.user.rol not in ['admin', 'profesor']:
            raise PermissionError('Solo administradores y profesores pueden crear eventos')
        serializer.save(creado_por=self.request.user)
    
    def perform_update(self, serializer):
        # Solo admin y profesor pueden editar eventos
        if self.request.user.rol not in ['admin', 'profesor']:
            raise PermissionError('Solo administradores y profesores pueden editar eventos')
        serializer.save()
    
    def perform_destroy(self, instance):
        # Solo admin puede eliminar eventos
        if self.request.user.rol != 'admin':
            raise PermissionError('Solo los administradores pueden eliminar eventos')
        instance.delete()
    
    @action(detail=False, methods=['get'])
    def mes_actual(self, request):
        """Obtener eventos del mes actual"""
        hoy = date.today()
        inicio_mes = date(hoy.year, hoy.month, 1)
        if hoy.month == 12:
            fin_mes = date(hoy.year + 1, 1, 1)
        else:
            fin_mes = date(hoy.year, hoy.month + 1, 1)
        
        eventos = self.get_queryset().filter(
            fecha_inicio__gte=inicio_mes,
            fecha_inicio__lt=fin_mes
        )
        serializer = self.get_serializer(eventos, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def por_fecha(self, request):
        """Obtener eventos por rango de fechas"""
        fecha_desde = request.query_params.get('desde')
        fecha_hasta = request.query_params.get('hasta')
        
        if not fecha_desde or not fecha_hasta:
            return Response(
                {'error': 'Se requieren los parámetros "desde" y "hasta" (formato: YYYY-MM-DD)'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            desde = datetime.strptime(fecha_desde, '%Y-%m-%d').date()
            hasta = datetime.strptime(fecha_hasta, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {'error': 'Formato de fecha inválido. Use YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        eventos = self.get_queryset().filter(
            fecha_inicio__date__gte=desde,
            fecha_fin__date__lte=hasta
        )
        serializer = self.get_serializer(eventos, many=True)
        return Response(serializer.data)



