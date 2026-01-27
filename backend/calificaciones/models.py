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

    estudiante = models.ForeignKey(Estudiante, on_delete=models.CASCADE, related_name='calificaciones')
    materia = models.ForeignKey(Materia, on_delete=models.CASCADE, related_name='calificaciones')
    profesor = models.ForeignKey(Profesor, on_delete=models.CASCADE, related_name='calificaciones_registradas')
    lapso = models.CharField(max_length=1, choices=LAPSO_OPCIONES)
    
    # Único campo de resultado. Se llena sumando sus "Evaluaciones"
    promedio = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    enviado = models.BooleanField(default=False)
    
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['estudiante', 'materia', 'lapso']
        verbose_name = 'Control de Nota'

    def calcular_promedio(self):
        """Suma todas las evaluaciones dinámicas y saca el promedio"""
        evals = self.evaluaciones.all()
        if evals.exists():
            # Filtramos solo las que tengan nota numérica válida
            notas = [float(e.nota) for e in evals if e.nota]
            return round(sum(notas) / len(notas), 2) if notas else 0
        return 0

    def save(self, *args, **kwargs):
        # El promedio se recalcula siempre al guardar el padre
        if self.pk:
            self.promedio = self.calcular_promedio()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.estudiante} - {self.materia} (Lapso {self.lapso})"


class Evaluacion(models.Model):
    calificacion = models.ForeignKey(Calificacion, on_delete=models.CASCADE, related_name="evaluaciones")
    nombre = models.CharField(max_length=100) # Ej: "Nota 1", "Examen", etc.
    nota = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['fecha_creacion']

    def save(self, *args, **kwargs):
        if self.calificacion.enviado:
            raise ValidationError("No puedes editar notas de un lapso ya cerrado/enviado.")
        super().save(*args, **kwargs)
        # Importante: Esto actualiza el promedio en el modelo Calificacion
        self.calificacion.save()

    def __str__(self):
        return f"{self.nombre}: {self.nota}"