/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração otimizada para Meu Bentin Sistema
  reactStrictMode: true,
  
  // Output estático para máxima compatibilidade
  output: 'export',
  trailingSlash: true,
  
  // Otimizações de imagem desabilitadas para export estático
  images: {
    unoptimized: true
  },
  
  // Configurações de build otimizadas
  poweredByHeader: false,
  compress: true,
  
  // Configurações experimentais para performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-tabs']
  },
  
  // Webpack customizations se necessário
  webpack: (config, { isServer }) => {
    // Otimizações específicas podem ser adicionadas aqui
    return config;
  },
  
  // Configuração de ambiente
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Headers de segurança básicos
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;