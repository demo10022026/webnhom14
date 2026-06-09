import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const useTunnelHmr = env.VITE_TUNNEL_HMR === 'true'

  return {
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  define: {
    global: 'globalThis',
  },

  server: {
    host: '0.0.0.0',
    allowedHosts: ['.trycloudflare.com'],
    hmr: useTunnelHmr ? { clientPort: 443 } : undefined,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  }
  }
})
