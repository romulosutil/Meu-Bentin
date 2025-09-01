/**
 * Utilitário para environment - versão simplificada
 */

// Função para verificar ambiente de desenvolvimento
export const isDevelopment = (): boolean => {
  // Sempre retornar false para builds de produção
  return false;
};

// Função para verificar ambiente de produção
export const isProduction = (): boolean => {
  // Sempre retornar true para builds de produção
  return true;
};

// Configurações da aplicação
export const appConfig = {
  name: 'Meu Bentin',
  version: '1.0.0',
  environment: 'production'
};

// Log de inicialização
console.log('🏪 Meu Bentin - Sistema iniciado');