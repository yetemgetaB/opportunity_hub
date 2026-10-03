import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Proxy API requests to the backend during local development to avoid CORS
    // Adjust target port if the backend runs on a different port (default here: 3000)
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        // keep path as-is; if backend expects no /api prefix, use rewrite: (path) => path.replace(/^\/api/, '')
      },
    },
  },
})
