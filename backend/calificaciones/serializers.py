from rest_framework import serializers
from .models import Calificacion, Evaluacion

class EvaluacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evaluacion
        fields = ['id', 'nombre', 'nota', 'fecha_creacion']

class CalificacionSerializer(serializers.ModelSerializer):
    # Relaciones de lectura para el frontend
    estudiante_nombre = serializers.CharField(source='estudiante.nombre', read_only=True)
    estudiante_apellido = serializers.CharField(source='estudiante.apellido', read_only=True)
    materia_nombre = serializers.CharField(source='materia.nombre', read_only=True)
    
    # Traemos las evaluaciones dinámicas anidadas
    evaluaciones = EvaluacionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Calificacion
        fields = [
            'id', 'estudiante', 'estudiante_nombre', 'estudiante_apellido',
            'materia', 'materia_nombre', 'profesor', 'lapso', 
            'promedio', 'evaluaciones', 'enviado',
            'fecha_creacion', 'fecha_actualizacion',
        ]
        read_only_fields = ['promedio', 'fecha_creacion', 'fecha_actualizacion']

    def create(self, validated_data):
        """
        Al crear la calificación, si es Primaria, generamos las 4 notas base.
        """
        calificacion = Calificacion.objects.create(**validated_data)
        estudiante = validated_data.get('estudiante')

        # Lógica de autogeneración para Primaria
        # Asumiendo que en tu modelo Estudiante tienes acceso al nivel educativo
        if estudiante.grado_seccion.nivel == 'primaria':
            for i in range(1, 5):
                Evaluacion.objects.create(
                    calificacion=calificacion,
                    nombre=f"Nota {i}",
                    nota=0.00
                )
        return calificacion

    def update(self, instance, validated_data):
        # Bloqueo de edición si ya fue enviado al boletín
        if instance.enviado:
            raise serializers.ValidationError(
                "Esta calificación está bloqueada porque ya fue enviada al boletín."
            )
        return super().update(instance, validated_data)

    def validate_enviado(self, value):
        # Impedir que el profesor desmarque 'enviado' una vez que lo confirmó
        if self.instance and self.instance.enviado and value is False:
            raise serializers.ValidationError(
                "No se puede revertir el estado de una calificación ya enviada."
            )
        return value