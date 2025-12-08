from rest_framework import serializers
from core.serializers import UsuarioSerializer, GradoSeccionSerializer
from core.models import Usuario, GradoSeccion
from .models import Profesor

class RegistroProfesorSerializer(serializers.ModelSerializer):
    # Campos para crear el usuario asociado
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True)

    # Recibir varias secciones en la petición
    grado_secciones = GradoSeccionSerializer(many=True, write_only=True, required=False)

    # Devolver las secciones completas en la respuesta
    grado_secciones_detalle = GradoSeccionSerializer(source='grado_secciones', many=True, read_only=True)

    class Meta:
        model = Profesor
        fields = [
            'id', 'usuario', 'nombre', 'apellido',
            'tipo_profesor', 'fecha_nacimiento', 'cedula', 'direccion',
            'telefono', 'foto', 'email', 'password',
            'grado_secciones', 'grado_secciones_detalle'
        ]
        read_only_fields = ['usuario', 'id', 'grado_secciones_detalle']

    def validate(self, data):
        email = data.get('email')
        if Usuario.objects.filter(email=email).exists():
            raise serializers.ValidationError("El email ya está registrado en el sistema.")
        return data

    def create(self, validated_data):
        email = validated_data.pop('email')
        password = validated_data.pop('password')
        secciones_data = validated_data.pop('grado_secciones', []) or []

        # Crear usuario con rol profesor
        datos_usuario = {
            'email': email,
            'nombre': validated_data.get('nombre'),
            'apellido': validated_data.get('apellido'),
            'rol': 'profesor',
            'password': password
        }
        usuario_serializer = UsuarioSerializer(data=datos_usuario)
        usuario_serializer.is_valid(raise_exception=True)
        usuario = usuario_serializer.save()

        usuario.is_active = True
        usuario.save()

        profesor = Profesor.objects.create(usuario=usuario, **validated_data)

        # Asignar secciones (buscar o crear)
        for seccion in secciones_data:
            grado_seccion, _ = GradoSeccion.objects.get_or_create(
                nivel=seccion['nivel'],
                grado=seccion['grado'],
                seccion=seccion['seccion']
            )
            profesor.grado_secciones.add(grado_seccion)

        return profesor


class ProfesorListSerializer(serializers.ModelSerializer):
    edad = serializers.ReadOnlyField()
    grado_secciones = GradoSeccionSerializer(many=True, read_only=True)

    class Meta:
        model = Profesor
        fields = [
            'id', 'usuario', 'nombre', 'apellido',
            'tipo_profesor', 'fecha_nacimiento', 'edad',
            'cedula', 'direccion', 'telefono', 'foto',
            'fecha_creacion', 'fecha_actualizacion',
            'grado_secciones'
        ]


class ProfesorUpdateSerializer(serializers.ModelSerializer):
    grado_secciones = GradoSeccionSerializer(many=True, write_only=True, required=False)

    class Meta:
        model = Profesor
        fields = [
            'nombre', 'apellido', 'tipo_profesor',
            'fecha_nacimiento', 'cedula', 'direccion',
            'telefono', 'foto', 'grado_secciones'
        ]
        read_only_fields = ['id', 'usuario']

    def update(self, instance, validated_data):
        secciones_data = validated_data.pop('grado_secciones', None)

        if secciones_data is not None:
            instance.grado_secciones.clear()
            for seccion in secciones_data:
                grado_seccion, _ = GradoSeccion.objects.get_or_create(
                    nivel=seccion['nivel'],
                    grado=seccion['grado'],
                    seccion=seccion['seccion']
                )
                instance.grado_secciones.add(grado_seccion)

        return super().update(instance, validated_data)