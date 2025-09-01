/**
 * Utilitário para acessar variáveis de ambiente de forma segura
 * Compatível com Vite (desenvolvimento) e Vercel (produção)
 */

// Função para acessar variáveis de ambiente de forma segura
function getEnvVar(key: string, fallback: string = ''): string {
  // Tentar acessar via import.meta.env (Vite)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const viteVar = import.meta.env[`VITE_${key}`] || import.meta.env[key];
    if (viteVar) return viteVar;
  }

  // Tentar acessar via process.env (Node.js/Vercel) se disponível
  if (typeof process !== 'undefined' && process.env) {
    const processVar = process.env[`NEXT_PUBLIC_${key}`] || process.env[key];
    if (processVar) return processVar;
  }

  // Fallback para variáveis globais (se configuradas)
  if (typeof window !== 'undefined' && (window as any).__ENV__) {
    const globalVar = (window as any).__ENV__[key];
    if (globalVar) return globalVar;
  }

  return fallback;
}

// Função para verificar se estamos em desenvolvimento
export function isDevelopment(): boolean {
  // Vite
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.DEV === true;
  }
  
  // Node.js/Vercel
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NODE_ENV === 'development';
  }
  
  // Fallback
  return false;
}

// Função para verificar se estamos em produção
export function isProduction(): boolean {
  // Vite
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.PROD === true;
  }
  
  // Node.js/Vercel
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NODE_ENV === 'production';
  }
  
  // Fallback
  return false;
}

// Configurações específicas do Supabase
export const supabaseConfig = {
  url: getEnvVar('SUPABASE_URL'),
  anonKey: getEnvVar('SUPABASE_ANON_KEY'),
  serviceRoleKey: getEnvVar('SUPABASE_SERVICE_ROLE_KEY', ''),
  
  // Função para verificar se está configurado
  isConfigured(): boolean {
    return !!(this.url && this.anonKey && this.url !== 'https://seu-projeto-id.supabase.co');
  },
  
  // Função para obter o project ID
  getProjectId(): string {
    if (!this.url) return 'local';
    try {
      const match = this.url.match(/https:\/\/([^.]+)\.supabase\.co/);
      return match ? match[1] : 'local';
    } catch {
      return 'local';
    }
  }
};

// Configurações da aplicação
export const appConfig = {
  name: getEnvVar('APP_NAME', 'Meu Bentin'),
  version: getEnvVar('APP_VERSION', '1.0.0'),
  environment: getEnvVar('APP_ENV', isDevelopment() ? 'development' : 'production')
};

// Log de configuração (apenas em desenvolvimento)
if (isDevelopment() && typeof console !== 'undefined') {
  console.log('🔧 Configuração do ambiente:', {
    environment: appConfig.environment,
    supabaseConfigured: supabaseConfig.isConfigured(),
    projectId: supabaseConfig.getProjectId(),
    hasServiceRole: !!supabaseConfig.serviceRoleKey
  });
}