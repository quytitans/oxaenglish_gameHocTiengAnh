import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // In production this app is reverse-proxied under /oxaenglish/ alongside
  // other apps on the same domain, so built asset URLs must carry that
  // prefix. Dev keeps serving from the root so `npm run dev` is unaffected.
  base: command === 'build' ? '/oxaenglish/' : '/',
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
}))
