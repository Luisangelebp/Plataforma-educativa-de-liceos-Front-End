# Instrucciones para Ejecutar el Servidor de Desarrollo

## Problema: Landing Page Antigua
Si estás viendo la landing page antigua (HTML estático sin funcionalidad), sigue estos pasos:

## Solución:

### 1. Detener el servidor actual
- Presiona `Ctrl + C` en la terminal donde está corriendo el servidor

### 2. Navegar al directorio correcto
```bash
cd Plataforma-educativa-de-liceos-Front-End/frontend
```

### 3. Limpiar la caché de node_modules (opcional pero recomendado)
```bash
# En Windows PowerShell:
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### 4. Iniciar el servidor de desarrollo
```bash
npm run dev
```

### 5. Limpiar la caché del navegador
- Abre las herramientas de desarrollador (F12)
- Haz clic derecho en el botón de recargar
- Selecciona "Vaciar caché y volver a cargar de forma forzada" o "Empty Cache and Hard Reload"

### 6. Verificar la URL
Asegúrate de acceder a: `http://localhost:5173/`

## Si el problema persiste:

1. Verifica que estás en el directorio correcto:
   ```bash
   pwd  # En Linux/Mac
   cd   # En Windows PowerShell
   ```

2. Verifica que el archivo `index.html` existe en `frontend/index.html`

3. Verifica que el archivo `src/main.jsx` existe

4. Intenta eliminar la carpeta `.vite` si existe:
   ```bash
   Remove-Item -Recurse -Force .vite
   ```

5. Reinicia el servidor:
   ```bash
   npm run dev
   ```

## Nota Importante:
- El servidor DEBE ejecutarse desde el directorio `frontend/`
- NO ejecutes el servidor desde la raíz del proyecto
- El puerto correcto es `5173` (no 3000 ni otro puerto)
