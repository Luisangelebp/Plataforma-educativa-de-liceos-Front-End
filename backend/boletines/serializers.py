from rest_framework import serializers
from .models import Boletin

class BoletinSerializer(serializers.ModelSerializer):
    # Acceso a campos del estudiante
    estudiante_nombre = serializers.SerializerMethodField()
    estudiante_cedula = serializers.CharField(source='estudiante.cedula', read_only=True)
    
    # Representación del grado y nivel (Ej: "1er Grado A - primaria")
    grado_display = serializers.CharField(source='grado_seccion.__str__', read_only=True)
    nivel = serializers.CharField(source='grado_seccion.nivel', read_only=True)
    
    # Información del Administrador que lo generó
    generado_por_nombre = serializers.SerializerMethodField()
    
    # Texto descriptivo del lapso (Ej: "Primer Lapso")
    lapso_display = serializers.CharField(source='get_lapso_display', read_only=True)
    
    class Meta:
        model = Boletin
        fields = [
            'id',
            'estudiante',
            'estudiante_nombre',
            'estudiante_cedula',
            'periodo_escolar',
            'grado_seccion',
            'grado_display',
            'nivel',
            'lapso',
            'lapso_display',
            'archivo_pdf',
            'promedio_general',
            'es_definitivo',
            'observaciones',
            'fecha_emision',
            'fecha_actualizacion',
            'generado_por',
            'generado_por_nombre'
        ]
        read_only_fields = [
            'fecha_emision',
            'fecha_actualizacion',
            'generado_por',
            'promedio_general',
            'archivo_pdf'
        ]
    
    def get_estudiante_nombre(self, obj):
        # Aseguramos que tome nombre y apellido del modelo Estudiante
        return f"{obj.estudiante.nombre} {obj.estudiante.apellido}"
    
    def get_generado_por_nombre(self, obj):
        # Accedemos al modelo Usuario a través del campo generado_por
        if obj.generado_por:
            # Si tu modelo de Usuario tiene nombre y apellido:
            nombre = getattr(obj.generado_por, 'nombre', '')
            apellido = getattr(obj.generado_por, 'apellido', '')
            if nombre or apellido:
                return f"{nombre} {apellido}".strip()
            return obj.generado_por.username
        return "Sistema/Automático"

    def validate(self, data):
        """
        Evita duplicados: Un boletín único por Estudiante + Lapso + Periodo.
        """
        estudiante = data.get('estudiante', getattr(self.instance, 'estudiante', None))
        lapso = data.get('lapso', getattr(self.instance, 'lapso', None))
        periodo = data.get('periodo_escolar', getattr(self.instance, 'periodo_escolar', None))

        if not self.instance:  # Solo validar duplicados al crear nuevo
            if Boletin.objects.filter(
                estudiante=estudiante, 
                lapso=lapso, 
                periodo_escolar=periodo
            ).exists():
                raise serializers.ValidationError(
                    f"Ya existe un boletín para este estudiante en el lapso {lapso} ({periodo})."
                )
        return data