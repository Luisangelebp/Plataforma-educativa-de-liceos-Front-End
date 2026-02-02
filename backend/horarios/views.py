from rest_framework import viewsets, permissions
from .models import Materia, Horario
from .serializers import MateriaSerializer, HorarioSerializer

class MateriaViewSet(viewsets.ModelViewSet):
    """
    Listado de materias disponibles en la institución.
    """
    queryset = Materia.objects.all()
    serializer_class = MateriaSerializer
    permission_classes = [permissions.IsAuthenticated]


class HorarioViewSet(viewsets.ModelViewSet):
    """
    Vista de horarios con filtros de seguridad por rol.
    """
    # 🔑 CORRECCIÓN: Definimos el queryset base para que el router
    # pueda determinar el nombre de la URL (basename) automáticamente.
    queryset = Horario.objects.all()
    serializer_class = HorarioSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        # Optimizamos la consulta con select_related para evitar 
        # múltiples hits a la base de datos al traer nombres de materia, etc.
        queryset = Horario.objects.all().select_related(
            'materia', 
            'grado_seccion', 
            'profesor',
            'profesor__usuario' # Útil para filtrar por usuario del profesor
        )

        # --- 🛡️ LÓGICA DE SEGURIDAD SEGÚN ROL ---

        # 1. PROFESOR: Solo ve las clases que él debe dictar
        if user.rol == 'profesor':
            queryset = queryset.filter(profesor__usuario=user)

        # 2. ESTUDIANTE: Solo ve el horario de su sección asignada
        elif user.rol == 'estudiante':
            # Buscamos el perfil de estudiante relacionado al usuario
            estudiante_perfil = getattr(user, 'estudiante_profile', None)
            if estudiante_perfil and estudiante_perfil.grado_seccion:
                queryset = queryset.filter(grado_seccion=estudiante_perfil.grado_seccion)
            else:
                # Si no tiene sección, no ve horarios
                return Horario.objects.none()

        # 3. REPRESENTANTE: Ve los horarios de las secciones donde están sus hijos
        elif user.rol == 'representante':
            repre_perfil = getattr(user, 'representante_profile', None)
            if repre_perfil:
                # Obtenemos los IDs de las secciones de todos sus hijos
                secciones_ids = repre_perfil.estudiantes.values_list('grado_seccion', flat=True)
                queryset = queryset.filter(grado_seccion__id__in=secciones_ids)
            else:
                return Horario.objects.none()

        # 4. ADMIN: Ve todo el cronograma escolar (no aplicamos filtros de rol)

        # --- FILTROS EXTRAS POR URL ---
        # Permite filtrar por ejemplo: /horarios/?dia_semana=lunes
        grado_seccion_id = self.request.query_params.get('grado_seccion')
        dia = self.request.query_params.get('dia_semana')

        if grado_seccion_id:
            queryset = queryset.filter(grado_seccion_id=grado_seccion_id)
        if dia:
            queryset = queryset.filter(dia_semana__iexact=dia)

        # Ordenamos por día y hora para que el front lo reciba organizado
        return queryset.distinct().order_by('dia_semana', 'hora_inicio')