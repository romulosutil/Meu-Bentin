import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },

  define: {
    'process.env': {},
    'global': 'globalThis'
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    emptyOutDir: true,
    assetsDir: 'assets',
    target: 'esnext',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-tabs', '@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-checkbox'],
          charts: ['recharts'],
          icons: ['lucide-react'],
          utils: ['./utils/EstoqueContext', './utils/AuthContext']
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