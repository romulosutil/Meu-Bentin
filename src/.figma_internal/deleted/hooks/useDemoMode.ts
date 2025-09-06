/**
 * Hook para gerenciar o modo demonstração do sistema
 * Detecta quando o banco não está configurado e ativa o modo demo
 */

import { useState, useCallback } from 'react';

interface DemoModeState {
  isDemoMode: boolean;
  showSetupGuide: boolean;
  demoReason: 'tables_missing' | 'connection_error' | null;
}

export function useDemoMode() {
  const [state, setState] = useState<DemoModeState>({
    isDemoMode: false,
    showSetupGuide: false,
    demoReason: null
  });

  const activateDemoMode = useCallback((reason: 'tables_missing' | 'connection_error') => {
    console.log(`🔄 Ativando modo demonstração: ${reason}`);
    setState({
      isDemoMode: true,
      showSetupGuide: reason === 'tables_missing',
      demoReason: reason
    });
  }, []);

  const dismissSetupGuide = useCallback(() => {
    setState(prev => ({
      ...prev,
      showSetupGuide: false
    }));
  }, []);

  const showSetupGuide = useCallback(() => {
    setState(prev => ({
      ...prev,
      showSetupGuide: true
    }));
  }, []);

  const getDemoMessage = useCallback(() => {
    switch (state.demoReason) {
      case 'tables_missing':
        return 'Banco de dados não configurado. Sistema executando em modo demonstração com dados de exemplo.';
      case 'connection_error':
        return 'Conexão com banco de dados indisponível. Sistema executando em modo offline temporário.';
      default:
        return 'Sistema em modo demonstração.';
    }
  }, [state.demoReason]);

  const getSetupButtonText = useCallback(() => {
    switch (state.demoReason) {
      case 'tables_missing':
        return 'Configurar Banco';
      case 'connection_error':
        return 'Tentar Novamente';
      default:
        return 'Configurar';
    }
  }, [state.demoReason]);

  return {
    ...state,
    activateDemoMode,
    dismissSetupGuide,
    showSetupGuide,
    getDemoMessage,
    getSetupButtonText
  };
}