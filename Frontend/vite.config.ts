import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Redirige las peticiones al backend local y evita errores de CORS
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
})