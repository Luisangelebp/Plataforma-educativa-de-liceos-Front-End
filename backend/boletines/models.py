from django.db import models
from Usuarios.estudiante.models import Estudiante
from core.models import GradoSeccion, PeriodoEscolar  # Importado PeriodoEscolar
from django.conf import settings
from django.core.exceptions import ValidationError

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
    grado_seccion = models.ForeignKey(
        GradoSeccion, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='boletines_historicos'
    )
    periodo_escolar = models.CharField(
        max_length=20, 
        blank=True,  # Permitimos blanco para llenarlo en el save()
        help_text="Ejemplo: 2025-2026"
    )
    lapso = models.CharField(max_length=1, choices=LAPSO_OPCIONES)
    
    archivo_pdf = models.FileField(
        upload_to='boletines/finales/', 
        null=True, 
        blank=True
    )
    promedio_general = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        null=True, 
        blank=True
    )
    es_definitivo = models.BooleanField(
        default=False,
        help_text="Si está marcado, se considera el boletín oficial cerrado."
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
        unique_together = ['estudiante', 'lapso', 'periodo_escolar']
        verbose_name = "Boletín Informativo"
        verbose_name_plural = "Boletines Informativos"

    def __str__(self):
        return f"Boletín {self.get_lapso_display()} - {self.estudiante.nombre} {self.estudiante.apellido}"

    def calcular_promedio_general(self):
        """
        Busca las calificaciones enviadas para promediar.
        """
        from calificaciones.models import Calificacion
        
        calificaciones = Calificacion.objects.filter(
            estudiante=self.estudiante,
            lapso=self.lapso,
            enviado=True 
        )
        
        if not calificaciones.exists():
            return 0
        
        # Filtramos valores nulos de promedio antes de sumar
        notas = [c.promedio for c in calificaciones if c.promedio is not None]
        if not notas:
            return 0
            
        return round(sum(notas) / len(notas), 2)

    def save(self, *args, **kwargs):
        # 1. Asignar periodo escolar dinámico si no se provee uno
        if not self.periodo_escolar:
            periodo_activo = PeriodoEscolar.objects.filter(es_actual=True).first()
            if periodo_activo:
                self.periodo_escolar = periodo_activo.nombre
            else:
                self.periodo_escolar = "2025-2026" # Fallback de seguridad

        # 2. Asignar el grado actual del estudiante si no está seteado
        if not self.grado_seccion and self.estudiante:
            self.grado_seccion = self.estudiante.grado_seccion

        # 3. Actualizar el promedio numérico
        self.promedio_general = self.calcular_promedio_general()
        
        super().save(*args, **kwargs)