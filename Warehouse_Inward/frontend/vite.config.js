import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defaultEndPoint } from './src/constant/endPoints'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  
})
