from django.db import models
from django.conf import settings
from horarios.models import Materia
from Usuarios.estudiante.models import Estudiante
from Usuarios.profesor.models import Profesor


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
    
    # 4 notas parciales
    nota1 = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Primera nota parcial (0-20)"
    )
    nota2 = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Segunda nota parcial (0-20)"
    )
    nota3 = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Tercera nota parcial (0-20)"
    )
    nota4 = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Cuarta nota parcial (0-20)"
    )
    
    # Promedio calculado automáticamente
    promedio = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Promedio de las notas parciales"
    )
    
    # Control de envío
    enviado = models.BooleanField(
        default=False,
        help_text="Indica si las calificaciones finales ya fueron enviadas"
    )
    
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-fecha_actualizacion']
        unique_together = ['estudiante', 'materia', 'lapso']
        verbose_name = 'Calificación'
        verbose_name_plural = 'Calificaciones'
    
    def calcular_promedio(self):
        """Calcula el promedio de las notas válidas"""
        notas = [self.nota1, self.nota2, self.nota3, self.nota4]
        notas_validas = [n for n in notas if n is not None]
        
        if not notas_validas:
            return None
        
        suma = sum(notas_validas)
        promedio = suma / len(notas_validas)
        return round(promedio, 2)
    
    def save(self, *args, **kwargs):
        """Calcula el promedio automáticamente antes de guardar"""
        self.promedio = self.calcular_promedio()
        super().save(*args, **kwargs)
    
    def promedio_lapso(self, lapso):
        """Promedio dinámico de secundaria para un lapso específico"""
        evaluaciones = self.evaluaciones.filter(lapso=lapso)
        if not evaluaciones.exists():
            return None
        notas = [ev.nota for ev in evaluaciones]
        return round(sum(notas) / len(notas), 2)

    def promedio_general(self):
        """Promedio general considerando todos los lapsos (primaria o secundaria)"""
        promedios = []
        # Si hay evaluaciones dinámicas, usamos esas
        if hasattr(self, 'evaluaciones') and self.evaluaciones.exists():
            for lapso, _ in self.LAPSO_OPCIONES:
                lapso_prom = self.promedio_lapso(lapso)
                if lapso_prom is not None:
                    promedios.append(lapso_prom)
        else:
            # Caso primaria: usamos el campo promedio
            if self.promedio is not None:
                promedios.append(float(self.promedio))
        if not promedios:
            return None
        return round(sum(promedios) / len(promedios), 2)
    
    def __str__(self):
        return f"{self.estudiante} - {self.materia} - {self.get_lapso_display()} (Prom: {self.promedio or 'N/A'})"


# 🔹 Nuevo modelo para secundaria (evaluaciones dinámicas)
class Evaluacion(models.Model):
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
        """Al guardar o editar una evaluación, recalcula el promedio general"""
        super().save(*args, **kwargs)
        self.calificacion.save()  # fuerza recalcular promedios en Calificacion

    def delete(self, *args, **kwargs):
        """Al eliminar una evaluación, recalcula el promedio general"""
        calificacion = self.calificacion
        super().delete(*args, **kwargs)
        calificacion.save()

    def __str__(self):
        return f"{self.calificacion.estudiante} - {self.nombre} ({self.lapso})"
