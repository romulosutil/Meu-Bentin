/* INTEGRAÇÃO VERCEL-SUPABASE - CONFIGURAÇÃO AUTOMÁTICA */

import { supabaseConfig, appConfig, isDevelopment } from '../env';

// Informações do app
export const APP_NAME = appConfig.name
export const APP_VERSION = appConfig.version
export const AUTH_STORAGE_KEY = "meu-bentin-auth"
export const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 horas

// Configurações do Supabase usando o utilitário seguro
export const projectId = supabaseConfig.getProjectId()
export const publicAnonKey = supabaseConfig.anonKey
export const supabaseUrl = supabaseConfig.url
export const serviceRoleKey = supabaseConfig.serviceRoleKey

// Verificar se a integração está ativa
export const isSupabaseIntegrated = supabaseConfig.isConfigured()

// Log de configuração (apenas em desenvolvimento)
if (typeof window !== 'undefined' && isDevelopment()) {
  console.log('🔗 Status da Integração Supabase:', {
    integrado: isSupabaseIntegrated,
    projectId: projectId !== 'local' ? projectId : 'Não configurado',
    hasAnonKey: !!publicAnonKey,
    hasServiceRole: !!serviceRoleKey
  })
}