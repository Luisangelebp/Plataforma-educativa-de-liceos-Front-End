from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CalificacionViewSet
from .evaluacion_views import EvaluacionViewSet

router = DefaultRouter()
router.register(r'', CalificacionViewSet, basename='calificacion')
router.register(r'evaluaciones', EvaluacionViewSet, basename='evaluacion')

urlpatterns = [
    path('', include(router.urls)),
]