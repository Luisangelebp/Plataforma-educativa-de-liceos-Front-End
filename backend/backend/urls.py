from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse
from rest_framework_simplejwt.views import TokenRefreshView

# Vista índice actualizada con los nuevos endpoints de configuración
def index(request):
    return HttpResponse("""
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8" />
            <title>API Liceo - Panel de Control</title>
            <style>
                body { font-family: system-ui, -apple-system, sans-serif; margin: 2rem; background: #f8f9fa; color: #333; }
                .container { max-width: 900px; margin: auto; background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                h1 { color: #0b5bd3; border-bottom: 2px solid #eee; padding-bottom: 0.5rem; }
                .section { margin-top: 1.5rem; padding: 1rem; border: 1px solid #eee; border-radius: 6px; }
                h2 { font-size: 1.2rem; color: #555; margin-top: 0; }
                ul { line-height: 1.8; list-style: none; padding: 0; }
                li { margin-bottom: 0.4rem; }
                a { text-decoration: none; color: #0b5bd3; font-weight: 500; }
                a:hover { text-decoration: underline; }
                code { background: #f4f4f4; padding: 0.2rem 0.4rem; border-radius: 4px; font-size: 0.9rem; color: #d63384; }
                .badge { background: #e7f0ff; color: #0b5bd3; padding: 0.1rem 0.5rem; border-radius: 10px; font-size: 0.8rem; margin-left: 5px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Índice de Endpoints API</h1>
                <p>Panel de recursos disponibles para el Front-end.</p>

                <div class="section">
                    <h2>⚙️ Configuración Global (Institución)</h2>
                    <ul>
                        <li><a href="/institucion/">/institucion/</a> <span class="badge">Singleton</span> (Info del Liceo, Logo, Autoridades)</li>
                        <li><a href="/periodo-escolar/">/periodo-escolar/</a> (Gestión de Años Escolares y periodo activo)</li>
                    </ul>
                </div>

                <div class="section">
                    <h2>👤 Usuarios y Acceso</h2>
                    <ul>
                        <li><a href="/login/">/login/</a> <span class="badge">POST</span></li>
                        <li><a href="/refresh/">/refresh/</a> (Renovar Token JWT)</li>
                        <li><a href="/grado-seccion/">/grado-seccion/</a> (Configuración de aulas y <b>Maestro Guía</b>)</li>
                        <li><a href="/usuarios/estudiante/">/usuarios/estudiante/</a></li>
                        <li><a href="/usuarios/profesor/">/usuarios/profesor/</a></li>
                    </ul>
                </div>

                <div class="section">
                    <h2>📊 Calificaciones y Boletines</h2>
                    <ul>
                        <li><a href="/calificaciones/">/calificaciones/</a></li>
                        <li><a href="/boletines/">/boletines/</a> (Archivos generados)</li>
                        <li><code>/boletines/vista-previa/&lt;id&gt;/lapso/&lt;1-3&gt;/</code> <span class="badge">PDF al vuelo</span></li>
                    </ul>
                </div>

                <div class="section">
                    <h2>🛡️ Administración</h2>
                    <ul>
                        <li><a href="/admin/">/admin/</a> (Panel interno de Django)</li>
                    </ul>
                </div>
            </div>
        </body>
        </html>
    """)

urlpatterns = [
    path('', index),
    path('admin/', admin.site.urls),
    
    # Core (Login, Institucion, Periodos, Grados)
    path('', include('core.urls')),
    
    # Perfiles de Usuarios
    path('usuarios/estudiante/', include('Usuarios.estudiante.urls')),
    path('usuarios/profesor/', include('Usuarios.profesor.urls')),
    path('usuarios/representante/', include('Usuarios.representante.urls')),
    path('usuarios/administrador/', include('Usuarios.administrador.urls')),
    
    # Módulos Académicos
    path('horarios/', include('horarios.urls')),
    path('boletines/', include('boletines.urls')), 
    path('calendario/', include('calendario.urls')),
    path('calificaciones/', include('calificaciones.urls')),
    
    # Seguridad
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)