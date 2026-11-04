import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  // GitHub Pages serves from /hamzaoui-portfolio/; Vercel and local dev use /
  base: process.env.BASE_PATH || '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '#': path.resolve(__dirname, './src'),
    },
  },
})