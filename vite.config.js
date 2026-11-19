import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  // GitHub Pages serves from /hamzaoui-portfolio/; Vercel and local dev use /
  base: process.env.BASE_PATH || '/',
  plugins: [react(), tailwindcss()],
  // two pages: the current site (index.html) and the redesign preview (v2.html)
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        v2: path.resolve(__dirname, 'v2.html'),
      },
    },
  },
  resolve: {
    alias: {
      '#': path.resolve(__dirname, './src'),
    },
  },
})