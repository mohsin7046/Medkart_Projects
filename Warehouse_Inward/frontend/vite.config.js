import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defaultEndPoint } from './src/constant/endPoints.js'


export default defineConfig({
  plugins: [react(),tailwindcss()],
  server:{
    proxy:{
      '/api':{
        target:defaultEndPoint,
  }
    }
}})
