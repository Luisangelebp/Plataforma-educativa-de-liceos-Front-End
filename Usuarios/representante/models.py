from django.db import models
from django.conf import settings

class Representante(models.Model):
    usuario = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='representante_profile'
    )
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    edad = models.PositiveSmallIntegerField()
    fecha_nacimiento = models.DateField()
    cedula = models.CharField(max_length=20)
    direccion = models.TextField()
    telefono = models.CharField(max_length=20)
    foto = models.ImageField(upload_to='representantes/', null=True, blank=True)
    
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.nombre} {self.apellido}"

