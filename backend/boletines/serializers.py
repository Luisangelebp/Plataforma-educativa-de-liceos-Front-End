from rest_framework import serializers
from .models import PlantillaBoletin, Boletin
from Usuarios.estudiante.models import Estudiante
from core.models import GradoSeccion

class PlantillaBoletinSerializer(serializers.ModelSerializer):
    grado_seccion_nombre = serializers.SerializerMethodField()
    subido_por_nombre = serializers.SerializerMethodField()
    
    class Meta:
        model = PlantillaBoletin
        fields = [
            'id',
            'periodo',
            'grado_seccion',
            'grado_seccion_nombre',
            'archivo_word',
            'activa',
            'fecha_subida',
            'fecha_actualizacion',
            'subido_por',
            'subido_por_nombre'
        ]
        read_only_fields = ['fecha_subida', 'fecha_actualizacion', 'subido_por']
    
    def get_grado_seccion_nombre(self, obj):
        if obj.grado_seccion:
            return str(obj.grado_seccion)
        return None
    
    def get_subido_por_nombre(self, obj):
        if obj.subido_por:
            return f"{obj.subido_por.nombre} {obj.subido_por.apellido}"
        return None


class BoletinSerializer(serializers.ModelSerializer):
    estudiante_nombre = serializers.SerializerMethodField()
    estudiante_cedula = serializers.CharField(source='estudiante.cedula', read_only=True)
    estudiante_grado = serializers.SerializerMethodField()
    subido_por_nombre = serializers.SerializerMethodField()
    lapso_display = serializers.CharField(source='get_lapso_display', read_only=True)
    
    class Meta:
        model = Boletin
        fields = [
            'id',
            'estudiante',
            'estudiante_nombre',
            'estudiante_cedula',
            'estudiante_grado',
            'lapso',
            'lapso_display',
            'archivo_word',      # 🔹 nuevo campo para subir/descargar Word
            'archivo_pdf',
            'promedio_general',
            'fecha_emision',
            'fecha_actualizacion',
            'subido_por',
            'subido_por_nombre',
            'observaciones'
        ]
        read_only_fields = [
            'fecha_emision',
            'fecha_actualizacion',
            'subido_por',
            'promedio_general'
        ]
    
    def get_estudiante_nombre(self, obj):
        return f"{obj.estudiante.nombre} {obj.estudiante.apellido}"
    
    def get_estudiante_grado(self, obj):
        if obj.estudiante.grado_seccion:
            return str(obj.estudiante.grado_seccion)
        return None
    
    def get_subido_por_nombre(self, obj):
        if obj.subido_por:
            return f"{obj.subido_por.nombre} {obj.subido_por.apellido}"
        return None
    
    def validate(self, data):
        # Validar que no exista otro boletín para el mismo estudiante y lapso
        estudiante = data.get('estudiante')
        lapso = data.get('lapso')
        
        if estudiante and lapso:
            existing = Boletin.objects.filter(estudiante=estudiante, lapso=lapso)
            if self.instance:
                existing = existing.exclude(id=self.instance.id)
            if existing.exists():
                raise serializers.ValidationError(
                    f"Ya existe un boletín para {estudiante} en el {dict(Boletin.LAPSO_OPCIONES)[lapso]}"
                )
        return data