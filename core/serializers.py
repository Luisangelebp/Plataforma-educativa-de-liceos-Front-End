from rest_framework import serializers
from django.contrib.auth import authenticate
from core.models import Usuario

class UsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Usuario
        fields = ['id', 'email', 'nombre', 'apellido', 'rol', 'password', 'foto']

    def create(self, validated_data):
        return Usuario.objects.create_user(**validated_data)

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    rol = serializers.ChoiceField(choices=Usuario.ROLES)

    def validate(self, data):
        email = data['email']
        password = data['password']
        rol = data['rol']

        usuario = authenticate(email=email, password=password)

        if not usuario:
            raise serializers.ValidationError("Credenciales inválidas")

        if not usuario.is_active:
            raise serializers.ValidationError("Cuenta inactiva. Contacte a administración.")

        if usuario.rol != rol:
            raise serializers.ValidationError("El rol no coincide con el usuario")

        return {'usuario': usuario}
