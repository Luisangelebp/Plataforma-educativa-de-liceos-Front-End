from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse

# Vista índice en la raíz
def index(request):
    return HttpResponse("""
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8" />
            <title>Índice de endpoints</title>
            <style>
                body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; margin: 2rem; }
                h1 { margin-bottom: 0.5rem; }
                .section { margin-top: 1.5rem; }
                ul { line-height: 1.8; }
                a { text-decoration: none; color: #0b5bd3; }
                a:hover { text-decoration: underline; }
                code { background: #f4f4f4; padding: 0.1rem 0.3rem; border-radius: 4px; }
            </style>
        </head>
        <body>
            <h1>Índice de endpoints</h1>
            <p>Selecciona una ruta para probar directamente:</p>

            <div class="section">
                <h2>Core</h2>
                <ul>
                    <li><a href="/login/">/login/</a></li>
                    <li><a href="/registro/">/registro/</a></li>
                    <li><a href="/grado-seccion/">/grado-seccion/</a> (lista, detalle <code>/&lt;id&gt;/</code>, crear <code>POST</code>)</li>
                </ul>
            </div>

            <div class="section">
                <h2>Usuarios</h2>
                <ul>
                    <li><a href="/usuarios/estudiante/">/usuarios/estudiante/</a> (lista, detalle <code>/&lt;id&gt;/</code>, pdf <code>/pdf/</code>, registro <code>/registro/</code>)</li>
                    <li><a href="/usuarios/profesor/">/usuarios/profesor/</a> (lista, detalle <code>/&lt;id&gt;/</code>, registro <code>/registro/</code>)</li>
                    <li><a href="/usuarios/representante/">/usuarios/representante/</a> (lista, detalle <code>/&lt;id&gt;/</code>, registro <code>/registro/</code>)</li>
                    <li><a href="/usuarios/administrador/">/usuarios/administrador/</a> (lista, registro <code>/registro/</code>)</li>
                </ul>
            </div>

            <div class="section">
                <h2>Horarios (DRF router)</h2>
                <ul>
                    <li><a href="/horarios/">/horarios/</a> (API root de la app)</li>
                    <li><a href="/horarios/materias/">/horarios/materias/</a></li>
                </ul>
            </div>

            <div class="section">
                <h2>Admin</h2>
                <ul>
                    <li><a href="/admin/">/admin/</a></li>
                </ul>
            </div>
        </body>
        </html>
    """)

urlpatterns = [
    path('', index),  # 👈 raíz muestra índice
    path('admin/', admin.site.urls),
    path('', include('core.urls')),  # incluye login, registro y grado-seccion
    path('usuarios/estudiante/', include('Usuarios.estudiante.urls')),
    path('usuarios/profesor/', include('Usuarios.profesor.urls')),
    path('usuarios/representante/', include('Usuarios.representante.urls')),
    path('usuarios/administrador/', include('Usuarios.administrador.urls')),
    path('horarios/', include('horarios.urls')),
    path('boletines/', include('boletines.urls')),
    path('calendario/', include('calendario.urls')),
    path('calificaciones/', include('calificaciones.urls')),
]

# Servir archivos media en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
