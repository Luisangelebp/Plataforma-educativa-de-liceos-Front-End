from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.authentication import SessionAuthentication
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
    authentication_classes = [JWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAdminUser] # 🛡️ Solo el Admin registra


# Listado en JSON con Filtros por Rol
class ListEstudiantesView(generics.ListAPIView):
    serializer_class = EstudianteListSerializer
    authentication_classes = [JWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Estudiante.objects.select_related('grado_seccion', 'usuario', 'representante').all()

        # --- 🛡️ CAPA DE SEGURIDAD SEGÚN ROL ---
        
        # 1. Si es PROFESOR: Solo ve estudiantes de sus secciones asignadas
        if user.rol == 'profesor':
            profesor_perfil = getattr(user, 'profesor_profile', None)
            if profesor_perfil:
                secciones_ids = profesor_perfil.grado_secciones.values_list('id', flat=True)
                queryset = queryset.filter(grado_seccion_id__in=secciones_ids)
            else:
                return Estudiante.objects.none()

        # 2. Si es REPRESENTANTE: Solo ve a sus hijos
        elif user.rol == 'representante':
            repre_perfil = getattr(user, 'representante_profile', None)
            if repre_perfil:
                queryset = queryset.filter(representante=repre_perfil)
            else:
                return Estudiante.objects.none()

        # 3. Si es ESTUDIANTE: Solo se ve a sí mismo
        elif user.rol == 'estudiante':
            queryset = queryset.filter(usuario=user)

        # 4. Si es ADMIN: No se aplica filtro extra (ve todo)

        # --- FILTROS DE URL (Query Params) ---
        grado_seccion_ids = self.request.query_params.getlist("grado_seccion_id") or self.request.query_params.getlist("grado_seccion")
        nivel = self.request.query_params.get("nivel")
        representante_id = self.request.query_params.get("representante_id") or self.request.query_params.get("representante")
        grado = self.request.query_params.get("grado")
        seccion = self.request.query_params.get("seccion")

        if grado_seccion_ids:
            queryset = queryset.filter(grado_seccion_id__in=grado_seccion_ids)
        if nivel:
            queryset = queryset.filter(grado_seccion__nivel__iexact=nivel)
        if representante_id and user.rol == 'admin': # Solo admin filtra por cualquier repre
            queryset = queryset.filter(representante_id=representante_id)
        if grado:
            queryset = queryset.filter(grado_seccion__grado=grado)
        if seccion:
            queryset = queryset.filter(grado_seccion__seccion__iexact=seccion)

        return queryset.distinct()


# Listado en PDF (Aplica la misma seguridad que el JSON)
class EstudiantesPDFView(APIView):
    authentication_classes = [JWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Usamos la misma lógica de filtrado del listado para el PDF
        view_instance = ListEstudiantesView()
        view_instance.request = request
        estudiantes = view_instance.get_queryset()

        if not estudiantes.exists():
            return Response({'error': 'No hay estudiantes para generar el PDF'}, status=404)

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
            return Response({'error': 'WeasyPrint no disponible'}, status=500)


# Detalle, Actualización y Eliminación
class EstudianteDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Estudiante.objects.all()
    serializer_class = EstudianteUpdateSerializer
    authentication_classes = [JWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        obj = super().get_object()
        user = self.request.user
        
        # 🛡️ Seguridad: Solo Admin, el propio Estudiante o su Representante pueden ver la ficha
        es_dueño = (obj.usuario and obj.usuario.id == user.id)
        es_su_repre = (obj.representante and getattr(user, 'representante_profile', None) == obj.representante)
        
        # Si eres profesor, solo puedes ver si el alumno está en tu sección
        es_su_profe = False
        if user.rol == 'profesor':
            profe = getattr(user, 'profesor_profile', None)
            if profe and obj.grado_seccion in profe.grado_secciones.all():
                es_su_profe = True

        if user.rol != 'admin' and not (es_dueño or es_su_repre or es_su_profe):
            raise PermissionDenied("No tienes permiso para ver este estudiante.")
        return obj

    def perform_destroy(self, instance):
        # 🛡️ Solo el Admin puede borrar estudiantes
        if self.request.user.rol != 'admin':
            raise PermissionDenied("Solo el administrador puede eliminar estudiantes.")
            
        if instance.usuario:
            instance.usuario.delete()
        else:
            instance.delete()

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        # Solo Admin o Representante pueden editar (El estudiante no debería editar su propia ficha)
        if request.user.rol not in ['admin', 'representante']:
             raise PermissionDenied("No tienes permiso para editar esta ficha.")

        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        representante = serializer.validated_data.get('representante')
        if representante:
            serializer.validated_data['direccion'] = representante.direccion

        self.perform_update(serializer)
        instance.refresh_from_db()
        return Response(EstudianteListSerializer(instance).data)