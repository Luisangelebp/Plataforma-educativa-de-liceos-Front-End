from django.contrib import admin
from .profesor.models import Profesor
from .representante.models import Representante
from .estudiante.models import Estudiante
from .administrador.models import Administrador

@admin.register(Administrador)
class AdministradorAdmin(admin.ModelAdmin):
    list_display = ('id', 'usuario', 'fecha_creacion')

@admin.register(Profesor)
class ProfesorAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'apellido', 'cedula')
    search_fields = ('nombre', 'apellido', 'cedula')

@admin.register(Representante)
class RepresentanteAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'apellido', 'cedula')
    search_fields = ('nombre', 'apellido', 'cedula')

@admin.register(Estudiante)
class EstudianteAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'apellido', 'cedula', 'grado_seccion')
    list_filter = ('grado_seccion__nivel',)
    search_fields = ('nombre', 'apellido', 'cedula')