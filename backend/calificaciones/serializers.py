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
            'id', 'estudiante', 'estudiante_nombre', 'estudiante_apellido',
            'materia', 'materia_nombre', 'profesor', 'profesor_nombre', 'profesor_apellido',
            'lapso', 'nota1', 'nota2', 'nota3', 'nota4', 
            'promedio', 'promedio_lapso', 'enviado',
            'fecha_creacion', 'fecha_actualizacion',
        ]
        read_only_fields = ['promedio', 'promedio_lapso', 'fecha_creacion', 'fecha_actualizacion']
    
    def get_promedio_lapso(self, obj):
        # El modelo ya tiene la lógica: si hay evaluaciones dinámicas las promedia,
        # si no, devuelve el promedio fijo de primaria.
        val = obj.promedio_lapso(obj.lapso)
        return float(val) if val is not None else 0.0

    def validate(self, data):
        notas_parciales = ['nota1', 'nota2', 'nota3', 'nota4']
        for campo in notas_parciales:
            valor = data.get(campo)
            if valor is not None and (valor < 0 or valor > 20):
                raise serializers.ValidationError({
                    campo: "La calificación debe estar entre 0 y 20."
                })
        return data

    def validate_enviado(self, value):
        if self.instance and self.instance.enviado and value is False:
            raise serializers.ValidationError("No se puede revertir el estado de una calificación ya enviada.")
        return value