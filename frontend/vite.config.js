import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite dev server proxy: forward API calls to backend container service.
// This lets the browser make same-origin requests to the frontend dev server
// which proxies them into the docker-compose network (backend:8001).
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 8000,
    proxy: {
      '/upload': {
        target: 'http://backend:8001',
        changeOrigin: true,
        secure: false,
      },
      '/message': {
        target: 'http://backend:8001',
        changeOrigin: true,
        secure: false,
      },
      '/files': {
        target: 'http://backend:8001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
