from django.contrib import admin
from .models import Calificacion, Evaluacion

class EvaluacionInline(admin.TabularInline):
    model = Evaluacion
    extra = 0  # Controlado por get_extra
    fields = ['nombre', 'nota', 'fecha_creacion']
    readonly_fields = ['fecha_creacion']
    
    def get_extra(self, request, obj=None, **kwargs):
        """
        Si es Primaria y no tiene notas, sugerimos las 4 casillas base.
        """
        if obj is None: 
            return 1
        
        # Si es primaria y no hay evaluaciones registradas aún, mostramos 4
        if (obj.estudiante.grado_seccion and 
            obj.estudiante.grado_seccion.nivel == 'primaria' and 
            not obj.evaluaciones.exists()):
            return 4
        return 1

@admin.register(Calificacion)
class CalificacionAdmin(admin.ModelAdmin):
    list_display = [
        'estudiante', 
        'materia', 
        'lapso', 
        'promedio', 
        'enviado', 
        'fecha_actualizacion'
    ]
    list_filter = [
        'lapso', 
        'enviado', 
        'materia', 
        'estudiante__grado_seccion__nivel',
        'estudiante__grado_seccion__grado'
    ]
    search_fields = [
        'estudiante__nombre', 
        'estudiante__apellido', 
        'materia__nombre', 
        'estudiante__cedula'
    ]
    readonly_fields = ['promedio', 'fecha_creacion', 'fecha_actualizacion']
    
    inlines = [EvaluacionInline]
    
    fieldsets = (
        ('Información General', {
            'fields': ('estudiante', 'materia', 'profesor', 'lapso')
        }),
        ('Resultado Final', {
            'fields': ('promedio', 'enviado'),
            'description': 'El promedio se calcula automáticamente al guardar las evaluaciones inferiores.'
        }),
        ('Fechas de Registro', {
            'fields': ('fecha_creacion', 'fecha_actualizacion'),
            'classes': ('collapse',)
        }),
    )

    def save_formset(self, request, form, formset, change):
        """
        Asegura que las notas tengan nombre y actualiza el promedio del padre.
        """
        instances = formset.save(commit=False)
        
        # Guardar cada evaluación (esto dispara el save de Evaluacion)
        for i, instance in enumerate(instances):
            if not instance.nombre:
                # Nombre por defecto si viene vacío
                instance.nombre = f"Nota {i+1}"
            instance.save()
            
        # Eliminar objetos marcados para borrar en el admin
        for obj in formset.deleted_objects:
            obj.delete()

        # ⚡ CRUCIAL: Forzamos el save del padre para que recalcule el promedio
        # con las notas que acabamos de guardar o borrar.
        form.instance.save()
        formset.save_m2m()