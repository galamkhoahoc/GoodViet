/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  build: {
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 500,
    // Source maps for production debugging
    sourcemap: true,
  },
  // Development server config
  server: {
    port: 5173,
    strictPort: false,
    // Proxy for future backend API
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  test: {
    exclude: ['backend/**', 'node_modules/**', 'dist/**'],
  },
})
