/**
 * Configuração de variáveis de ambiente para o Sistema Meu Bentin
 * Este arquivo centraliza o acesso às variáveis de ambiente e fornece fallbacks
 */

// Função para obter variáveis de ambiente de forma segura
function getEnvVar(key: string, fallback?: string): string {
  try {
    // Tentar usar import.meta.env primeiro (Vite)
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      const value = import.meta.env[key];
      if (value && value !== 'undefined') return value;
    }
    
    // Fallback para process.env (caso necessário)
    if (typeof process !== 'undefined' && process.env) {
      const value = process.env[key];
      if (value && value !== 'undefined') return value;
    }
    
    // Usar fallback se fornecido
    if (fallback) return fallback;
    
    // Para VITE_ENVIRONMENT, usar 'development' como padrão
    if (key === 'VITE_ENVIRONMENT') {
      return 'development';
    }
    
    throw new Error(`Variável de ambiente ${key} não encontrada`);
  } catch (error) {
    console.warn(`Erro ao acessar variável ${key}:`, error);
    if (fallback) return fallback;
    if (key === 'VITE_ENVIRONMENT') return 'development';
    throw error;
  }
}

// Configurações do Supabase
export const SUPABASE_CONFIG = {
  url: getEnvVar('VITE_SUPABASE_URL', 'https://taxmrpkppjmbxuwlielt.supabase.co'),
  anonKey: getEnvVar('VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRheG1ycGtwcGptYnh1d2xpZWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3Mjg4MDcsImV4cCI6MjA3MjMwNDgwN30.5vyi8svRVDxDYRNB6qoCj-H9OuwTsWa1GFgSoHoexMI'),
  environment: getEnvVar('VITE_ENVIRONMENT', 'development')
};

// Validação das configurações
export function validateSupabaseConfig() {
  if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
    throw new Error('Configurações do Supabase incompletas. Verifique as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY');
  }
  
  if (!SUPABASE_CONFIG.url.includes('supabase.co')) {
    throw new Error('URL do Supabase inválida');
  }
  
  return true;
}

// Log das configurações (sem expor dados sensíveis)
export function logConfigStatus() {
  console.log('🔧 Configurações do Sistema Meu Bentin:');
  console.log(`   Environment: ${SUPABASE_CONFIG.environment}`);
  console.log(`   Supabase URL: ${SUPABASE_CONFIG.url.substring(0, 30)}...`);
  console.log(`   Supabase Key: ${SUPABASE_CONFIG.anonKey ? '✅ Configurada' : '❌ Não configurada'}`);
}