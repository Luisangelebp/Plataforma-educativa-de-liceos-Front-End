from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.core.exceptions import ValidationError

# --- GESTIÓN DE USUARIOS ---

class UsuarioManager(BaseUserManager):
    def create_user(self, email, nombre, apellido, rol, password=None, **extra_fields):
        if not email:
            raise ValueError("El correo electrónico es obligatorio")
        if not rol:
            raise ValueError("El rol es obligatorio")
        
        email = self.normalize_email(email)
        usuario = self.model(
            email=email, 
            nombre=nombre, 
            apellido=apellido, 
            rol=rol, 
            **extra_fields
        )
        usuario.set_password(password)
        usuario.save(using=self._db)
        return usuario

    def create_superuser(self, email, nombre, apellido, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser debe tener is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser debe tener is_superuser=True.')

        # Si el rol viene en los argumentos extra (por el REQUIRED_FIELDS), lo usamos, 
        # de lo contrario, por defecto es 'admin'
        rol = extra_fields.pop('rol', 'admin')

        return self.create_user(
            email=email, 
            nombre=nombre, 
            apellido=apellido, 
            rol=rol, 
            password=password, 
            **extra_fields
        )

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

# --- CONFIGURACIÓN DINÁMICA DEL PLANTEL ---

class Institucion(models.Model):
    nombre = models.CharField(max_length=255, verbose_name="Nombre del Plantel")
    codigo_dea = models.CharField(max_length=50, blank=True, verbose_name="Código DEA")
    rif = models.CharField(max_length=20, blank=True, verbose_name="RIF")
    logo = models.ImageField(upload_to='institucion/logo/', null=True, blank=True)
    
    director = models.CharField(max_length=150, verbose_name="Director(a)")
    subdirector = models.CharField(max_length=150, blank=True, verbose_name="Subdirector(a)")
    
    slogan_boletin = models.CharField(
        max_length=255, 
        default="Educando para el futuro",
        verbose_name="Slogan / Mensaje al pie"
    )

    class Meta:
        verbose_name = "Configuración de la Institución"
        verbose_name_plural = "Configuración de la Institución"

    def clean(self):
        if not self.pk and Institucion.objects.exists():
            raise ValidationError("Ya existe una configuración institucional. Solo se permite un registro.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.nombre

class PeriodoEscolar(models.Model):
    nombre = models.CharField(max_length=20)
    es_actual = models.BooleanField(default=False, verbose_name="¿Es el periodo activo?")
    
    class Meta:
        verbose_name = "Periodo Escolar"
        verbose_name_plural = "Periodos Escolares"

    def save(self, *args, **kwargs):
        if self.es_actual:
            PeriodoEscolar.objects.filter(es_actual=True).exclude(pk=self.pk).update(es_actual=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.nombre

# --- ESTRUCTURA DE GRADOS ---

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
    TODOS_LOS_GRADOS = GRADO_OPCIONES_PRIMARIA + GRADO_OPCIONES_SECUNDARIA
    SECCION_OPCIONES = [
        ('A', 'Sección A'),
        ('B', 'Sección B'),
        ('C', 'Sección C'),
    ]

    nivel = models.CharField(max_length=20, choices=NIVEL_OPCIONES)
    grado = models.CharField(max_length=50, choices=TODOS_LOS_GRADOS)
    seccion = models.CharField(max_length=5, choices=SECCION_OPCIONES)
    
    docente_guia = models.ForeignKey(
        'Usuarios.Profesor', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='secciones_asignadas'
    )

    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Grado y Sección"
        verbose_name_plural = "Grados y Secciones"
        unique_together = ['nivel', 'grado', 'seccion']

    def __str__(self):
        if self.nivel == "primaria":
            grado_texto = dict(self.GRADO_OPCIONES_PRIMARIA).get(self.grado, self.grado)
        else:
            grado_texto = dict(self.GRADO_OPCIONES_SECUNDARIA).get(self.grado, self.grado)
        return f"{grado_texto} {self.seccion} ({self.nivel.capitalize()})"