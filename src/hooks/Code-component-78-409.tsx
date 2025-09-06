import { useState, useEffect, useCallback } from 'react';
import { supabase, supabaseHelpers } from '../utils/supabaseClient';
import type { Usuario, Produto, Venda, Categoria, Vendedor } from '../utils/supabaseClient';

// Hook personalizado para gerenciar operações do Supabase
export function useSupabase() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar conexão com o Supabase
  const checkConnection = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: connectionError } = await supabase.from('configuracoes').select('chave').limit(1);
      
      if (connectionError) {
        throw connectionError;
      }
      
      setIsConnected(true);
      console.log('Conectado ao Supabase com sucesso!');
    } catch (err) {
      setIsConnected(false);
      setError(err instanceof Error ? err.message : 'Erro ao conectar com Supabase');
      console.error('Erro de conexão com Supabase:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  return {
    isConnected,
    isLoading,
    error,
    reconnect: checkConnection,
    supabase,
    helpers: supabaseHelpers
  };
}

// Hook para gerenciar produtos
export function useProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProdutos = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabaseHelpers.getProdutos();
      
      if (fetchError) {
        throw fetchError;
      }
      
      setProdutos(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar produtos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createProduto = useCallback(async (produto: Omit<Produto, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);
      const { data, error: createError } = await supabaseHelpers.createProduto(produto);
      
      if (createError) {
        throw createError;
      }
      
      if (data?.[0]) {
        setProdutos(prev => [...prev, data[0]]);
        return { success: true, data: data[0] };
      }
      
      return { success: false, error: 'Nenhum produto foi criado' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar produto';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const updateProduto = useCallback(async (id: string, updates: Partial<Produto>) => {
    try {
      setError(null);
      const { data, error: updateError } = await supabaseHelpers.updateProduto(id, updates);
      
      if (updateError) {
        throw updateError;
      }
      
      if (data?.[0]) {
        setProdutos(prev => prev.map(p => p.id === id ? data[0] : p));
        return { success: true, data: data[0] };
      }
      
      return { success: false, error: 'Nenhum produto foi atualizado' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar produto';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const deleteProduto = useCallback(async (id: string) => {
    try {
      setError(null);
      const { error: deleteError } = await supabaseHelpers.deleteProduto(id);
      
      if (deleteError) {
        throw deleteError;
      }
      
      setProdutos(prev => prev.filter(p => p.id !== id));
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir produto';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  useEffect(() => {
    fetchProdutos();
  }, [fetchProdutos]);

  return {
    produtos,
    isLoading,
    error,
    refresh: fetchProdutos,
    create: createProduto,
    update: updateProduto,
    delete: deleteProduto
  };
}

// Hook para gerenciar vendas
export function useVendas(startDate?: string, endDate?: string) {
  const [vendas, setVendas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVendas = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabaseHelpers.getVendas(startDate, endDate);
      
      if (fetchError) {
        throw fetchError;
      }
      
      setVendas(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar vendas');
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  const createVenda = useCallback(async (
    venda: Omit<Venda, 'id' | 'created_at' | 'updated_at'>, 
    itens: Array<{ produto_id: string; quantidade: number; preco_unitario: number; subtotal: number }>
  ) => {
    try {
      setError(null);
      const { data, error: createError } = await supabaseHelpers.createVenda(venda, itens);
      
      if (createError) {
        throw createError;
      }
      
      if (data) {
        // Atualizar lista local
        await fetchVendas();
        return { success: true, data };
      }
      
      return { success: false, error: 'Nenhuma venda foi criada' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar venda';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [fetchVendas]);

  useEffect(() => {
    fetchVendas();
  }, [fetchVendas]);

  return {
    vendas,
    isLoading,
    error,
    refresh: fetchVendas,
    create: createVenda
  };
}

// Hook para gerenciar categorias
export function useCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategorias = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabaseHelpers.getCategorias();
      
      if (fetchError) {
        throw fetchError;
      }
      
      setCategorias(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar categorias');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCategoria = useCallback(async (categoria: Omit<Categoria, 'id' | 'created_at'>) => {
    try {
      setError(null);
      const { data, error: createError } = await supabaseHelpers.createCategoria(categoria);
      
      if (createError) {
        throw createError;
      }
      
      if (data?.[0]) {
        setCategorias(prev => [...prev, data[0]]);
        return { success: true, data: data[0] };
      }
      
      return { success: false, error: 'Nenhuma categoria foi criada' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar categoria';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  return {
    categorias,
    isLoading,
    error,
    refresh: fetchCategorias,
    create: createCategoria
  };
}

// Hook para gerenciar vendedores
export function useVendedores() {
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVendedores = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabaseHelpers.getVendedores();
      
      if (fetchError) {
        throw fetchError;
      }
      
      setVendedores(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar vendedores');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createVendedor = useCallback(async (vendedor: Omit<Vendedor, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);
      const { data, error: createError } = await supabaseHelpers.createVendedor(vendedor);
      
      if (createError) {
        throw createError;
      }
      
      if (data?.[0]) {
        setVendedores(prev => [...prev, data[0]]);
        return { success: true, data: data[0] };
      }
      
      return { success: false, error: 'Nenhum vendedor foi criado' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar vendedor';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  useEffect(() => {
    fetchVendedores();
  }, [fetchVendedores]);

  return {
    vendedores,
    isLoading,
    error,
    refresh: fetchVendedores,
    create: createVendedor
  };
}

// Hook para análises e relatórios
export function useAnalytics() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTopProdutos = useCallback(async (limit = 10) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabaseHelpers.getTopProdutos(limit);
      
      if (fetchError) {
        throw fetchError;
      }
      
      return { success: true, data: data || [] };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar top produtos';
      setError(errorMessage);
      return { success: false, error: errorMessage, data: [] };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getVendasPorVendedor = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabaseHelpers.getVendasPorVendedor();
      
      if (fetchError) {
        throw fetchError;
      }
      
      return { success: true, data: data || [] };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar vendas por vendedor';
      setError(errorMessage);
      return { success: false, error: errorMessage, data: [] };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getVendasPorPeriodo = useCallback(async (startDate: string, endDate: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabaseHelpers.getVendasPorPeriodo(startDate, endDate);
      
      if (fetchError) {
        throw fetchError;
      }
      
      return { success: true, data: data || [] };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar vendas por período';
      setError(errorMessage);
      return { success: false, error: errorMessage, data: [] };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    getTopProdutos,
    getVendasPorVendedor,
    getVendasPorPeriodo
  };
}