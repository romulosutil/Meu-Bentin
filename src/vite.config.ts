import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ==========================================
// CONFIGURAÇÃO VITE - MEU BENTIN SISTEMA
// VERSÃO FINAL - CORRIGIDA PARA DIST
// ==========================================

export default defineConfig({
  plugins: [react()],
  
  root: '.',
  publicDir: 'public',
  
  resolve: {
    alias: {
      '@': '/src',
    },
  },

  define: {
    'process.env': {},
    'global': 'globalThis'
  },

  // CONFIGURAÇÃO DE BUILD - FORÇANDO DIST
  build: {
    // CRITICAL: Output DEVE ser 'dist' para Vercel
    outDir: 'dist',
    
    // Limpar diretório antes do build
    emptyOutDir: true,
    
    // Configurações de otimização
    sourcemap: false,
    minify: 'esbuild',
    target: 'esnext',
    cssCodeSplit: true,
    
    // Assets configuration
    assetsDir: 'assets',
    
    // Rollup options optimized
    rollupOptions: {
      input: {
        main: './index.html'
      },
      output: {
        dir: 'dist',
        format: 'es',
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-tabs', '@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-checkbox'],
          charts: ['recharts'],
          icons: ['lucide-react']
        }
      },
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false
      }
    },
    
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: false
  },

  server: {
    port: 3000,
    host: true,
    open: true
  },

  preview: {
    port: 4173,
    host: true
  },

  optimizeDeps: {
    include: [
      'react',
      'react-dom', 
      'lucide-react',
      'recharts',
      '@radix-ui/react-tabs',
      '@radix-ui/react-dialog',
      '@radix-ui/react-select',
      '@radix-ui/react-checkbox'
    ]
  },

  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
})