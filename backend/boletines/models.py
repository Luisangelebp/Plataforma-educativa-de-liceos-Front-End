from django.db import models
from Usuarios.estudiante.models import Estudiante
from core.models import GradoSeccion
from django.conf import settings

class Boletin(models.Model):
    
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
    
    # Almacena el PDF generado automáticamente para que el Admin lo descargue
    archivo_pdf = models.FileField(
        upload_to='boletines/finales/', 
        null=True, 
        blank=True,
        help_text="PDF generado automáticamente por el sistema"
    )

    promedio_general = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        null=True, 
        blank=True,
        help_text="Promedio calculado de todas las materias del lapso"
    )
    
    es_definitivo = models.BooleanField(
        default=False,
        help_text="Indica si las notas fueron aprobadas y el boletín está listo para el Admin"
    )
    
    observaciones = models.TextField(null=True, blank=True)
    fecha_emision = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    generado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='boletines_generados'
    )

    class Meta:
        ordering = ['-fecha_emision']
        unique_together = ['estudiante', 'lapso']
        verbose_name = "Boletín Informativo"
        verbose_name_plural = "Boletines Informativos"

    def __str__(self):
        return f"Boletín {self.get_lapso_display()} - {self.estudiante.nombre} {self.estudiante.apellido}"