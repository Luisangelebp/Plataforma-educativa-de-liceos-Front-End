from django.contrib import admin
from django.urls import path, include
<<<<<<< HEAD
from django.conf import settings
from django.conf.urls.static import static
=======
>>>>>>> be966112e40af0d3615b700be9d8845dc237fff3

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('core.urls')),
    path('api/usuarios/estudiante/', include('Usuarios.estudiante.urls')),
<<<<<<< HEAD
    path('api/usuarios/profesor/', include('Usuarios.profesor.urls')),
    path('api/usuarios/representante/', include('Usuarios.representante.urls')),
    path('api/usuarios/administrador/', include('Usuarios.administrador.urls')),
]

# Servir archivos media en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
=======
]
>>>>>>> be966112e40af0d3615b700be9d8845dc237fff3
