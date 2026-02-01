from django.contrib import admin
from .models import Materia, Horario

@admin.register(Materia)
class MateriaAdmin(admin.ModelAdmin):
    """
    Configuración para la gestión de Materias.
    """
    list_display = ('id', 'nombre', 'descripcion', 'fecha_creacion')
    search_fields = ('nombre',)
    ordering = ('nombre',)

@admin.register(Horario)
class HorarioAdmin(admin.ModelAdmin):
    """
    Configuración para el Cronograma Escolar.
    """
    # Columnas que verás en la tabla principal
    list_display = (
        'dia_semana', 
        'hora_inicio', 
        'hora_fin', 
        'materia', 
        'grado_seccion', 
        'profesor'
    )
    
    # Filtros laterales (Muy útiles para el Admin)
    list_filter = (
        'dia_semana', 
        'grado_seccion__nivel', 
        'grado_seccion', 
        'profesor'
    )
    
    # Búsqueda por texto
    search_fields = (
        'materia__nombre', 
        'profesor__nombre', 
        'profesor__apellido', 
        'grado_seccion__grado'
    )
    
    # Orden predeterminado: por día y luego por hora
    ordering = ('dia_semana', 'hora_inicio')

    # Organización del formulario de edición
    fieldsets = (
        ('Asignación Académica', {
            'fields': ('materia', 'grado_seccion', 'profesor')
        }),
        ('Bloque de Tiempo', {
            'fields': ('dia_semana', 'hora_inicio', 'hora_fin')
        }),
        ('Metadatos', {
            'fields': ('fecha_creacion', 'fecha_actualizacion'),
            'classes': ('collapse',) # Esto lo oculta por defecto
        }),
    )

    readonly_fields = ('fecha_creacion', 'fecha_actualizacion')

    # Para que sea más rápido elegir profesor y grado en listas largas
    autocomplete_fields = ['profesor', 'grado_seccion']