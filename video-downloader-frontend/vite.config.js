import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In development, proxy /api requests to the local FastAPI backend so the
// frontend can use relative URLs and avoid CORS issues.
// In production, set VITE_API_URL or serve the built frontend from the backend.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})

