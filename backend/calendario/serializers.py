from rest_framework import serializers
from .models import EventoCalendario
from core.models import GradoSeccion

class EventoCalendarioSerializer(serializers.ModelSerializer):
    grado_seccion_nombre = serializers.CharField(source='grado_seccion.__str__', read_only=True)
    creado_por_nombre = serializers.SerializerMethodField()
    
    class Meta:
        model = EventoCalendario
        fields = ['id', 'titulo', 'descripcion', 'fecha_inicio', 'fecha_fin', 
                  'hora_inicio', 'hora_fin', 'grado_seccion', 'grado_seccion_nombre',
                  'creado_por', 'creado_por_nombre', 'fecha_creacion', 'fecha_actualizacion']
        read_only_fields = ['fecha_creacion', 'fecha_actualizacion', 'creado_por']
    
    def get_creado_por_nombre(self, obj):
        if obj.creado_por:
            return f"{obj.creado_por.nombre} {obj.creado_por.apellido}"
        return None
    
    def validate(self, data):
        fecha_inicio = data.get('fecha_inicio')
        fecha_fin = data.get('fecha_fin')
        hora_inicio = data.get('hora_inicio')
        hora_fin = data.get('hora_fin')
        
        # Validar que fecha_inicio sea menor que fecha_fin
        if fecha_inicio and fecha_fin:
            if fecha_inicio > fecha_fin:
                raise serializers.ValidationError(
                    {"fecha_fin": "La fecha de fin debe ser posterior a la fecha de inicio"}
                )
        
        # Validar que hora_inicio sea menor que hora_fin
        if hora_inicio and hora_fin:
            if fecha_inicio and fecha_fin and fecha_inicio.date() == fecha_fin.date():
                # Si es el mismo día, validar horas
                if hora_inicio >= hora_fin:
                    raise serializers.ValidationError(
                        {"hora_fin": "La hora de fin debe ser posterior a la hora de inicio"}
                    )
        
        return data



