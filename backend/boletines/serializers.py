from rest_framework import serializers
from .models import Boletin

class BoletinSerializer(serializers.ModelSerializer):
    estudiante_nombre = serializers.SerializerMethodField()
    estudiante_cedula = serializers.CharField(source='estudiante.cedula', read_only=True)
    # Ahora apunta al campo histórico del modelo Boletin
    grado_display = serializers.CharField(source='grado_seccion.__str__', read_only=True)
    generado_por_nombre = serializers.SerializerMethodField()
    lapso_display = serializers.CharField(source='get_lapso_display', read_only=True)
    
    class Meta:
        model = Boletin
        fields = [
            'id',
            'estudiante',
            'estudiante_nombre',
            'estudiante_cedula',
            'periodo_escolar',  # ¡Importante!
            'grado_seccion',    # El ID del grado histórico
            'grado_display',    # El texto legible del grado
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
            'archivo_pdf' # El PDF lo genera el sistema, no el usuario
        ]
    
    def get_estudiante_nombre(self, obj):
        # Usamos el perfil de usuario para obtener los nombres
        return f"{obj.estudiante.user.nombre} {obj.estudiante.user.apellido}"
    
    def get_generado_por_nombre(self, obj):
        if obj.generado_por:
            return f"{obj.generado_por.nombre} {obj.generado_por.apellido}"
        return None

    def validate(self, data):
        """
        Validación integral: Estudiante + Lapso + Periodo Escolar.
        """
        estudiante = data.get('estudiante')
        lapso = data.get('lapso')
        periodo = data.get('periodo_escolar')
        
        # Si es una actualización, tomamos los valores de la instancia si no vienen en data
        if self.instance:
            estudiante = estudiante or self.instance.estudiante
            lapso = lapso or self.instance.lapso
            periodo = periodo or self.instance.periodo_escolar

        if estudiante and lapso and periodo:
            existing = Boletin.objects.filter(
                estudiante=estudiante, 
                lapso=lapso, 
                periodo_escolar=periodo
            )
            
            if self.instance:
                existing = existing.exclude(id=self.instance.id)
                
            if existing.exists():
                raise serializers.ValidationError(
                    f"Ya existe un boletín para este estudiante en el {lapso}º lapso del periodo {periodo}."
                )
        return data