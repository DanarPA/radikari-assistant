import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // 1. Wajib import path dari node

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      // 2. Ini yang bertugas menerjemahkan "@" menjadi folder "src"
      "@": path.resolve(__dirname, "./src"),
    },
  },
})