from django.contrib.auth.backends import ModelBackend
from core.models import Usuario

class EmailBackend(ModelBackend):
    def authenticate(self, request, email=None, password=None, **kwargs):
        try:
            usuario = Usuario.objects.get(email=email)
            if usuario.check_password(password):
                return usuario
        except Usuario.DoesNotExist:
            return None
