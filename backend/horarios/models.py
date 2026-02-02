from django.db import models

class Materia(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(null=True, blank=True)

    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nombre


class Horario(models.Model):
    DIAS_SEMANA = [
        ("lunes", "Lunes"),
        ("martes", "Martes"),
        ("miercoles", "Miércoles"),
        ("jueves", "Jueves"),
        ("viernes", "Viernes"),
    ]

    dia_semana = models.CharField(max_length=15, choices=DIAS_SEMANA)
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()

    materia = models.ForeignKey(Materia, on_delete=models.CASCADE)
    
    # 🛡️ CORRECCIÓN: Usamos string 'core.GradoSeccion' para evitar el bloqueo mutuo
    grado_seccion = models.ForeignKey(
        'core.GradoSeccion', 
        on_delete=models.CASCADE
    )
    
    # 🔑 Relación con Profesor (ya estaba bien como string)
    profesor = models.ForeignKey(
        "Usuarios.Profesor",
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.grado_seccion} - {self.materia} ({self.dia_semana} {self.hora_inicio}-{self.hora_fin})"