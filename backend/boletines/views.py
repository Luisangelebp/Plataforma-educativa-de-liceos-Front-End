from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication
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

def procesar_data_boletin(request, estudiante, lapso, periodo_manual=None, observaciones_manual=""):
    calificaciones_qs = Calificacion.objects.filter(
        estudiante=estudiante, 
        enviado=True
    ).select_related('materia')

    if not calificaciones_qs.exists():
        return None

    inst = Institucion.objects.first()
    periodo_display = periodo_manual if periodo_manual else (
        PeriodoEscolar.objects.filter(es_actual=True).first().nombre 
        if PeriodoEscolar.objects.filter(es_actual=True).exists() else "Sin Periodo"
    )

    es_primaria = (estudiante.grado_seccion.nivel == 'primaria') if estudiante.grado_seccion else False
    materias_dict = {}
    textos_observaciones = []
    
    # --- PROCESAMIENTO DE MATERIAS ---
    for cal in calificaciones_qs:
        m_id = cal.materia.id
        if m_id not in materias_dict:
            materias_dict[m_id] = {
                'nombre': cal.materia.nombre,
                'l1': '-', 'l2': '-', 'l3': '-',
                'nums': {} 
            }
        
        # RECOPILACIÓN: Solo si es primaria y es el lapso consultado
        if es_primaria and str(cal.lapso) == str(lapso) and cal.observaciones:
            textos_observaciones.append(cal.observaciones)
        
        valor = float(cal.promedio or 0)
        materias_dict[m_id]['nums'][str(cal.lapso)] = valor
        
        if es_primaria:
            letra, _ = obtener_literal_venezuela(valor)
            materias_dict[m_id][f'l{cal.lapso}'] = letra
        else:
            materias_dict[m_id][f'l{cal.lapso}'] = f"{int(valor):02d}"

    # --- LÓGICA DE OBSERVACIÓN FINAL ---
    if observaciones_manual:
        observacion_final = observaciones_manual
    elif es_primaria and textos_observaciones:
        # Une todas las observaciones de los profes de primaria
        observacion_final = " ".join(textos_observaciones)
    elif es_primaria:
        observacion_final = "Sin observaciones registradas."
    else:
        # Para secundaria, según tu decisión, va vacío o ignorado
        observacion_final = ""

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

    notas_este_lapso = [v for m in materias_dict.values() for k, v in m['nums'].items() if k == str(lapso)]
    promedio_final_num = sum(notas_este_lapso) / len(notas_este_lapso) if notas_este_lapso else 0

    if es_primaria:
        letra, significado = obtener_literal_venezuela(promedio_final_num)
        promedio_display_nota = letra
        significado_literal = significado
    else:
        promedio_display_nota = f"{promedio_final_num:.2f}"
        significado_literal = ""

    logo_full_url = request.build_absolute_uri(inst.logo.url) if inst and inst.logo else None

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
        "observaciones": observacion_final,
        "es_vista_previa": False,
        "nombre_liceo": inst.nombre if inst else "Institución",
        "codigo_dea": inst.codigo_dea if inst else "",
        "rif": inst.rif if inst else "",
        "director_nombre": inst.director if inst else "Director(a)",
        "subdirector_nombre": inst.subdirector if inst else "Subdirector(a)",
        "slogan": inst.slogan_boletin if inst else "",
        "logo_url": logo_full_url,
    }

# --- VISTAS PROTEGIDAS ---

class VistaPreviaBoletinView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, estudiante_id, lapso):
        if request.user.rol != 'admin' and not request.user.is_staff:
            return Response({"error": "No autorizado"}, status=403)

        estudiante = get_object_or_404(Estudiante, pk=estudiante_id)
        periodo_param = request.query_params.get('periodo')
        context = procesar_data_boletin(request, estudiante, lapso, periodo_param)
        
        if not context:
            return Response({'error': 'No hay notas enviadas'}, status=404)

        context['es_vista_previa'] = True
        template_name = "boletines/boletin_primaria.html" if context['nivel'] == 'primaria' else "boletines/boletin_secundaria.html"

        html_string = render_to_string(template_name, context)
        pdf_bytes = HTML(string=html_string, base_url=request.build_absolute_uri()).write_pdf()
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = 'inline; filename="vista_previa.pdf"'
        return response

class GenerarBoletinView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, estudiante_id, lapso):
        if request.user.rol != 'admin' and not request.user.is_staff:
            return Response({"error": "No autorizado"}, status=403)

        estudiante = get_object_or_404(Estudiante, pk=estudiante_id)
        periodo_param = request.data.get('periodo_escolar')
        obs_manual = request.data.get('observaciones', '')

        context = procesar_data_boletin(request, estudiante, lapso, periodo_param, obs_manual)
        if not context:
            return Response({'error': 'Sin notas'}, status=404)

        template_name = "boletines/boletin_primaria.html" if context['nivel'] == 'primaria' else "boletines/boletin_secundaria.html"
        html_string = render_to_string(template_name, context)
        pdf_file = BytesIO()
        HTML(string=html_string, base_url=request.build_absolute_uri()).write_pdf(pdf_file)

        boletin, _ = Boletin.objects.update_or_create(
            estudiante=estudiante, lapso=str(lapso), periodo_escolar=context['periodo'],
            defaults={
                'grado_seccion': estudiante.grado_seccion,
                'promedio_general': context['promedio_numerico'],
                'generado_por': request.user,
                'es_definitivo': True,
                'observaciones': context['observaciones']
            }
        )
        boletin.archivo_pdf.save(f"boletin_{estudiante.cedula}_L{lapso}.pdf", ContentFile(pdf_file.getvalue()), save=True)
        return Response(BoletinSerializer(boletin).data, status=201)

class BoletinListCreateView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        queryset = Boletin.objects.all().select_related('estudiante', 'grado_seccion').order_by('-fecha_emision')
        id_estudiante = request.query_params.get('idEstudiante')
        id_representante = request.query_params.get('idRepresentante')

        if user.rol == 'estudiante':
            queryset = queryset.filter(estudiante__usuario=user)
        elif user.rol == 'representante':
            repre_perfil = getattr(user, 'representante_profile', None)
            if not repre_perfil: return Response([], status=200)
            queryset = queryset.filter(estudiante__representante=repre_perfil)
            if id_estudiante: queryset = queryset.filter(estudiante_id=id_estudiante)
        elif user.rol in ['admin', 'staff'] or user.is_staff:
            if id_estudiante: queryset = queryset.filter(estudiante_id=id_estudiante)
            if id_representante: queryset = queryset.filter(estudiante__representante_id=id_representante)
        else:
            return Response({"error": "No permitido"}, status=403)

        return Response(BoletinSerializer(queryset, many=True).data)

class DescargarBoletinView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, pk):
        boletin = get_object_or_404(Boletin, pk=pk)
        user = request.user
        pueden = (user.rol in ['admin', 'staff']) or \
                 (user.rol == 'estudiante' and boletin.estudiante.usuario == user) or \
                 (user.rol == 'representante' and boletin.estudiante.representante.usuario == user)

        if not pueden: return Response({"error": "No permitido"}, status=403)
        if not boletin.archivo_pdf: raise Http404()
        return FileResponse(open(boletin.archivo_pdf.path, 'rb'), as_attachment=True)