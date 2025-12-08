from django.contrib import admin
from .models import PlantillaBoletin, Boletin

@admin.register(PlantillaBoletin)
class PlantillaBoletinAdmin(admin.ModelAdmin):
    list_display = ['periodo', 'grado_seccion', 'activa', 'fecha_subida', 'subido_por']
    list_filter = ['periodo', 'activa', 'fecha_subida']
    search_fields = ['grado_seccion__grado', 'grado_seccion__seccion']

@admin.register(Boletin)
class BoletinAdmin(admin.ModelAdmin):
    list_display = ['estudiante', 'lapso', 'promedio_general', 'fecha_emision', 'subido_por']
    list_filter = ['lapso', 'fecha_emision']
    search_fields = ['estudiante__nombre', 'estudiante__apellido', 'estudiante__cedula']



