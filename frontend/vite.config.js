import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, res) => {
            console.error('[Vite Proxy Error]: Backend unreachable', err.message);
            if (res && !res.headersSent) {
              res.writeHead(502, {
                'Content-Type': 'application/json',
              });
              res.end(
                JSON.stringify({
                  status: 502,
                  error: 'Bad Gateway',
                  message: 'Authentication service is temporarily unavailable. Please try again.',
                })
              );
            }
          });
        },
      },
    },
  },
})
