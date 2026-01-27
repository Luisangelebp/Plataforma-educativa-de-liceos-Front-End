from django.db import models
from django.conf import settings
from horarios.models import Materia
from Usuarios.estudiante.models import Estudiante
from Usuarios.profesor.models import Profesor
from django.core.exceptions import ValidationError

class Calificacion(models.Model):
    LAPSO_OPCIONES = [
        ('1', 'Primer Lapso'),
        ('2', 'Segundo Lapso'),
        ('3', 'Tercer Lapso'),
    ]

    estudiante = models.ForeignKey(
        Estudiante,
        on_delete=models.CASCADE,
        related_name='calificaciones'
    )
    materia = models.ForeignKey(
        Materia,
        on_delete=models.CASCADE,
        related_name='calificaciones'
    )
    profesor = models.ForeignKey(
        Profesor,
        on_delete=models.CASCADE,
        related_name='calificaciones_registradas'
    )
    lapso = models.CharField(max_length=1, choices=LAPSO_OPCIONES)
    
    # Notas parciales (Primaria)
    nota1 = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="0-20")
    nota2 = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="0-20")
    nota3 = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="0-20")
    nota4 = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="0-20")
    
    promedio = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        null=True, 
        blank=True, 
        help_text="Calculado automáticamente"
    )
    
    enviado = models.BooleanField(
        default=False,
        help_text="Si es True, el registro queda bloqueado para edición"
    )
    
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-fecha_actualizacion']
        unique_together = ['estudiante', 'materia', 'lapso']
        verbose_name = 'Calificación'
        verbose_name_plural = 'Calificaciones'

    def calcular_promedio_fijo(self):
        """Calcula el promedio de las notas nota1..nota4 (Para Primaria)"""
        notas = [self.nota1, self.nota2, self.nota3, self.nota4]
        notas_validas = [n for n in notas if n is not None]
        if not notas_validas:
            return None
        return round(sum(notas_validas) / len(notas_validas), 2)

    def promedio_lapso(self, lapso):
        """
        Retorna el promedio del lapso. 
        Si hay evaluaciones dinámicas (Secundaria), las promedia.
        Si no, usa el promedio de notas fijas (Primaria).
        """
        evaluaciones = self.evaluaciones.filter(lapso=lapso)
        if evaluaciones.exists():
            notas = [ev.nota for ev in evaluaciones]
            return round(sum(notas) / len(notas), 2)
        return self.promedio

    def promedio_general(self):
        """Promedio histórico de todos los lapsos registrados"""
        promedios = []
        for lapso_cod, _ in self.LAPSO_OPCIONES:
            p_lapso = self.promedio_lapso(lapso_cod)
            if p_lapso is not None:
                promedios.append(float(p_lapso))
        
        if not promedios:
            return None
        return round(sum(promedios) / len(promedios), 2)

    def save(self, *args, **kwargs):
        # Si no hay evaluaciones dinámicas, calculamos el promedio fijo
        if not self.pk or not self.evaluaciones.exists():
            self.promedio = self.calcular_promedio_fijo()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.estudiante} - {self.materia} - Lapso {self.lapso}"


class Evaluacion(models.Model):
    """Modelo para evaluaciones dinámicas (Secundaria)"""
    calificacion = models.ForeignKey(
        Calificacion,
        on_delete=models.CASCADE,
        related_name="evaluaciones"
    )
    lapso = models.CharField(max_length=1, choices=Calificacion.LAPSO_OPCIONES)
    nombre = models.CharField(max_length=100)
    nota = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['lapso', 'fecha_creacion']
        verbose_name = "Evaluación"
        verbose_name_plural = "Evaluaciones"

    def save(self, *args, **kwargs):
        # Bloqueo: No se puede editar si la nota ya se envió al boletín
        if self.calificacion.enviado:
            raise ValidationError("No se puede modificar evaluaciones de una materia ya finalizada.")
        super().save(*args, **kwargs)
        self.calificacion.save()  # Dispara el recalculo en el padre

    def delete(self, *args, **kwargs):
        # Bloqueo: No se puede eliminar si la nota ya se envió al boletín
        if self.calificacion.enviado:
            raise ValidationError("No se puede eliminar evaluaciones de una materia ya finalizada.")
        calificacion = self.calificacion
        super().delete(*args, **kwargs)
        calificacion.save()

    def __str__(self):
        return f"{self.nombre} - {self.nota} ({self.calificacion.estudiante})"