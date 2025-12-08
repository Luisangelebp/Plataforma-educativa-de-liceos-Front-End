from django.contrib import admin
from .models import EventoCalendario

@admin.register(EventoCalendario)
class EventoCalendarioAdmin(admin.ModelAdmin):
    list_display = ['titulo', 'grado_seccion', 'fecha_inicio', 'hora_inicio', 'creado_por']
    list_filter = ['fecha_inicio', 'grado_seccion']
    search_fields = ['titulo', 'descripcion']
    date_hierarchy = 'fecha_inicio'



