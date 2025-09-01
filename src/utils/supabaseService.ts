/**
 * Serviço principal do Supabase para o Sistema Meu Bentin
 * Substitui o localStorage por operações reais do banco de dados
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG, validateSupabaseConfig, logConfigStatus } from './envConfig';
import { logTableNotFound, logDemoOperation, conditionalLog } from './demoModeLogger';

// Tipos de banco de dados baseados na estrutura existente
export interface DbProduto {
  id: string;
  nome: string;
  categoria_id?: string;
  categoria?: string; // Compatibilidade
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
  created_at: string;
  updated_at: string;
}

export interface DbVenda {
  id: string;
  vendedor_id?: string;
  vendedor?: string; // Compatibilidade
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
  produto_id?: string;
  produto_nome: string;
  quantidade: number;
  preco_unitario: number;
  desconto_item: number;
  subtotal: number;
}

export interface DbCategoria {
  id: string;
  nome: string;
  descricao?: string;
  cor?: string;
  ativa: boolean;
  created_at: string;
}

export interface DbVendedor {
  id: string;
  nome: string;
  telefone?: string;
  email?: string;
  comissao_percentual: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbHistoricoEstoque {
  id: string;
  produto_id: string;
  tipo_movimento: 'entrada' | 'saida' | 'ajuste';
  quantidade_anterior: number;
  quantidade_movimento: number;
  quantidade_nova: number;
  motivo?: string;
  observacoes?: string;
  venda_id?: string;
  created_at: string;
}

// Tipos para compatibilidade com o sistema existente
export interface Produto {
  id: string;
  nome: string;
  categoria: string;
  preco: number;
  custo: number;
  quantidade: number;
  minimo: number;
  vendedor: string;
  cor?: string;
  tamanho?: string;
  marca?: string;
  descricao?: string;
  ativo: boolean;
  dataAtualizacao: string;
  emPromocao?: boolean;
  precoPromocional?: number;
  estoqueMinimo?: number;
}

export interface Venda {
  id: string;
  produtoId: string;
  nomeProduto: string;
  quantidade: number;
  precoUnitario: number;
  precoTotal: number;
  vendedor: string;
  categoria: string;
  formaPagamento: 'dinheiro' | 'cartao-debito' | 'cartao-credito' | 'pix' | 'parcelado';
  desconto: number;
  data: string;
  observacoes?: string;
}

export interface Meta {
  id: string;
  mes: string;
  ano: number;
  valorMeta: number;
  vendedor: string;
  ativa: boolean;
}

class SupabaseService {
  private client: SupabaseClient;

  constructor() {
    try {
      // Validar configurações
      validateSupabaseConfig();
      
      // Log do status da configuração
      logConfigStatus();
      
      // Criar cliente Supabase
      this.client = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
      
      console.log('✅ Serviço Supabase inicializado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao inicializar Supabase:', error);
      throw error;
    }
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

      // Converter do formato do banco para o formato do sistema
      return (dbProdutos || []).map(this.convertDbProdutoToProduto);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      throw error;
    }
  }

  async adicionarProduto(produto: Omit<Produto, 'id' | 'dataAtualizacao'>): Promise<Produto> {
    try {
      const dbProduto: Omit<DbProduto, 'id' | 'created_at' | 'updated_at'> = {
        nome: produto.nome,
        categoria: produto.categoria,
        preco: produto.preco,
        preco_custo: produto.custo,
        quantidade_estoque: produto.quantidade,
        estoque_minimo: produto.minimo,
        tamanho: produto.tamanho,
        cor: produto.cor,
        marca: produto.marca,
        descricao: produto.descricao,
        ativo: produto.ativo
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

      return this.convertDbProdutoToProduto(data);
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      throw error;
    }
  }

  async atualizarProduto(produto: Produto): Promise<Produto> {
    try {
      const dbProduto: Partial<DbProduto> = {
        nome: produto.nome,
        categoria: produto.categoria,
        preco: produto.preco,
        preco_custo: produto.custo,
        quantidade_estoque: produto.quantidade,
        estoque_minimo: produto.minimo,
        tamanho: produto.tamanho,
        cor: produto.cor,
        marca: produto.marca,
        descricao: produto.descricao,
        ativo: produto.ativo
      };

      const { data, error } = await this.client
        .from('produtos')
        .update(dbProduto)
        .eq('id', produto.id)
        .select()
        .single();

      if (error) throw error;

      return this.convertDbProdutoToProduto(data);
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      throw new Error('Falha ao atualizar produto');
    }
  }

  async removerProduto(id: string): Promise<void> {
    try {
      // Soft delete - apenas marcar como inativo
      const { error } = await this.client
        .from('produtos')
        .update({ ativo: false })
        .eq('id', id);

      if (error) {
        console.error('Erro ao remover produto:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erro ao remover produto:', error);
      throw error;
    }
  }

  // ============= VENDAS =============
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

      // Converter vendas complexas para o formato simples do sistema antigo
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
            vendedor: dbVenda.vendedor || 'Vendedor',
            categoria: 'Produto', // Será preenchido depois se necessário
            formaPagamento: this.convertFormaPagamento(dbVenda.forma_pagamento),
            desconto: dbVenda.desconto,
            data: dbVenda.data_venda,
            observacoes: dbVenda.observacoes
          });
        }
      }

      return vendas;
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
      throw error;
    }
  }

  async adicionarVenda(venda: Omit<Venda, 'id'>): Promise<Venda> {
    try {
      // Inserir venda principal
      const dbVenda: Omit<DbVenda, 'id' | 'created_at' | 'updated_at'> = {
        vendedor: venda.vendedor,
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
        // Se erro nos itens, ainda assim retornar a venda criada
        console.warn('⚠️ Erro ao adicionar itens da venda, mas venda foi criada');
        return {
          ...venda,
          id: vendaData.id
        };
      }

      return {
        ...venda,
        id: `${vendaData.id}-${itemData.id}`
      };
    } catch (error) {
      console.error('Erro ao adicionar venda:', error);
      throw error;
    }
  }

  async removerVenda(id: string): Promise<void> {
    try {
      // Extrair ID da venda do formato combinado
      const vendaId = id.split('-')[0];
      
      const { error } = await this.client
        .from('vendas')
        .update({ status: 'cancelada' })
        .eq('id', vendaId);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao remover venda:', error);
      throw new Error('Falha ao cancelar venda');
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

      return (dbCategorias || []).map(cat => cat.nome);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      throw error;
    }
  }

  async adicionarCategoria(nome: string): Promise<void> {
    try {
      // Verificar se já existe
      const { data: existente, error: selectError } = await this.client
        .from('categorias')
        .select('id')
        .eq('nome', nome)
        .single();

      // Se erro ao verificar existência
      if (selectError && selectError.code !== 'PGRST116') { // PGRST116 = not found (esperado)
        console.error('Erro ao verificar categoria existente:', selectError);
        throw selectError;
      }

      if (existente) {
        return; // Já existe
      }

      const { error } = await this.client
        .from('categorias')
        .insert([{ nome, ativa: true }]);

      if (error) {
        console.error('Erro ao adicionar categoria:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error);
      throw error;
    }
  }

  async removerCategoria(nome: string): Promise<void> {
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

  // ============= VENDEDORES =============
  async getVendedores(): Promise<string[]> {
    try {
      const { data: dbVendedores, error } = await this.client
        .from('vendedores')
        .select('nome')
        .eq('ativo', true)
        .order('nome');

      if (error) {
        console.error('Erro ao buscar vendedores:', error);
        throw error;
      }

      return (dbVendedores || []).map(v => v.nome);
    } catch (error) {
      console.error('Erro ao buscar vendedores:', error);
      throw error;
    }
  }

  async adicionarVendedor(nome: string): Promise<void> {
    try {
      // Verificar se já existe
      const { data: existente, error: selectError } = await this.client
        .from('vendedores')
        .select('id')
        .eq('nome', nome)
        .single();

      // Se erro ao verificar existência
      if (selectError && selectError.code !== 'PGRST116') { // PGRST116 = not found (esperado)
        console.error('Erro ao verificar vendedor existente:', selectError);
        throw selectError;
      }

      if (existente) {
        return; // Já existe
      }

      const { error } = await this.client
        .from('vendedores')
        .insert([{ nome, ativo: true, comissao_percentual: 0 }]);

      if (error) {
        console.error('Erro ao adicionar vendedor:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erro ao adicionar vendedor:', error);
      throw error;
    }
  }

  async removerVendedor(nome: string): Promise<void> {
    try {
      const { error } = await this.client
        .from('vendedores')
        .update({ ativo: false })
        .eq('nome', nome);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao remover vendedor:', error);
      throw new Error('Falha ao remover vendedor');
    }
  }

  // ============= METAS (usando configurações) =============
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
              vendedor: metaData.vendedor,
              ativa: metaData.ativa || true
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

  async adicionarMeta(meta: Omit<Meta, 'id'>): Promise<Meta> {
    try {
      const chave = `meta_${meta.vendedor}_${meta.ano}_${meta.mes}`;
      const valor = JSON.stringify(meta);

      const { data, error } = await this.client
        .from('configuracoes')
        .insert([{
          chave,
          valor,
          tipo: 'json',
          descricao: `Meta de ${meta.mes}/${meta.ano} para ${meta.vendedor}`
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar meta:', error);
        throw error;
      }

      return {
        ...meta,
        id: data.id
      };
    } catch (error) {
      console.error('Erro ao adicionar meta:', error);
      throw error;
    }
  }

  async atualizarMeta(meta: Meta): Promise<Meta> {
    try {
      const valor = JSON.stringify({
        mes: meta.mes,
        ano: meta.ano,
        valorMeta: meta.valorMeta,
        vendedor: meta.vendedor,
        ativa: meta.ativa
      });

      const { data, error } = await this.client
        .from('configuracoes')
        .update({ valor })
        .eq('id', meta.id)
        .select()
        .single();

      if (error) throw error;

      return meta;
    } catch (error) {
      console.error('Erro ao atualizar meta:', error);
      throw new Error('Falha ao atualizar meta');
    }
  }

  async removerMeta(id: string): Promise<void> {
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

  // ============= MÉTODOS AUXILIARES =============
  private convertDbProdutoToProduto(dbProduto: DbProduto): Produto {
    return {
      id: dbProduto.id,
      nome: dbProduto.nome,
      categoria: dbProduto.categoria || 'Sem categoria',
      preco: dbProduto.preco,
      custo: dbProduto.preco_custo,
      quantidade: dbProduto.quantidade_estoque,
      minimo: dbProduto.estoque_minimo,
      vendedor: 'Naila', // Valor padrão para compatibilidade
      cor: dbProduto.cor,
      tamanho: dbProduto.tamanho,
      marca: dbProduto.marca,
      descricao: dbProduto.descricao,
      ativo: dbProduto.ativo,
      dataAtualizacao: dbProduto.updated_at,
      emPromocao: false, // Pode ser implementado depois
      precoPromocional: undefined,
      estoqueMinimo: dbProduto.estoque_minimo
    };
  }

  private convertFormaPagamento(dbFormaPagamento: string): 'dinheiro' | 'cartao-debito' | 'cartao-credito' | 'pix' | 'parcelado' {
    switch (dbFormaPagamento.toLowerCase()) {
      case 'dinheiro':
      case 'espécie':
        return 'dinheiro';
      case 'cartao-debito':
      case 'débito':
      case 'debito':
        return 'cartao-debito';
      case 'cartao-credito':
      case 'crédito':
      case 'credito':
        return 'cartao-credito';
      case 'pix':
        return 'pix';
      case 'parcelado':
        return 'parcelado';
      default:
        return 'dinheiro';
    }
  }

  // ============= RELATÓRIOS E ANÁLISES =============
  async getVendasPorPeriodo(dataInicio: string, dataFim: string) {
    try {
      const { data, error } = await this.client
        .rpc('get_vendas_por_periodo', {
          data_inicio: dataInicio,
          data_fim: dataFim
        });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar vendas por período:', error);
      return [];
    }
  }

  async getTopProdutos(limite: number = 10) {
    try {
      const { data, error } = await this.client
        .rpc('get_top_produtos', { limit_count: limite });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar top produtos:', error);
      return [];
    }
  }

  async getVendasPorVendedor() {
    try {
      const { data, error } = await this.client
        .rpc('get_vendas_por_vendedor');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar vendas por vendedor:', error);
      return [];
    }
  }

  // ============= MÉTODOS DE FALLBACK/EXEMPLO =============
  private getProdutosExemplo(): Produto[] {
    return [
      {
        id: 'exemplo-1',
        nome: 'Camiseta Unicórnio',
        categoria: 'Camisetas',
        preco: 29.90,
        custo: 15.00,
        quantidade: 25,
        minimo: 5,
        vendedor: 'Naila',
        cor: 'Rosa',
        tamanho: 'P',
        marca: 'Meu Bentin',
        descricao: 'Camiseta infantil com estampa de unicórnio',
        ativo: true,
        dataAtualizacao: new Date().toISOString()
      },
      {
        id: 'exemplo-2',
        nome: 'Vestido Princesa',
        categoria: 'Vestidos',
        preco: 59.90,
        custo: 30.00,
        quantidade: 12,
        minimo: 3,
        vendedor: 'Naila',
        cor: 'Rosa',
        tamanho: '4-5 anos',
        marca: 'Meu Bentin',
        descricao: 'Vestido de princesa para meninas',
        ativo: true,
        dataAtualizacao: new Date().toISOString()
      },
      {
        id: 'exemplo-3',
        nome: 'Short Jeans',
        categoria: 'Shorts',
        preco: 34.90,
        custo: 18.00,
        quantidade: 28,
        minimo: 5,
        vendedor: 'Naila',
        cor: 'Azul',
        tamanho: 'M',
        marca: 'Meu Bentin',
        descricao: 'Short jeans infantil',
        ativo: true,
        dataAtualizacao: new Date().toISOString()
      }
    ];
  }

  private simularCriacaoProduto(produto: Omit<Produto, 'id' | 'dataAtualizacao'>): Produto {
    return {
      ...produto,
      id: `sim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      dataAtualizacao: new Date().toISOString()
    };
  }

  private getVendasExemplo(): Venda[] {
    return [
      {
        id: 'venda-exemplo-1',
        produtoId: 'exemplo-1',
        nomeProduto: 'Camiseta Unicórnio',
        quantidade: 1,
        precoUnitario: 29.90,
        precoTotal: 29.90,
        vendedor: 'Naila',
        categoria: 'Camisetas',
        formaPagamento: 'pix',
        desconto: 0,
        data: new Date().toISOString(),
        observacoes: 'Venda de exemplo'
      },
      {
        id: 'venda-exemplo-2',
        produtoId: 'exemplo-2',
        nomeProduto: 'Vestido Princesa',
        quantidade: 1,
        precoUnitario: 59.90,
        precoTotal: 59.90,
        vendedor: 'Maria Silva',
        categoria: 'Vestidos',
        formaPagamento: 'cartao-credito',
        desconto: 5.00,
        data: new Date(Date.now() - 86400000).toISOString(), // Ontem
        observacoes: 'Venda de exemplo'
      }
    ];
  }

  private getMetasExemplo(): Meta[] {
    const hoje = new Date();
    const mesAtual = hoje.toLocaleDateString('pt-BR', { month: 'long' });
    const anoAtual = hoje.getFullYear();
    
    return [
      {
        id: 'meta-exemplo-1',
        mes: mesAtual,
        ano: anoAtual,
        valorMeta: 5000.00,
        vendedor: 'Naila',
        ativa: true
      },
      {
        id: 'meta-exemplo-2',
        mes: mesAtual,
        ano: anoAtual,
        valorMeta: 3000.00,
        vendedor: 'Maria Silva',
        ativa: true
      }
    ];
  }

  private simularCriacaoMeta(meta: Omit<Meta, 'id'>): Meta {
    return {
      ...meta,
      id: `meta-sim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  }

  private simularCriacaoVenda(venda: Omit<Venda, 'id'>): Venda {
    return {
      ...venda,
      id: `venda-sim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  }
}

// Instância singleton do serviço
export const supabaseService = new SupabaseService();