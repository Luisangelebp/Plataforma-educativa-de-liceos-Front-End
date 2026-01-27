from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse
from rest_framework_simplejwt.views import TokenRefreshView

# Vista índice en la raíz corregida para los nuevos endpoints de boletines
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
                <h2>Core & Usuarios</h2>
                <ul>
                    <li><a href="/login/">/login/</a></li>
                    <li><a href="/grado-seccion/">/grado-seccion/</a></li>
                    <li><a href="/usuarios/estudiante/">/usuarios/estudiante/</a></li>
                    <li><a href="/usuarios/profesor/">/usuarios/profesor/</a></li>
                </ul>
            </div>

            <div class="section">
                <h2>Calificaciones</h2>
                <ul>
                    <li><a href="/calificaciones/">/calificaciones/</a> (lista, crear <code>POST</code>)</li>
                    <li><a href="/calificaciones/enviar_finales/">/calificaciones/enviar_finales/</a> (cerrar lapso <code>POST</code>)</li>
                </ul>
            </div>

            <div class="section">
                <h2>Módulo de Boletines (Nuevo Motor PDF)</h2>
                <ul>
                    <li><a href="/boletines/">/boletines/</a> (Listado general de archivos generados <code>GET</code>)</li>
                    <li><code>/boletines/vista-previa/&lt;est_id&gt;/lapso/&lt;1-3&gt;/</code> (Generar PDF al vuelo <code>GET</code>)</li>
                    <li><code>/boletines/generar/&lt;est_id&gt;/lapso/&lt;1-3&gt;/</code> (Guardar boletín oficial <code>POST</code>)</li>
                    <li><code>/boletines/&lt;id&gt;/descargar/</code> (Descargar archivo físico <code>GET</code>)</li>
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
    path('', index),
    path('admin/', admin.site.urls),
    path('', include('core.urls')),
    path('usuarios/estudiante/', include('Usuarios.estudiante.urls')),
    path('usuarios/profesor/', include('Usuarios.profesor.urls')),
    path('usuarios/representante/', include('Usuarios.representante.urls')),
    path('usuarios/administrador/', include('Usuarios.administrador.urls')),
    path('horarios/', include('horarios.urls')),
    path('boletines/', include('boletines.urls')), 
    path('calendario/', include('calendario.urls')),
    path('calificaciones/', include('calificaciones.urls')),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)