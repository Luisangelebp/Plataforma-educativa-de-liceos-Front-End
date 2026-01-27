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
    
class GradoSeccion(models.Model):
    NIVEL_OPCIONES = [
        ('primaria', 'Primaria'),
        ('secundaria', 'Secundaria'),
    ]

    GRADO_OPCIONES_PRIMARIA = [
        ('1', '1er grado'), ('2', '2do grado'), ('3', '3er grado'),
        ('4', '4to grado'), ('5', '5to grado'), ('6', '6to grado'),
    ]

    GRADO_OPCIONES_SECUNDARIA = [
        ('1', '1er año'), ('2', '2do año'), ('3', '3er año'),
        ('4', '4to año'), ('5', '5to año'), ('6', '6to año'),
    ]

    # Unificamos todas las opciones para la validación del campo
    TODOS_LOS_GRADOS = GRADO_OPCIONES_PRIMARIA + GRADO_OPCIONES_SECUNDARIA

    SECCION_OPCIONES = [
        ('A', 'Sección A'),
        ('B', 'Sección B'),
        ('C', 'Sección C'),
    ]

    nivel = models.CharField(max_length=20, choices=NIVEL_OPCIONES)
    # Usamos las opciones unificadas para evitar errores de validación
    grado = models.CharField(max_length=50, choices=TODOS_LOS_GRADOS)
    seccion = models.CharField(max_length=5, choices=SECCION_OPCIONES)

    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Grado y Sección"
        verbose_name_plural = "Grados y Secciones"
        unique_together = ['nivel', 'grado', 'seccion'] # Evita crear "1er año A" dos veces

    def __str__(self):
        # Lógica para mostrar el nombre según el nivel
        if self.nivel == "primaria":
            grado_texto = dict(self.GRADO_OPCIONES_PRIMARIA).get(self.grado, self.grado)
        else:
            grado_texto = dict(self.GRADO_OPCIONES_SECUNDARIA).get(self.grado, self.grado)
            
        return f"{grado_texto} {self.seccion} ({self.nivel.capitalize()})"