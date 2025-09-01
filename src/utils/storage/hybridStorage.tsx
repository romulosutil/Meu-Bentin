import { AUTH_CONFIG } from '../local/constants'
import { isDevelopment } from '../env'

// Mock das funções do Supabase para build sem dependências
const isSupabaseAvailable = async () => false
const isSupabaseConfigured = () => false
const testSupabaseConnection = async () => ({ connected: false, message: 'Build mode - localStorage only' })
const isSupabaseIntegrated = false

// Interface para operações de storage híbrido
export interface HybridStorageService {
  get: (key: string) => Promise<any>
  set: (key: string, value: any) => Promise<void>
  remove: (key: string) => Promise<void>
  getMultiple: (keys: string[]) => Promise<any[]>
  setMultiple: (items: Array<{ key: string; value: any }>) => Promise<void>
}

// Implementação localStorage como fallback
class LocalStorageService implements HybridStorageService {
  async get(key: string): Promise<any> {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error('Erro ao ler localStorage:', error)
      return null
    }
  }

  async set(key: string, value: any): Promise<void> {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Erro ao salvar localStorage:', error)
      throw error
    }
  }

  async remove(key: string): Promise<void> {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Erro ao remover localStorage:', error)
      throw error
    }
  }

  async getMultiple(keys: string[]): Promise<any[]> {
    const results = await Promise.all(keys.map(key => this.get(key)))
    return results
  }

  async setMultiple(items: Array<{ key: string; value: any }>): Promise<void> {
    await Promise.all(items.map(item => this.set(item.key, item.value)))
  }
}

// Mock da implementação Supabase (desabilitada para build)
class SupabaseStorageService implements HybridStorageService {
  async get(key: string): Promise<any> {
    throw new Error('Supabase desabilitado para build')
  }

  async set(key: string, value: any): Promise<void> {
    throw new Error('Supabase desabilitado para build')
  }

  async remove(key: string): Promise<void> {
    throw new Error('Supabase desabilitado para build')
  }

  async getMultiple(keys: string[]): Promise<any[]> {
    throw new Error('Supabase desabilitado para build')
  }

  async setMultiple(items: Array<{ key: string; value: any }>): Promise<void> {
    throw new Error('Supabase desabilitado para build')
  }
}

// Serviço híbrido que usa Supabase quando disponível e localStorage como fallback
class HybridStorage implements HybridStorageService {
  private localService = new LocalStorageService()
  private supabaseService = new SupabaseStorageService()
  private useSupabase = false

  constructor() {
    this.checkSupabaseAvailability()
  }

  private async checkSupabaseAvailability() {
    if (isSupabaseIntegrated) {
      this.useSupabase = await isSupabaseAvailable()
      
      if (isDevelopment()) {
        const testResult = await testSupabaseConnection()
        console.log(`🗄️ Storage configurado: ${this.useSupabase ? 'Supabase (integração Vercel)' : 'localStorage (fallback)'}`)
        console.log(`📡 Teste de conectividade: ${testResult.message}`)
        if (testResult.details) {
          console.log('📊 Detalhes:', testResult.details)
        }
      }
    } else {
      console.log('🔧 Integração Vercel-Supabase não detectada, usando localStorage')
    }
  }

  async get(key: string): Promise<any> {
    try {
      if (this.useSupabase) {
        return await this.supabaseService.get(key)
      }
    } catch (error) {
      console.warn('Fallback para localStorage devido a erro no Supabase:', error)
      this.useSupabase = false
    }
    
    return await this.localService.get(key)
  }

  async set(key: string, value: any): Promise<void> {
    // Sempre salvar no localStorage primeiro para garantir disponibilidade
    await this.localService.set(key, value)
    
    try {
      if (this.useSupabase) {
        await this.supabaseService.set(key, value)
      }
    } catch (error) {
      console.warn('Erro ao sincronizar com Supabase, dados salvos localmente:', error)
      this.useSupabase = false
    }
  }

  async remove(key: string): Promise<void> {
    // Remover do localStorage
    await this.localService.remove(key)
    
    try {
      if (this.useSupabase) {
        await this.supabaseService.remove(key)
      }
    } catch (error) {
      console.warn('Erro ao remover do Supabase, removido localmente:', error)
    }
  }

  async getMultiple(keys: string[]): Promise<any[]> {
    try {
      if (this.useSupabase) {
        return await this.supabaseService.getMultiple(keys)
      }
    } catch (error) {
      console.warn('Fallback para localStorage devido a erro no Supabase:', error)
      this.useSupabase = false
    }
    
    return await this.localService.getMultiple(keys)
  }

  async setMultiple(items: Array<{ key: string; value: any }>): Promise<void> {
    // Sempre salvar no localStorage primeiro
    await this.localService.setMultiple(items)
    
    try {
      if (this.useSupabase) {
        await this.supabaseService.setMultiple(items)
      }
    } catch (error) {
      console.warn('Erro ao sincronizar múltiplos com Supabase, dados salvos localmente:', error)
      this.useSupabase = false
    }
  }

  // Método para forçar sincronização
  async syncToSupabase(): Promise<boolean> {
    if (!isSupabaseIntegrated) {
      console.log('🔗 Integração Vercel-Supabase não detectada para sincronização')
      return false
    }

    try {
      // Tentar reconectar
      this.useSupabase = await isSupabaseAvailable()
      
      if (this.useSupabase) {
        console.log('✅ Sincronização com Supabase disponível')
        return true
      } else {
        console.log('❌ Supabase não disponível para sincronização')
      }
    } catch (error) {
      console.error('💥 Erro ao tentar sincronizar com Supabase:', error)
    }
    
    return false
  }

  // Método para diagnóstico da integração
  async getIntegrationStatus(): Promise<{
    integrated: boolean
    connected: boolean
    usingSupabase: boolean
    connectionTest?: any
  }> {
    const connectionTest = isSupabaseIntegrated ? await testSupabaseConnection() : null
    
    return {
      integrated: isSupabaseIntegrated,
      connected: connectionTest?.connected || false,
      usingSupabase: this.useSupabase,
      connectionTest
    }
  }
}

// Instância singleton do storage híbrido
export const storage = new HybridStorage()

// Chaves de storage específicas para o Meu Bentin
export const STORAGE_KEYS = {
  AUTH: AUTH_CONFIG.storageKey,
  ESTOQUE: 'meu-bentin-estoque',
  VENDAS: 'meu-bentin-vendas',
  RECEITA: 'meu-bentin-receita',
  METAS: 'meu-bentin-metas',
  VENDEDORES: 'meu-bentin-vendedores',
  CONFIGURACOES: 'meu-bentin-configuracoes'
} as const