import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 4175,
    proxy: {
      '/api': {
        target: 'http://172.16.1.155:3301',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    }
  },
  preview: {
	allowedHosts: ['os.tisaude.tec.br'],
 	port: 2222
 }
})
