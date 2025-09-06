/**
 * Contexto principal do Sistema Meu Bentin
 * 100% localStorage - Zero dependências externas
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { LocalStorage } from './localStorage';

// Tipos principais
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
  estoqueMinimo?: number; // Compatibilidade com componentes antigos
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

export interface EstoqueState {
  produtos: Produto[];
  vendas: Venda[];
  categorias: string[];
  vendedores: string[];
  metas: Meta[];
  loading: boolean;
  error: string | null;
}

// Ações do reducer
type EstoqueAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PRODUTOS'; payload: Produto[] }
  | { type: 'ADD_PRODUTO'; payload: Produto }
  | { type: 'UPDATE_PRODUTO'; payload: Produto }
  | { type: 'DELETE_PRODUTO'; payload: string }
  | { type: 'SET_VENDAS'; payload: Venda[] }
  | { type: 'ADD_VENDA'; payload: Venda }
  | { type: 'DELETE_VENDA'; payload: string }
  | { type: 'SET_CATEGORIAS'; payload: string[] }
  | { type: 'ADD_CATEGORIA'; payload: string }
  | { type: 'DELETE_CATEGORIA'; payload: string }
  | { type: 'SET_VENDEDORES'; payload: string[] }
  | { type: 'ADD_VENDEDOR'; payload: string }
  | { type: 'DELETE_VENDEDOR'; payload: string }
  | { type: 'SET_METAS'; payload: Meta[] }
  | { type: 'ADD_META'; payload: Meta }
  | { type: 'UPDATE_META'; payload: Meta }
  | { type: 'DELETE_META'; payload: string };

// Estado inicial
const initialState: EstoqueState = {
  produtos: [],
  vendas: [],
  categorias: ['Roupas', 'Calçados', 'Acessórios', 'Brinquedos'],
  vendedores: ['Naila', 'Vendedor 2'],
  metas: [],
  loading: false,
  error: null,
};

// Reducer
function estoqueReducer(state: EstoqueState, action: EstoqueAction): EstoqueState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_PRODUTOS':
      return { ...state, produtos: action.payload };
    
    case 'ADD_PRODUTO':
      return { ...state, produtos: [...state.produtos, action.payload] };
    
    case 'UPDATE_PRODUTO':
      return {
        ...state,
        produtos: state.produtos.map(p => 
          p.id === action.payload.id ? action.payload : p
        )
      };
    
    case 'DELETE_PRODUTO':
      return {
        ...state,
        produtos: state.produtos.filter(p => p.id !== action.payload)
      };
    
    case 'SET_VENDAS':
      return { ...state, vendas: action.payload };
    
    case 'ADD_VENDA':
      return { ...state, vendas: [...state.vendas, action.payload] };
    
    case 'DELETE_VENDA':
      return {
        ...state,
        vendas: state.vendas.filter(v => v.id !== action.payload)
      };
    
    case 'SET_CATEGORIAS':
      return { ...state, categorias: action.payload };
    
    case 'ADD_CATEGORIA':
      return {
        ...state,
        categorias: [...state.categorias, action.payload]
      };
    
    case 'DELETE_CATEGORIA':
      return {
        ...state,
        categorias: state.categorias.filter(c => c !== action.payload)
      };
    
    case 'SET_VENDEDORES':
      return { ...state, vendedores: action.payload };
    
    case 'ADD_VENDEDOR':
      return {
        ...state,
        vendedores: [...state.vendedores, action.payload]
      };
    
    case 'DELETE_VENDEDOR':
      return {
        ...state,
        vendedores: state.vendedores.filter(v => v !== action.payload)
      };
    
    case 'SET_METAS':
      return { ...state, metas: action.payload };
    
    case 'ADD_META':
      return { ...state, metas: [...state.metas, action.payload] };
    
    case 'UPDATE_META':
      return {
        ...state,
        metas: state.metas.map(m => 
          m.id === action.payload.id ? action.payload : m
        )
      };
    
    case 'DELETE_META':
      return {
        ...state,
        metas: state.metas.filter(m => m.id !== action.payload)
      };
    
    default:
      return state;
  }
}

// Context
const EstoqueContext = createContext<{
  state: EstoqueState;
  dispatch: React.Dispatch<EstoqueAction>;
  actions: {
    // Produtos
    adicionarProduto: (produto: Omit<Produto, 'id' | 'dataAtualizacao'>) => Promise<void>;
    atualizarProduto: (produto: Produto) => Promise<void>;
    removerProduto: (id: string) => Promise<void>;
    // Vendas
    adicionarVenda: (venda: Omit<Venda, 'id'>) => Promise<void>;
    removerVenda: (id: string) => Promise<void>;
    // Categorias
    adicionarCategoria: (nome: string) => Promise<void>;
    removerCategoria: (nome: string) => Promise<void>;
    // Vendedores
    adicionarVendedor: (nome: string) => Promise<void>;
    removerVendedor: (nome: string) => Promise<void>;
    // Metas
    adicionarMeta: (meta: Omit<Meta, 'id'>) => Promise<void>;
    atualizarMeta: (meta: Meta) => Promise<void>;
    removerMeta: (id: string) => Promise<void>;
    // Utilitários
    carregarDados: () => Promise<void>;
    salvarDados: () => Promise<void>;
  };
} | null>(null);

// Provider
export function EstoqueProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(estoqueReducer, initialState);

  // Carregar dados do localStorage
  const carregarDados = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const produtos = LocalStorage.load('produtos', []);
      const vendas = LocalStorage.load('vendas', []);
      const categorias = LocalStorage.load('categorias', initialState.categorias);
      const vendedores = LocalStorage.load('vendedores', initialState.vendedores);
      const metas = LocalStorage.load('metas', []);

      dispatch({ type: 'SET_PRODUTOS', payload: produtos });
      dispatch({ type: 'SET_VENDAS', payload: vendas });
      dispatch({ type: 'SET_CATEGORIAS', payload: categorias });
      dispatch({ type: 'SET_VENDEDORES', payload: vendedores });
      dispatch({ type: 'SET_METAS', payload: metas });
      
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao carregar dados' });
    }
  };

  // Salvar dados no localStorage
  const salvarDados = async () => {
    try {
      LocalStorage.save('produtos', state.produtos);
      LocalStorage.save('vendas', state.vendas);
      LocalStorage.save('categorias', state.categorias);
      LocalStorage.save('vendedores', state.vendedores);
      LocalStorage.save('metas', state.metas);
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao salvar dados' });
    }
  };

  // Actions
  const actions = {
    carregarDados,
    salvarDados,
    
    // Produtos
    adicionarProduto: async (produtoData: Omit<Produto, 'id' | 'dataAtualizacao'>) => {
      const produto: Produto = {
        ...produtoData,
        id: Date.now().toString(),
        dataAtualizacao: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_PRODUTO', payload: produto });
    },

    atualizarProduto: async (produto: Produto) => {
      const produtoAtualizado = {
        ...produto,
        dataAtualizacao: new Date().toISOString(),
      };
      dispatch({ type: 'UPDATE_PRODUTO', payload: produtoAtualizado });
    },

    removerProduto: async (id: string) => {
      dispatch({ type: 'DELETE_PRODUTO', payload: id });
    },

    // Vendas
    adicionarVenda: async (vendaData: Omit<Venda, 'id'>) => {
      const venda: Venda = {
        ...vendaData,
        id: Date.now().toString(),
      };
      dispatch({ type: 'ADD_VENDA', payload: venda });
      
      // Atualizar estoque automaticamente
      const produto = state.produtos.find(p => p.id === venda.produtoId);
      if (produto) {
        const produtoAtualizado = {
          ...produto,
          quantidade: produto.quantidade - venda.quantidade,
          dataAtualizacao: new Date().toISOString(),
        };
        dispatch({ type: 'UPDATE_PRODUTO', payload: produtoAtualizado });
      }
    },

    removerVenda: async (id: string) => {
      dispatch({ type: 'DELETE_VENDA', payload: id });
    },

    // Categorias
    adicionarCategoria: async (nome: string) => {
      if (!state.categorias.includes(nome)) {
        dispatch({ type: 'ADD_CATEGORIA', payload: nome });
      }
      return Promise.resolve();
    },

    removerCategoria: async (nome: string) => {
      dispatch({ type: 'DELETE_CATEGORIA', payload: nome });
    },

    // Vendedores
    adicionarVendedor: async (nome: string) => {
      if (!state.vendedores.includes(nome)) {
        dispatch({ type: 'ADD_VENDEDOR', payload: nome });
      }
    },

    removerVendedor: async (nome: string) => {
      dispatch({ type: 'DELETE_VENDEDOR', payload: nome });
    },

    // Metas
    adicionarMeta: async (metaData: Omit<Meta, 'id'>) => {
      const meta: Meta = {
        ...metaData,
        id: Date.now().toString(),
      };
      dispatch({ type: 'ADD_META', payload: meta });
    },

    atualizarMeta: async (meta: Meta) => {
      dispatch({ type: 'UPDATE_META', payload: meta });
    },

    removerMeta: async (id: string) => {
      dispatch({ type: 'DELETE_META', payload: id });
    },
  };

  // Auto-salvar quando o estado mudar
  useEffect(() => {
    if (!state.loading) {
      salvarDados();
    }
  }, [state.produtos, state.vendas, state.categorias, state.vendedores, state.metas]);

  // Carregar dados na inicialização
  useEffect(() => {
    carregarDados();
  }, []);

  return (
    <EstoqueContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </EstoqueContext.Provider>
  );
}

// Hook customizado
export function useEstoque() {
  const context = useContext(EstoqueContext);
  if (!context) {
    throw new Error('useEstoque deve ser usado dentro de EstoqueProvider');
  }
  
  // Retornar dados compatíveis com componentes existentes
  return {
    ...context,
    produtos: context.state.produtos,
    vendas: context.state.vendas,
    categorias: context.state.categorias,
    vendedores: context.state.vendedores,
    metas: context.state.metas,
    loading: context.state.loading,
    error: context.state.error,
    actions: context.actions,
    // Funções de compatibilidade
    adicionarProduto: context.actions.adicionarProduto,
    editarProduto: context.actions.atualizarProduto,
    adicionarCategoria: context.actions.adicionarCategoria,
    adicionarEstoque: async (produtoId: string, quantidade: number) => {
      const produto = context.state.produtos.find(p => p.id === produtoId);
      if (produto) {
        const produtoAtualizado = {
          ...produto,
          quantidade: produto.quantidade + quantidade,
          dataAtualizacao: new Date().toISOString(),
        };
        await context.actions.atualizarProduto(produtoAtualizado);
      }
    },
    registrarPerda: async (produtoId: string, quantidade: number, motivo?: string) => {
      const produto = context.state.produtos.find(p => p.id === produtoId);
      if (produto) {
        const produtoAtualizado = {
          ...produto,
          quantidade: Math.max(0, produto.quantidade - quantidade),
          dataAtualizacao: new Date().toISOString(),
        };
        await context.actions.atualizarProduto(produtoAtualizado);
      }
    }
  };
}

// Utilitários de cálculo
export const calcularEstatisticas = (produtos: Produto[], vendas: Venda[]) => {
  const totalProdutos = produtos.length;
  const produtosAtivos = produtos.filter(p => p.ativo).length;
  const produtosBaixoEstoque = produtos.filter(p => p.quantidade <= p.minimo).length;
  
  const receitaTotal = vendas.reduce((acc, v) => acc + v.precoTotal, 0);
  const totalVendas = vendas.length;
  
  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const vendasMesAtual = vendas.filter(v => new Date(v.data) >= inicioMes);
  const receitaMesAtual = vendasMesAtual.reduce((acc, v) => acc + v.precoTotal, 0);
  
  return {
    totalProdutos,
    produtosAtivos,
    produtosBaixoEstoque,
    receitaTotal,
    receitaMesAtual,
    totalVendas,
    vendasMesAtual: vendasMesAtual.length
  };
};