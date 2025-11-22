from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario, GradoSeccion

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
            'fields': ('email', 'nombre', 'apellido', 'rol', 'foto', 'password1', 'password2', 'is_staff', 'is_superuser')}
        ),
    )

    # 👇 Esto asegura que el admin use email como login
    def get_fieldsets(self, request, obj=None):
        return super().get_fieldsets(request, obj)

    def get_form(self, request, obj=None, **kwargs):
        kwargs['fields'] = ('email', 'nombre', 'apellido', 'rol', 'foto', 'password')
        return super().get_form(request, obj, **kwargs)

@admin.register(GradoSeccion)
class GradoSeccionAdmin(admin.ModelAdmin):
    list_display = ('nivel', 'grado', 'seccion', 'fecha_creacion', 'fecha_actualizacion')
    list_filter = ('nivel', 'seccion')
    search_fields = ('grado', 'seccion')