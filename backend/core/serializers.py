from rest_framework import serializers
from django.contrib.auth import authenticate
from core.models import Usuario, GradoSeccion


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
    rol = serializers.CharField()  # Recibimos el rol tal cual y luego mapeamos

    ROLE_MAP = {
        'administrador': 'admin',
        'admin': 'admin',
        'profesor': 'profesor',
        'representante': 'representante',
        'estudiante': 'estudiante',
    }

    def validate(self, data):
        email = data['email']
        password = data['password']
        rol_input = data['rol'].lower()
        rol = self.ROLE_MAP.get(rol_input)

        if not rol:
            raise serializers.ValidationError("Rol inválido.")

        usuario = authenticate(email=email, password=password)

        if not usuario:
            raise serializers.ValidationError("Credenciales inválidas")

        if not usuario.is_active:
            raise serializers.ValidationError("Cuenta inactiva. Contacte a administración.")

        if usuario.rol != rol:
            raise serializers.ValidationError("El rol no coincide con el usuario")

        # Validación específica por rol
        if rol == 'estudiante':
            # Validar que exista perfil estudiante
            estudiante = getattr(usuario, 'estudiante_profile', None)
            if not estudiante:
                raise serializers.ValidationError("No existe perfil de estudiante asociado.")

            if estudiante.nivel != 'secundaria':
                raise serializers.ValidationError("Solo estudiantes de secundaria pueden iniciar sesión.")

            if not estudiante.cedula:
                raise serializers.ValidationError("Estudiante de secundaria debe tener cédula registrada.")

        return {'usuario': usuario}


class GradoSeccionSerializer(serializers.ModelSerializer):
    class Meta:
        model = GradoSeccion
        fields = '__all__'

    def validate(self, data):
        nivel = data.get('nivel')
        grado = data.get('grado')

        if nivel == 'primaria':
            opciones = dict(GradoSeccion.GRADO_OPCIONES_PRIMARIA).keys()
        elif nivel == 'secundaria':
            opciones = dict(GradoSeccion.GRADO_OPCIONES_SECUNDARIA).keys()
        else:
            opciones = []

        if grado not in opciones:
            raise serializers.ValidationError({
                'grado': f"El grado '{grado}' no es válido para el nivel {nivel}."
            })

        return data
