from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('core.urls')),
    path('usuarios/estudiante/', include('Usuarios.estudiante.urls')),
    path('usuarios/profesor/', include('Usuarios.profesor.urls')),
    path('usuarios/representante/', include('Usuarios.representante.urls')),
    path('usuarios/administrador/', include('Usuarios.administrador.urls')),
]

# Servir archivos media en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
