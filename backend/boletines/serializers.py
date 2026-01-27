from rest_framework import serializers
from .models import Boletin

class BoletinSerializer(serializers.ModelSerializer):
    # Usamos los campos directos del modelo Estudiante que ya tienes
    estudiante_nombre = serializers.SerializerMethodField()
    estudiante_cedula = serializers.CharField(source='estudiante.cedula', read_only=True)
    
    # Representación legible del grado histórico guardado en el boletín
    grado_display = serializers.CharField(source='grado_seccion.__str__', read_only=True)
    
    # Información de quién generó el boletín (Admin)
    generado_por_nombre = serializers.SerializerMethodField()
    
    # Texto del lapso (ej: "Primer Lapso" en vez de "1")
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
        # Acceso directo a los campos del modelo Estudiante
        return f"{obj.estudiante.nombre} {obj.estudiante.apellido}"
    
    def get_generado_por_nombre(self, obj):
        # Acceso a través de la relación usuario para el administrador
        if obj.generado_por:
            return f"{obj.generado_por.nombre} {obj.generado_por.apellido}"
        return "Sistema"

    def validate(self, data):
        """
        Validación integral: Evita duplicados para el mismo Estudiante + Lapso + Periodo.
        """
        estudiante = data.get('estudiante')
        lapso = data.get('lapso')
        periodo = data.get('periodo_escolar')
        
        # Lógica para actualizaciones (PATCH/PUT)
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
                    f"Ya existe un boletín registrado para este estudiante en el {lapso}º lapso del periodo {periodo}."
                )
        return data