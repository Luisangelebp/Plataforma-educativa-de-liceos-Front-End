from django.contrib import admin
from .profesor.models import Profesor
from .representante.models import Representante
from .estudiante.models import Estudiante

@admin.register(Profesor)
class ProfesorAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'apellido', 'tipo_profesor', 'cedula')
    search_fields = ('nombre', 'apellido', 'cedula') # 🚀 Habilita autocomplete en Horarios

@admin.register(Representante)
class RepresentanteAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'apellido', 'cedula', 'telefono')
    search_fields = ('nombre', 'apellido', 'cedula') # 🚀 Habilita autocomplete en Estudiantes

@admin.register(Estudiante)
class EstudianteAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'apellido', 'cedula', 'grado_seccion')
    search_fields = ('nombre', 'apellido', 'cedula')
    list_filter = ('grado_seccion', 'grado_seccion__nivel')