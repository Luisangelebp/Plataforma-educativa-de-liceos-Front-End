from django.db import models
from Usuarios.estudiante.models import Estudiante
from core.models import GradoSeccion
from django.conf import settings

class PlantillaBoletin(models.Model):
    """Plantilla Word que sube el admin por periodo"""
    PERIODO_OPCIONES = [
        ('1', 'Primer Lapso'),
        ('2', 'Segundo Lapso'),
        ('3', 'Tercer Lapso'),
    ]
    
    periodo = models.CharField(max_length=1, choices=PERIODO_OPCIONES)
    grado_seccion = models.ForeignKey(
        GradoSeccion,
        on_delete=models.CASCADE,
        related_name='plantillas_boletin',
        null=True,
        blank=True
    )  # Si es None, aplica a todos los grados
    archivo_word = models.FileField(upload_to='plantillas_boletines/')
    activa = models.BooleanField(default=True)
    fecha_subida = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    subido_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='plantillas_subidas'
    )
    
    class Meta:
        ordering = ['-fecha_subida']
        unique_together = ['periodo', 'grado_seccion']
    
    def __str__(self):
        grado = f" - {self.grado_seccion}" if self.grado_seccion else " - Todos"
        return f"Plantilla {self.get_periodo_display()}{grado}"

class Boletin(models.Model):
    """Boletín subido por el profesor para un estudiante en un lapso"""
    LAPSO_OPCIONES = [
        ('1', 'Primer Lapso'),
        ('2', 'Segundo Lapso'),
        ('3', 'Tercer Lapso'),
    ]
    
    estudiante = models.ForeignKey(
        Estudiante,
        on_delete=models.CASCADE,
        related_name='boletines'
    )
    lapso = models.CharField(max_length=1, choices=LAPSO_OPCIONES)

    # 🔹 Nuevo campo para soportar Word y conversión automática
    archivo_word = models.FileField(upload_to='boletines/', null=True, blank=True)
    archivo_pdf = models.FileField(upload_to='boletines/', null=True, blank=True)

    promedio_general = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Promedio general calculado"
    )
    fecha_emision = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    subido_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='boletines_subidos'
    )
    observaciones = models.TextField(null=True, blank=True)
    
    class Meta:
        ordering = ['-fecha_emision']
        unique_together = ['estudiante', 'lapso']
    
    def __str__(self):
        return f"Boletín {self.get_lapso_display()} - {self.estudiante}"



