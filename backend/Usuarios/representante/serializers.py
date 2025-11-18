from rest_framework import serializers
from core.serializers import UsuarioSerializer
from core.models import Usuario
from .models import Representante
from Usuarios.profesor.models import Profesor

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
        
        # Validar que el email no esté ya registrado
        if Usuario.objects.filter(email=email).exists():
            raise serializers.ValidationError("El email ya está registrado en el sistema.")
        
        return data

    def create(self, validated_data):
        email = validated_data.pop('email')
        password = validated_data.pop('password')
        
        # Validar unicidad del email antes de crear para dar error amigable
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
        
        # Asegurar que is_active = True
        usuario.is_active = True
        usuario.save()
        
        representante = Representante.objects.create(usuario=usuario, **validated_data)
        return representante


class RepresentanteListSerializer(serializers.ModelSerializer):
    # Representación anidada mínima del profesor asignado
    class ProfesorSimpleSerializer(serializers.ModelSerializer):
        class Meta:
            model = Profesor
            fields = ['id', 'nombre', 'apellido', 'grado_asignado']

    profesor_asignado = ProfesorSimpleSerializer(read_only=True)
    edad = serializers.ReadOnlyField()

    class Meta:
        model = Representante
        fields = [
            'id', 'usuario', 'nombre', 'apellido', 'fecha_nacimiento', 'edad',
            'cedula', 'direccion', 'telefono', 'foto', 'profesor_asignado',
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