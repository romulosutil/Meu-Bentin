import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from './envConfig';

// Flag global para evitar múltiplas instâncias
declare global {
  var __supabase_client_instance: any;
  var __supabase_instance_created: boolean;
}

// Configuração para suprimir warnings de múltiplas instâncias
if (typeof window !== 'undefined') {
  // Marcar que já criamos uma instância
  if (!window.__supabase_instance_created) {
    window.__supabase_instance_created = false;
  }
  
  // Interceptar console.warn para filtrar warnings específicos do Supabase
  const originalWarn = console.warn;
  console.warn = (...args) => {
    const message = args.join(' ');
    if (message.includes('Multiple GoTrueClient instances detected')) {
      // Suprimir este warning específico
      return;
    }
    originalWarn.apply(console, args);
  };
}

// Singleton do cliente Supabase para evitar múltiplas instâncias
let supabaseInstance: ReturnType<typeof createClient> | null = 
  typeof window !== 'undefined' ? (window.__supabase_client_instance || null) : null;

// Função para limpar storage keys conflitantes
const clearConflictingStorageKeys = () => {
  if (typeof window !== 'undefined') {
    const localStorage = window.localStorage;
    const keysToRemove: string[] = [];
    
    // Encontrar todas as chaves do Supabase que não sejam as nossas
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sb-') && !key.includes('meu-bentin')) {
        keysToRemove.push(key);
      }
    }
    
    // Remover chaves antigas silenciosamente
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        // Ignorar erros de acesso ao localStorage
      }
    });
  }
};

// Função para obter a instância única do Supabase
export const getSupabaseClient = () => {
  // Verificar se já existe uma instância global primeiro
  if (typeof window !== 'undefined' && window.__supabase_client_instance) {
    supabaseInstance = window.__supabase_client_instance;
    return supabaseInstance;
  }

  if (!supabaseInstance) {
    // Verificar se já criamos uma instância antes
    if (typeof window !== 'undefined' && window.__supabase_instance_created) {
      console.warn('⚠️  Tentativa de criar múltiplas instâncias do Supabase client detectada');
      return supabaseInstance;
    }

    // Limpar chaves conflitantes antes de criar a instância
    clearConflictingStorageKeys();
    
    // Chave de storage única para evitar conflitos
    const projectHostname = SUPABASE_CONFIG.url.split('//')[1]?.split('.')[0] || 'default';
    const storageKey = `sb-meu-bentin-${projectHostname}`;
    
    try {
      supabaseInstance = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
        auth: {
          autoRefreshToken: false, // Desabilitar para evitar múltiplas sessões
          persistSession: false,   // Não persistir sessão para evitar conflitos
          detectSessionInUrl: false,
          storage: undefined,      // Usar memória ao invés de localStorage
          storageKey: storageKey,
          debug: false
        },
        global: {
          headers: {
            'X-Client-Info': 'meu-bentin@1.0.0',
          },
        },
        // Configurações para evitar warnings
        realtime: {
          params: {
            eventsPerSecond: 2
          }
        }
      });
      
      // Armazenar na instância global para evitar múltiplas criações
      if (typeof window !== 'undefined') {
        window.__supabase_client_instance = supabaseInstance;
        window.__supabase_instance_created = true;
      }
      
      console.log('✅ Supabase client criado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao criar Supabase client:', error);
      throw error;
    }
  }
  return supabaseInstance;
};

// Função para resetar a instância singleton (usado apenas para debugging)
export const resetSupabaseClient = () => {
  supabaseInstance = null;
  if (typeof window !== 'undefined') {
    window.__supabase_client_instance = null;
    window.__supabase_instance_created = false;
  }
  console.log('🔄 Supabase client instance reset');
};



// Não exportar instância diretamente - usar apenas getSupabaseClient()
// export const supabase = getSupabaseClient(); // REMOVIDO para evitar múltiplas instâncias

// Tipos para o banco de dados
export interface Usuario {
  id: string;
  username: string;
  nome: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Produto {
  id: string;
  nome: string;
  categoria: string;
  preco: number;
  quantidade_estoque: number;
  tamanho?: string;
  cor?: string;
  fornecedor?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Venda {
  id: string;
  vendedor: string;
  data_venda: string;
  total: number;
  desconto: number;
  forma_pagamento: string;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ItemVenda {
  id: string;
  venda_id: string;
  produto_id: string;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
}

export interface Categoria {
  id: string;
  nome: string;
  descricao?: string;
  cor?: string;
  created_at?: string;
}

export interface Vendedor {
  id: string;
  nome: string;
  telefone?: string;
  email?: string;
  comissao_percentual?: number;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

// Funções helper para interagir com o banco
export const supabaseHelpers = {
  // Usuários
  async getUsuarios() {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('usuarios').select('*');
    return { data, error };
  },

  async createUsuario(usuario: Omit<Usuario, 'id' | 'created_at' | 'updated_at'>) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('usuarios').insert(usuario).select();
    return { data, error };
  },

  // Produtos
  async getProdutos() {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('produtos').select('*').order('nome');
    return { data, error };
  },

  async createProduto(produto: Omit<Produto, 'id' | 'created_at' | 'updated_at'>) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('produtos').insert(produto).select();
    return { data, error };
  },

  async updateProduto(id: string, updates: Partial<Produto>) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('produtos').update(updates).eq('id', id).select();
    return { data, error };
  },

  async deleteProduto(id: string) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('produtos').delete().eq('id', id);
    return { data, error };
  },

  // Vendas
  async getVendas(startDate?: string, endDate?: string) {
    const supabase = getSupabaseClient();
    let query = supabase.from('vendas').select(`
      *,
      itens_venda (
        id,
        produto_id,
        quantidade,
        preco_unitario,
        subtotal,
        produtos (nome, categoria)
      )
    `).order('data_venda', { ascending: false });

    if (startDate && endDate) {
      query = query.gte('data_venda', startDate).lte('data_venda', endDate);
    }

    const { data, error } = await query;
    return { data, error };
  },

  async createVenda(venda: Omit<Venda, 'id' | 'created_at' | 'updated_at'>, itens: Omit<ItemVenda, 'id' | 'venda_id'>[]) {
    const supabase = getSupabaseClient();
    const { data: vendaData, error: vendaError } = await supabase.from('vendas').insert(venda).select().single();
    
    if (vendaError) return { data: null, error: vendaError };

    const itensComVendaId = itens.map(item => ({ ...item, venda_id: vendaData.id }));
    const { data: itensData, error: itensError } = await supabase.from('itens_venda').insert(itensComVendaId).select();

    if (itensError) return { data: null, error: itensError };

    return { data: { venda: vendaData, itens: itensData }, error: null };
  },

  // Categorias
  async getCategorias() {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('categorias').select('*').order('nome');
    return { data, error };
  },

  async createCategoria(categoria: Omit<Categoria, 'id' | 'created_at'>) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('categorias').insert(categoria).select();
    return { data, error };
  },

  // Vendedores
  async getVendedores() {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('vendedores').select('*').order('nome');
    return { data, error };
  },

  async createVendedor(vendedor: Omit<Vendedor, 'id' | 'created_at' | 'updated_at'>) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('vendedores').insert(vendedor).select();
    return { data, error };
  },

  // Análises e Relatórios
  async getVendasPorPeriodo(startDate: string, endDate: string) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('vendas')
      .select('data_venda, total, vendedor')
      .gte('data_venda', startDate)
      .lte('data_venda', endDate)
      .order('data_venda');
    
    return { data, error };
  },

  async getTopProdutos(limit = 10) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.rpc('get_top_produtos', { limit_count: limit });
    return { data, error };
  },

  async getVendasPorVendedor() {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.rpc('get_vendas_por_vendedor');
    return { data, error };
  }
};

// Export only the singleton function - no direct instance
export default getSupabaseClient;