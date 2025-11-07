from django.db import models
from django.conf import settings

OPCIONES_TIPO_PROFESOR = [
    ('titular', 'Titular'),
    ('suplente', 'Suplente'),
    ('especialista', 'Especialista'),
]

class Profesor(models.Model):
    usuario = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='profesor_profile'
    )
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    edad = models.PositiveSmallIntegerField()
    grado_asignado = models.CharField(max_length=50)
    tipo_profesor = models.CharField(max_length=20, choices=OPCIONES_TIPO_PROFESOR)
    fecha_nacimiento = models.DateField()
    cedula = models.CharField(max_length=20)
    direccion = models.TextField()
    telefono = models.CharField(max_length=20)
    foto = models.ImageField(upload_to='profesores/', null=True, blank=True)
    
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.nombre} {self.apellido} - {self.grado_asignado}"


