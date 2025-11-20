from rest_framework import serializers
from .models import Materia, Horario

class MateriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Materia
        fields = '__all__'


class HorarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Horario
        fields = '__all__'

    def validate(self, data):
        # Validar que la hora de inicio sea menor que la hora de fin
        if data['hora_inicio'] >= data['hora_fin']:
            raise serializers.ValidationError(
                {"hora_inicio": "La hora de inicio debe ser menor que la hora de fin."}
            )

        # Validar que no se solapen horarios en el mismo grado/sección y día
        qs = Horario.objects.filter(
            grado_seccion=data['grado_seccion'],
            dia_semana=data['dia_semana']
        )

        for h in qs:
            # Si el rango horario se cruza con otro ya existente
            if not (data['hora_fin'] <= h.hora_inicio or data['hora_inicio'] >= h.hora_fin):
                raise serializers.ValidationError(
                    {"horario": "Ya existe otra materia en este rango de horas para este grado/sección."}
                )

        return data
