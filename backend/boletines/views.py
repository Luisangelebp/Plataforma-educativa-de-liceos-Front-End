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

# --- HELPER DE DATOS ACUMULATIVO E INTEGRAL ---

def procesar_data_boletin(estudiante, lapso, periodo, observaciones=""):
    """
    Carga notas del lapso actual, recupera las anteriores y calcula 
    la definitiva por materia y el promedio general anual si es Lapso 3.
    """
    # 1. Obtenemos las notas enviadas del estudiante en el periodo actual
    # Traemos todo el histórico para poder llenar las columnas L1 y L2 aunque estemos en el L3
    calificaciones_qs = Calificacion.objects.filter(
        estudiante=estudiante, 
        enviado=True
    ).select_related('materia')

    if not calificaciones_qs.exists():
        return None

    es_primaria = (estudiante.grado_seccion.nivel == 'primaria') if estudiante.grado_seccion else False
    materias_dict = {}
    
    # Organizamos la data por materia
    for cal in calificaciones_qs:
        m_id = cal.materia.id
        if m_id not in materias_dict:
            materias_dict[m_id] = {
                'nombre': cal.materia.nombre,
                'l1': '-', 'l2': '-', 'l3': '-',
                'nums': {} # Para cálculos internos
            }
        
        valor = float(cal.promedio or 0)
        materias_dict[m_id]['nums'][str(cal.lapso)] = valor
        
        # Formateo visual según nivel
        if es_primaria:
            if valor >= 18: txt = "A"
            elif valor >= 14: txt = "B"
            elif valor >= 10: txt = "C"
            elif valor >= 6:  txt = "D"
            else: txt = "E"
        else:
            txt = f"{int(valor):02d}"
        
        materias_dict[m_id][f'l{cal.lapso}'] = txt

    materias_finales = []
    suma_definitivas_anuales = 0 

    for m_id, data in materias_dict.items():
        def_val = "-"
        
        # Lógica de Definitiva: Solo se calcula/muestra en el reporte del Lapso 3
        if str(lapso) == '3':
            # Promedio de los 3 lapsos para la materia
            valores = data['nums'].values()
            # Dividimos entre 3 (o el número de lapsos que existan si el colegio permite cierre parcial)
            prom_materia = sum(valores) / 3 
            suma_definitivas_anuales += prom_materia
            
            if es_primaria:
                if prom_materia >= 18: def_val = "A"
                elif prom_materia >= 14: def_val = "B"
                elif prom_materia >= 10: def_val = "C"
                elif prom_materia >= 6:  def_val = "D"
                else: def_val = "E"
            else:
                def_val = f"{int(prom_materia):02d}"

        materias_finales.append({
            'materia_nombre': data['nombre'],
            'nota_l1': data['l1'],
            'nota_l2': data['l2'],
            'nota_l3': data['l3'],
            'definitiva': def_val
        })

    # LÓGICA DEL PROMEDIO GENERAL (El cuadro grande)
    if str(lapso) == '3':
        # PROMEDIO GENERAL DE TODAS LAS DEFINITIVAS
        promedio_final_num = suma_definitivas_anuales / len(materias_finales) if materias_finales else 0
    else:
        # PROMEDIO ÚNICAMENTE DEL LAPSO ACTUAL
        notas_este_lapso = [v for m in materias_dict.values() for k, v in m['nums'].items() if k == str(lapso)]
        promedio_final_num = sum(notas_este_lapso) / len(notas_este_lapso) if notas_este_lapso else 0

    # Formateo del promedio general
    if es_primaria:
        if promedio_final_num >= 18: promedio_display = "A"
        elif promedio_final_num >= 14: promedio_display = "B"
        elif promedio_final_num >= 10: promedio_display = "C"
        elif promedio_final_num >= 6:  promedio_display = "D"
        else: promedio_display = "E"
    else:
        promedio_display = f"{promedio_final_num:.2f}"

    return {
        "estudiante": estudiante,
        "cedula": estudiante.cedula,
        "grado_obj": estudiante.grado_seccion,
        "materias": materias_finales,
        "lapso": str(lapso), 
        "promedio_general": promedio_display,
        "periodo": periodo,
        "fecha_emision": timezone.now(),
        "observaciones": observaciones,
        "es_vista_previa": False
    }

# --- VISTAS ---

class VistaPreviaBoletinView(APIView):
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, estudiante_id, lapso):
        if request.user.rol != 'admin':
            return Response({'error': 'No autorizado'}, status=403)

        estudiante = get_object_or_404(Estudiante, pk=estudiante_id)
        periodo = request.query_params.get('periodo', '2024-2025')
        
        context = procesar_data_boletin(estudiante, lapso, periodo)
        if not context:
            return Response({'error': 'No hay notas enviadas para el lapso solicitado'}, status=404)

        context['es_vista_previa'] = True
        
        try:
            html_string = render_to_string("boletines/boletin_secundaria.html", context)
            pdf_bytes = HTML(string=html_string).write_pdf()
            
            response = HttpResponse(pdf_bytes, content_type='application/pdf')
            if request.GET.get('download') == '1':
                filename = f"Boletin_{estudiante.cedula}_L{lapso}.pdf"
                response['Content-Disposition'] = f'attachment; filename="{filename}"'
            else:
                response['Content-Disposition'] = 'inline; filename="vista_previa.pdf"'
            return response
        except Exception as e:
            return Response({'error': f'Error render: {str(e)}'}, status=500)

class GenerarBoletinView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, estudiante_id, lapso):
        if request.user.rol != 'admin':
            return Response({'error': 'No autorizado'}, status=403)

        estudiante = get_object_or_404(Estudiante, pk=estudiante_id)
        periodo = request.data.get('periodo_escolar', '2024-2025')
        obs = request.data.get('observaciones', '')

        context = procesar_data_boletin(estudiante, lapso, periodo, obs)
        if not context:
            return Response({'error': 'No hay notas enviadas para generar este boletín'}, status=404)

        try:
            html_string = render_to_string("boletines/boletin_secundaria.html", context)
            pdf_file = BytesIO()
            HTML(string=html_string).write_pdf(pdf_file)
            
            # Promedio numérico para registro en BD (basado en el contexto procesado)
            # Intentamos convertir el display a float si no es primaria
            try:
                promedio_db = float(context['promedio_general'])
            except:
                promedio_db = 0.0

            boletin, _ = Boletin.objects.update_or_create(
                estudiante=estudiante, 
                lapso=str(lapso), 
                periodo_escolar=periodo,
                defaults={
                    'grado_seccion': estudiante.grado_seccion,
                    'promedio_general': round(promedio_db, 2),
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