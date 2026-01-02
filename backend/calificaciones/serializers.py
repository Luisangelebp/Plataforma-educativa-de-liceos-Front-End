from rest_framework import serializers
from .models import Calificacion


class CalificacionSerializer(serializers.ModelSerializer):
    estudiante_nombre = serializers.CharField(source='estudiante.nombre', read_only=True)
    estudiante_apellido = serializers.CharField(source='estudiante.apellido', read_only=True)
    materia_nombre = serializers.CharField(source='materia.nombre', read_only=True)
    profesor_nombre = serializers.CharField(source='profesor.nombre', read_only=True)
    profesor_apellido = serializers.CharField(source='profesor.apellido', read_only=True)
    
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
            'enviado',
            'fecha_creacion',
            'fecha_actualizacion',
        ]
        read_only_fields = ['promedio', 'fecha_creacion', 'fecha_actualizacion']
    
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
