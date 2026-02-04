from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario, GradoSeccion, Institucion, PeriodoEscolar

@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    model = Usuario
    list_display = ('email', 'nombre', 'apellido', 'rol', 'is_staff', 'is_superuser')
    list_filter = ('rol', 'is_staff', 'is_superuser', 'is_active')
    search_fields = ('email', 'nombre', 'apellido')
    ordering = ('email',)

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Información personal', {'fields': ('nombre', 'apellido', 'rol', 'foto')}),
        ('Permisos', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Fechas importantes', {'fields': ('last_login',)}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'nombre', 'apellido', 'rol', 'foto', 'password', 'is_staff', 'is_superuser')}
        ),
    )

    def get_fieldsets(self, request, obj=None):
        return super().get_fieldsets(request, obj)

    def get_form(self, request, obj=None, **kwargs):
        # Aseguramos que los campos coincidan con tu modelo personalizado
        if not obj:
            self.fields = ('email', 'nombre', 'apellido', 'rol', 'foto', 'password', 'is_staff', 'is_superuser')
        return super().get_form(request, obj, **kwargs)

@admin.register(GradoSeccion)
class GradoSeccionAdmin(admin.ModelAdmin):
    list_display = ('nivel', 'grado', 'seccion', 'fecha_creacion', 'fecha_actualizacion')
    list_filter = ('nivel', 'seccion')
    search_fields = ('grado', 'seccion', 'nivel')

# --- CONFIGURACIÓN DEL PLANTEL (Agregados para desbloquear el sistema) ---

@admin.register(Institucion)
class InstitucionAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'rif', 'director', 'codigo_dea')
    # Esto permite editar la info básica directamente desde la lista
    list_editable = ('director',)

@admin.register(PeriodoEscolar)
class PeriodoEscolarAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'es_actual')
    list_editable = ('es_actual',)