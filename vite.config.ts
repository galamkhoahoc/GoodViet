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
      '/ai-runtime/gemma-4-e2b.js': {
        target: 'https://huggingface.co',
        changeOrigin: true,
        rewrite: () => '/api/resolve-cache/spaces/webml-community/gemma-4-webgpu-kernels/cc7145c0c0c3351c8d2852a2e1cc45edaa2a9e80/gemma-4-e2b.js',
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyResponse) => {
            proxyResponse.headers['content-type'] = 'application/javascript; charset=utf-8'
            proxyResponse.headers['cache-control'] = 'public, max-age=31536000, immutable'
          })
        },
      },
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
