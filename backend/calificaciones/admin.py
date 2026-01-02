from django.contrib import admin
from .models import Calificacion


@admin.register(Calificacion)
class CalificacionAdmin(admin.ModelAdmin):
    list_display = ['estudiante', 'materia', 'lapso', 'nota1', 'nota2', 'nota3', 'nota4', 'promedio', 'enviado', 'fecha_actualizacion']
    list_filter = ['lapso', 'enviado', 'materia', 'fecha_actualizacion']
    search_fields = ['estudiante__nombre', 'estudiante__apellido', 'materia__nombre']
    readonly_fields = ['promedio', 'fecha_creacion', 'fecha_actualizacion']
    
    fieldsets = (
        ('Información General', {
            'fields': ('estudiante', 'materia', 'profesor', 'lapso')
        }),
        ('Notas Parciales', {
            'fields': ('nota1', 'nota2', 'nota3', 'nota4', 'promedio')
        }),
        ('Estado', {
            'fields': ('enviado',)
        }),
        ('Fechas', {
            'fields': ('fecha_creacion', 'fecha_actualizacion'),
            'classes': ('collapse',)
        }),
    )
