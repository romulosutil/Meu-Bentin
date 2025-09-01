/**
 * Contexto principal do Sistema Meu Bentin
 * Versão Supabase - Usa banco de dados real
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { supabaseService, Produto, Venda, Meta } from './supabaseService';
import { runDiagnostics } from './testSupabase';

// Tipos mantidos para compatibilidade
export interface EstoqueState {
  produtos: Produto[];
  vendas: Venda[];
  categorias: string[];
  vendedores: string[];
  metas: Meta[];
  loading: boolean;
  error: string | null;
}

// Ações do reducer (mantidas as mesmas)
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

// Reducer (mantido o mesmo)
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

// Context (interface mantida para compatibilidade)
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

// Provider com integração Supabase
export function EstoqueProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(estoqueReducer, initialState);
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Carregar dados do Supabase
  const carregarDados = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      console.log('🔄 Carregando dados do Supabase...');
      
      // Carregar todas as entidades em paralelo
      const [produtos, vendas, categorias, vendedores, metas] = await Promise.all([
        supabaseService.getProdutos(),
        supabaseService.getVendas(),
        supabaseService.getCategorias(),
        supabaseService.getVendedores(),
        supabaseService.getMetas()
      ]);

      console.log('✅ Dados carregados:', {
        produtos: produtos.length,
        vendas: vendas.length,
        categorias: categorias.length,
        vendedores: vendedores.length,
        metas: metas.length
      });

      dispatch({ type: 'SET_PRODUTOS', payload: produtos });
      dispatch({ type: 'SET_VENDAS', payload: vendas });
      dispatch({ type: 'SET_CATEGORIAS', payload: categorias });
      dispatch({ type: 'SET_VENDEDORES', payload: vendedores });
      dispatch({ type: 'SET_METAS', payload: metas });
      
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      
      // Usar dados padrão em caso de erro
      console.log('🔄 Usando dados padrão temporariamente...');
      dispatch({ type: 'SET_CATEGORIAS', payload: ['Roupas', 'Calçados', 'Acessórios', 'Brinquedos'] });
      dispatch({ type: 'SET_VENDEDORES', payload: ['Naila', 'Vendedor 2'] });
      
      dispatch({ type: 'SET_ERROR', payload: 'Conexão com banco de dados indisponível. Usando modo offline temporário.' });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Salvar dados (não necessário no Supabase - operações são imediatas)
  const salvarDados = async () => {
    // No-op - dados são salvos automaticamente no Supabase
    return Promise.resolve();
  };

  // Actions com integração Supabase
  const actions = {
    carregarDados,
    salvarDados,
    
    // Produtos
    adicionarProduto: async (produtoData: Omit<Produto, 'id' | 'dataAtualizacao'>) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const novoProduto = await supabaseService.adicionarProduto(produtoData);
        dispatch({ type: 'ADD_PRODUTO', payload: novoProduto });
        dispatch({ type: 'SET_LOADING', payload: false });
      } catch (error) {
        console.error('Erro ao adicionar produto:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Erro ao adicionar produto' });
      }
    },

    atualizarProduto: async (produto: Produto) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const produtoAtualizado = await supabaseService.atualizarProduto(produto);
        dispatch({ type: 'UPDATE_PRODUTO', payload: produtoAtualizado });
        dispatch({ type: 'SET_LOADING', payload: false });
      } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Erro ao atualizar produto' });
      }
    },

    removerProduto: async (id: string) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        await supabaseService.removerProduto(id);
        dispatch({ type: 'DELETE_PRODUTO', payload: id });
        dispatch({ type: 'SET_LOADING', payload: false });
      } catch (error) {
        console.error('Erro ao remover produto:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Erro ao remover produto' });
      }
    },

    // Vendas
    adicionarVenda: async (vendaData: Omit<Venda, 'id'>) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const novaVenda = await supabaseService.adicionarVenda(vendaData);
        dispatch({ type: 'ADD_VENDA', payload: novaVenda });
        
        // Atualizar estoque automaticamente (o banco já faz isso, mas vamos atualizar localmente)
        const produto = state.produtos.find(p => p.id === vendaData.produtoId);
        if (produto) {
          const produtoAtualizado = {
            ...produto,
            quantidade: produto.quantidade - vendaData.quantidade,
            dataAtualizacao: new Date().toISOString(),
          };
          dispatch({ type: 'UPDATE_PRODUTO', payload: produtoAtualizado });
        }
        
        dispatch({ type: 'SET_LOADING', payload: false });
      } catch (error) {
        console.error('Erro ao adicionar venda:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Erro ao registrar venda' });
      }
    },

    removerVenda: async (id: string) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        await supabaseService.removerVenda(id);
        dispatch({ type: 'DELETE_VENDA', payload: id });
        dispatch({ type: 'SET_LOADING', payload: false });
      } catch (error) {
        console.error('Erro ao remover venda:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Erro ao cancelar venda' });
      }
    },

    // Categorias
    adicionarCategoria: async (nome: string) => {
      try {
        if (!state.categorias.includes(nome)) {
          await supabaseService.adicionarCategoria(nome);
          dispatch({ type: 'ADD_CATEGORIA', payload: nome });
        }
        return Promise.resolve();
      } catch (error) {
        console.error('Erro ao adicionar categoria:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Erro ao adicionar categoria' });
      }
    },

    removerCategoria: async (nome: string) => {
      try {
        await supabaseService.removerCategoria(nome);
        dispatch({ type: 'DELETE_CATEGORIA', payload: nome });
      } catch (error) {
        console.error('Erro ao remover categoria:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Erro ao remover categoria' });
      }
    },

    // Vendedores
    adicionarVendedor: async (nome: string) => {
      try {
        if (!state.vendedores.includes(nome)) {
          await supabaseService.adicionarVendedor(nome);
          dispatch({ type: 'ADD_VENDEDOR', payload: nome });
        }
      } catch (error) {
        console.error('Erro ao adicionar vendedor:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Erro ao adicionar vendedor' });
      }
    },

    removerVendedor: async (nome: string) => {
      try {
        await supabaseService.removerVendedor(nome);
        dispatch({ type: 'DELETE_VENDEDOR', payload: nome });
      } catch (error) {
        console.error('Erro ao remover vendedor:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Erro ao remover vendedor' });
      }
    },

    // Metas
    adicionarMeta: async (metaData: Omit<Meta, 'id'>) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const novaMeta = await supabaseService.adicionarMeta(metaData);
        dispatch({ type: 'ADD_META', payload: novaMeta });
        dispatch({ type: 'SET_LOADING', payload: false });
      } catch (error) {
        console.error('Erro ao adicionar meta:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Erro ao adicionar meta' });
      }
    },

    atualizarMeta: async (meta: Meta) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const metaAtualizada = await supabaseService.atualizarMeta(meta);
        dispatch({ type: 'UPDATE_META', payload: metaAtualizada });
        dispatch({ type: 'SET_LOADING', payload: false });
      } catch (error) {
        console.error('Erro ao atualizar meta:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Erro ao atualizar meta' });
      }
    },

    removerMeta: async (id: string) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        await supabaseService.removerMeta(id);
        dispatch({ type: 'DELETE_META', payload: id });
        dispatch({ type: 'SET_LOADING', payload: false });
      } catch (error) {
        console.error('Erro ao remover meta:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Erro ao remover meta' });
      }
    },
  };

  // Carregar dados na inicialização
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Executar diagnósticos em desenvolvimento
        if (import.meta.env.VITE_ENVIRONMENT === 'development') {
          await runDiagnostics();
        }
        
        await carregarDados();
        setIsInitialized(true);
      } catch (error) {
        console.error('Erro na inicialização:', error);
        // Não quebrar a aplicação, apenas mostrar dados padrão
        setIsInitialized(true);
      }
    };

    initializeData();
  }, []);

  // Mostrar loading durante inicialização
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bentin-pink mx-auto"></div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Meu Bentin</h3>
            <p className="text-muted-foreground">Inicializando sistema...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <EstoqueContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </EstoqueContext.Provider>
  );
}

// Hook customizado (mantido para compatibilidade)
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

// Utilitários de cálculo (mantidos)
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