from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import HttpResponse
from django.template.loader import get_template
from weasyprint import HTML

from .models import Estudiante
from .serializers import RegistroEstudianteSerializer, EstudianteListSerializer


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
        grado = self.request.query_params.get("grado")
        nivel = self.request.query_params.get("nivel")
        representante_id = self.request.query_params.get("representante_id")

        if grado:
            queryset = queryset.filter(grado=grado)
        if nivel:
            queryset = queryset.filter(nivel=nivel)
        if representante_id:
            queryset = queryset.filter(representante_id=representante_id)

        return queryset


# Listado en PDF
class EstudiantesPDFView(APIView):
    permission_classes = [permissions.AllowAny]  # en producción usar IsAuthenticated

    def get(self, request):
        grado = request.GET.get("grado")
        nivel = request.GET.get("nivel")
        representante_id = request.GET.get("representante_id")

        estudiantes = Estudiante.objects.all()
        if grado:
            estudiantes = estudiantes.filter(grado__iexact=grado)
        if nivel:
            estudiantes = estudiantes.filter(nivel__iexact=nivel)
        if representante_id:
            estudiantes = estudiantes.filter(representante_id=representante_id)

        if not estudiantes.exists():
            html = "<h1 style='text-align:center;'>No hay estudiantes que coincidan con los filtros.</h1>"
            pdf_file = HTML(string=html).write_pdf()
            response = HttpResponse(pdf_file, content_type="application/pdf")
            response["Content-Disposition"] = "inline; filename=estudiantes.pdf"
            return response

        niveles = set(e.nivel for e in estudiantes)
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

        pdf_file = HTML(string=html).write_pdf()
        response = HttpResponse(pdf_file, content_type="application/pdf")
        response["Content-Disposition"] = "inline; filename=estudiantes.pdf"
        return response
