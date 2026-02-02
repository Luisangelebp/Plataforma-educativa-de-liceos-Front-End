from rest_framework import serializers
from core.serializers import UsuarioSerializer, GradoSeccionSerializer
from core.models import Usuario, GradoSeccion
from .models import Estudiante

class RegistroEstudianteSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(write_only=True, required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    nivel = serializers.CharField(write_only=True)
    grado = serializers.CharField(write_only=True)
    seccion = serializers.CharField(write_only=True)

    grado_seccion = GradoSeccionSerializer(read_only=True)

    class Meta:
        model = Estudiante
        fields = [
            'id', 'usuario', 'nombre', 'apellido',
            'nivel', 'grado', 'seccion', 
            'grado_seccion', 
            'fecha_nacimiento', 'cedula', 'direccion', 'foto',
            'email', 'password', 'representante',
            'estatus', 'es_repitiente'  # 🔑 Agregados para el flujo de inscripción
        ]
        read_only_fields = ['usuario', 'id', 'grado_seccion']

    def validate(self, data):
        nivel = data.get('nivel')
        grado = data.get('grado')
        cedula = data.get('cedula')
        email = data.get('email')

        # Validar grado según nivel
        if nivel == 'primaria':
            opciones = dict(GradoSeccion.GRADO_OPCIONES_PRIMARIA).keys()
        elif nivel == 'secundaria':
            opciones = dict(GradoSeccion.GRADO_OPCIONES_SECUNDARIA).keys()
        else:
            raise serializers.ValidationError({'nivel': "El nivel debe ser 'primaria' o 'secundaria'."})

        if grado not in opciones:
            raise serializers.ValidationError({
                'grado': f"El grado '{grado}' no es válido para el nivel {nivel}."
            })

        # Validaciones para secundaria
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

        grado_seccion, _ = GradoSeccion.objects.get_or_create(
            nivel=nivel,
            grado=grado,
            seccion=seccion
        )
        validated_data['grado_seccion'] = grado_seccion

        if representante and not validated_data.get('direccion'):
            validated_data['direccion'] = representante.direccion

        if nivel == 'secundaria':
            if not email or not password:
                raise serializers.ValidationError("Email y password son obligatorios para secundaria.")
            if Usuario.objects.filter(email=email).exists():
                raise serializers.ValidationError("El email ya está registrado.")

            # Usamos el manager para crear el usuario correctamente con password hasheado
            usuario = Usuario.objects.create_user(
                email=email,
                nombre=validated_data.get('nombre'),
                apellido=validated_data.get('apellido'),
                rol='estudiante',
                password=password
            )
            return Estudiante.objects.create(usuario=usuario, **validated_data)

        return Estudiante.objects.create(**validated_data)


class EstudianteListSerializer(serializers.ModelSerializer):
    representante_nombre = serializers.ReadOnlyField() # 🔑 Usamos la property del modelo
    edad = serializers.ReadOnlyField()
    grado_seccion = GradoSeccionSerializer(read_only=True)
    grado_o_año = serializers.ReadOnlyField() # 🔑 Útil para el front

    class Meta:
        model = Estudiante
        fields = [
            'id', 'nombre', 'apellido', 'grado_seccion', 'grado_o_año',
            'fecha_nacimiento', 'edad', 'cedula', 'direccion', 'foto',
            'representante', 'representante_nombre', 'usuario', 'estatus', 'es_repitiente'
        ]


class EstudianteUpdateSerializer(serializers.ModelSerializer):
    nivel = serializers.CharField(write_only=True, required=False)
    grado = serializers.CharField(write_only=True, required=False)
    seccion = serializers.CharField(write_only=True, required=False)
    grado_seccion = GradoSeccionSerializer(read_only=True)

    class Meta:
        model = Estudiante
        fields = [
            'nombre', 'apellido', 'estatus', 'es_repitiente',
            'nivel', 'grado', 'seccion', 
            'grado_seccion', 
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
            instance.grado_seccion = grado_seccion

        return super().update(instance, validated_data)