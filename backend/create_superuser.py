import os
import django
import sys

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from core.models import Usuario

# Datos del superusuario
EMAIL = "admin@admin.com"
PASSWORD = "admin123"
NOMBRE = "Administrador"      # ¡REQUERIDO!
APELLIDO = "Sistema"          # ¡REQUERIDO!

try:
    if not Usuario.objects.filter(email=EMAIL).exists():
        # OPCIÓN 1: Con todos los campos requeridos
        Usuario.objects.create_superuser(
            email=EMAIL,
            password=PASSWORD,
            nombre=NOMBRE,
            apellido=APELLIDO
        )
        print(f"✅ Superusuario creado exitosamente")
        print(f"   Email: {EMAIL}")
        print(f"   Password: {PASSWORD}")
        print(f"   Nombre: {NOMBRE} {APELLIDO}")
    else:
        print("ℹ️ Superusuario ya existe")
        print(f"   Email: {EMAIL}")
        
except Exception as e:
    print(f"❌ Error crítico: {e}")
    
    # OPCIÓN 2: Si aún falla, intenta crear usuario normal
    try:
        user = Usuario(
            email=EMAIL,
            nombre=NOMBRE,
            apellido=APELLIDO,
            is_staff=True,
            is_superuser=True,
            is_active=True
        )
        user.set_password(PASSWORD)
        user.save()
        print(f"✅ Superusuario creado (manualmente)")
    except Exception as e2:
        print(f"⚠️ Error manual: {e2}")
    
    sys.exit(0)  # No rompe el build