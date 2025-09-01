import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ==========================================
// CONFIGURAÇÃO VITE - MEU BENTIN SISTEMA
// VERSÃO ULTRA-SIMPLIFICADA PARA FORÇAR DIST
// ==========================================

export default defineConfig({
  plugins: [react()],
  
  // CONFIGURAÇÃO DE BUILD MINIMALISTA
  build: {
    // FORÇA output para 'dist' (será sobrescrito por --outDir se necessário)
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    minify: 'esbuild',
    assetsDir: 'assets'
  },

  // Configurações básicas
  server: {
    port: 3000,
    host: true
  },

  // Otimizações essenciais
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react']
  }
})