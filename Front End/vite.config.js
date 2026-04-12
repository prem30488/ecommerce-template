import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiBaseUrl = env.VITE_API_BACKEND_URL || 'http://localhost:3000'

  return defineConfig({
    plugins: [react()],
    define: {
      global: 'window',
    },
    server: {
      port: 5173,
      host: true,
      proxy: {
        '/api': {
          target: apiBaseUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/api'),
        },
        '/solr': {
          target: env.VITE_SOLR_URL || 'http://localhost:8983',
          changeOrigin: true,
          secure: false,
          headers: {
            'ngrok-skip-browser-warning': 'true'
          }
        },
      },
    },
  })
}
