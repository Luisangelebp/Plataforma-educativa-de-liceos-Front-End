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
    
    promedio = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    enviado = models.BooleanField(default=False)
    
    observaciones = models.TextField(
        null=True, 
        blank=True, 
        help_text="Al ser general, lo que escribas aquí se verá en el boletín del lapso."
    )
    
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['estudiante', 'materia', 'lapso']
        verbose_name = 'Control de Nota'

    def calcular_promedio(self):
        evals = self.evaluaciones.all()
        if evals.exists():
            notas = [float(e.nota) for e in evals if e.nota]
            return round(sum(notas) / len(notas), 2) if notas else 0
        return 0

    def save(self, *args, **kwargs):
        # 1. Recalcular promedio
        if self.pk:
            self.promedio = self.calcular_promedio()
        
        super().save(*args, **kwargs)

        # 2. Lógica de Sincronización: 
        # Si esta materia tiene una observación, se la copiamos a todas las 
        # otras materias del estudiante en el mismo lapso.
        if self.observaciones:
            Calificacion.objects.filter(
                estudiante=self.estudiante, 
                lapso=self.lapso
            ).exclude(id=self.id).update(observaciones=self.observaciones)

    def __str__(self):
        return f"{self.estudiante} - {self.materia} (Lapso {self.lapso})"


class Evaluacion(models.Model):
    calificacion = models.ForeignKey(Calificacion, on_delete=models.CASCADE, related_name="evaluaciones")
    nombre = models.CharField(max_length=100) 
    nota = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['fecha_creacion']

    def save(self, *args, **kwargs):
        if self.calificacion.enviado:
            raise ValidationError("No puedes editar notas de un lapso ya cerrado/enviado.")
        super().save(*args, **kwargs)
        # Actualiza el padre para disparar el cálculo de promedio y la sincronización
        self.calificacion.save()

    def __str__(self):
        return f"{self.nombre}: {self.nota}"