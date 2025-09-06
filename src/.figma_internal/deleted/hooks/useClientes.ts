// =====================================================
// HOOK DE GERENCIAMENTO DE CLIENTES
// =====================================================
// Hook customizado para gerenciar clientes e filhos
// com integração completa ao backend Supabase
// =====================================================

import { useState, useEffect, useCallback } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

// Tipos TypeScript
export interface Cliente {
  id?: string;
  nome: string;
  data_nascimento?: string;
  telefone?: string;
  email?: string;
  instagram?: string;
  endereco?: string;
  observacoes?: string;
  ativo?: boolean;
  criado_em?: string;
  atualizado_em?: string;
  filhos?: Filho[];
}

export interface Filho {
  id?: string;
  cliente_id: string;
  nome: string;
  data_nascimento?: string;
  genero?: 'masculino' | 'feminino' | 'unissex';
  tamanho_preferido?: string;
  observacoes?: string;
  criado_em?: string;
  atualizado_em?: string;
}

export interface ClienteStats {
  totalClientes: number;
  totalFilhos: number;
  vendasComCliente: number;
  mediaFilhosPorCliente: number;
}

interface UseClientesReturn {
  // Estados
  clientes: Cliente[];
  clienteSelecionado: Cliente | null;
  stats: ClienteStats | null;
  isLoading: boolean;
  error: string | null;
  
  // Operações CRUD de Clientes
  carregarClientes: () => Promise<void>;
  buscarCliente: (id: string) => Promise<Cliente | null>;
  criarCliente: (cliente: Omit<Cliente, 'id'>) => Promise<Cliente | null>;
  atualizarCliente: (id: string, dados: Partial<Cliente>) => Promise<Cliente | null>;
  desativarCliente: (id: string) => Promise<boolean>;
  
  // Operações CRUD de Filhos
  adicionarFilho: (clienteId: string, filho: Omit<Filho, 'id' | 'cliente_id'>) => Promise<Filho | null>;
  atualizarFilho: (id: string, dados: Partial<Filho>) => Promise<Filho | null>;
  removerFilho: (id: string) => Promise<boolean>;
  
  // Utilitários
  carregarEstatisticas: () => Promise<void>;
  limparErro: () => void;
  selecionarCliente: (cliente: Cliente | null) => void;
}

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-f57293e2`;

export function useClientes(): UseClientesReturn {
  // Estados
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [stats, setStats] = useState<ClienteStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função helper para requisições
  const makeRequest = useCallback(async (
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<any> => {
    try {
      console.log(`🔗 Fazendo requisição: ${BASE_URL}${endpoint}`);
      
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
          ...options.headers,
        },
      });

      // Log da resposta para debugging
      console.log(`📡 Resposta HTTP ${response.status} para ${endpoint}`);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: `Erro HTTP ${response.status}` };
        }
        
        console.error(`❌ Erro na requisição ${endpoint}:`, errorData);
        throw new Error(errorData.error || errorData.message || `Erro HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ Sucesso na requisição ${endpoint}:`, data);
      return data;
    } catch (error) {
      console.error(`❌ Erro crítico na requisição ${endpoint}:`, error);
      throw error;
    }
  }, []);

  // =====================================================
  // OPERAÇÕES CRUD DE CLIENTES
  // =====================================================

  const carregarClientes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Carregando clientes do servidor...');
      const response = await makeRequest('/clientes');
      
      if (response.clientes) {
        setClientes(response.clientes);
        console.log(`✅ ${response.clientes.length} clientes carregados`);
      } else {
        console.log('⚠️ Nenhum cliente encontrado na resposta');
        setClientes([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar clientes';
      setError(errorMessage);
      console.error('❌ Erro detalhado ao carregar clientes:', {
        error: err,
        message: errorMessage,
        timestamp: new Date().toISOString()
      });
      
      // Em caso de erro, definir array vazio para não quebrar a UI
      setClientes([]);
    } finally {
      setIsLoading(false);
    }
  }, [makeRequest]);

  const buscarCliente = useCallback(async (id: string): Promise<Cliente | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await makeRequest(`/clientes/${id}`);
      setClienteSelecionado(response.cliente);
      return response.cliente;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar cliente';
      setError(errorMessage);
      console.error('Erro ao buscar cliente:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [makeRequest]);

  const criarCliente = useCallback(async (cliente: Omit<Cliente, 'id'>): Promise<Cliente | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await makeRequest('/clientes', {
        method: 'POST',
        body: JSON.stringify(cliente),
      });
      
      if (response.success) {
        await carregarClientes(); // Recarregar lista
        return response.cliente;
      }
      
      throw new Error(response.error || 'Erro ao criar cliente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar cliente';
      setError(errorMessage);
      console.error('Erro ao criar cliente:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [makeRequest, carregarClientes]);

  const atualizarCliente = useCallback(async (
    id: string, 
    dados: Partial<Cliente>
  ): Promise<Cliente | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await makeRequest(`/clientes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(dados),
      });
      
      if (response.success) {
        await carregarClientes(); // Recarregar lista
        return response.cliente;
      }
      
      throw new Error(response.error || 'Erro ao atualizar cliente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar cliente';
      setError(errorMessage);
      console.error('Erro ao atualizar cliente:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [makeRequest, carregarClientes]);

  const desativarCliente = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await makeRequest(`/clientes/${id}`, {
        method: 'DELETE',
      });
      
      if (response.success) {
        await carregarClientes(); // Recarregar lista
        return true;
      }
      
      throw new Error(response.error || 'Erro ao desativar cliente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao desativar cliente';
      setError(errorMessage);
      console.error('Erro ao desativar cliente:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [makeRequest, carregarClientes]);

  // =====================================================
  // OPERAÇÕES CRUD DE FILHOS
  // =====================================================

  const adicionarFilho = useCallback(async (
    clienteId: string, 
    filho: Omit<Filho, 'id' | 'cliente_id'>
  ): Promise<Filho | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await makeRequest(`/clientes/${clienteId}/filhos`, {
        method: 'POST',
        body: JSON.stringify(filho),
      });
      
      if (response.success) {
        await carregarClientes(); // Recarregar lista
        return response.filho;
      }
      
      throw new Error(response.error || 'Erro ao adicionar filho');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar filho';
      setError(errorMessage);
      console.error('Erro ao adicionar filho:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [makeRequest, carregarClientes]);

  const atualizarFilho = useCallback(async (
    id: string, 
    dados: Partial<Filho>
  ): Promise<Filho | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await makeRequest(`/filhos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(dados),
      });
      
      if (response.success) {
        await carregarClientes(); // Recarregar lista
        return response.filho;
      }
      
      throw new Error(response.error || 'Erro ao atualizar filho');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar filho';
      setError(errorMessage);
      console.error('Erro ao atualizar filho:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [makeRequest, carregarClientes]);

  const removerFilho = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await makeRequest(`/filhos/${id}`, {
        method: 'DELETE',
      });
      
      if (response.success) {
        await carregarClientes(); // Recarregar lista
        return true;
      }
      
      throw new Error(response.error || 'Erro ao remover filho');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover filho';
      setError(errorMessage);
      console.error('Erro ao remover filho:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [makeRequest, carregarClientes]);

  // =====================================================
  // UTILITÁRIOS
  // =====================================================

  const carregarEstatisticas = useCallback(async () => {
    try {
      console.log('🔄 Carregando estatísticas de clientes...');
      
      // Tentar carregar estatísticas do servidor
      const response = await makeRequest('/clientes/stats');
      
      // Verificar se a resposta tem os dados esperados
      if (response && response.stats) {
        setStats(response.stats);
        console.log('✅ Estatísticas carregadas com sucesso:', response.stats);
      } else if (response && response.error) {
        // Se o servidor retornou um erro mas com stats padrão
        console.log('⚠️ Servidor retornou erro, mas com estatísticas padrão:', response.stats);
        setStats(response.stats || {
          totalClientes: 0,
          totalFilhos: 0,
          vendasComCliente: 0,
          mediaFilhosPorCliente: 0
        });
      } else {
        console.log('⚠️ Resposta sem estatísticas, usando valores padrão');
        setStats({
          totalClientes: 0,
          totalFilhos: 0,
          vendasComCliente: 0,
          mediaFilhosPorCliente: 0
        });
      }
    } catch (err) {
      console.error('❌ Erro ao carregar estatísticas:', {
        error: err,
        message: err instanceof Error ? err.message : 'Erro desconhecido',
        timestamp: new Date().toISOString()
      });
      
      // Sempre definir estatísticas padrão em caso de erro
      setStats({
        totalClientes: 0,
        totalFilhos: 0,
        vendasComCliente: 0,
        mediaFilhosPorCliente: 0
      });
      
      // Não definir como erro crítico, apenas log
      console.log('🔄 Usando estatísticas padrão devido ao erro');
    }
  }, [makeRequest]);

  const limparErro = useCallback(() => {
    setError(null);
  }, []);

  const selecionarCliente = useCallback((cliente: Cliente | null) => {
    setClienteSelecionado(cliente);
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    carregarClientes();
    carregarEstatisticas();
  }, [carregarClientes, carregarEstatisticas]);

  return {
    // Estados
    clientes,
    clienteSelecionado,
    stats,
    isLoading,
    error,
    
    // Operações CRUD de Clientes
    carregarClientes,
    buscarCliente,
    criarCliente,
    atualizarCliente,
    desativarCliente,
    
    // Operações CRUD de Filhos
    adicionarFilho,
    atualizarFilho,
    removerFilho,
    
    // Utilitários
    carregarEstatisticas,
    limparErro,
    selecionarCliente,
  };
}

// =====================================================
// FIM DO HOOK DE CLIENTES
// =====================================================