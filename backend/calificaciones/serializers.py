from rest_framework import serializers
from .models import Calificacion, Evaluacion


class EvaluacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evaluacion
        fields = ['id', 'nombre', 'lapso', 'nota', 'fecha_creacion', 'fecha_actualizacion']


class CalificacionSerializer(serializers.ModelSerializer):
    estudiante_nombre = serializers.CharField(source='estudiante.nombre', read_only=True)
    estudiante_apellido = serializers.CharField(source='estudiante.apellido', read_only=True)
    materia_nombre = serializers.CharField(source='materia.nombre', read_only=True)
    profesor_nombre = serializers.CharField(source='profesor.nombre', read_only=True)
    profesor_apellido = serializers.CharField(source='profesor.apellido', read_only=True)

    # 🔹 Campo extra para secundaria
    evaluaciones = EvaluacionSerializer(many=True, read_only=True)

    # 🔹 Promedios adicionales
    promedio_lapso = serializers.SerializerMethodField()
    promedio_general = serializers.SerializerMethodField()

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
            'promedio',          # promedio de primaria
            'promedio_lapso',    # promedio dinámico por lapso (secundaria)
            'promedio_general',  # promedio general de todos los lapsos
            'enviado',
            'fecha_creacion',
            'fecha_actualizacion',
            'evaluaciones',
        ]
        read_only_fields = ['promedio', 'promedio_lapso', 'promedio_general', 'fecha_creacion', 'fecha_actualizacion']

    # Validaciones de primaria
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

    # Métodos para promedios adicionales
    def get_promedio_lapso(self, obj):
        return obj.promedio_lapso(obj.lapso)

    def get_promedio_general(self, obj):
        return obj.promedio_general()
