from django.urls import path
from .views import LoginUsuarioView,RegistroUsuarioView

urlpatterns = [
    path('login/', LoginUsuarioView.as_view(), name='login'),
    path('registro/', RegistroUsuarioView.as_view(), name = 'registro')
]
