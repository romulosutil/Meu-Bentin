/**
 * Sistema de persistência local para o Sistema Meu Bentin
 * Totalmente baseado em localStorage - sem dependências externas
 */

export interface StorageKeys {
  produtos: 'meu-bentin-produtos';
  vendas: 'meu-bentin-vendas';
  categorias: 'meu-bentin-categorias';
  vendedores: 'meu-bentin-vendedores';
  metas: 'meu-bentin-metas';
  configuracoes: 'meu-bentin-config';
}

export const STORAGE_KEYS: StorageKeys = {
  produtos: 'meu-bentin-produtos',
  vendas: 'meu-bentin-vendas',
  categorias: 'meu-bentin-categorias',
  vendedores: 'meu-bentin-vendedores',
  metas: 'meu-bentin-metas',
  configuracoes: 'meu-bentin-config'
};

/**
 * Utilitário para gerenciar localStorage de forma type-safe
 */
export class LocalStorage {
  /**
   * Salva dados no localStorage
   */
  static save<T>(key: keyof StorageKeys, data: T): void {
    try {
      const storageKey = STORAGE_KEYS[key];
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
      console.error(`Erro ao salvar no localStorage (${key}):`, error);
    }
  }

  /**
   * Carrega dados do localStorage
   */
  static load<T>(key: keyof StorageKeys, defaultValue: T): T {
    try {
      const storageKey = STORAGE_KEYS[key];
      const item = localStorage.getItem(storageKey);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Erro ao carregar do localStorage (${key}):`, error);
      return defaultValue;
    }
  }

  /**
   * Remove dados do localStorage
   */
  static remove(key: keyof StorageKeys): void {
    try {
      const storageKey = STORAGE_KEYS[key];
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error(`Erro ao remover do localStorage (${key}):`, error);
    }
  }

  /**
   * Limpa todos os dados do Meu Bentin
   */
  static clearAll(): void {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Erro ao limpar localStorage:', error);
    }
  }

  /**
   * Verifica se uma chave existe no localStorage
   */
  static exists(key: keyof StorageKeys): boolean {
    try {
      const storageKey = STORAGE_KEYS[key];
      return localStorage.getItem(storageKey) !== null;
    } catch (error) {
      console.error(`Erro ao verificar localStorage (${key}):`, error);
      return false;
    }
  }

  /**
   * Obtém informações sobre o uso do localStorage
   */
  static getUsageInfo() {
    try {
      let totalSize = 0;
      const details: Record<string, number> = {};

      Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
        const item = localStorage.getItem(storageKey);
        const size = item ? new Blob([item]).size : 0;
        details[key] = size;
        totalSize += size;
      });

      return {
        totalSize,
        details,
        totalSizeFormatted: `${(totalSize / 1024).toFixed(2)} KB`
      };
    } catch (error) {
      console.error('Erro ao calcular uso do localStorage:', error);
      return { totalSize: 0, details: {}, totalSizeFormatted: '0 KB' };
    }
  }
}