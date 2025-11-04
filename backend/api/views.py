from rest_framework import viewsets
from django.contrib.auth import get_user_model
from .serializers import UserSerializer

class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer

    def get_queryset(self):
        User = get_user_model()
        return User.objects.all()
