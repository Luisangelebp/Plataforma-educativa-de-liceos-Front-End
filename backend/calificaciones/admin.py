from django.contrib import admin
from .models import Calificacion, Evaluacion

class EvaluacionInline(admin.TabularInline):
    model = Evaluacion
    extra = 0  # No mostramos filas vacías por defecto, el método abajo lo controla
    
    def get_extra(self, request, obj=None, **kwargs):
        """
        Si es Primaria y es un registro nuevo, mostramos 4 campos.
        Si es Secundaria o ya existe, mostramos solo 1 o los que tenga.
        """
        if obj is None: # Cuando se está creando apenas
            return 1
        
        # Si el objeto ya existe y es primaria, y no tiene evaluaciones aún
        if obj.estudiante.grado_seccion.nivel == 'primaria' and not obj.evaluaciones.exists():
            return 4
        return 1

@admin.register(Calificacion)
class CalificacionAdmin(admin.ModelAdmin):
    # Ya no incluimos nota1, nota2... porque ahora son 'Evaluaciones'
    list_display = [
        'estudiante', 'materia', 'lapso', 'promedio', 
        'enviado', 'fecha_actualizacion'
    ]
    list_filter = ['lapso', 'enviado', 'materia', 'estudiante__grado_seccion__nivel']
    search_fields = ['estudiante__nombre', 'estudiante__apellido', 'materia__nombre']
    readonly_fields = ['promedio', 'fecha_creacion', 'fecha_actualizacion']
    
    # Metemos las evaluaciones dinámicas dentro del formulario de Calificación
    inlines = [EvaluacionInline]
    
    fieldsets = (
        ('Información General', {
            'fields': ('estudiante', 'materia', 'profesor', 'lapso')
        }),
        ('Resultado Final', {
            'fields': ('promedio', 'enviado'),
            'description': 'El promedio se calcula automáticamente sumando las evaluaciones de abajo.'
        }),
        ('Fechas de Registro', {
            'fields': ('fecha_creacion', 'fecha_actualizacion'),
            'classes': ('collapse',)
        }),
    )

    def save_formset(self, request, form, formset, change):
        """
        Lógica para nombrar automáticamente las notas de Primaria
        si el profesor las deja en blanco.
        """
        instances = formset.save(commit=False)
        for i, instance in enumerate(instances):
            if not instance.nombre:
                instance.nombre = f"Nota {i+1}"
            instance.save()
        formset.save()