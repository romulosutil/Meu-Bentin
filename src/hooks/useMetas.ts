import { useState, useEffect, useCallback } from 'react';
import { supabaseService, Meta } from '../utils/supabaseServiceSemVendedor';

export const useMetas = () => {
  const [metas, setMetas] = useState<Meta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar metas do Supabase
  const carregarMetas = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🎯 Carregando metas do Supabase...');
      
      // Verificar se o serviço está disponível
      if (!supabaseService) {
        throw new Error('Serviço Supabase não inicializado');
      }
      
      // Verificar se a função existe
      if (typeof supabaseService.obterMetas !== 'function') {
        throw new Error('Função obterMetas não disponível no serviço');
      }
      
      const metasCarregadas = await supabaseService.obterMetas();
      console.log('🎯 Metas carregadas:', metasCarregadas);
      
      if (Array.isArray(metasCarregadas)) {
        setMetas(metasCarregadas);
      } else {
        console.warn('⚠️ Metas carregadas não são um array:', metasCarregadas);
        setMetas([]);
      }
    } catch (err) {
      console.error('❌ Erro ao carregar metas:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao carregar metas';
      setError(`Erro ao carregar metas: ${errorMessage}`);
      // Em caso de erro, definir array vazio para evitar problemas no UI
      setMetas([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Obter meta específica por mês e ano
  const obterMetaPorMesAno = useCallback(async (mes: string, ano: number): Promise<Meta | null> => {
    try {
      return await supabaseService.obterMetaPorMesAno(mes, ano);
    } catch (err) {
      console.error('Erro ao obter meta por mês/ano:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return null;
    }
  }, []);

  // Criar ou atualizar meta
  const criarOuAtualizarMeta = useCallback(async (mes: string, ano: number, valor: number): Promise<Meta | null> => {
    try {
      setError(null);
      console.log('🎯 Criando/atualizando meta:', { mes, ano, valor });
      const metaAtualizada = await supabaseService.criarOuAtualizarMeta(mes, ano, valor);
      console.log('🎯 Meta atualizada:', metaAtualizada);
      
      // Atualizar lista local
      setMetas(prev => {
        const novasMetas = prev.filter(m => !(m.mes === mes && m.ano === ano));
        return [...novasMetas, metaAtualizada].sort((a, b) => {
          if (a.ano !== b.ano) return b.ano - a.ano;
          return getMesNumero(b.mes) - getMesNumero(a.mes);
        });
      });
      
      return metaAtualizada;
    } catch (err) {
      console.error('❌ Erro ao criar/atualizar meta:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao salvar meta');
      return null;
    }
  }, []);

  // Obter meta atual (mês e ano atuais)
  const obterMetaAtual = useCallback((): Meta | null => {
    const agora = new Date();
    const mesAtual = getMesNome(agora.getMonth());
    const anoAtual = agora.getFullYear();
    
    return metas.find(m => m.mes === mesAtual && m.ano === anoAtual) || null;
  }, [metas]);

  // Utilitários para conversão de mês
  const getMesNome = useCallback((mes: number): string => {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return meses[mes];
  }, []);

  const getMesNumero = useCallback((nomeMes: string): number => {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return meses.indexOf(nomeMes);
  }, []);

  // Carregar metas na inicialização
  useEffect(() => {
    carregarMetas();
  }, [carregarMetas]);

  return {
    metas,
    isLoading,
    error,
    carregarMetas,
    obterMetaPorMesAno,
    criarOuAtualizarMeta,
    obterMetaAtual,
    getMesNome,
    getMesNumero
  };
};