from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from .models import Boletin

@admin.register(Boletin)
class BoletinAdmin(admin.ModelAdmin):
    list_display = (
        'estudiante', 
        'cedula_display',
        'grado_display',
        'lapso', 
        'periodo_escolar', 
        'promedio_display', 
        'acciones_pdf' 
    )
    
    list_filter = ('lapso', 'periodo_escolar', 'es_definitivo', 'grado_seccion__nivel')
    search_fields = ('estudiante__nombre', 'estudiante__apellido', 'estudiante__cedula')
    
    readonly_fields = (
        'fecha_emision', 
        'fecha_actualizacion', 
        'promedio_general', 
        'archivo_pdf_link',
        'generado_por'
    )

    # --- MÉTODOS DE DISPLAY ---

    def cedula_display(self, obj):
        return obj.estudiante.cedula
    cedula_display.short_description = "Cédula"

    def grado_display(self, obj):
        return str(obj.grado_seccion)
    grado_display.short_description = "Grado/Sección"

    def promedio_display(self, obj):
        color = "#28a745" if obj.promedio_general >= 10 else "#dc3545"
        return format_html('<strong style="color: {};">{}</strong>', color, obj.promedio_general)
    promedio_display.short_description = "Prom. General"

    def acciones_pdf(self, obj):
        """Genera botones de acción dinámicos para el Admin."""
        # 1. Intentamos obtener la URL base de la vista previa
        try:
            url_base = reverse('boletines:vista-previa-boletin', kwargs={
                'estudiante_id': obj.estudiante.id,
                'lapso': obj.lapso
            })
        except:
            url_base = f"/boletines/vista-previa/{obj.estudiante.id}/lapso/{obj.lapso}/"

        # 2. URL de descarga directa (usando el parámetro que habilitamos en el views)
        url_descarga = f"{url_base}?download=1"

        # 3. Construcción de botones (Siempre visibles para el Admin)
        botones = format_html(
            '<a class="button" href="{}" target="_blank" style="background-color: #f0ad4e; color:white; padding: 4px 8px; margin-right: 5px; border-radius: 4px; text-decoration: none; font-size: 10px;">🔍 VISTA PREVIA</a>'
            '<a class="button" href="{}" style="background-color: #28a745; color:white; padding: 4px 8px; border-radius: 4px; text-decoration: none; font-size: 10px;">📥 DESCARGAR</a>',
            url_base, url_descarga
        )
        
        return botones
    
    acciones_pdf.short_description = "Acciones Rápidas"

    def archivo_pdf_link(self, obj):
        """Muestra el link al archivo si es que ya se generó oficialmente en el servidor."""
        if obj.archivo_pdf:
            return format_html('<a href="{}" target="_blank">📄 Abrir PDF guardado en servidor</a>', obj.archivo_pdf.url)
        return "No guardado físicamente. Use 'Descargar' para obtenerlo al momento."
    archivo_pdf_link.short_description = "Archivo PDF"

    # --- ORGANIZACIÓN ---

    fieldsets = (
        ('Información del Estudiante', {
            'fields': ('estudiante', 'grado_seccion', 'periodo_escolar', 'lapso')
        }),
        ('Resultados y Documento', {
            'fields': ('promedio_general', 'archivo_pdf_link', 'es_definitivo')
        }),
        ('Seguimiento', {
            'fields': ('observaciones', 'generado_por', 'fecha_emision', 'fecha_actualizacion')
        }),
    )

    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.generado_por = request.user
        super().save_model(request, obj, form, change)