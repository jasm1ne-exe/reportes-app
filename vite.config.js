import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// En GitHub Pages la app vive en /reportes-app/; en desarrollo sigue en la raíz
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/reportes-app/' : '/',
  plugins: [
    react(),
    tailwindcss(),
  ],
}))
