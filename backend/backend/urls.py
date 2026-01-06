from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

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
                    <li><a href="/usuarios/estudiante/">/usuarios/estudiante/</a></li>
                    <li><a href="/usuarios/profesor/">/usuarios/profesor/</a></li>
                    <li><a href="/usuarios/representante/">/usuarios/representante/</a></li>
                    <li><a href="/usuarios/administrador/">/usuarios/administrador/</a></li>
                </ul>
            </div>

            <div class="section">
                <h2>Horarios (DRF router)</h2>
                <ul>
                    <li><a href="/horarios/">/horarios/</a></li>
                    <li><a href="/horarios/materias/">/horarios/materias/</a></li>
                </ul>
            </div>

            <div class="section">
                <h2>Calificaciones</h2>
                <ul>
                    <li><a href="/calificaciones/">/calificaciones/</a> (lista, crear <code>POST</code>)</li>
                    <li><a href="/calificaciones/enviar_finales/">/calificaciones/enviar_finales/</a> (cerrar lapso <code>POST</code>)</li>
                    <li><a href="/calificaciones/&lt;id&gt;/">/calificaciones/&lt;id&gt;/</a> (detalle, editar <code>PUT/PATCH</code>, eliminar <code>DELETE</code>)</li>
                    <li><a href="/calificaciones/&lt;id&gt;/agregar_evaluacion/">/calificaciones/&lt;id&gt;/agregar_evaluacion/</a> (agregar evaluación <code>POST</code>)</li>
                    <li><a href="/calificaciones/&lt;id&gt;/listar_evaluaciones/">/calificaciones/&lt;id&gt;/listar_evaluaciones/</a> (listar evaluaciones <code>GET</code>)</li>
                </ul>
            </div>

            <div class="section">
                <h2>Boletines – Plantillas</h2>
                <ul>
                    <li><a href="/boletines/plantillas/">/boletines/plantillas/</a> (lista, crear <code>POST</code>, solo admin)</li>
                    <li><a href="/boletines/plantillas/&lt;id&gt;/">/boletines/plantillas/&lt;id&gt;/</a> (detalle, editar <code>PUT</code>, eliminar <code>DELETE</code>)</li>
                    <li><a href="/boletines/plantillas/&lt;id&gt;/descargar/">/boletines/plantillas/&lt;id&gt;/descargar/</a> (descargar plantilla Word, admin/profesor)</li>
                    <li><a href="/boletines/plantillas/periodo/&lt;periodo&gt;/">/boletines/plantillas/periodo/&lt;periodo&gt;/</a> (plantillas activas por periodo)</li>
                    <li><a href="/boletines/plantillas/periodo/&lt;periodo&gt;/grado/&lt;grado_id&gt;/">/boletines/plantillas/periodo/&lt;periodo&gt;/grado/&lt;grado_id&gt;/</a> (plantilla específica por periodo y grado)</li>
                </ul>
            </div>

            <div class="section">
                <h2>Boletines – Generales</h2>
                <ul>
                    <li><a href="/boletines/">/boletines/</a> (lista, crear <code>POST</code>, admin/profesor)</li>
                    <li><a href="/boletines/&lt;id&gt;/">/boletines/&lt;id&gt;/</a> (detalle, editar <code>PUT</code>, eliminar <code>DELETE</code>)</li>
                    <li><a href="/boletines/&lt;id&gt;/descargar/">/boletines/&lt;id&gt;/descargar/</a> (descargar boletín en PDF, solo admin)</li>
                    <li><a href="/boletines/estudiante/&lt;estudiante_id&gt;/">/boletines/estudiante/&lt;estudiante_id&gt;/</a> (boletines de un estudiante)</li>
                    <li><a href="/boletines/estudiante/&lt;estudiante_id&gt;/lapso/&lt;lapso&gt;/">/boletines/estudiante/&lt;estudiante_id&gt;/lapso/&lt;lapso&gt;/</a> (boletín de un estudiante en un lapso específico)</li>
                    <li><a href="/boletines/calcular-promedio/&lt;estudiante_id&gt;/lapso/&lt;lapso&gt;/">/boletines/calcular-promedio/&lt;estudiante_id&gt;/lapso/&lt;lapso&gt;/</a> (calcular promedio general de un estudiante en un lapso)</li>
                </ul>
            </div>

            <div class="section">
                <h2>Boletines – Secundaria</h2>
                <ul>
                    <li><a href="/boletines/secundaria/&lt;estudiante_id&gt;/lapso/&lt;lapso&gt;/generar/">/boletines/secundaria/&lt;estudiante_id&gt;/lapso/&lt;lapso&gt;/generar/</a> (generar boletín automático en PDF, solo admin <code>POST</code>)</li>
                    <li><a href="/boletines/secundaria/&lt;estudiante_id&gt;/lapso/&lt;lapso&gt;/vista-previa/">/boletines/secundaria/&lt;estudiante_id&gt;/lapso/&lt;lapso&gt;/vista-previa/</a> (vista previa del boletín en navegador, solo admin, idéntico al PDF)</li>
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
    path('', include('core.urls')),
    path('usuarios/estudiante/', include('Usuarios.estudiante.urls')),
    path('usuarios/profesor/', include('Usuarios.profesor.urls')),
    path('usuarios/representante/', include('Usuarios.representante.urls')),
    path('usuarios/administrador/', include('Usuarios.administrador.urls')),
    path('horarios/', include('horarios.urls')),
    path('boletines/', include('boletines.urls')),
    path('calendario/', include('calendario.urls')),
    path('calificaciones/', include('calificaciones.urls')),  # 👈 ya estaba incluida
    # refresh 
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

# Servir archivos media en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
