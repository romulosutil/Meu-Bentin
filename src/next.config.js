/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração simplificada e estável para Meu Bentin
  reactStrictMode: true,
  
  // Output estático para máxima compatibilidade com Vercel
  output: 'export',
  trailingSlash: true,
  
  // Desabilitar otimizações de imagem para export estático
  images: {
    unoptimized: true
  },
  
  // Configurações básicas
  poweredByHeader: false,
  
  // Evitar experimental para máxima estabilidade
  // experimental: {}, // Comentado para evitar problemas
  
  // ESLint configuração básica
  eslint: {
    // Durante builds, não parar por warnings de ESLint
    ignoreDuringBuilds: false,
  },
  
  // TypeScript configuração
  typescript: {
    // Durante builds, não parar por erros de TypeScript que possamos ter
    ignoreBuildErrors: false,
  }
};

module.exports = nextConfig;