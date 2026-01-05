from rest_framework import serializers
from .models import Calificacion


class CalificacionSerializer(serializers.ModelSerializer):
    estudiante_nombre = serializers.CharField(source='estudiante.nombre', read_only=True)
    estudiante_apellido = serializers.CharField(source='estudiante.apellido', read_only=True)
    materia_nombre = serializers.CharField(source='materia.nombre', read_only=True)
    profesor_nombre = serializers.CharField(source='profesor.nombre', read_only=True)
    profesor_apellido = serializers.CharField(source='profesor.apellido', read_only=True)
    promedio_lapso = serializers.SerializerMethodField()
    
    class Meta:
        model = Calificacion
        fields = [
            'id',
            'estudiante',
            'estudiante_nombre',
            'estudiante_apellido',
            'materia',
            'materia_nombre',
            'profesor',
            'profesor_nombre',
            'profesor_apellido',
            'lapso',
            'nota1',
            'nota2',
            'nota3',
            'nota4',
            'promedio',
            'promedio_lapso',
            'enviado',
            'fecha_creacion',
            'fecha_actualizacion',
        ]
        read_only_fields = ['promedio', 'promedio_lapso', 'fecha_creacion', 'fecha_actualizacion']
    
    def get_promedio_lapso(self, obj):
        """Calcula el promedio del lapso actual (para secundaria con evaluaciones dinámicas o primaria con notas fijas)"""
        # Si tiene evaluaciones dinámicas, usar promedio_lapso del modelo
        if hasattr(obj, 'evaluaciones') and obj.evaluaciones.exists():
            return obj.promedio_lapso(obj.lapso)
        # Si no, usar el promedio calculado (primaria)
        return obj.promedio
    
    def validate_nota1(self, value):
        if value is not None and (value < 0 or value > 20):
            raise serializers.ValidationError("La nota debe estar entre 0 y 20")
        return value
    
    def validate_nota2(self, value):
        if value is not None and (value < 0 or value > 20):
            raise serializers.ValidationError("La nota debe estar entre 0 y 20")
        return value
    
    def validate_nota3(self, value):
        if value is not None and (value < 0 or value > 20):
            raise serializers.ValidationError("La nota debe estar entre 0 y 20")
        return value
    
    def validate_nota4(self, value):
        if value is not None and (value < 0 or value > 20):
            raise serializers.ValidationError("La nota debe estar entre 0 y 20")
        return value
