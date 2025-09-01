import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  // Configuração para compatibilidade com process.env em alguns casos
  define: {
    'process.env': {},
    'global': 'globalThis'
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-tabs', '@radix-ui/react-dialog', '@radix-ui/react-select'],
          charts: ['recharts'],
          icons: ['lucide-react']
        }
      },
      external: (id) => {
        // Excluir qualquer coisa relacionada ao Supabase ou JSR
        return id.includes('supabase') || id.includes('jsr:') || id.includes('@supabase')
      }
    },
    chunkSizeWarningLimit: 1000,
    target: 'esnext',
    cssCodeSplit: true
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
      '@radix-ui/react-dialog'
    ],
    exclude: [
      'supabase',
      '@supabase/supabase-js',
      'jsr:*'
    ]
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
})