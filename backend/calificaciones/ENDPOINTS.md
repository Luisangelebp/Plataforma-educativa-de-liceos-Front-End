# 📋 ENDPOINTS DE CALIFICACIONES - DOCUMENTACIÓN

## 🔥 **NUEVOS ENDPOINTS IMPLEMENTADOS**

### 1. **Evaluaciones Individuales**
```
GET    /calificaciones/evaluaciones/                    - Listar evaluaciones
POST   /calificaciones/evaluaciones/                    - Crear evaluación
GET    /calificaciones/evaluaciones/{id}/               - Detalle evaluación
PUT    /calificaciones/evaluaciones/{id}/               - Actualizar evaluación completa
PATCH  /calificaciones/evaluaciones/{id}/               - Actualizar evaluación parcial
DELETE /calificaciones/evaluaciones/{id}/               - Eliminar evaluación
```

### 2. **Actualización Masiva por Calificación**
```
PATCH  /calificaciones/{calificacion_id}/actualizar_evaluaciones/
```

**Body:**
```json
{
    "evaluaciones": [
        {"id": 1, "nota": 15.5},
        {"id": 2, "nota": 18.0},
        {"id": 3, "nota": 12.5},
        {"id": 4, "nota": 16.0}
    ]
}
```

**Respuesta:**
```json
{
    "actualizadas": 4,
    "errores": 0,
    "detalle_errores": [],
    "calificacion": {
        "id": 123,
        "evaluaciones": [
            {"id": 1, "nombre": "Nota 1", "nota": 15.5},
            {"id": 2, "nombre": "Nota 2", "nota": 18.0},
            {"id": 3, "nombre": "Nota 3", "nota": 12.5},
            {"id": 4, "nombre": "Nota 4", "nota": 16.0}
        ],
        "promedio": 15.5
    }
}
```

### 3. **Actualización Masiva Global**
```
PATCH  /calificaciones/actualizar_evaluaciones_masivas/
```

**Body:**
```json
{
    "evaluaciones": [
        {"id": 1, "nota": 15.5},
        {"id": 5, "nota": 18.0},
        {"id": 9, "nota": 12.5}
    ]
}
```

**Respuesta:**
```json
{
    "actualizadas": 3,
    "errores": 0,
    "detalle_errores": [],
    "calificaciones": [
        {
            "id": 123,
            "evaluaciones": [...],
            "promedio": 15.5
        },
        {
            "id": 124,
            "evaluaciones": [...],
            "promedio": 18.0
        }
    ]
}
```

## 🎯 **EJEMPLOS DE USO**

### **Para Primaria (4 notas fijas):**
```javascript
// Opción 1: Actualizar por calificación (RECOMENDADO)
PATCH /calificaciones/123/actualizar_evaluaciones/
{
    "evaluaciones": [
        {"id": 1, "nota": 15},
        {"id": 2, "nota": 18},
        {"id": 3, "nota": 12},
        {"id": 4, "nota": 16}
    ]
}

// Opción 2: Actualizar individual
PATCH /calificaciones/evaluaciones/1/
{
    "nota": 15
}
```

### **Para Secundaria (evaluaciones dinámicas):**
```javascript
// Añadir evaluación
POST /calificaciones/123/agregar_evaluacion/
{
    "nombre": "Examen Parcial",
    "nota": 17.5
}

// Actualizar existente
PATCH /calificaciones/evaluaciones/5/
{
    "nota": 19.0
}
```

## ✅ **CARACTERÍSTICAS DE SEGURIDAD**

- **✅ Filtro por rol**: Solo ve evaluaciones de tus estudiantes
- **✅ Bloqueo por lapso**: No edita si `enviado=true`
- **✅ Validación de permisos**: Solo profesor dueño puede modificar
- **✅ Recálculo automático**: Promedio se actualiza solos
- **✅ Manejo de errores**: Detalla qué falló y por qué
- **✅ Transaccional**: Si falla una, las demás sí se actualizan

## 🚀 **FLUJO COMPLETO PARA PROFESORES**

1. **Listar calificaciones**: `GET /calificaciones/?materia=1&lapso=1`
2. **Actualizar notas**: `PATCH /calificaciones/123/actualizar_evaluaciones/`
3. **Cerrar lapso**: `POST /calificaciones/enviar_finales/`
4. **Generar boletín**: `GET /boletines/profesor/vista-previa/1/lapso/1/`

## 🔧 **SOLUCIÓN A TU PROBLEMA**

**Antes:** No había endpoint para actualizar evaluaciones individuales
**Ahora:** Tienes múltiples opciones para actualizar notas correctamente

**El body que mostraste en la imagen ahora funciona perfectamente:**
```json
{
    "evaluaciones": [
        {"id": 1, "nota": 15},
        {"id": 2, "nota": 18},
        {"id": 3, "nota": 12},
        {"id": 4, "nota": 16}
    ]
}
```
