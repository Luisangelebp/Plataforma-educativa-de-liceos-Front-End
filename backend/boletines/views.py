from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import render, get_object_or_404
from django.http import FileResponse, Http404
from django.utils import timezone
from io import BytesIO
from django.core.files.base import ContentFile
from django.template.loader import render_to_string
from weasyprint import HTML

from .models import Boletin
from .serializers import BoletinSerializer
from Usuarios.estudiante.models import Estudiante
from calificaciones.models import Calificacion
from calificaciones.serializers import CalificacionSerializer

# --- GESTIÓN DE BOLETINES (Exclusivo Admin) ---

class BoletinListCreateView(APIView):
    """Listar boletines generados para control administrativo."""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if request.user.rol != 'admin':
            return Response({'error': 'No autorizado'}, status=403)
        boletines = Boletin.objects.all().order_by('-fecha_emision')
        serializer = BoletinSerializer(boletines, many=True)
        return Response(serializer.data)

class DescargarBoletinView(APIView):
    """Descarga del PDF físico guardado en el servidor."""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        # Permitir que admin, el propio estudiante o su representante vean el boletín
        boletin = get_object_or_404(Boletin, pk=pk)
        
        user = request.user
        es_dueño = (user.rol == 'estudiante' and user.estudiante_profile == boletin.estudiante)
        # (Aquí podrías añadir la lógica de representante si ya la tienes)

        if user.rol != 'admin' and not es_dueño:
            return Response({'error': 'No autorizado para ver este documento'}, status=403)
            
        if not boletin.archivo_pdf:
            raise Http404("El archivo PDF no ha sido generado")
        
        return FileResponse(
            open(boletin.archivo_pdf.path, 'rb'),
            as_attachment=True,
            filename=f"BOLETIN_{boletin.estudiante.cedula}_{boletin.periodo_escolar}_L{boletin.lapso}.pdf"
        )

# --- MOTOR DE GENERACIÓN DUAL ---

class GenerarBoletinView(APIView):
    """
    POST: Genera, guarda en base de datos y crea el archivo PDF oficial.
    """
    permission_classes = [IsAuthenticated]

    def obtener_literal_venezuela(self, promedio):
        """Convierte escala numérica a literal para Primaria."""
        p = float(promedio)
        if p >= 19: return "A"
        if p >= 14: return "B"
        if p >= 10: return "C"
        if p >= 6:  return "D"
        return "E"

    def post(self, request, estudiante_id, lapso):
        if request.user.rol != 'admin':
            return Response({'error': 'Solo el administrador puede generar documentos oficiales'}, status=403)

        estudiante = get_object_or_404(Estudiante, pk=estudiante_id)
        # El periodo escolar debería venir del request o un setting global
        periodo = request.data.get('periodo_escolar', '2025-2026')
        
        # Filtro: Solo notas que el profesor ya marcó como 'enviado'
        calificaciones_qs = Calificacion.objects.filter(
            estudiante=estudiante, lapso=lapso, enviado=True
        )

        if not calificaciones_qs.exists():
            return Response({'error': 'No hay calificaciones definitivas enviadas para este lapso'}, status=404)

        # 1. Procesamiento de datos
        serializer = CalificacionSerializer(calificaciones_qs, many=True)
        materias_data = serializer.data
        
        # DETECCIÓN DE NIVEL (Usando el modelo GradoSeccion corregido)
        es_primaria = False
        if estudiante.grado_seccion:
            es_primaria = estudiante.grado_seccion.nivel == 'primaria'
        
        promedios_lista = []
        for m in materias_data:
            nota_num = float(m.get('promedio_lapso', 0))
            promedios_lista.append(nota_num)
            m['nota_display'] = self.obtener_literal_venezuela(nota_num) if es_primaria else nota_num

        # 2. Cálculo de Promedio General
        promedio_num = round(sum(promedios_lista) / len(promedios_lista), 2) if promedios_lista else 0
        promedio_final_pdf = self.obtener_literal_venezuela(promedio_num) if es_primaria else promedio_num

        # 3. Preparación del Contexto
        context = {
            "estudiante": estudiante,
            "cedula": estudiante.cedula,
            "grado_obj": estudiante.grado_seccion, # Pasamos el objeto completo para usar su __str__
            "materias": materias_data,
            "lapso": lapso,
            "es_primaria": es_primaria,
            "promedio_general": promedio_final_pdf,
            "periodo": periodo,
            "fecha_emision": timezone.now().date(),
            "observaciones": request.data.get('observaciones', '')
        }

        try:
            # 4. Generación del PDF
            html_string = render_to_string("boletines/boletin_secundaria.html", context)
            pdf_file = BytesIO()
            HTML(string=html_string).write_pdf(pdf_file)
            
            # 5. Guardado o actualización (Incluyendo periodo y grado histórico)
            boletin, _ = Boletin.objects.update_or_create(
                estudiante=estudiante, 
                lapso=lapso,
                periodo_escolar=periodo,
                defaults={
                    'grado_seccion': estudiante.grado_seccion,
                    'promedio_general': promedio_num,
                    'generado_por': request.user,
                    'observaciones': context['observaciones'],
                    'es_definitivo': True
                }
            )
            
            nombre_archivo = f"boletin_{estudiante.cedula}_{periodo}_L{lapso}.pdf"
            boletin.archivo_pdf.save(nombre_archivo, ContentFile(pdf_file.getvalue()), save=True)
            
            return Response(BoletinSerializer(boletin).data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({'error': f'Error en motor PDF: {str(e)}'}, status=500)

class VistaPreviaBoletinView(APIView):
    """
    GET: Renderiza el boletín en el navegador sin guardar archivos.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, estudiante_id, lapso):
        if request.user.rol != 'admin':
            return Response({'error': 'No autorizado'}, status=403)

        estudiante = get_object_or_404(Estudiante, pk=estudiante_id)
        calificaciones = Calificacion.objects.filter(estudiante=estudiante, lapso=lapso, enviado=True)
        
        if not calificaciones.exists():
            return Response({'error': 'No hay notas enviadas para vista previa'}, status=404)

        serializer = CalificacionSerializer(calificaciones, many=True)
        materias_data = serializer.data
        
        es_primaria = (estudiante.grado_seccion.nivel == 'primaria') if estudiante.grado_seccion else False
        
        engine = GenerarBoletinView()
        promedios_lista = []
        
        for m in materias_data:
            val = float(m.get('promedio_lapso', 0))
            promedios_lista.append(val)
            m['nota_display'] = engine.obtener_literal_venezuela(val) if es_primaria else val

        promedio_num = round(sum(promedios_lista) / len(promedios_lista), 2) if promedios_lista else 0
        promedio_final_preview = engine.obtener_literal_venezuela(promedio_num) if es_primaria else promedio_num

        context = {
            "estudiante": estudiante,
            "cedula": estudiante.cedula,
            "grado_obj": estudiante.grado_seccion,
            "materias": materias_data,
            "lapso": lapso,
            "es_primaria": es_primaria,
            "promedio_general": promedio_final_preview,
            "periodo": request.query_params.get('periodo', '2025-2026'),
            "fecha_emision": timezone.now().date(),
            "observaciones": request.query_params.get('observaciones', ''),
            "es_vista_previa": True
        }

        return render(request, "boletines/boletin_secundaria.html", context)