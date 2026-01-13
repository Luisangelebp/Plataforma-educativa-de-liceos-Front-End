from rest_framework import serializers
from django.contrib.auth import authenticate
from core.models import Usuario, GradoSeccion


class UsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    rol = serializers.CharField(required=False)  # Permitir escribir rol durante la creación

    class Meta:
        model = Usuario
        fields = ['id', 'email', 'nombre', 'apellido', 'rol', 'password', 'foto']
        read_only_fields = ['id']  # Removido 'rol' de read_only para permitir escritura durante creación

    def create(self, validated_data):
        # Extraer rol si está presente, es requerido para create_user
        rol = validated_data.pop('rol', None)
        if not rol:
            raise serializers.ValidationError({'rol': 'El rol es obligatorio para crear un usuario.'})
        return Usuario.objects.create_user(rol=rol, **validated_data)
    
    def update(self, instance, validated_data):
        # No permitir cambiar el rol durante la actualización
        validated_data.pop('rol', None)
        
        # Si se proporciona una nueva contraseña, hashearla
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)
        
        # Actualizar los demás campos
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


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

        usuario = authenticate(username=email, password=password)

        if not usuario:
            raise serializers.ValidationError("Credenciales inválidas")

        if not usuario.is_active:
            raise serializers.ValidationError("Cuenta inactiva. Contacte a administración.")

        if usuario.rol != rol:
            raise serializers.ValidationError("El rol no coincide con el usuario")

        # Validación específica por rol
        if rol == 'estudiante':
            estudiante = getattr(usuario, 'estudiante_profile', None)
            if not estudiante:
                raise serializers.ValidationError("No existe perfil de estudiante asociado.")

            # 🔑 Ahora validamos usando grado_seccion.nivel
            if not estudiante.grado_seccion:
                raise serializers.ValidationError("El estudiante no tiene sección asignada.")

            if estudiante.grado_seccion.nivel != 'secundaria':
                raise serializers.ValidationError("Solo estudiantes de secundaria pueden iniciar sesión.")

            if not estudiante.cedula:
                raise serializers.ValidationError("Estudiante de secundaria debe tener cédula registrada.")

        return {'usuario': usuario}


class GradoSeccionSerializer(serializers.ModelSerializer):
    class Meta:
        model = GradoSeccion
        fields = ['id', 'nivel', 'grado', 'seccion']

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