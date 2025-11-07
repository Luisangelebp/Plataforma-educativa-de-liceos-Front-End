from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager

class UsuarioManager(BaseUserManager):
    def create_user(self, email, nombre, apellido, rol, password=None):
        if not email:
            raise ValueError("El correo electrónico es obligatorio")
        if not rol:
            raise ValueError("El rol es obligatorio")

        email = self.normalize_email(email)
        usuario = self.model(email=email, nombre=nombre, apellido=apellido, rol=rol)
        usuario.set_password(password)
        usuario.save(using=self._db)
        return usuario

    def create_superuser(self, email, nombre, apellido, password=None):
        usuario = self.create_user(email=email, nombre=nombre, apellido=apellido, rol='admin', password=password)
        usuario.is_staff = True
        usuario.is_superuser = True
        usuario.save(using=self._db)
        return usuario

class Usuario(AbstractBaseUser, PermissionsMixin):
    ROLES = [
        ('admin', 'Administrador'),
        ('profesor', 'Profesor'),
        ('representante', 'Representante'),
        ('estudiante', 'Estudiante'),
    ]

    email = models.EmailField(unique=True)
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    rol = models.CharField(max_length=20, choices=ROLES)
    foto = models.ImageField(upload_to='usuarios/', null=True, blank=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nombre', 'apellido', 'rol']

    objects = UsuarioManager()

    def __str__(self):
        return f"{self.nombre} {self.apellido} ({self.rol})"