from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from django.shortcuts import get_object_or_404
from django.http import FileResponse, Http404, HttpResponse
from django.utils import timezone
from io import BytesIO
from django.core.files.base import ContentFile
from django.template.loader import render_to_string
from weasyprint import HTML

from .models import Boletin
from .serializers import BoletinSerializer
from Usuarios.estudiante.models import Estudiante
from calificaciones.models import Calificacion
from core.models import Institucion, PeriodoEscolar

# --- HELPERS DE CONVERSIÓN Y LÓGICA ---

def obtener_literal_venezuela(promedio):
    """
    Convierte escala 0-20 a A-E según escala oficial.
    """
    nota = round(promedio)
    if 18 <= nota <= 20:
        return "A", "El estudiante alcanzó todas las competencias de manera sobresaliente."
    elif 15 <= nota <= 17:
        return "B", "El estudiante alcanzó las competencias satisfactoriamente."
    elif 12 <= nota <= 14:
        return "C", "El estudiante alcanzó la mayoría de las competencias previstas para el grado."
    elif 10 <= nota <= 11:
        return "D", "El estudiante alcanzó las competencias mínimas requeridas."
    else:
        return "E", "El estudiante no logró alcanzar las competencias mínimas del grado."

def procesar_data_boletin(request, estudiante, lapso, periodo_manual=None, observaciones=""):
    """
    Carga notas y jala configuración dinámica de la Institución y Periodo.
    Se agregó 'request' para construir URLs absolutas de imágenes.
    """
    calificaciones_qs = Calificacion.objects.filter(
        estudiante=estudiante, 
        enviado=True
    ).select_related('materia')

    if not calificaciones_qs.exists():
        return None

    # Obtener configuración del plantel y periodo
    inst = Institucion.objects.first()
    if not periodo_manual:
        per_activo = PeriodoEscolar.objects.filter(es_actual=True).first()
        periodo_display = per_activo.nombre if per_activo else "Sin Periodo"
    else:
        periodo_display = periodo_manual

    es_primaria = (estudiante.grado_seccion.nivel == 'primaria') if estudiante.grado_seccion else False
    materias_dict = {}
    
    for cal in calificaciones_qs:
        m_id = cal.materia.id
        if m_id not in materias_dict:
            materias_dict[m_id] = {
                'nombre': cal.materia.nombre,
                'l1': '-', 'l2': '-', 'l3': '-',
                'nums': {} 
            }
        valor = float(cal.promedio or 0)
        materias_dict[m_id]['nums'][str(cal.lapso)] = valor
        
        if es_primaria:
            letra, _ = obtener_literal_venezuela(valor)
            materias_dict[m_id][f'l{cal.lapso}'] = letra
        else:
            materias_dict[m_id][f'l{cal.lapso}'] = f"{int(valor):02d}"

    materias_finales = []
    suma_definitivas_anuales = 0 

    for m_id, data in materias_dict.items():
        def_val = "-"
        if str(lapso) == '3':
            valores = list(data['nums'].values())
            prom_materia = sum(valores) / 3 if len(valores) > 0 else 0
            suma_definitivas_anuales += prom_materia
            if es_primaria:
                letra, _ = obtener_literal_venezuela(prom_materia)
                def_val = letra
            else:
                def_val = f"{int(prom_materia):02d}"

        materias_finales.append({
            'materia_nombre': data['nombre'],
            'nota_l1': data['l1'],
            'nota_l2': data['l2'],
            'nota_l3': data['l3'],
            'definitiva': def_val
        })

    if str(lapso) == '3':
        promedio_final_num = suma_definitivas_anuales / len(materias_finales) if materias_finales else 0
    else:
        notas_este_lapso = [v for m in materias_dict.values() for k, v in m['nums'].items() if k == str(lapso)]
        promedio_final_num = sum(notas_este_lapso) / len(notas_este_lapso) if notas_este_lapso else 0

    significado_literal = ""
    if es_primaria:
        letra, significado = obtener_literal_venezuela(promedio_final_num)
        promedio_display_nota = letra
        significado_literal = significado
    else:
        promedio_display_nota = f"{promedio_final_num:.2f}"

    # Construir URL absoluta para el logo
    logo_full_url = None
    if inst and inst.logo:
        logo_full_url = request.build_absolute_uri(inst.logo.url)

    return {
        "estudiante": estudiante,
        "cedula": estudiante.cedula,
        "grado_obj": estudiante.grado_seccion,
        "nivel": 'primaria' if es_primaria else 'secundaria',
        "materias": materias_finales,
        "lapso": str(lapso), 
        "promedio_general": promedio_display_nota,
        "promedio_numerico": round(promedio_final_num, 2),
        "significado_literal": significado_literal,
        "periodo": periodo_display,
        "fecha_emision": timezone.now(),
        "observaciones": observaciones,
        "es_vista_previa": False,
        "nombre_liceo": inst.nombre if inst else "Institución No Configurada",
        "codigo_dea": inst.codigo_dea if inst else "",
        "rif": inst.rif if inst else "",
        "director_nombre": inst.director if inst else "Director(a)",
        "subdirector_nombre": inst.subdirector if inst else "Subdirector(a)",
        "slogan": inst.slogan_boletin if inst else "",
        "logo_url": logo_full_url,
    }

# --- VISTAS ---

class VistaPreviaBoletinView(APIView):
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, estudiante_id, lapso):
        if request.user.rol != 'admin':
            return Response({'error': 'No autorizado'}, status=403)

        estudiante = get_object_or_404(Estudiante, pk=estudiante_id)
        periodo_param = request.query_params.get('periodo')
        
        context = procesar_data_boletin(request, estudiante, lapso, periodo_param)
        if not context:
            return Response({'error': 'No hay notas enviadas para el lapso solicitado'}, status=404)

        context['es_vista_previa'] = True
        template_name = "boletines/boletin_primaria.html" if context['nivel'] == 'primaria' else "boletines/boletin_secundaria.html"

        try:
            html_string = render_to_string(template_name, context)
            pdf_bytes = HTML(string=html_string, base_url=request.build_absolute_uri()).write_pdf()
            response = HttpResponse(pdf_bytes, content_type='application/pdf')
            response['Content-Disposition'] = 'inline; filename="vista_previa.pdf"'
            return response
        except Exception as e:
            return Response({'error': str(e)}, status=500)

class GenerarBoletinView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, estudiante_id, lapso):
        if request.user.rol != 'admin':
            return Response({'error': 'No autorizado'}, status=403)

        estudiante = get_object_or_404(Estudiante, pk=estudiante_id)
        periodo_param = request.data.get('periodo_escolar')
        obs = request.data.get('observaciones', '')

        context = procesar_data_boletin(request, estudiante, lapso, periodo_param, obs)
        if not context:
            return Response({'error': 'No hay notas para generar el boletín'}, status=404)

        template_name = "boletines/boletin_primaria.html" if context['nivel'] == 'primaria' else "boletines/boletin_secundaria.html"

        try:
            html_string = render_to_string(template_name, context)
            pdf_file = BytesIO()
            HTML(string=html_string, base_url=request.build_absolute_uri()).write_pdf(pdf_file)

            boletin, _ = Boletin.objects.update_or_create(
                estudiante=estudiante, 
                lapso=str(lapso), 
                periodo_escolar=context['periodo'],
                defaults={
                    'grado_seccion': estudiante.grado_seccion,
                    'promedio_general': context['promedio_numerico'],
                    'generado_por': request.user,
                    'es_definitivo': True,
                    'observaciones': obs
                }
            )
            boletin.archivo_pdf.save(
                f"boletin_{estudiante.cedula}_L{lapso}.pdf", 
                ContentFile(pdf_file.getvalue()), 
                save=True
            )
            return Response(BoletinSerializer(boletin).data, status=201)
        except Exception as e:
            return Response({'error': str(e)}, status=500)

class BoletinListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        if request.user.rol != 'admin': return Response(status=403)
        boletines = Boletin.objects.all().order_by('-fecha_emision')
        return Response(BoletinSerializer(boletines, many=True).data)

class DescargarBoletinView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, pk):
        boletin = get_object_or_404(Boletin, pk=pk)
        if not boletin.archivo_pdf: raise Http404()
        return FileResponse(open(boletin.archivo_pdf.path, 'rb'), as_attachment=True)