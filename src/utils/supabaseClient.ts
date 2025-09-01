import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase - substituir pelas suas próprias URLs e chaves
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project-url.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Criar cliente do Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

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
    const { data, error } = await supabase.from('usuarios').select('*');
    return { data, error };
  },

  async createUsuario(usuario: Omit<Usuario, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase.from('usuarios').insert(usuario).select();
    return { data, error };
  },

  // Produtos
  async getProdutos() {
    const { data, error } = await supabase.from('produtos').select('*').order('nome');
    return { data, error };
  },

  async createProduto(produto: Omit<Produto, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase.from('produtos').insert(produto).select();
    return { data, error };
  },

  async updateProduto(id: string, updates: Partial<Produto>) {
    const { data, error } = await supabase.from('produtos').update(updates).eq('id', id).select();
    return { data, error };
  },

  async deleteProduto(id: string) {
    const { data, error } = await supabase.from('produtos').delete().eq('id', id);
    return { data, error };
  },

  // Vendas
  async getVendas(startDate?: string, endDate?: string) {
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
    const { data: vendaData, error: vendaError } = await supabase.from('vendas').insert(venda).select().single();
    
    if (vendaError) return { data: null, error: vendaError };

    const itensComVendaId = itens.map(item => ({ ...item, venda_id: vendaData.id }));
    const { data: itensData, error: itensError } = await supabase.from('itens_venda').insert(itensComVendaId).select();

    if (itensError) return { data: null, error: itensError };

    return { data: { venda: vendaData, itens: itensData }, error: null };
  },

  // Categorias
  async getCategorias() {
    const { data, error } = await supabase.from('categorias').select('*').order('nome');
    return { data, error };
  },

  async createCategoria(categoria: Omit<Categoria, 'id' | 'created_at'>) {
    const { data, error } = await supabase.from('categorias').insert(categoria).select();
    return { data, error };
  },

  // Vendedores
  async getVendedores() {
    const { data, error } = await supabase.from('vendedores').select('*').order('nome');
    return { data, error };
  },

  async createVendedor(vendedor: Omit<Vendedor, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase.from('vendedores').insert(vendedor).select();
    return { data, error };
  },

  // Análises e Relatórios
  async getVendasPorPeriodo(startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('vendas')
      .select('data_venda, total, vendedor')
      .gte('data_venda', startDate)
      .lte('data_venda', endDate)
      .order('data_venda');
    
    return { data, error };
  },

  async getTopProdutos(limit = 10) {
    const { data, error } = await supabase.rpc('get_top_produtos', { limit_count: limit });
    return { data, error };
  },

  async getVendasPorVendedor() {
    const { data, error } = await supabase.rpc('get_vendas_por_vendedor');
    return { data, error };
  }
};

export default supabase;