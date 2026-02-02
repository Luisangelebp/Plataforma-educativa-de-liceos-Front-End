from django.db import models
from django.conf import settings
from datetime import date
# 🛡️ Eliminamos los imports directos para romper el círculo vicioso
# from core.models import GradoSeccion
# from horarios.models import Materia

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

    # 🛡️ CORRECCIÓN: Relación mediante string
    grado_secciones = models.ManyToManyField(
        'core.GradoSeccion',
        related_name='profesores',
        blank=True
    )

    # 🛡️ CORRECCIÓN: Relación mediante string
    materias = models.ManyToManyField(
        'horarios.Materia',
        related_name='profesores',
        blank=True
    )

    tipo_profesor = models.CharField(max_length=20, choices=OPCIONES_TIPO_PROFESOR)
    fecha_nacimiento = models.DateField()
    cedula = models.CharField(max_length=20, unique=True)
    direccion = models.TextField()
    telefono = models.CharField(max_length=20)
    foto = models.ImageField(upload_to='profesores/', null=True, blank=True)
    
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    @property
    def edad(self):
        if self.fecha_nacimiento:
            today = date.today()
            return today.year - self.fecha_nacimiento.year - (
                (today.month, today.day) < (self.fecha_nacimiento.month, self.fecha_nacimiento.day)
            )
        return None

    def __str__(self):
        return f"{self.nombre} {self.apellido} - {self.tipo_profesor}"