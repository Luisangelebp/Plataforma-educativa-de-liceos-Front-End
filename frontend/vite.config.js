import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  root: resolve(__dirname),
  publicDir: 'public',
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    // Asegurar que siempre sirva el index.html correcto
    fs: {
      strict: true,
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
