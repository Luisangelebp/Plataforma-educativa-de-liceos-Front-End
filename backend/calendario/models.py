from django.db import models
from django.conf import settings
from core.models import GradoSeccion

class EventoCalendario(models.Model):
    """Eventos del calendario escolar (evaluaciones, actividades, etc.)"""
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField(null=True, blank=True)
    fecha_inicio = models.DateTimeField()
    fecha_fin = models.DateTimeField()
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()
    
    # Relaciones opcionales
    grado_seccion = models.ForeignKey(
        GradoSeccion,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='eventos'
    )  # Si es None, es un evento general
    
    creado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='eventos_creados'
    )
    
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['fecha_inicio', 'hora_inicio']
        verbose_name = 'Evento de Calendario'
        verbose_name_plural = 'Eventos de Calendario'
    
    def __str__(self):
        grado = f" - {self.grado_seccion}" if self.grado_seccion else ""
        return f"{self.titulo}{grado} - {self.fecha_inicio.strftime('%d/%m/%Y')}"



