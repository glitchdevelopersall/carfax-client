import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // For local development: proxy /api calls to local server
    // In production (Vercel), /api calls go directly to Vercel Functions
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
})