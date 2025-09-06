/**
 * Contexto principal do Sistema Meu Bentin
 * Versão SEM VENDEDOR - Usa banco de dados Supabase
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { supabaseService, Produto, Venda, Meta } from './supabaseServiceSemVendedor';
import { runDiagnostics } from './testSupabase';
import { DemoModeIndicator } from '../components/DemoModeIndicator';
import { useDemoMode } from '../hooks/useDemoMode';
import { activateDemoMode, demoLogger, getDemoData } from './demoModeLogger';

// Tipos atualizados - removendo vendedores
export interface EstoqueState {
  produtos: Produto[];
  vendas: Venda[];
  categorias: string[];
  metas: Meta[];
  loading: boolean;
  error: string | null;
}

// Ações do reducer (sem vendedores)
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
  | { type: 'SET_METAS'; payload: Meta[] }
  | { type: 'ADD_META'; payload: Meta }
  | { type: 'UPDATE_META'; payload: Meta }
  | { type: 'DELETE_META'; payload: string };

// Estado inicial (sem vendedores)
const initialState: EstoqueState = {
  produtos: [],
  vendas: [],
  categorias: ['Roupas', 'Calçados', 'Acessórios', 'Brinquedos'],
  metas: [],
  loading: false,
  error: null,
};

// Reducer (sem vendedores)
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

// Context (interface sem vendedores)
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
    // Metas
    adicionarMeta: (meta: Omit<Meta, 'id'>) => Promise<void>;
    atualizarMeta: (meta: Meta) => Promise<void>;
    removerMeta: (id: string) => Promise<void>;
    // Utilitários
    carregarDados: () => Promise<void>;
    salvarDados: () => Promise<void>;
  };
} | null>(null);

// Provider com integração Supabase (sem vendedores)
export function EstoqueProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(estoqueReducer, initialState);
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Carregar dados do Supabase (sem vendedores)
  const carregarDados = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      console.log('🔄 Carregando dados do Supabase...');
      
      // Carregar todas as entidades em paralelo (sem vendedores)
      const [produtos, vendas, categorias, metas] = await Promise.all([
        supabaseService.getProdutos(),
        supabaseService.getVendas(),
        supabaseService.getCategorias(),
        supabaseService.getMetas()
      ]);
      
      console.log('✅ Dados carregados:', {
        produtos: produtos.length,
        vendas: vendas.length,
        categorias: categorias.length,
        metas: metas.length
      });
      
      // Atualizar estado
      dispatch({ type: 'SET_PRODUTOS', payload: produtos });
      dispatch({ type: 'SET_VENDAS', payload: vendas });
      dispatch({ type: 'SET_CATEGORIAS', payload: categorias });
      dispatch({ type: 'SET_METAS', payload: metas });
      
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      
      // Se houver erro, ativar modo demo
      activateDemoMode('connection_error');
      const demoData = getDemoData();
      dispatch({ type: 'SET_PRODUTOS', payload: demoData.produtos });
      dispatch({ type: 'SET_VENDAS', payload: demoData.vendas });
      dispatch({ type: 'SET_CATEGORIAS', payload: demoData.categorias });
      dispatch({ type: 'SET_METAS', payload: demoData.metas || [] });
      
      dispatch({ 
        type: 'SET_ERROR', 
        payload: 'Erro de conexão. Funcionando em modo offline.' 
      });
      
      demoLogger.error('Falha ao conectar com Supabase', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Salvar dados no Supabase (implementação placeholder)
  const salvarDados = async () => {
    try {
      console.log('💾 Salvando dados no Supabase...');
      // Implementar conforme necessário
    } catch (error) {
      console.error('❌ Erro ao salvar dados:', error);
      demoLogger.error('Erro ao salvar no Supabase', error);
    }
  };

  // ============================================
  // AÇÕES DE PRODUTOS
  // ============================================
  
  const adicionarProduto = async (produtoData: Omit<Produto, 'id' | 'dataAtualizacao'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const novoProduto = await supabaseService.addProduto(produtoData);
      dispatch({ type: 'ADD_PRODUTO', payload: novoProduto });
      console.log('✅ Produto adicionado:', novoProduto.nome);
    } catch (error) {
      console.error('❌ Erro ao adicionar produto:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao adicionar produto' });
      demoLogger.error('Erro ao adicionar produto', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const atualizarProduto = async (produto: Produto) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const produtoAtualizado = await supabaseService.updateProduto(produto);
      dispatch({ type: 'UPDATE_PRODUTO', payload: produtoAtualizado });
      console.log('✅ Produto atualizado:', produto.nome);
    } catch (error) {
      console.error('❌ Erro ao atualizar produto:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao atualizar produto' });
      demoLogger.error('Erro ao atualizar produto', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const removerProduto = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await supabaseService.deleteProduto(id);
      dispatch({ type: 'DELETE_PRODUTO', payload: id });
      console.log('✅ Produto removido:', id);
    } catch (error) {
      console.error('❌ Erro ao remover produto:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao remover produto' });
      demoLogger.error('Erro ao remover produto', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // ============================================
  // AÇÕES DE VENDAS (sem vendedor)
  // ============================================
  
  const adicionarVenda = async (vendaData: Omit<Venda, 'id'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Para compatibilidade, definir vendedor como "Venda Direta"
      const vendaComVendedor = {
        ...vendaData,
        vendedor: vendaData.vendedor || 'Venda Direta'
      };
      
      const novaVenda = await supabaseService.addVenda(vendaComVendedor);
      dispatch({ type: 'ADD_VENDA', payload: novaVenda });
      
      // Atualizar estoque do produto
      const produto = state.produtos.find(p => p.id === vendaData.produtoId);
      if (produto) {
        const produtoAtualizado = {
          ...produto,
          quantidade: produto.quantidade - vendaData.quantidade
        };
        await atualizarProduto(produtoAtualizado);
      }
      
      console.log('✅ Venda adicionada:', novaVenda.nomeProduto);
    } catch (error) {
      console.error('❌ Erro ao adicionar venda:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao registrar venda' });
      demoLogger.error('Erro ao adicionar venda', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const removerVenda = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await supabaseService.deleteVenda(id);
      dispatch({ type: 'DELETE_VENDA', payload: id });
      console.log('✅ Venda removida:', id);
    } catch (error) {
      console.error('❌ Erro ao remover venda:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao remover venda' });
      demoLogger.error('Erro ao remover venda', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // ============================================
  // AÇÕES DE CATEGORIAS
  // ============================================
  
  const adicionarCategoria = async (nome: string) => {
    try {
      const novaCategoria = await supabaseService.addCategoria(nome);
      dispatch({ type: 'ADD_CATEGORIA', payload: novaCategoria });
      console.log('✅ Categoria adicionada:', nome);
    } catch (error) {
      console.error('❌ Erro ao adicionar categoria:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao adicionar categoria' });
      demoLogger.error('Erro ao adicionar categoria', error);
    }
  };

  const removerCategoria = async (nome: string) => {
    try {
      await supabaseService.deleteCategoria(nome);
      dispatch({ type: 'DELETE_CATEGORIA', payload: nome });
      console.log('✅ Categoria removida:', nome);
    } catch (error) {
      console.error('❌ Erro ao remover categoria:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao remover categoria' });
      demoLogger.error('Erro ao remover categoria', error);
    }
  };

  // ============================================
  // AÇÕES DE METAS
  // ============================================
  
  const adicionarMeta = async (metaData: Omit<Meta, 'id'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const novaMeta = await supabaseService.addMeta(metaData);
      dispatch({ type: 'ADD_META', payload: novaMeta });
      console.log('✅ Meta adicionada:', novaMeta.titulo);
    } catch (error) {
      console.error('❌ Erro ao adicionar meta:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao adicionar meta' });
      demoLogger.error('Erro ao adicionar meta', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const atualizarMeta = async (meta: Meta) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const metaAtualizada = await supabaseService.updateMeta(meta);
      dispatch({ type: 'UPDATE_META', payload: metaAtualizada });
      console.log('✅ Meta atualizada:', meta.titulo);
    } catch (error) {
      console.error('❌ Erro ao atualizar meta:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao atualizar meta' });
      demoLogger.error('Erro ao atualizar meta', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const removerMeta = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await supabaseService.deleteMeta(id);
      dispatch({ type: 'DELETE_META', payload: id });
      console.log('✅ Meta removida:', id);
    } catch (error) {
      console.error('❌ Erro ao remover meta:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao remover meta' });
      demoLogger.error('Erro ao remover meta', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Inicialização
  useEffect(() => {
    const initializeSystem = async () => {
      try {
        console.log('🚀 Inicializando sistema Meu Bentin...');
        
        // Executar diagnósticos
        const diagnostics = await runDiagnostics();
        console.log('🔍 Diagnósticos:', diagnostics);
        
        // Carregar dados
        await carregarDados();
        
        setIsInitialized(true);
        console.log('✅ Sistema inicializado com sucesso!');
        
      } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        setIsInitialized(true); // Continuar mesmo com erro
      }
    };

    if (!isInitialized) {
      initializeSystem();
    }
  }, [isInitialized]);

  // Actions object (sem vendedores)
  const actions = {
    // Produtos
    adicionarProduto,
    atualizarProduto,
    removerProduto,
    // Vendas
    adicionarVenda,
    removerVenda,
    // Categorias
    adicionarCategoria,
    removerCategoria,
    // Metas
    adicionarMeta,
    atualizarMeta,
    removerMeta,
    // Utilitários
    carregarDados,
    salvarDados,
  };

  const { isDemoMode } = useDemoMode();

  return (
    <EstoqueContext.Provider value={{ state, dispatch, actions }}>
      {isDemoMode && <DemoModeIndicator />}
      {children}
    </EstoqueContext.Provider>
  );
}

// Hook para usar o contexto (sem vendedores)
export function useEstoque() {
  const context = useContext(EstoqueContext);
  if (!context) {
    throw new Error('useEstoque deve ser usado dentro de EstoqueProvider');
  }

  const { state, actions } = context;

  return {
    // Estado (sem vendedores)
    produtos: state.produtos,
    vendas: state.vendas,
    categorias: state.categorias,
    metas: state.metas,
    loading: state.loading,
    error: state.error,

    // Ações
    ...actions,
  };
}

// Exports para compatibilidade
export type { Produto, Venda, Meta };
export { EstoqueContext };