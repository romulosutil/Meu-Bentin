/**
 * Serviço principal do Supabase para o Sistema Meu Bentin
 * Versão SEM VENDEDOR - Remove todas as funções relacionadas a vendedores
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG, validateSupabaseConfig, logConfigStatus } from './envConfig';
import { getSupabaseClient } from './supabaseClient';
import { logTableNotFound, logDemoOperation, conditionalLog } from './demoModeLogger';

// Tipos de banco de dados (sem vendedor) - Apenas colunas existentes na tabela atual
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
  created_at: string;
  updated_at: string;
  // Colunas extras adicionadas:
  image_url?: string;
  tamanhos?: string[];
  genero?: string;
  cores?: string[];
  tipo_tecido?: string;
  sku?: string;
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

export interface DbMeta {
  id: string;
  valor: number;
  mes: string;
  ano: number;
  data_inicio: string;
  data_fim: string;
  ativo: boolean;
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
  sku?: string;
}

export interface Meta {
  id: string;
  valor: number;
  mes: string;
  ano: number;
  dataInicio: Date;
  dataFim: Date;
  ativo: boolean;
  criada: Date;
  atualizada: Date;
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

export interface CapitalGiro {
  id?: string;
  valorInicial: number;
  dataConfiguracao: Date;
  historico: Array<{
    data: Date;
    valor: number;
    tipo: 'inicial' | 'retirada' | 'aporte';
    descricao: string;
  }>;
}

export interface MovimentacaoCaixa {
  id?: string;
  tipo: 'investimento' | 'retirada' | 'perda' | 'venda';
  descricao?: string;
  valor: number;
  venda_id?: string;
  criado_em?: string;
}

// Classe principal do serviço (sem vendedores)
class SupabaseService {
  private client: SupabaseClient;
  private isConfigured: boolean;

  constructor() {
    try {
      console.log('🔧 [SupabaseService] Inicializando constructor...');
      this.client = getSupabaseClient();
      console.log('🔧 [SupabaseService] Cliente obtido:', !!this.client);
      
      this.isConfigured = validateSupabaseConfig();
      console.log('🔧 [SupabaseService] Configuração validada:', this.isConfigured);
      
      // Log das funções de meta disponíveis
      console.log('🔧 [SupabaseService] Funções de meta disponíveis:', {
        obterMetas: typeof this.obterMetas,
        criarMeta: typeof this.criarMeta,
        criarOuAtualizarMeta: typeof this.criarOuAtualizarMeta
      });
      
    } catch (error) {
      console.warn('⚠️ [SupabaseService] Erro ao inicializar:', error);
      this.isConfigured = false;
      try {
        // Tentar obter cliente mesmo com erro
        this.client = getSupabaseClient();
      } catch (clientError) {
        console.error('❌ [SupabaseService] Erro ao obter cliente:', clientError);
      }
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

      return (dbProdutos || []).map(this.dbToFrontendProduto);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      throw error;
    }
  }

  async addProduto(produto: Omit<Produto, 'id' | 'dataAtualizacao'>): Promise<Produto> {
    try {
      // Incluir todas as colunas, incluindo as extras
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
        // Campos extras agora incluídos:
        image_url: produto.imageUrl,
        tamanhos: produto.tamanhos,
        genero: produto.genero,
        cores: produto.cores,
        tipo_tecido: produto.tipoTecido,
        sku: produto.sku
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
      // Incluir todas as colunas, incluindo as extras
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
        // Campos extras agora incluídos:
        image_url: produto.imageUrl,
        tamanhos: produto.tamanhos,
        genero: produto.genero,
        cores: produto.cores,
        tipo_tecido: produto.tipoTecido,
        sku: produto.sku
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
      // Garantir que data_venda está sempre presente e no formato correto
      const dataVenda = venda.data || new Date().toISOString();
      
      console.log('🔄 Adicionando venda:', {
        cliente: venda.cliente,
        produto: venda.nomeProduto,
        data_venda: dataVenda
      });
      
      // Inserir venda principal (sem vendedor_id)
      const dbVenda: Omit<DbVenda, 'id' | 'created_at' | 'updated_at'> = {
        cliente_id: venda.cliente_id || null,
        cliente_nome: venda.cliente || 'Cliente não informado',
        data_venda: dataVenda,
        subtotal: venda.precoTotal || 0,
        desconto: venda.desconto || 0,
        total: venda.precoTotal || 0,
        forma_pagamento: venda.formaPagamento || 'dinheiro',
        status: 'concluida',
        observacoes: venda.observacoes || null
      };

      const { data: vendaData, error: vendaError } = await this.client
        .from('vendas')
        .insert([dbVenda])
        .select()
        .single();

      if (vendaError) {
        console.error('❌ Erro SQL ao inserir venda:', vendaError);
        throw vendaError;
      }

      console.log('✅ Venda principal criada:', vendaData.id);

      // Inserir item da venda
      const dbItem: Omit<DbItemVenda, 'id'> = {
        venda_id: vendaData.id,
        produto_id: venda.produtoId || 'produto-indefinido',
        produto_nome: venda.nomeProduto || 'Produto não informado',
        quantidade: venda.quantidade || 1,
        preco_unitario: venda.precoUnitario || 0,
        desconto_item: 0,
        subtotal: venda.precoTotal || 0
      };

      const { data: itemData, error: itemError } = await this.client
        .from('itens_venda')
        .insert([dbItem])
        .select()
        .single();

      if (itemError) {
        console.warn('⚠️ Erro ao adicionar itens da venda, mas venda foi criada:', itemError);
        // Mesmo com erro no item, retornar a venda como criada
        return {
          ...venda,
          id: vendaData.id,
          vendedor: 'Venda Direta',
          data: dataVenda
        };
      }

      console.log('✅ Item da venda criado:', itemData.id);

      return {
        ...venda,
        id: vendaData.id,
        vendedor: 'Venda Direta',
        data: dataVenda
      };
    } catch (error) {
      console.error('❌ Erro crítico ao adicionar venda:', error);
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
      precoCusto: dbProduto.preco_custo || 0,
      quantidade: dbProduto.quantidade_estoque,
      estoqueMinimo: dbProduto.estoque_minimo || 0,
      tamanho: dbProduto.tamanho || '',
      cor: dbProduto.cor || '',
      marca: dbProduto.marca || '',
      fornecedor: dbProduto.fornecedor || '',
      codigoBarras: dbProduto.codigo_barras || '',
      descricao: dbProduto.descricao || '',
      dataAtualizacao: dbProduto.updated_at,
      ativo: dbProduto.ativo ?? true,
      // Campos extras agora mapeados corretamente
      imageUrl: dbProduto.image_url || '',
      tamanhos: dbProduto.tamanhos || [],
      genero: dbProduto.genero || 'unissex',
      cores: dbProduto.cores || [],
      tipoTecido: dbProduto.tipo_tecido || '',
      sku: dbProduto.sku || ''
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

  // ============= UPLOAD DE IMAGENS =============
  async uploadImage(file: File): Promise<string> {
    try {
      if (!this.isConfigured) {
        throw new Error('Supabase não configurado');
      }

      // Validar arquivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Tipo de arquivo não suportado. Use: JPG, PNG ou WebP');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Arquivo muito grande. Tamanho máximo: 5MB');
      }

      // Preparar FormData
      const formData = new FormData();
      formData.append('file', file);

      // Fazer upload via API
      const response = await fetch(`${SUPABASE_CONFIG.url}/functions/v1/make-server-f57293e2/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro no upload');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Erro no upload');
      }

      return result.imageUrl;
    } catch (error) {
      console.error('Erro no upload de imagem:', error);
      throw error;
    }
  }

  async deleteImage(fileName: string): Promise<void> {
    try {
      if (!this.isConfigured) {
        throw new Error('Supabase não configurado');
      }

      const response = await fetch(`${SUPABASE_CONFIG.url}/functions/v1/make-server-f57293e2/delete-image/${fileName}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao deletar imagem');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Erro ao deletar imagem');
      }
    } catch (error) {
      console.error('Erro ao deletar imagem:', error);
      throw error;
    }
  }

  // ============= CAIXA =============
  async buscarMovimentacoesCaixa(): Promise<{ sucesso: boolean; dados?: MovimentacaoCaixa[]; erro?: string }> {
    try {
      if (!this.isConfigured || !this.client) {
        logDemoOperation('Buscar Movimentações Caixa', {});
        return { sucesso: true, dados: [] };
      }

      const { data, error } = await this.client
        .from('caixa_movimentacoes')
        .select('*')
        .order('criado_em', { ascending: false });

      if (error) {
        console.error('Erro ao buscar movimentações do caixa:', error);
        return { sucesso: false, erro: error.message };
      }

      return { sucesso: true, dados: data || [] };
    } catch (error) {
      console.error('Erro ao buscar movimentações do caixa:', error);
      return { sucesso: false, erro: 'Erro interno' };
    }
  }

  async adicionarMovimentacaoCaixa(movimentacao: Omit<MovimentacaoCaixa, 'id' | 'criado_em'>): Promise<{ sucesso: boolean; dados?: MovimentacaoCaixa; erro?: string }> {
    try {
      if (!this.isConfigured || !this.client) {
        logDemoOperation('Adicionar Movimentação Caixa', movimentacao);
        const movDemo: MovimentacaoCaixa = {
          id: `demo_${Date.now()}`,
          ...movimentacao,
          criado_em: new Date().toISOString()
        };
        return { sucesso: true, dados: movDemo };
      }

      const { data, error } = await this.client
        .from('caixa_movimentacoes')
        .insert([movimentacao])
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar movimentação do caixa:', error);
        return { sucesso: false, erro: error.message };
      }

      return { sucesso: true, dados: data };
    } catch (error) {
      console.error('Erro ao adicionar movimentação do caixa:', error);
      return { sucesso: false, erro: 'Erro interno' };
    }
  }

  async calcularDashboardCaixa(): Promise<{ sucesso: boolean; dados?: any; erro?: string }> {
    try {
      if (!this.isConfigured || !this.client) {
        logDemoOperation('Calcular Dashboard Caixa', {});
        return {
          sucesso: true,
          dados: {
            balancoAtual: 0,
            lucroPrejuizo: 0,
            projecaoLucro: 0,
            totalInvestimentos: 0,
            totalRetiradas: 0,
            totalPerdas: 0,
            totalVendas: 0
          }
        };
      }

      // Buscar movimentações para calcular balanço
      const { data: movimentacoes, error: errorMov } = await this.client
        .from('caixa_movimentacoes')
        .select('tipo, valor');

      if (errorMov) {
        console.error('Erro ao buscar movimentações para dashboard:', errorMov);
        return { sucesso: false, erro: errorMov.message };
      }

      // Buscar vendas concluídas para calcular total de vendas
      const { data: vendas, error: errorVendas } = await this.client
        .from('vendas')
        .select('total')
        .eq('status', 'concluida');

      if (errorVendas) {
        console.error('Erro ao buscar vendas para dashboard:', errorVendas);
        return { sucesso: false, erro: errorVendas.message };
      }

      // Buscar produtos para calcular projeção
      const { data: produtos, error: errorProdutos } = await this.client
        .from('produtos')
        .select('preco, preco_custo, quantidade_estoque')
        .eq('ativo', true);

      if (errorProdutos) {
        console.error('Erro ao buscar produtos para dashboard:', errorProdutos);
        return { sucesso: false, erro: errorProdutos.message };
      }

      // Calcular totais por tipo
      let totalInvestimentos = 0;
      let totalRetiradas = 0;
      let totalPerdas = 0;
      
      for (const mov of movimentacoes || []) {
        switch (mov.tipo) {
          case 'investimento':
            totalInvestimentos += mov.valor;
            break;
          case 'retirada':
            totalRetiradas += mov.valor;
            break;
          case 'perda':
            totalPerdas += mov.valor;
            break;
        }
      }

      // Calcular total de vendas
      const totalVendas = (vendas || []).reduce((sum, venda) => sum + venda.total, 0);

      // Calcular balanço atual
      const balancoAtual = totalInvestimentos + totalVendas - totalRetiradas - totalPerdas;

      // Calcular projeção de lucro (valor de venda do estoque - custo do estoque)
      let valorVendaEstoque = 0;
      let custoEstoque = 0;
      
      for (const produto of produtos || []) {
        const quantidade = produto.quantidade_estoque || 0;
        valorVendaEstoque += (produto.preco || 0) * quantidade;
        custoEstoque += (produto.preco_custo || 0) * quantidade;
      }
      
      const projecaoLucro = valorVendaEstoque - custoEstoque;

      return {
        sucesso: true,
        dados: {
          balancoAtual,
          lucroPrejuizo: balancoAtual, // Mesmo valor para simplicidade
          projecaoLucro,
          totalInvestimentos,
          totalRetiradas,
          totalPerdas,
          totalVendas
        }
      };
    } catch (error) {
      console.error('Erro ao calcular dashboard do caixa:', error);
      return { sucesso: false, erro: 'Erro interno' };
    }
  }

  // ==========================================
  // CRUD PARA METAS
  // ==========================================

  async criarMeta(meta: Omit<Meta, 'id' | 'criada' | 'atualizada'>): Promise<Meta> {
    try {
      if (!this.isConfigured || !this.client) {
        logDemoOperation('Criar Meta', meta);
        const metaDemo: Meta = {
          id: `demo_${Date.now()}`,
          ...meta,
          criada: new Date(),
          atualizada: new Date()
        };
        return metaDemo;
      }

      // Converter dados do frontend para formato DB
      const metaDb: Omit<DbMeta, 'id' | 'created_at' | 'updated_at'> = {
        valor: meta.valor,
        mes: meta.mes,
        ano: meta.ano,
        data_inicio: meta.dataInicio.toISOString(),
        data_fim: meta.dataFim.toISOString(),
        ativo: meta.ativo
      };

      const { data, error } = await this.client
        .from('metas')
        .insert(metaDb)
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar meta:', error);
        throw new Error(`Erro ao criar meta: ${error.message}`);
      }

      return this.convertDbMetaToMeta(data);
    } catch (error) {
      console.error('Erro ao criar meta:', error);
      throw error;
    }
  }

  async obterMetas(): Promise<Meta[]> {
    try {
      console.log('🔍 [SupabaseService] Iniciando obterMetas...');
      console.log('🔍 [SupabaseService] isConfigured:', this.isConfigured);
      console.log('🔍 [SupabaseService] client existe:', !!this.client);
      
      if (!this.isConfigured || !this.client) {
        console.log('🔍 [SupabaseService] Modo demo ativado - configuração inválida');
        logDemoOperation('Listar Metas', {});
        return [];
      }

      console.log('🔍 [SupabaseService] Fazendo query para tabela metas...');
      const { data, error } = await this.client
        .from('metas')
        .select('*')
        .eq('ativo', true)
        .order('ano', { ascending: false })
        .order('mes', { ascending: false });

      console.log('🔍 [SupabaseService] Resultado da query:', { data, error });

      if (error) {
        console.error('❌ [SupabaseService] Erro na query de metas:', error);
        throw new Error(`Erro ao obter metas: ${error.message}`);
      }

      const metas = (data || []).map(this.convertDbMetaToMeta);
      console.log('🔍 [SupabaseService] Metas convertidas:', metas);
      
      return metas;
    } catch (error) {
      console.error('❌ [SupabaseService] Erro geral em obterMetas:', error);
      throw error;
    }
  }

  async obterMetaPorMesAno(mes: string, ano: number): Promise<Meta | null> {
    try {
      if (!this.isConfigured || !this.client) {
        logDemoOperation('Obter Meta por Mês/Ano', { mes, ano });
        return null;
      }

      const { data, error } = await this.client
        .from('metas')
        .select('*')
        .eq('mes', mes)
        .eq('ano', ano)
        .eq('ativo', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Nenhum registro encontrado
          return null;
        }
        console.error('Erro ao obter meta por mês/ano:', error);
        throw new Error(`Erro ao obter meta: ${error.message}`);
      }

      return this.convertDbMetaToMeta(data);
    } catch (error) {
      console.error('Erro ao obter meta por mês/ano:', error);
      throw error;
    }
  }

  async atualizarMeta(id: string, metaAtualizada: Partial<Omit<Meta, 'id' | 'criada' | 'atualizada'>>): Promise<Meta> {
    try {
      if (!this.isConfigured || !this.client) {
        logDemoOperation('Atualizar Meta', { id, ...metaAtualizada });
        throw new Error('Modo demo: atualização de meta não implementada');
      }

      // Converter dados do frontend para formato DB
      const metaDb: Partial<DbMeta> = {};
      
      if (metaAtualizada.valor !== undefined) metaDb.valor = metaAtualizada.valor;
      if (metaAtualizada.mes !== undefined) metaDb.mes = metaAtualizada.mes;
      if (metaAtualizada.ano !== undefined) metaDb.ano = metaAtualizada.ano;
      if (metaAtualizada.dataInicio !== undefined) metaDb.data_inicio = metaAtualizada.dataInicio.toISOString();
      if (metaAtualizada.dataFim !== undefined) metaDb.data_fim = metaAtualizada.dataFim.toISOString();
      if (metaAtualizada.ativo !== undefined) metaDb.ativo = metaAtualizada.ativo;

      metaDb.updated_at = new Date().toISOString();

      const { data, error } = await this.client
        .from('metas')
        .update(metaDb)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar meta:', error);
        throw new Error(`Erro ao atualizar meta: ${error.message}`);
      }

      return this.convertDbMetaToMeta(data);
    } catch (error) {
      console.error('Erro ao atualizar meta:', error);
      throw error;
    }
  }

  async criarOuAtualizarMeta(mes: string, ano: number, valor: number): Promise<Meta> {
    try {
      // Verificar se já existe uma meta para este mês/ano
      const metaExistente = await this.obterMetaPorMesAno(mes, ano);

      if (metaExistente) {
        // Atualizar meta existente
        return await this.atualizarMeta(metaExistente.id, { valor });
      } else {
        // Criar nova meta
        const primeiroDia = new Date(ano, this.getMesNumero(mes), 1);
        const ultimoDia = new Date(ano, this.getMesNumero(mes) + 1, 0);

        return await this.criarMeta({
          valor,
          mes,
          ano,
          dataInicio: primeiroDia,
          dataFim: ultimoDia,
          ativo: true
        });
      }
    } catch (error) {
      console.error('Erro ao criar ou atualizar meta:', error);
      throw error;
    }
  }

  private getMesNumero(nomeMes: string): number {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return meses.indexOf(nomeMes);
  }

  private convertDbMetaToMeta(dbMeta: DbMeta): Meta {
    return {
      id: dbMeta.id,
      valor: dbMeta.valor,
      mes: dbMeta.mes,
      ano: dbMeta.ano,
      dataInicio: new Date(dbMeta.data_inicio),
      dataFim: new Date(dbMeta.data_fim),
      ativo: dbMeta.ativo,
      criada: new Date(dbMeta.created_at),
      atualizada: new Date(dbMeta.updated_at)
    };
  }

  // ==========================================
  // CRUD PARA CAPITAL DE GIRO
  // ==========================================

  async getCapitalGiro(): Promise<CapitalGiro | null> {
    try {
      if (!this.isConfigured || !this.client) {
        // Retornar dados demo do localStorage se disponível
        const stored = localStorage.getItem('meuBentin-capitalGiro');
        return stored ? JSON.parse(stored) : null;
      }

      const { data, error } = await this.client
        .from('capital_giro')
        .select('*')
        .order('data_configuracao', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Nenhum registro encontrado
          return null;
        }
        console.error('Erro ao buscar capital de giro:', error);
        return null;
      }

      return {
        id: data.id,
        valorInicial: data.valor_inicial,
        dataConfiguracao: new Date(data.data_configuracao),
        historico: data.historico || []
      };
    } catch (error) {
      console.error('Erro ao buscar capital de giro:', error);
      return null;
    }
  }

  async saveCapitalGiro(capitalGiro: CapitalGiro): Promise<CapitalGiro> {
    try {
      if (!this.isConfigured || !this.client) {
        // Salvar no localStorage em modo demo
        const capitalComId = { ...capitalGiro, id: capitalGiro.id || `capital_${Date.now()}` };
        localStorage.setItem('meuBentin-capitalGiro', JSON.stringify(capitalComId));
        logDemoOperation('Salvar Capital de Giro', capitalComId);
        return capitalComId;
      }

      const capitalData = {
        valor_inicial: capitalGiro.valorInicial,
        data_configuracao: capitalGiro.dataConfiguracao.toISOString(),
        historico: capitalGiro.historico
      };

      if (capitalGiro.id) {
        // Atualizar existente
        const { data, error } = await this.client
          .from('capital_giro')
          .update(capitalData)
          .eq('id', capitalGiro.id)
          .select()
          .single();

        if (error) {
          console.error('Erro ao atualizar capital de giro:', error);
          throw new Error(`Erro ao atualizar capital de giro: ${error.message}`);
        }

        return {
          id: data.id,
          valorInicial: data.valor_inicial,
          dataConfiguracao: new Date(data.data_configuracao),
          historico: data.historico || []
        };
      } else {
        // Criar novo
        const { data, error } = await this.client
          .from('capital_giro')
          .insert([capitalData])
          .select()
          .single();

        if (error) {
          console.error('Erro ao criar capital de giro:', error);
          throw new Error(`Erro ao criar capital de giro: ${error.message}`);
        }

        return {
          id: data.id,
          valorInicial: data.valor_inicial,
          dataConfiguracao: new Date(data.data_configuracao),
          historico: data.historico || []
        };
      }
    } catch (error) {
      console.error('Erro ao salvar capital de giro:', error);
      throw error;
    }
  }
}

// Instância singleton
export const supabaseService = new SupabaseService();

// Exports para compatibilidade
export type { Produto, Venda, Meta, DbMeta, CapitalGiro };