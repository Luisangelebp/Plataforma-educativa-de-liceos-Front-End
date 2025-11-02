from django.urls import path
from .views import LoginUsuarioView,RegistroUsuarioView

urlpatterns = [
    path('api/login/', LoginUsuarioView.as_view(), name='login'),
    path('api/registro/', RegistroUsuarioView.as_view(), name = 'registro')
]
