from django.db import models
from django.conf import settings

OPCIONES_NIVEL = [
    ('primaria', 'Primaria'),
    ('secundaria', 'Secundaria'),
]

class Estudiante(models.Model):
    usuario = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='estudiante_profile'
    )
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    edad = models.PositiveSmallIntegerField()
    grado = models.CharField(max_length=50)
    nivel = models.CharField(max_length=20, choices=OPCIONES_NIVEL)
    fecha_nacimiento = models.DateField()
    cedula = models.CharField(max_length=20, null=True, blank=True)
    direccion = models.TextField()
    foto = models.ImageField(upload_to='estudiantes/', null=True, blank=True)
<<<<<<< HEAD
    # Referencia al modelo Representante - usando importación directa
    representante = models.ForeignKey(
        'Usuarios.Representante',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='estudiantes'
    )
=======
    # Campo representante temporalmente deshabilitado hasta crear la app representante
    # representante = models.ForeignKey(
    #     'representante.Representante',
    #     on_delete=models.SET_NULL,
    #     null=True,
    #     blank=True,
    #     related_name='estudiantes'
    # )
>>>>>>> be966112e40af0d3615b700be9d8845dc237fff3

    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.nombre} {self.apellido} - {self.grado} ({self.nivel})"
