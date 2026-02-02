from django.db import models
from django.conf import settings
from datetime import date
# 🛡️ Eliminamos el import directo de GradoSeccion para evitar bloqueos circulares
# from core.models import GradoSeccion 

class Estudiante(models.Model):
    ESTATUS_OPCIONES = [
        ('activo', 'Activo'),      # Estudiante cursando actualmente
        ('graduado', 'Graduado'),  # Ya terminó bachillerato/primaria
        ('retirado', 'Retirado'),  # Se fue del plantel
        ('inactivo', 'Inactivo'),  # No se ha reinscrito en el nuevo periodo
    ]

    usuario = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='estudiante_profile'
    )
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    fecha_nacimiento = models.DateField()
    cedula = models.CharField(max_length=20, null=True, blank=True)
    direccion = models.TextField()
    foto = models.ImageField(upload_to='estudiantes/', null=True, blank=True)

    # --- CAMPOS DE CONTROL ACADÉMICO ---
    estatus = models.CharField(
        max_length=20, 
        choices=ESTATUS_OPCIONES, 
        default='activo'
    )
    es_repitiente = models.BooleanField(
        default=False, 
        help_text="Marcar si el estudiante está repitiendo el grado actual."
    )
    # ----------------------------------

    representante = models.ForeignKey(
        'Usuarios.Representante',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='estudiantes'
    )

    # 🛡️ CORRECCIÓN: Usamos el string 'core.GradoSeccion'
    grado_seccion = models.ForeignKey(
        'core.GradoSeccion',
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
        """Devuelve el grado o año según el nivel de la sección."""
        if self.grado_seccion:
            if self.grado_seccion.nivel == "primaria":
                return f"Grado: {self.grado_seccion.grado} {self.grado_seccion.seccion}"
            elif self.grado_seccion.nivel == "secundaria":
                return f"Año: {self.grado_seccion.grado} {self.grado_seccion.seccion}"
        return "Sin sección asignada"

    @property
    def cedula_mostrada(self):
        """Devuelve la cédula o un guion si no está asignada."""
        return self.cedula if self.cedula else "—"

    @property
    def representante_nombre(self):
        """Devuelve el nombre del representante o 'Sin representante'."""
        if self.representante:
            return f"{getattr(self.representante, 'nombre', '')} {getattr(self.representante, 'apellido', '')}".strip()
        return "Sin representante"

    def __str__(self):
        return f"{self.nombre} {self.apellido} ({self.estatus.capitalize()}) - {self.grado_seccion}"