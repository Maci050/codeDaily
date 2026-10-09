import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // El worker de Python es un módulo ES (carga Pyodide con import dinámico)
  worker: { format: 'es' },
})
