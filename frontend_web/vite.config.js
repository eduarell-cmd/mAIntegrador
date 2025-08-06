import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Estas son las instrucciones para el "recepcionista"
    proxy: {
      // Si una petición empieza con '/api'...
      '/api': {
        // ...envíala a esta dirección (tu backend de FastAPI)
        target: 'http://localhost:8000',

        // Requerido para que el backend acepte la petición
        changeOrigin: true,

        // Le quita el '/api' antes de enviarla, para que tu backend
        // reciba la ruta limpia (ej: /auth/login)
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
