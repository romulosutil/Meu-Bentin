import { AUTH_CONFIG } from '../local/constants'

// Chaves de storage definidas primeiro para evitar problemas de inicialização
const createStorageKeys = () => {
  try {
    return {
      AUTH: AUTH_CONFIG?.storageKey || 'meu-bentin-auth',
      ESTOQUE: 'meu-bentin-estoque',
      VENDAS: 'meu-bentin-vendas', 
      RECEITA: 'meu-bentin-receita',
      METAS: 'meu-bentin-metas',
      VENDEDORES: 'meu-bentin-vendedores',
      CONFIGURACOES: 'meu-bentin-configuracoes',
      DASHBOARD: 'meu-bentin-dashboard'
    } as const
  } catch {
    return {
      AUTH: 'meu-bentin-auth',
      ESTOQUE: 'meu-bentin-estoque',
      VENDAS: 'meu-bentin-vendas',
      RECEITA: 'meu-bentin-receita',
      METAS: 'meu-bentin-metas',
      VENDEDORES: 'meu-bentin-vendedores',
      CONFIGURACOES: 'meu-bentin-configuracoes',
      DASHBOARD: 'meu-bentin-dashboard'
    } as const
  }
}

export const STORAGE_KEYS = createStorageKeys()

// Sistema de storage simplificado e otimizado
export interface StorageService {
  get: (key: string) => Promise<any>
  set: (key: string, value: any) => Promise<void>
  remove: (key: string) => Promise<void>
  clear: () => Promise<void>
}

class OptimizedLocalStorage implements StorageService {
  private cache = new Map<string, any>()
  private initialized = false

  constructor() {
    // Inicialização segura após um tick
    if (typeof window !== 'undefined') {
      setTimeout(() => this.safeInitializeCache(), 0)
    }
  }

  private safeInitializeCache() {
    if (this.initialized) return
    
    try {
      // Usar apenas as chaves definidas estaticamente
      const keys = [
        'meu-bentin-auth',
        'meu-bentin-estoque',
        'meu-bentin-vendas',
        'meu-bentin-receita',
        'meu-bentin-metas',
        'meu-bentin-vendedores',
        'meu-bentin-configuracoes',
        'meu-bentin-dashboard'
      ]
      
      keys.forEach(key => {
        try {
          const item = localStorage.getItem(key)
          if (item) {
            try {
              this.cache.set(key, JSON.parse(item))
            } catch {
              this.cache.set(key, item)
            }
          }
        } catch (error) {
          // Log silencioso por key
          console.warn(`Key ${key} erro:`, error.message)
        }
      })
      
      this.initialized = true
      console.log('✅ Cache de storage inicializado com sucesso')
    } catch (error) {
      console.warn('⚠️ Inicialização parcial do cache:', error.message)
      this.initialized = true // Continuar mesmo com erros
    }
  }

  async get(key: string): Promise<any> {
    // Verificar cache primeiro para melhor performance
    if (this.cache.has(key)) {
      return this.cache.get(key)
    }

    try {
      const item = localStorage.getItem(key)
      if (item === null) return null
      
      const parsed = JSON.parse(item)
      this.cache.set(key, parsed) // Atualizar cache
      return parsed
    } catch (error) {
      console.error(`❌ Erro ao ler storage [${key}]:`, error)
      return null
    }
  }

  async set(key: string, value: any): Promise<void> {
    try {
      const serialized = JSON.stringify(value)
      localStorage.setItem(key, serialized)
      this.cache.set(key, value) // Atualizar cache
    } catch (error) {
      console.error(`❌ Erro ao salvar storage [${key}]:`, error)
      throw error
    }
  }

  async remove(key: string): Promise<void> {
    try {
      localStorage.removeItem(key)
      this.cache.delete(key) // Remover do cache
    } catch (error) {
      console.error(`❌ Erro ao remover storage [${key}]:`, error)
      throw error
    }
  }

  async clear(): Promise<void> {
    try {
      // Limpar apenas chaves do Meu Bentin com verificação segura
      const keys = STORAGE_KEYS ? Object.values(STORAGE_KEYS) : []
      keys.forEach(key => {
        if (key) {
          localStorage.removeItem(key)
          this.cache.delete(key)
        }
      })
    } catch (error) {
      console.error('❌ Erro ao limpar storage:', error)
      throw error
    }
  }

  // Métodos de diagnóstico
  getStorageSize(): number {
    try {
      let totalSize = 0
      const keys = STORAGE_KEYS ? Object.values(STORAGE_KEYS) : []
      keys.forEach(key => {
        if (!key) return
        try {
          const item = localStorage.getItem(key)
          if (item) {
            totalSize += new Blob([item]).size
          }
        } catch {
          // Silencioso se houver erro em uma key específica
        }
      })
      return totalSize
    } catch {
      return 0
    }
  }

  getCacheStats() {
    return {
      cacheSize: this.cache.size,
      initialized: this.initialized,
      storageSize: this.getStorageSize()
    }
  }
}

// Instância singleton otimizada
export const storage = new OptimizedLocalStorage()

// Log de inicialização
console.log('🗄️ Sistema de storage otimizado inicializado')

// Log de stats após inicialização (sem dependência de process.env)
setTimeout(() => {
  try {
    console.log('📊 Storage stats:', storage.getCacheStats())
  } catch (error) {
    console.warn('⚠️ Erro ao obter stats do storage:', error)
  }
}, 2000)