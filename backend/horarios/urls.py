from rest_framework.routers import DefaultRouter
from .views import MateriaViewSet, HorarioViewSet

router = DefaultRouter()
router.register(r'materias', MateriaViewSet)
router.register(r'', HorarioViewSet)

urlpatterns = router.urls   