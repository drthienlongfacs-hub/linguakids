import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/linguakids/', // GitHub Pages base path
  server: {
    host: true, // Allow LAN access from iPad on same network
  },
})
