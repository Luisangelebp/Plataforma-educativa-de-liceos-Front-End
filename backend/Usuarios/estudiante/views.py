from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import HttpResponse
from django.template.loader import get_template

from .models import Estudiante
from .serializers import (
    RegistroEstudianteSerializer,
    EstudianteListSerializer,
    EstudianteUpdateSerializer
)


# Registro de estudiantes
class RegistroEstudianteView(generics.CreateAPIView):
    queryset = Estudiante.objects.all()
    serializer_class = RegistroEstudianteSerializer
    permission_classes = [permissions.AllowAny]  # en producción usar IsAdminUser


# Listado en JSON
class ListEstudiantesView(generics.ListAPIView):
    serializer_class = EstudianteListSerializer
    permission_classes = [permissions.AllowAny]  # en producción usar IsAuthenticated

    def get_queryset(self):
        queryset = Estudiante.objects.all()

        # Parámetros principales
        # Soportar múltiples grado_seccion_id para profesores con varias secciones
        grado_seccion_ids = self.request.query_params.getlist("grado_seccion_id")
        if not grado_seccion_ids:
            # Alias alternativo
            grado_seccion_ids = self.request.query_params.getlist("grado_seccion")
        
        nivel = self.request.query_params.get("nivel")
        representante_id = (
            self.request.query_params.get("representante_id")
            or self.request.query_params.get("representante")  # alias
        )

        # (filtrar por grado/sección directos)
        grado = self.request.query_params.get("grado")
        seccion = self.request.query_params.get("seccion")

        # Aplicar filtros
        if grado_seccion_ids:
            queryset = queryset.filter(grado_seccion_id__in=grado_seccion_ids)
        if nivel:
            queryset = queryset.filter(grado_seccion__nivel__iexact=nivel)
        if representante_id:
            queryset = queryset.filter(representante_id=representante_id)
        if grado:
            queryset = queryset.filter(grado_seccion__grado=grado)
        if seccion:
            queryset = queryset.filter(grado_seccion__seccion__iexact=seccion)

        return queryset


# Listado en PDF
class EstudiantesPDFView(APIView):
    permission_classes = [permissions.AllowAny]  # en producción usar IsAuthenticated

    def get(self, request):
        # Parámetros principales
        # Soportar múltiples grado_seccion_id para profesores con varias secciones
        grado_seccion_ids = request.GET.getlist("grado_seccion_id")
        if not grado_seccion_ids:
            grado_seccion_ids = request.GET.getlist("grado_seccion")
        
        nivel = request.GET.get("nivel")
        representante_id = request.GET.get("representante_id") or request.GET.get("representante")  # alias

        # (filtrar por grado/sección directos)
        grado = request.GET.get("grado")
        seccion = request.GET.get("seccion")

        estudiantes = Estudiante.objects.all()

        # Aplicar filtros de manera consistente (insensible a mayúsculas donde aplica)
        if grado_seccion_ids:
            estudiantes = estudiantes.filter(grado_seccion_id__in=grado_seccion_ids)
        if nivel:
            estudiantes = estudiantes.filter(grado_seccion__nivel__iexact=nivel)
        if representante_id:
            estudiantes = estudiantes.filter(representante_id=representante_id)
        if grado:
            estudiantes = estudiantes.filter(grado_seccion__grado=grado)
        if seccion:
            estudiantes = estudiantes.filter(grado_seccion__seccion__iexact=seccion)

        if not estudiantes.exists():
            try:
                from weasyprint import HTML
                html = "<h1 style='text-align:center;'>No hay estudiantes que coincidan con los filtros.</h1>"
                pdf_file = HTML(string=html).write_pdf()
                response = HttpResponse(pdf_file, content_type="application/pdf")
                response["Content-Disposition"] = "attachment; filename=estudiantes.pdf"
                return response
            except ImportError:
                return Response({'error': 'WeasyPrint no está disponible. Por favor, instale las dependencias del sistema necesarias.'}, status=500)

        # Determinar si mostrar "Grado" o "Año" según el nivel de las secciones
        niveles = set(e.grado_seccion.nivel for e in estudiantes if e.grado_seccion)
        mostrar_grado = "primaria" in niveles
        mostrar_año = "secundaria" in niveles

        template = get_template("estudiante/estudiantes_pdf.html")
        context = {
            "title": "Listado de Estudiantes",
            "estudiantes": estudiantes,
            "mostrar_grado": mostrar_grado,
            "mostrar_año": mostrar_año,
        }
        html = template.render(context)

        try:
            from weasyprint import HTML
            pdf_file = HTML(string=html).write_pdf()
            response = HttpResponse(pdf_file, content_type="application/pdf")
            response["Content-Disposition"] = "attachment; filename=estudiantes.pdf"
            return response
        except ImportError:
            return Response({'error': 'WeasyPrint no está disponible. Por favor, instale las dependencias del sistema necesarias.'}, status=500)


# Actualización y eliminación de estudiantes
class EstudianteDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Estudiante.objects.all()
    serializer_class = EstudianteUpdateSerializer
    permission_classes = [permissions.AllowAny]  # en producción usar IsAdminUser

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        # Si hay representante, actualizar dirección
        representante = serializer.validated_data.get('representante')
        if representante:
            serializer.validated_data['direccion'] = representante.direccion

        self.perform_update(serializer)
        instance.refresh_from_db()
        return Response(EstudianteListSerializer(instance).data)
