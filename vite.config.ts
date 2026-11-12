/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves the site from /bug-hunt/, so assets need this prefix.
  base: '/bug-hunt/',
  plugins: [react()],
  // Pyodide loads its own files at runtime, so Vite must not pre-bundle it.
  optimizeDeps: { exclude: ['pyodide'] },
  worker: { format: 'es' },
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.ts'],
  },
})
