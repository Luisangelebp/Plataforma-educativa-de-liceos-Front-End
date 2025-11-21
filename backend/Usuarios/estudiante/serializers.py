from rest_framework import serializers
from core.serializers import UsuarioSerializer, GradoSeccionSerializer
from core.models import Usuario, GradoSeccion
from .models import Estudiante


class RegistroEstudianteSerializer(serializers.ModelSerializer):
    # Campos opcionales para posible creación de usuario
    email = serializers.EmailField(write_only=True, required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    # Nuevo campo: grado_seccion (se recibe por id al registrar)
    grado_seccion = serializers.PrimaryKeyRelatedField(
        queryset=GradoSeccion.objects.all(),
        required=True
    )

    class Meta:
        model = Estudiante
        fields = [
            'id', 'usuario', 'nombre', 'apellido', 'grado_seccion',
            'fecha_nacimiento', 'cedula', 'direccion', 'foto',
            'email', 'password', 'representante'
        ]
        read_only_fields = ['usuario', 'id']

    def validate(self, data):
        grado_seccion = data.get('grado_seccion')
        cedula = data.get('cedula')
        email = data.get('email')

        # Si el nivel de la sección es secundaria, email y cédula son obligatorios
        if grado_seccion and grado_seccion.nivel == 'secundaria':
            if not email:
                raise serializers.ValidationError("El email es obligatorio para estudiantes de secundaria.")
            if not cedula:
                raise serializers.ValidationError("La cédula es obligatoria para estudiantes de secundaria.")

        return data

    def create(self, validated_data):
        email = validated_data.pop('email', None)
        password = validated_data.pop('password', None)
        grado_seccion = validated_data.get('grado_seccion')
        representante = validated_data.get('representante')

        # Si hay representante, la dirección del estudiante debe ser la misma que la del representante
        if representante:
            validated_data['direccion'] = representante.direccion

        # Si es secundaria, se espera que el admin proporcione email y password para crear el Usuario
        if grado_seccion and grado_seccion.nivel == 'secundaria':
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
    representante = serializers.IntegerField(source='representante_id', read_only=True)
    edad = serializers.ReadOnlyField()
    # 🔑 Aquí anidamos el serializer de GradoSeccion para devolver valores completos
    grado_seccion = GradoSeccionSerializer(read_only=True)

    class Meta:
        model = Estudiante
        fields = [
            'id', 'nombre', 'apellido', 'grado_seccion',
            'fecha_nacimiento', 'edad', 'cedula', 'direccion', 'foto',
            'representante', 'usuario'
        ]


class EstudianteUpdateSerializer(serializers.ModelSerializer):
    grado_seccion = serializers.PrimaryKeyRelatedField(
        queryset=GradoSeccion.objects.all(),
        required=False
    )

    class Meta:
        model = Estudiante
        fields = [
            'nombre', 'apellido', 'grado_seccion',
            'fecha_nacimiento', 'cedula', 'direccion', 'foto', 'representante'
        ]
        read_only_fields = ['id', 'usuario']
