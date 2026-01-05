from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import render, get_object_or_404
from django.http import FileResponse, Http404
from django.conf import settings
from django.db import models
from django.utils import timezone
import os
import subprocess
from io import BytesIO
from django.core.files import File
from django.core.files.base import ContentFile
from django.template.loader import render_to_string

from .models import PlantillaBoletin, Boletin
from .serializers import PlantillaBoletinSerializer, BoletinSerializer
from Usuarios.estudiante.models import Estudiante
from core.models import GradoSeccion
from calificaciones.models import Calificacion
from calificaciones.serializers import CalificacionSerializer


class PlantillaBoletinListCreateView(APIView):
    """
    Listar todas las plantillas o crear una nueva (solo admin)
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        plantillas = PlantillaBoletin.objects.all()
        if request.user.rol != 'admin':
            # Profesores solo ven plantillas activas
            plantillas = plantillas.filter(activa=True)
        serializer = PlantillaBoletinSerializer(plantillas, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        if request.user.rol != 'admin':
            return Response(
                {'error': 'Solo los administradores pueden subir plantillas'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = PlantillaBoletinSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(subido_por=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PlantillaBoletinDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        plantilla = get_object_or_404(PlantillaBoletin, pk=pk)
        serializer = PlantillaBoletinSerializer(plantilla)
        return Response(serializer.data)
    
    def put(self, request, pk):
        if request.user.rol != 'admin':
            return Response(
                {'error': 'Solo los administradores pueden editar plantillas'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        plantilla = get_object_or_404(PlantillaBoletin, pk=pk)
        serializer = PlantillaBoletinSerializer(plantilla, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        if request.user.rol != 'admin':
            return Response(
                {'error': 'Solo los administradores pueden eliminar plantillas'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        plantilla = get_object_or_404(PlantillaBoletin, pk=pk)
        plantilla.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class DescargarPlantillaView(APIView):
    """
    Descargar plantilla Word (profesor/admin)
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        plantilla = get_object_or_404(PlantillaBoletin, pk=pk)
        
        if request.user.rol not in ['admin', 'profesor']:
            return Response(
                {'error': 'No tienes permiso para descargar plantillas'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if not plantilla.archivo_word:
            raise Http404("La plantilla no tiene archivo asociado")
        
        try:
            file_path = plantilla.archivo_word.path
            return FileResponse(
                open(file_path, 'rb'),
                as_attachment=True,
                filename=os.path.basename(file_path)
            )
        except Exception as e:
            return Response(
                {'error': f'Error al descargar el archivo: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class PlantillasPorPeriodoView(APIView):
    """
    Obtener plantillas activas por periodo
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, periodo):
        plantillas = PlantillaBoletin.objects.filter(periodo=periodo, activa=True)
        
        # Si es profesor, filtrar por sus grados
        if hasattr(request.user, 'rol') and request.user.rol == 'profesor':
            try:
                profesor = request.user.profesor_profile
                grados_ids = list(profesor.grado_secciones.values_list('id', flat=True))
                
                # Siempre incluir plantillas generales (sin grado asignado)
                # Y si tiene grados, también las específicas de sus grados
                if grados_ids:
                    plantillas = plantillas.filter(
                        models.Q(grado_seccion__in=grados_ids) | models.Q(grado_seccion__isnull=True)
                    )
                else:
                    # Si el profesor no tiene grados asignados, solo ver plantillas generales
                    plantillas = plantillas.filter(grado_seccion__isnull=True)
            except Exception:
                # Si hay error, solo mostrar plantillas generales
                plantillas = plantillas.filter(grado_seccion__isnull=True)
        
        serializer = PlantillaBoletinSerializer(plantillas, many=True)
        return Response(serializer.data)

class PlantillaPorPeriodoGradoView(APIView):
    """
    Obtener plantilla específica por periodo y grado (para profesor)
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, periodo, grado_id):
        grado = get_object_or_404(GradoSeccion, pk=grado_id)
        
        # Primero buscar plantilla específica del grado
        plantilla = PlantillaBoletin.objects.filter(
            periodo=periodo,
            grado_seccion=grado,
            activa=True
        ).first()
        
        # Si no hay específica, buscar general
        if not plantilla:
            plantilla = PlantillaBoletin.objects.filter(
                periodo=periodo,
                grado_seccion__isnull=True,
                activa=True
            ).first()
        
        if not plantilla:
            return Response(
                {'error': 'No hay plantilla disponible para este periodo y grado'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = PlantillaBoletinSerializer(plantilla)
        return Response(serializer.data)

class BoletinListCreateView(APIView):
    """
    Listar boletines o crear uno nuevo
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        boletines = Boletin.objects.all()
        
        # Estudiantes y representantes solo ven sus propios boletines
        if request.user.rol == 'estudiante':
            try:
                estudiante = request.user.estudiante_profile
                boletines = boletines.filter(estudiante=estudiante)
            except:
                boletines = boletines.none()
        elif request.user.rol == 'representante':
            try:
                representante = request.user.representante_profile
                estudiantes_ids = representante.estudiantes.values_list('id', flat=True)
                boletines = boletines.filter(estudiante_id__in=estudiantes_ids)
            except:
                boletines = boletines.none()
        # Admin y profesor ven todos
        
        serializer = BoletinSerializer(boletines, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        if request.user.rol not in ['admin', 'profesor']:
            return Response(
                {'error': 'Solo administradores y profesores pueden subir boletines'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = BoletinSerializer(data=request.data)
        if serializer.is_valid():
            boletin = serializer.save(subido_por=request.user)

            # 🔎 Conversión automática Word → PDF si se sube Word
            if hasattr(boletin, "archivo_word") and boletin.archivo_word:
                word_path = boletin.archivo_word.path
                output_dir = os.path.dirname(word_path)

                try:
                    subprocess.run([
                        "libreoffice", "--headless", "--convert-to", "pdf", "--outdir", output_dir, word_path
                    ], check=True)

                    pdf_path = os.path.splitext(word_path)[0] + ".pdf"
                    with open(pdf_path, "rb") as f:
                        boletin.archivo_pdf.save(
                            os.path.basename(pdf_path),
                            File(f),
                            save=True
                        )
                except Exception as e:
                    return Response(
                        {'error': f'Error al convertir Word a PDF: {str(e)}'},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )

            return Response(BoletinSerializer(boletin).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class BoletinDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        boletin = get_object_or_404(Boletin, pk=pk)
        
        # Verificar permisos
        if request.user.rol == 'estudiante':
            try:
                if boletin.estudiante.usuario != request.user:
                    return Response(
                        {'error': 'No tienes permiso para ver este boletín'},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except:
                return Response(
                    {'error': 'No tienes permiso para ver este boletín'},
                    status=status.HTTP_403_FORBIDDEN
                )
        elif request.user.rol == 'representante':
            try:
                representante = request.user.representante_profile
                if boletin.estudiante not in representante.estudiantes.all():
                    return Response(
                        {'error': 'No tienes permiso para ver este boletín'},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except:
                return Response(
                    {'error': 'No tienes permiso para ver este boletín'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        serializer = BoletinSerializer(boletin)
        return Response(serializer.data)
    
    def put(self, request, pk):
        if request.user.rol not in ['admin', 'profesor']:
            return Response(
                {'error': 'Solo administradores y profesores pueden editar boletines'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        boletin = get_object_or_404(Boletin, pk=pk)
        serializer = BoletinSerializer(boletin, data=request.data, partial=True)
        if serializer.is_valid():
            boletin = serializer.save()

            # 🔎 Conversión automática Word → PDF si se sube Word
            if hasattr(boletin, "archivo_word") and boletin.archivo_word:
                word_path = boletin.archivo_word.path
                output_dir = os.path.dirname(word_path)

                try:
                    subprocess.run([
                        "libreoffice", "--headless", "--convert-to", "pdf", "--outdir", output_dir, word_path
                    ], check=True)

                    pdf_path = os.path.splitext(word_path)[0] + ".pdf"
                    with open(pdf_path, "rb") as f:
                        boletin.archivo_pdf.save(
                            os.path.basename(pdf_path),
                            File(f),
                            save=True
                        )
                except Exception as e:
                    return Response(
                        {'error': f'Error al convertir Word a PDF: {str(e)}'},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )

            return Response(BoletinSerializer(boletin).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        if request.user.rol != 'admin':
            return Response(
                {'error': 'Solo los administradores pueden eliminar boletines'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        boletin = get_object_or_404(Boletin, pk=pk)
        boletin.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class DescargarBoletinView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        boletin = get_object_or_404(Boletin, pk=pk)
        
        # Verificar permisos (misma lógica que BoletinDetailView)
        if request.user.rol == 'estudiante':
            try:
                if boletin.estudiante.usuario != request.user:
                    return Response(
                        {'error': 'No tienes permiso para descargar este boletín'},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except:
                return Response(
                    {'error': 'No tienes permiso para descargar este boletín'},
                    status=status.HTTP_403_FORBIDDEN
                )
        elif request.user.rol == 'representante':
            try:
                representante = request.user.representante_profile
                if boletin.estudiante not in representante.estudiantes.all():
                    return Response(
                        {'error': 'No tienes permiso para descargar este boletín'},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except:
                return Response(
                    {'error': 'No tienes permiso para descargar este boletín'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        if not boletin.archivo_pdf:
            raise Http404("El boletín no tiene archivo asociado")
        
        try:
            file_path = boletin.archivo_pdf.path
            return FileResponse(
                open(file_path, 'rb'),
                as_attachment=True,
                filename=f"boletin_{boletin.estudiante.cedula}_{boletin.lapso}.pdf"
            )
        except Exception as e:
            return Response(
                {'error': f'Error al descargar el archivo: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class BoletinesPorEstudianteView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, estudiante_id):
        estudiante = get_object_or_404(Estudiante, pk=estudiante_id)
        
        # Verificar permisos
        if request.user.rol == 'estudiante':
            try:
                if estudiante.usuario != request.user:
                    return Response(
                        {'error': 'No tienes permiso para ver estos boletines'},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except:
                return Response(
                    {'error': 'No tienes permiso para ver estos boletines'},
                    status=status.HTTP_403_FORBIDDEN
                )
        elif request.user.rol == 'representante':
            try:
                representante = request.user.representante_profile
                if estudiante not in representante.estudiantes.all():
                    return Response(
                        {'error': 'No tienes permiso para ver estos boletines'},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except:
                return Response(
                    {'error': 'No tienes permiso para ver estos boletines'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        boletines = Boletin.objects.filter(estudiante=estudiante)
        serializer = BoletinSerializer(boletines, many=True)
        return Response(serializer.data)

class BoletinPorEstudianteLapsoView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, estudiante_id, lapso):
        estudiante = get_object_or_404(Estudiante, pk=estudiante_id)
        boletin = Boletin.objects.filter(estudiante=estudiante, lapso=lapso).first()
        
        if not boletin:
            return Response(
                {'error': 'No existe boletín para este estudiante y lapso'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Verificar permisos (misma lógica que BoletinDetailView)
        if request.user.rol == 'estudiante':
            try:
                if estudiante.usuario != request.user:
                    return Response(
                        {'error': 'No tienes permiso para ver este boletín'},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except:
                return Response(
                    {'error': 'No tienes permiso para ver este boletín'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        serializer = BoletinSerializer(boletin)
        return Response(serializer.data)

class CalcularPromedioView(APIView):
    """
    Calcular promedio general de un estudiante en un lapso
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, estudiante_id, lapso):
        estudiante = get_object_or_404(Estudiante, pk=estudiante_id)
        
        # Obtener calificaciones enviadas
        calificaciones = Calificacion.objects.filter(estudiante=estudiante, lapso=lapso, enviado=True)
        if not calificaciones.exists():
            return Response({'error': 'No hay calificaciones enviadas'}, status=404)

        # Usar el serializer para aprovechar la lógica de promedios
        serializer = CalificacionSerializer(calificaciones, many=True)
        data = serializer.data

        # Extraer promedios de cada materia
        promedios = [c['promedio_lapso'] or c['promedio'] for c in data if c.get('promedio_lapso') or c.get('promedio')]
        promedio_general = round(sum(promedios) / len(promedios), 2) if promedios else None

        return Response({
            'estudiante_id': estudiante_id,
            'lapso': lapso,
            'promedio_general': promedio_general,
            'detalle': data  # opcional: devuelve todas las calificaciones con sus evaluaciones
        })


class GenerarBoletinSecundariaView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, estudiante_id, lapso):
        # 🔐 Solo admin puede generar
        if request.user.rol != 'admin':
            return Response({'error': 'Solo el administrador puede generar boletines'}, status=403)

        estudiante = get_object_or_404(Estudiante, pk=estudiante_id)

        # 🔁 Evitar duplicados
        if Boletin.objects.filter(estudiante=estudiante, lapso=lapso).exists():
            return Response({'error': 'Ya existe un boletín para este estudiante y lapso'}, status=400)

        # 📊 Obtener calificaciones enviadas
        calificaciones = Calificacion.objects.filter(estudiante=estudiante, lapso=lapso, enviado=True)
        if not calificaciones.exists():
            return Response({'error': 'No hay calificaciones enviadas'}, status=404)

        serializer = CalificacionSerializer(calificaciones, many=True)
        materias = serializer.data

        # 🧮 Calcular promedio general
        promedios = [m.get('promedio_lapso') for m in materias if m.get('promedio_lapso') is not None]
        promedio_general = round(sum(promedios) / len(promedios), 2) if promedios else None

        # 📅 Periodo académico (constante por ahora)
        periodo = "2023-2024"

        # 🧾 Renderizar HTML
        html_string = render_to_string("boletines/boletin_secundaria.html", {
            "estudiante": estudiante,
            "cedula": estudiante.cedula,
            "fecha_nacimiento": estudiante.fecha_nacimiento or "No registrada",
            "grado": estudiante.grado_seccion.grado if estudiante.grado_seccion else "No registrado",
            "seccion": estudiante.grado_seccion.seccion if estudiante.grado_seccion else "No registrada",
            "numero_lista": estudiante.numero_lista if hasattr(estudiante, "numero_lista") else "No registrado",
            "materias": materias,
            "lapso": lapso,
            "promedio_general": promedio_general,
            "periodo": periodo,
            "fecha_emision": timezone.now().date(),
            "director": "Lic. Carlos Rodríguez",
            "secretaria": "Secretaría Académica"
        })

        # 🖨️ Generar PDF con WeasyPrint
        pdf_file = BytesIO()
        HTML(string=html_string).write_pdf(pdf_file)
        pdf_content = ContentFile(pdf_file.getvalue())

        # 💾 Guardar boletín
        boletin = Boletin.objects.create(
            estudiante=estudiante,
            lapso=lapso,
            promedio_general=promedio_general,
            subido_por=request.user
        )
        boletin.archivo_pdf.save(f"boletin_{estudiante.cedula}_{lapso}.pdf", pdf_content)
        boletin.save()

        return Response(BoletinSerializer(boletin).data, status=201)


class VistaPreviaBoletinSecundariaView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, estudiante_id, lapso):
        # 🔐 Solo admin puede ver la vista previa
        if request.user.rol != 'admin':
            return Response({'error': 'Solo el administrador puede ver la vista previa'}, status=403)

        estudiante = get_object_or_404(Estudiante, pk=estudiante_id)
        boletin = Boletin.objects.filter(estudiante=estudiante, lapso=lapso).first()

        if not boletin or not boletin.archivo_pdf:
            return Response({'error': 'No existe boletín en PDF para este estudiante y lapso'}, status=404)

        # 📊 Obtener calificaciones enviadas
        calificaciones = Calificacion.objects.filter(estudiante=estudiante, lapso=lapso, enviado=True)
        serializer = CalificacionSerializer(calificaciones, many=True)
        materias = serializer.data

        # 🧮 Calcular promedio general
        promedios = [m.get('promedio_lapso') for m in materias if m.get('promedio_lapso') is not None]
        promedio_general = round(sum(promedios) / len(promedios), 2) if promedios else None

        periodo = "2023-2024"

        context = {
            "estudiante": estudiante,
            "cedula": estudiante.cedula,
            "fecha_nacimiento": estudiante.fecha_nacimiento or "No registrada",
            "grado": estudiante.grado_seccion.grado if estudiante.grado_seccion else "No registrado",
            "seccion": estudiante.grado_seccion.seccion if estudiante.grado_seccion else "No registrada",
            "numero_lista": getattr(estudiante, "numero_lista", "No registrado"),
            "materias": materias,
            "lapso": lapso,
            "promedio_general": promedio_general,
            "periodo": periodo,
            "fecha_emision": boletin.fecha_emision.date(),
            "director": "Lic. Carlos Rodríguez",
            "secretaria": "Secretaría Académica"
        }

        # 🔎 Renderizar el mismo HTML que se usa para PDF
        return render(request, "boletines/boletin_secundaria.html", context)

