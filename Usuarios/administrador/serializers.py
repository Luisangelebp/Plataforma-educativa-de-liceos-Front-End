from rest_framework import serializers
from core.serializers import UsuarioSerializer
from core.models import Usuario
from .models import Administrador

class RegistroAdministradorSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True)
    nombre = serializers.CharField(write_only=True)
    apellido = serializers.CharField(write_only=True)

    class Meta:
        model = Administrador
        fields = [
            'id', 'usuario', 'email', 'password', 'nombre', 'apellido'
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
        nombre = validated_data.pop('nombre')
        apellido = validated_data.pop('apellido')
        
        # Validar unicidad del email antes de crear para dar error amigable
        if Usuario.objects.filter(email=email).exists():
            raise serializers.ValidationError("El email ya está registrado en el sistema.")
        
        datos_usuario = {
            'email': email,
            'nombre': nombre,
            'apellido': apellido,
            'rol': 'admin',
            'password': password
        }
        
        usuario_serializer = UsuarioSerializer(data=datos_usuario)
        usuario_serializer.is_valid(raise_exception=True)
        usuario = usuario_serializer.save()
        
        # Asegurar que is_active = True
        usuario.is_active = True
        usuario.save()
        
        administrador = Administrador.objects.create(usuario=usuario)
        return administrador

class AdministradorListSerializer(serializers.ModelSerializer):
    nombre = serializers.CharField(source='usuario.nombre', read_only=True)
    apellido = serializers.CharField(source='usuario.apellido', read_only=True)
    email = serializers.EmailField(source='usuario.email', read_only=True)

    class Meta:
        model = Administrador
        fields = [
            'id', 'usuario', 'nombre', 'apellido', 'email',
            'fecha_creacion', 'fecha_actualizacion'
        ]


