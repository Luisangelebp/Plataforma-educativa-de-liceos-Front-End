from rest_framework import serializers
from .models import Materia, Horario
from Usuarios.profesor.models import Profesor

class MateriaSerializer(serializers.ModelSerializer):
    profesores = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Profesor.objects.all(),
        required=False
    )
    profesores_detalle = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Materia
        fields = ['id', 'nombre', 'descripcion', 'profesores', 'profesores_detalle']

    def get_profesores_detalle(self, obj):
        """Retorna información detallada de los profesores asignados"""
        profesores = obj.profesores.all()
        return [
            {
                'id': prof.id,
                'nombre': prof.nombre,
                'apellido': prof.apellido,
                'tipo_profesor': prof.tipo_profesor
            }
            for prof in profesores
        ]

    def validate_nombre(self, value):
        # Solo validar si es creación, no en actualización
        if self.instance is None:
            if Materia.objects.filter(nombre__iexact=value).exists():
                raise serializers.ValidationError("Ya existe una materia con este nombre.")
        else:
            # En actualización, verificar que no haya otra materia con el mismo nombre
            if Materia.objects.filter(nombre__iexact=value).exclude(id=self.instance.id).exists():
                raise serializers.ValidationError("Ya existe una materia con este nombre.")
        return value

    def update(self, instance, validated_data):
        profesores_data = validated_data.pop('profesores', None)
        
        # Actualizar campos básicos
        instance.nombre = validated_data.get('nombre', instance.nombre)
        instance.descripcion = validated_data.get('descripcion', instance.descripcion)
        instance.save()
        
        # Actualizar profesores si se proporcionan
        if profesores_data is not None:
            instance.profesores.set(profesores_data)
        
        return instance

class HorarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Horario
        fields = '__all__'

    def validate(self, data):
        hora_inicio = data['hora_inicio']
        hora_fin = data['hora_fin']
        grado_seccion = data['grado_seccion']
        dia_semana = data['dia_semana']
        profesor = data.get('profesor')

        # Validar que la hora de inicio sea menor que la hora de fin
        if hora_inicio >= hora_fin:
            raise serializers.ValidationError(
                {"hora_inicio": "La hora de inicio debe ser menor que la hora de fin."}
            )

        # Validar que no se solapen horarios en el mismo grado/sección y día
        qs = Horario.objects.filter(
            grado_seccion=grado_seccion,
            dia_semana=dia_semana
        )
        if self.instance:
            qs = qs.exclude(id=self.instance.id)

        for h in qs:
            if not (hora_fin <= h.hora_inicio or hora_inicio >= h.hora_fin):
                raise serializers.ValidationError(
                    {"horario": "Ya existe otra materia en este rango de horas para este grado/sección."}
                )

        # Validar que un profesor no tenga dos clases al mismo tiempo (si está asignado)
        if profesor:
            qs_prof = Horario.objects.filter(
                profesor=profesor,
                dia_semana=dia_semana
            )
            if self.instance:
                qs_prof = qs_prof.exclude(id=self.instance.id)

            for h in qs_prof:
                if not (hora_fin <= h.hora_inicio or hora_inicio >= h.hora_fin):
                    raise serializers.ValidationError(
                        {"profesor": "El profesor ya tiene una clase en este rango de horas."}
                    )

        return data
