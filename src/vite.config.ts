import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Otimizações para React
      fastRefresh: true,
    })
  ],
  
  // Configurações de build para produção
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar dependências grandes em chunks
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['lucide-react', 'recharts'],
        }
      }
    },
    // Otimizações para tamanho do bundle
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      }
    }
  },

  // Configurações do servidor de desenvolvimento
  server: {
    port: 3000,
    host: true,
    open: true,
    hmr: {
      overlay: true
    }
  },

  // Preview server
  preview: {
    port: 4173,
    host: true
  },

  // Configurações de resolução de módulos
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@/components': path.resolve(__dirname, './components'),
      '@/utils': path.resolve(__dirname, './utils'),
      '@/styles': path.resolve(__dirname, './styles'),
      '@/hooks': path.resolve(__dirname, './hooks'),
    }
  },

  // Configurações de otimização de dependências
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'lucide-react',
      'recharts'
    ]
  },

  // CSS
  css: {
    devSourcemap: true,
    modules: {
      localsConvention: 'camelCaseOnly'
    }
  },

  // Configurações para deploy
  base: '/',
  
  // Definir variáveis de ambiente para build
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
    __VERSION__: JSON.stringify(process.env.npm_package_version),
  },

  // Configurações para PWA (caso necessário no futuro)
  // Comentado por enquanto, mas pronto para uso
  /*
  pwa: {
    registerType: 'autoUpdate',
    workbox: {
      globPatterns: ['**\/*.{js,css,html,ico,png,svg}'],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
            },
            cacheKeyWillBeUsed: async ({ request }) => {
              return `${request.url}?v=1`;
            }
          }
        }
      ]
    }
  }
  */
});