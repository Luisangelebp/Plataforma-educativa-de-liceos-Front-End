from django.db import models
from django.conf import settings
from datetime import date

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
    grado = models.CharField(max_length=50)
    nivel = models.CharField(max_length=20, choices=OPCIONES_NIVEL)
    fecha_nacimiento = models.DateField()
    cedula = models.CharField(max_length=20, null=True, blank=True)
    direccion = models.TextField()
    foto = models.ImageField(upload_to='estudiantes/', null=True, blank=True)
    representante = models.ForeignKey(
        'Usuarios.Representante',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='estudiantes'
    )

    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    @property
    def edad(self):
        """Calcula la edad a partir de la fecha de nacimiento."""
        if self.fecha_nacimiento:
            today = date.today()
            return today.year - self.fecha_nacimiento.year - (
                (today.month, today.day) < (self.fecha_nacimiento.month, self.fecha_nacimiento.day)
            )
        return None

    @property
    def grado_o_año(self):
        """Devuelve el grado como 'Grado: X' o 'Año: X' según el nivel."""
        if self.nivel == "primaria":
            return f"Grado: {self.grado}"
        elif self.nivel == "secundaria":
            return f"Año: {self.grado}"
        return self.grado

    @property
    def cedula_mostrada(self):
        """Devuelve la cédula o un guion si no está asignada."""
        return self.cedula if self.cedula else "—"

    @property
    def representante_nombre(self):
        """Devuelve el nombre del representante o 'Sin representante'."""
        return self.representante.nombre if self.representante else "Sin representante"

    def __str__(self):
        return f"{self.nombre} {self.apellido} - {self.grado} ({self.nivel})"
