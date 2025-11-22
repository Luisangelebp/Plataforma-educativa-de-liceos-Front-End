from rest_framework import serializers
from core.serializers import UsuarioSerializer
from core.models import Usuario
from .models import Representante
from Usuarios.estudiante.models import Estudiante  # importa el modelo de estudiante

class RegistroRepresentanteSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Representante
        fields = [
            'id', 'usuario', 'nombre', 'apellido', 'fecha_nacimiento',
            'cedula', 'direccion', 'telefono', 'foto', 'email', 'password'
        ]
        read_only_fields = ['usuario', 'id']

    def validate(self, data):
        email = data.get('email')
        if Usuario.objects.filter(email=email).exists():
            raise serializers.ValidationError("El email ya está registrado en el sistema.")
        return data

    def create(self, validated_data):
        email = validated_data.pop('email')
        password = validated_data.pop('password')

        if Usuario.objects.filter(email=email).exists():
            raise serializers.ValidationError("El email ya está registrado en el sistema.")

        datos_usuario = {
            'email': email,
            'nombre': validated_data.get('nombre'),
            'apellido': validated_data.get('apellido'),
            'rol': 'representante',
            'password': password
        }

        usuario_serializer = UsuarioSerializer(data=datos_usuario)
        usuario_serializer.is_valid(raise_exception=True)
        usuario = usuario_serializer.save()

        usuario.is_active = True
        usuario.save()

        representante = Representante.objects.create(usuario=usuario, **validated_data)
        return representante


class EstudianteSimpleSerializer(serializers.ModelSerializer):
    """Serializer simplificado para mostrar estudiantes en el panel del representante."""
    grado_o_año = serializers.ReadOnlyField()
    representante_nombre = serializers.ReadOnlyField()

    class Meta:
        model = Estudiante
        fields = ['id', 'nombre', 'apellido', 'cedula_mostrada', 'grado_o_año', 'representante_nombre']


class RepresentanteListSerializer(serializers.ModelSerializer):
    edad = serializers.ReadOnlyField()
    estudiantes = EstudianteSimpleSerializer(many=True, read_only=True)

    class Meta:
        model = Representante
        fields = [
            'id', 'usuario', 'nombre', 'apellido', 'fecha_nacimiento', 'edad',
            'cedula', 'direccion', 'telefono', 'foto',
            'estudiantes',  # ahora devuelve los estudiantes asociados
            'fecha_creacion', 'fecha_actualizacion'
        ]


class RepresentanteUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Representante
        fields = [
            'nombre', 'apellido', 'fecha_nacimiento', 'cedula',
            'direccion', 'telefono', 'foto'
        ]
        read_only_fields = ['id', 'usuario']