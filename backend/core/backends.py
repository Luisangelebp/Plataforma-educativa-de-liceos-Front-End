from django.contrib.auth.backends import ModelBackend
from core.models import Usuario

class EmailBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        try:
            usuario = Usuario.objects.get(email=username)
            if usuario.check_password(password):
                return usuario
        except Usuario.DoesNotExist:
            return None
