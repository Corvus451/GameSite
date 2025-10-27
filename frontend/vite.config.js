import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/auth_v1': {
        target: 'http://localhost:3001',  // Backend server URL
        changeOrigin: true,  // Changes the origin of the host header to the target URL
        secure: false,  // If true, requires a valid SSL certificate on the target
        rewrite: (path) => path.replace(/^\/api/, '/api'),  // Optional: Rewrite paths (e.g., keep /api prefix)
      },
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
      '/game': {
        ws: true,
        target: 'ws://localhost:80',
        changeOrigin: true,
        secure: false,
      }
    },
  },
})
