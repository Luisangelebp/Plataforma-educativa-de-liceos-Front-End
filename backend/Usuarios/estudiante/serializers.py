from rest_framework import serializers
from core.serializers import UsuarioSerializer, GradoSeccionSerializer
from core.models import Usuario, GradoSeccion
from .models import Estudiante


class RegistroEstudianteSerializer(serializers.ModelSerializer):
    # Campos opcionales para posible creación de usuario
    email = serializers.EmailField(write_only=True, required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    # Recibimos nivel, grado y seccion directamente en la petición
    nivel = serializers.CharField(write_only=True)
    grado = serializers.CharField(write_only=True)
    seccion = serializers.CharField(write_only=True)

    # En la respuesta, devolvemos el objeto completo de grado_seccion
    grado_seccion = GradoSeccionSerializer(read_only=True)

    class Meta:
        model = Estudiante
        fields = [
            'id', 'usuario', 'nombre', 'apellido',
            'nivel', 'grado', 'seccion',   # 🔑 se mandan directo en la petición
            'grado_seccion',               # 🔑 se devuelve expandido en la respuesta
            'fecha_nacimiento', 'cedula', 'direccion', 'foto',
            'email', 'password', 'representante'
        ]
        read_only_fields = ['usuario', 'id', 'grado_seccion']

    def validate(self, data):
        nivel = data.get('nivel')
        grado = data.get('grado')
        cedula = data.get('cedula')
        email = data.get('email')

        # Validar que el grado sea válido para el nivel
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

        # Validaciones extra para secundaria
        if nivel == 'secundaria':
            if not email:
                raise serializers.ValidationError("El email es obligatorio para estudiantes de secundaria.")
            if not cedula:
                raise serializers.ValidationError("La cédula es obligatoria para estudiantes de secundaria.")

        return data

    def create(self, validated_data):
        email = validated_data.pop('email', None)
        password = validated_data.pop('password', None)
        nivel = validated_data.pop('nivel')
        grado = validated_data.pop('grado')
        seccion = validated_data.pop('seccion')
        representante = validated_data.get('representante')

        # Buscar o crear la sección correspondiente
        grado_seccion, _ = GradoSeccion.objects.get_or_create(
            nivel=nivel,
            grado=grado,
            seccion=seccion
        )
        validated_data['grado_seccion'] = grado_seccion

        # Si hay representante, copiar dirección
        if representante:
            validated_data['direccion'] = representante.direccion

        # Crear usuario si es secundaria
        if nivel == 'secundaria':
            if not email or not password:
                raise serializers.ValidationError("Email y password son obligatorios para secundaria.")
            if Usuario.objects.filter(email=email).exists():
                raise serializers.ValidationError("El email ya está registrado.")

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

        # Para primaria
        estudiante = Estudiante.objects.create(**validated_data)
        return estudiante


class EstudianteListSerializer(serializers.ModelSerializer):
    representante = serializers.IntegerField(source='representante_id', read_only=True)
    edad = serializers.ReadOnlyField()
    # 🔑 Devolvemos el objeto completo de grado_seccion
    grado_seccion = GradoSeccionSerializer(read_only=True)

    class Meta:
        model = Estudiante
        fields = [
            'id', 'nombre', 'apellido', 'grado_seccion',
            'fecha_nacimiento', 'edad', 'cedula', 'direccion', 'foto',
            'representante', 'usuario'
        ]


class EstudianteUpdateSerializer(serializers.ModelSerializer):
    # En update seguimos permitiendo cambiar la sección por nivel/grado/seccion
    nivel = serializers.CharField(write_only=True, required=False)
    grado = serializers.CharField(write_only=True, required=False)
    seccion = serializers.CharField(write_only=True, required=False)

    grado_seccion = GradoSeccionSerializer(read_only=True)

    class Meta:
        model = Estudiante
        fields = [
            'nombre', 'apellido',
            'nivel', 'grado', 'seccion',   # 🔑 se mandan en update
            'grado_seccion',               # 🔑 se devuelve expandido
            'fecha_nacimiento', 'cedula', 'direccion', 'foto', 'representante'
        ]
        read_only_fields = ['id', 'usuario', 'grado_seccion']

    def update(self, instance, validated_data):
        nivel = validated_data.pop('nivel', None)
        grado = validated_data.pop('grado', None)
        seccion = validated_data.pop('seccion', None)

        if nivel and grado and seccion:
            grado_seccion, _ = GradoSeccion.objects.get_or_create(
                nivel=nivel,
                grado=grado,
                seccion=seccion
            )
            validated_data['grado_seccion'] = grado_seccion

        return super().update(instance, validated_data)