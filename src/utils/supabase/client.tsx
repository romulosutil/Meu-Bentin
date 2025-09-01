import { supabaseUrl, publicAnonKey, isSupabaseIntegrated } from './info'

// Mock do cliente Supabase para evitar dependências em build
export const supabase = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    signInWithPassword: () => Promise.resolve({ data: { session: null }, error: new Error('Supabase não configurado') }),
    signOut: () => Promise.resolve({ error: null })
  },
  from: () => ({
    select: () => Promise.resolve({ data: null, error: new Error('Supabase não configurado') }),
    insert: () => Promise.resolve({ data: null, error: new Error('Supabase não configurado') }),
    update: () => Promise.resolve({ data: null, error: new Error('Supabase não configurado') }),
    delete: () => Promise.resolve({ data: null, error: new Error('Supabase não configurado') })
  })
}

// Função para verificar se o Supabase está disponível e funcionando
export const isSupabaseAvailable = async (): Promise<boolean> => {
  return false // Sempre retorna false no modo mock
}

// Verificar se o Supabase está configurado via integração Vercel
export const isSupabaseConfigured = (): boolean => {
  return false // Sempre retorna false no modo mock
}

// Função para teste de conectividade mais robusta
export const testSupabaseConnection = async (): Promise<{
  connected: boolean
  message: string
  details?: any
}> => {
  return {
    connected: false,
    message: 'Supabase desabilitado para build - usando localStorage',
    details: {
      mode: 'local-only',
      storage: 'localStorage'
    }
  }
}