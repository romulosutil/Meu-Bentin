/**
 * Serviço principal do Supabase para o Sistema Meu Bentin
 * Versão SEM VENDEDOR - Remove todas as funções relacionadas a vendedores
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG, validateSupabaseConfig, logConfigStatus } from './envConfig';
import { getSupabaseClient } from './supabaseClient';
import { logTableNotFound, logDemoOperation, conditionalLog } from './demoModeLogger';

// Tipos de banco de dados (sem vendedor)
export interface DbProduto {
  id: string;
  nome: string;
  categoria_id?: string;
  categoria?: string;
  preco: number;
  preco_custo: number;
  quantidade_estoque: number;
  estoque_minimo: number;
  tamanho?: string;
  cor?: string;
  marca?: string;
  fornecedor?: string;
  codigo_barras?: string;
  descricao?: string;
  ativo: boolean;
  image_url?: string;
  tamanhos?: string[];
  genero?: string;
  cores?: string[];
  tipo_tecido?: string;
  created_at: string;
  updated_at: string;
}

export interface DbVenda {
  id: string;
  cliente_id?: string;
  cliente_nome?: string;
  cliente_telefone?: string;
  data_venda: string;
  subtotal: number;
  desconto: number;
  total: number;
  forma_pagamento: string;
  status: 'pendente' | 'concluida' | 'cancelada';
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface DbItemVenda {
  id: string;
  venda_id: string;
  produto_id: string;
  produto_nome: string;
  quantidade: number;
  preco_unitario: number;
  desconto_item: number;
  subtotal: number;
}

export interface DbCategoria {
  id: string;
  nome: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbConfiguracao {
  id: string;
  chave: string;
  valor: string;
  tipo: 'string' | 'number' | 'json' | 'boolean';
  descricao?: string;
  created_at: string;
  updated_at: string;
}

// Tipos do frontend (compatibilidade)
export interface Produto {
  id: string;
  nome: string;
  categoria: string;
  preco: number;
  precoCusto: number;
  quantidade: number;
  estoqueMinimo: number;
  tamanho?: string;
  cor?: string;
  marca?: string;
  fornecedor?: string;
  codigoBarras?: string;
  descricao?: string;
  dataAtualizacao: string;
  ativo: boolean;
  imageUrl?: string;
  tamanhos?: string[];
  genero?: string;
  cores?: string[];
  tipoTecido?: string;
}

export interface Venda {
  id: string;
  produtoId: string;
  nomeProduto: string;
  quantidade: number;
  precoUnitario: number;
  precoTotal: number;
  vendedor: string; // Mantido para compatibilidade - sempre "Venda Direta"
  categoria: string;
  formaPagamento: 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix' | 'transferencia' | 'outros';
  desconto: number;
  data: string;
  observacoes?: string;
  cliente?: string;
  cliente_id?: string;
}

export interface Meta {
  id: string;
  mes: string;
  ano: number;
  valorMeta: number;
  vendedor: string; // Mantido para compatibilidade - sempre "Loja"
  ativa: boolean;
  titulo?: string;
}

// Classe principal do serviço (sem vendedores)
class SupabaseService {
  private client: SupabaseClient;

  constructor() {
    this.client = getSupabaseClient();
  }

  // ============= PRODUTOS =============
  async getProdutos(): Promise<Produto[]> {
    try {
      const { data: dbProdutos, error } = await this.client
        .from('produtos')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) {
        console.error('Erro ao buscar produtos:', error);
        throw error;
      }

      return (dbProdutos || []).map(this.dbToFrontendProduto);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      throw error;
    }
  }

  async addProduto(produto: Omit<Produto, 'id' | 'dataAtualizacao'>): Promise<Produto> {
    try {
      const dbProduto: Omit<DbProduto, 'id' | 'created_at' | 'updated_at'> = {
        nome: produto.nome,
        categoria: produto.categoria,
        preco: produto.preco,
        preco_custo: produto.precoCusto,
        quantidade_estoque: produto.quantidade,
        estoque_minimo: produto.estoqueMinimo,
        tamanho: produto.tamanho,
        cor: produto.cor,
        marca: produto.marca,
        fornecedor: produto.fornecedor,
        codigo_barras: produto.codigoBarras,
        descricao: produto.descricao,
        ativo: produto.ativo,
        image_url: produto.imageUrl,
        tamanhos: produto.tamanhos,
        genero: produto.genero,
        cores: produto.cores,
        tipo_tecido: produto.tipoTecido
      };

      const { data, error } = await this.client
        .from('produtos')
        .insert([dbProduto])
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar produto:', error);
        throw error;
      }

      return this.dbToFrontendProduto(data);
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      throw error;
    }
  }

  async updateProduto(produto: Produto): Promise<Produto> {
    try {
      const dbProduto: Partial<DbProduto> = {
        nome: produto.nome,
        categoria: produto.categoria,
        preco: produto.preco,
        preco_custo: produto.precoCusto,
        quantidade_estoque: produto.quantidade,
        estoque_minimo: produto.estoqueMinimo,
        tamanho: produto.tamanho,
        cor: produto.cor,
        marca: produto.marca,
        fornecedor: produto.fornecedor,
        codigo_barras: produto.codigoBarras,
        descricao: produto.descricao,
        ativo: produto.ativo,
        image_url: produto.imageUrl,
        tamanhos: produto.tamanhos,
        genero: produto.genero,
        cores: produto.cores,
        tipo_tecido: produto.tipoTecido
      };

      const { data, error } = await this.client
        .from('produtos')
        .update(dbProduto)
        .eq('id', produto.id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar produto:', error);
        throw error;
      }

      return this.dbToFrontendProduto(data);
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      throw error;
    }
  }

  async deleteProduto(id: string): Promise<void> {
    try {
      const { error } = await this.client
        .from('produtos')
        .update({ ativo: false })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao remover produto:', error);
      throw new Error('Falha ao remover produto');
    }
  }

  // ============= VENDAS (sem vendedor) =============
  async getVendas(): Promise<Venda[]> {
    try {
      const { data: dbVendas, error } = await this.client
        .from('vendas')
        .select(`
          *,
          itens_venda (*)
        `)
        .eq('status', 'concluida')
        .order('data_venda', { ascending: false });

      if (error) {
        console.error('Erro ao buscar vendas:', error);
        throw error;
      }

      const vendas: Venda[] = [];
      
      for (const dbVenda of dbVendas || []) {
        for (const item of dbVenda.itens_venda || []) {
          vendas.push({
            id: `${dbVenda.id}-${item.id}`,
            produtoId: item.produto_id || '',
            nomeProduto: item.produto_nome,
            quantidade: item.quantidade,
            precoUnitario: item.preco_unitario,
            precoTotal: item.subtotal,
            vendedor: 'Venda Direta', // Valor fixo
            categoria: 'Produto',
            formaPagamento: this.convertFormaPagamento(dbVenda.forma_pagamento),
            desconto: dbVenda.desconto,
            data: dbVenda.data_venda,
            observacoes: dbVenda.observacoes,
            cliente: dbVenda.cliente_nome,
            cliente_id: dbVenda.cliente_id
          });
        }
      }

      return vendas;
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
      throw error;
    }
  }

  async addVenda(venda: Omit<Venda, 'id'>): Promise<Venda> {
    try {
      // Inserir venda principal (sem vendedor_id)
      const dbVenda: Omit<DbVenda, 'id' | 'created_at' | 'updated_at'> = {
        cliente_id: venda.cliente_id,
        cliente_nome: venda.cliente,
        data_venda: venda.data,
        subtotal: venda.precoTotal,
        desconto: venda.desconto,
        total: venda.precoTotal,
        forma_pagamento: venda.formaPagamento,
        status: 'concluida',
        observacoes: venda.observacoes
      };

      const { data: vendaData, error: vendaError } = await this.client
        .from('vendas')
        .insert([dbVenda])
        .select()
        .single();

      if (vendaError) {
        console.error('Erro ao adicionar venda:', vendaError);
        throw vendaError;
      }

      // Inserir item da venda
      const dbItem: Omit<DbItemVenda, 'id'> = {
        venda_id: vendaData.id,
        produto_id: venda.produtoId,
        produto_nome: venda.nomeProduto,
        quantidade: venda.quantidade,
        preco_unitario: venda.precoUnitario,
        desconto_item: 0,
        subtotal: venda.precoTotal
      };

      const { data: itemData, error: itemError } = await this.client
        .from('itens_venda')
        .insert([dbItem])
        .select()
        .single();

      if (itemError) {
        console.warn('⚠️ Erro ao adicionar itens da venda, mas venda foi criada');
        return {
          ...venda,
          id: vendaData.id,
          vendedor: 'Venda Direta'
        };
      }

      return {
        ...venda,
        id: vendaData.id,
        vendedor: 'Venda Direta'
      };
    } catch (error) {
      console.error('Erro ao adicionar venda:', error);
      throw error;
    }
  }

  async deleteVenda(id: string): Promise<void> {
    try {
      // Primeiro buscar a venda para obter o venda_id real
      const [vendaIdReal] = id.split('-'); // id pode ter formato "vendaId-itemId"
      
      const { error } = await this.client
        .from('vendas')
        .update({ status: 'cancelada' })
        .eq('id', vendaIdReal);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao remover venda:', error);
      throw new Error('Falha ao remover venda');
    }
  }

  // ============= CATEGORIAS =============
  async getCategorias(): Promise<string[]> {
    try {
      const { data: dbCategorias, error } = await this.client
        .from('categorias')
        .select('nome')
        .eq('ativa', true)
        .order('nome');

      if (error) {
        console.error('Erro ao buscar categorias:', error);
        throw error;
      }

      return (dbCategorias || []).map(c => c.nome);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      throw error;
    }
  }

  async addCategoria(nome: string): Promise<string> {
    try {
      const { data: existente, error: selectError } = await this.client
        .from('categorias')
        .select('id')
        .eq('nome', nome)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        console.error('Erro ao verificar categoria existente:', selectError);
        throw selectError;
      }

      if (existente) {
        return nome;
      }

      const { error } = await this.client
        .from('categorias')
        .insert([{ nome, ativa: true }]);

      if (error) {
        console.error('Erro ao adicionar categoria:', error);
        throw error;
      }

      return nome;
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error);
      throw error;
    }
  }

  async deleteCategoria(nome: string): Promise<void> {
    try {
      const { error } = await this.client
        .from('categorias')
        .update({ ativa: false })
        .eq('nome', nome);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao remover categoria:', error);
      throw new Error('Falha ao remover categoria');
    }
  }

  // ============= METAS (sem vendedor específico) =============
  async getMetas(): Promise<Meta[]> {
    try {
      const { data: configs, error } = await this.client
        .from('configuracoes')
        .select('*')
        .like('chave', 'meta_%');

      if (error) {
        console.error('Erro ao buscar metas:', error);
        throw error;
      }

      const metas: Meta[] = [];
      for (const config of configs || []) {
        if (config.tipo === 'json' && config.valor) {
          try {
            const metaData = JSON.parse(config.valor);
            metas.push({
              id: config.id,
              mes: metaData.mes,
              ano: metaData.ano,
              valorMeta: metaData.valorMeta,
              vendedor: 'Loja', // Valor fixo
              ativa: metaData.ativa || true,
              titulo: metaData.titulo
            });
          } catch {
            // Ignorar configurações inválidas
          }
        }
      }

      return metas;
    } catch (error) {
      console.error('Erro ao buscar metas:', error);
      throw error;
    }
  }

  async addMeta(meta: Omit<Meta, 'id'>): Promise<Meta> {
    try {
      const metaData = {
        mes: meta.mes,
        ano: meta.ano,
        valorMeta: meta.valorMeta,
        vendedor: 'Loja',
        ativa: meta.ativa,
        titulo: meta.titulo
      };

      const config: Omit<DbConfiguracao, 'id' | 'created_at' | 'updated_at'> = {
        chave: `meta_${meta.mes}_${meta.ano}`,
        valor: JSON.stringify(metaData),
        tipo: 'json',
        descricao: `Meta para ${meta.mes}/${meta.ano}`
      };

      const { data, error } = await this.client
        .from('configuracoes')
        .insert([config])
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar meta:', error);
        throw error;
      }

      return {
        id: data.id,
        ...metaData
      };
    } catch (error) {
      console.error('Erro ao adicionar meta:', error);
      throw error;
    }
  }

  async updateMeta(meta: Meta): Promise<Meta> {
    try {
      const metaData = {
        mes: meta.mes,
        ano: meta.ano,
        valorMeta: meta.valorMeta,
        vendedor: 'Loja',
        ativa: meta.ativa,
        titulo: meta.titulo
      };

      const { data, error } = await this.client
        .from('configuracoes')
        .update({
          valor: JSON.stringify(metaData),
          chave: `meta_${meta.mes}_${meta.ano}`,
          descricao: `Meta para ${meta.mes}/${meta.ano}`
        })
        .eq('id', meta.id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar meta:', error);
        throw error;
      }

      return {
        id: data.id,
        ...metaData
      };
    } catch (error) {
      console.error('Erro ao atualizar meta:', error);
      throw error;
    }
  }

  async deleteMeta(id: string): Promise<void> {
    try {
      const { error } = await this.client
        .from('configuracoes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao remover meta:', error);
      throw new Error('Falha ao remover meta');
    }
  }

  // ============= UTILIDADES =============
  private dbToFrontendProduto(dbProduto: DbProduto): Produto {
    return {
      id: dbProduto.id,
      nome: dbProduto.nome,
      categoria: dbProduto.categoria || 'Sem categoria',
      preco: dbProduto.preco,
      precoCusto: dbProduto.preco_custo,
      quantidade: dbProduto.quantidade_estoque,
      estoqueMinimo: dbProduto.estoque_minimo,
      tamanho: dbProduto.tamanho,
      cor: dbProduto.cor,
      marca: dbProduto.marca,
      fornecedor: dbProduto.fornecedor,
      codigoBarras: dbProduto.codigo_barras,
      descricao: dbProduto.descricao,
      dataAtualizacao: dbProduto.updated_at,
      ativo: dbProduto.ativo,
      imageUrl: dbProduto.image_url,
      tamanhos: dbProduto.tamanhos,
      genero: dbProduto.genero,
      cores: dbProduto.cores,
      tipoTecido: dbProduto.tipo_tecido
    };
  }

  private convertFormaPagamento(dbForma: string): Venda['formaPagamento'] {
    const conversoes: { [key: string]: Venda['formaPagamento'] } = {
      'dinheiro': 'dinheiro',
      'cartao_credito': 'cartao_credito',
      'cartao_debito': 'cartao_debito',
      'pix': 'pix',
      'transferencia': 'transferencia'
    };
    
    return conversoes[dbForma] || 'outros';
  }
}

// Instância singleton
export const supabaseService = new SupabaseService();

// Exports para compatibilidade
export type { Produto, Venda, Meta };