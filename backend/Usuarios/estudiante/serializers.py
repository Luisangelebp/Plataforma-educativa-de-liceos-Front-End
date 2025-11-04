from rest_framework import serializers
from django.apps import apps
from core.serializers import UsuarioSerializer
from core.models import Usuario
from .models import Estudiante

class RegistroEstudianteSerializer(serializers.ModelSerializer):
    # Campos opcionales para posible creación de usuario
    email = serializers.EmailField(write_only=True, required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Estudiante
        fields = [
            'id', 'usuario', 'nombre', 'apellido', 'edad', 'grado', 'nivel',
            'fecha_nacimiento', 'cedula', 'direccion', 'foto', 'email', 'password'
        ]
        read_only_fields = ['usuario', 'id']

    def validate(self, data):
        nivel = data.get('nivel')
        cedula = data.get('cedula')
        email = data.get('email')

        # Si es secundaria, email y cédula son obligatorios para poder crear usuario de acceso
        if nivel == 'secundaria':
            if not email:
                raise serializers.ValidationError("El email es obligatorio para estudiantes de secundaria.")
            if not cedula:
                raise serializers.ValidationError("La cédula es obligatoria para estudiantes de secundaria.")

        return data

    def create(self, validated_data):
        email = validated_data.pop('email', None)
        password = validated_data.pop('password', None)
        nivel = validated_data.get('nivel')

        # Si es secundaria, se espera que el admin proporcione email y password para crear el Usuario
        if nivel == 'secundaria':
            if not email:
                raise serializers.ValidationError("Se requiere email para crear usuario de estudiante en secundaria.")
            if not password:
                raise serializers.ValidationError("Se requiere password para crear usuario de estudiante en secundaria.")

            # Validar unicidad del email antes de crear para dar error amigable
            if Usuario.objects.filter(email=email).exists():
                raise serializers.ValidationError("El email ya está registrado en el sistema.")

            datos_usuario = {
                'email': email,
                'nombre': validated_data.get('nombre'),
                'apellido': validated_data.get('apellido'),
                'rol': 'estudiante',
                'password': password
            }
            usuario_serializer = UsuarioSerializer(data=datos_usuario)
            usuario_serializer.is_valid(raise_exception=True)
            usuario = usuario_serializer.save()
            estudiante = Estudiante.objects.create(usuario=usuario, **validated_data)
            return estudiante

        # Para primaria o casos sin creación de usuario
        estudiante = Estudiante.objects.create(**validated_data)
        return estudiante

class EstudianteListSerializer(serializers.ModelSerializer):
    # Devuelve el id del representante; en el futuro puedes anidar sus datos
    representante = serializers.IntegerField(source='representante_id', read_only=True)

    class Meta:
        model = Estudiante
        fields = [
            'id', 'nombre', 'apellido', 'edad', 'grado', 'nivel',
            'fecha_nacimiento', 'cedula', 'direccion', 'foto',
            'representante', 'usuario'
        ]
