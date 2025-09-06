import { useState, useEffect } from 'react';
import { 
  getAuthData, 
  clearAuthData, 
  isSessionValid, 
  renewSession, 
  getSessionInfo 
} from '../utils/authStorage';

interface AuthState {
  isAuthenticated: boolean;
  user: string | null;
  loginTime: string | null;
  sessionExpiry: string | null;
}

interface UseAuthReturn extends AuthState {
  login: () => void;
  logout: () => void;
  checkAuth: () => boolean;
  renewSession: () => boolean;
  sessionInfo: ReturnType<typeof getSessionInfo>;
}

export function useAuth(): UseAuthReturn {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loginTime: null,
    sessionExpiry: null
  });

  const checkAuth = (): boolean => {
    try {
      const authData = getAuthData();
      
      if (!authData || !isSessionValid()) {
        if (authData) {
          // Sessão expirada, limpar dados
          logout();
        }
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      return false;
    }
  };

  const login = () => {
    const authData = getAuthData();
    
    if (authData && isSessionValid()) {
      setAuthState({
        isAuthenticated: true,
        user: authData.user,
        loginTime: authData.loginTime,
        sessionExpiry: authData.sessionExpiry
      });
    }
  };

  const logout = () => {
    try {
      clearAuthData();
      
      setAuthState({
        isAuthenticated: false,
        user: null,
        loginTime: null,
        sessionExpiry: null
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const handleRenewSession = (): boolean => {
    const success = renewSession();
    if (success) {
      // Atualizar estado local com nova data de expiração
      const authData = getAuthData();
      if (authData) {
        setAuthState(prev => ({
          ...prev,
          sessionExpiry: authData.sessionExpiry
        }));
      }
    }
    return success;
  };

  // Verificar autenticação na inicialização
  useEffect(() => {
    const isAuth = checkAuth();
    if (isAuth) {
      const authData = getAuthData();
      if (authData) {
        setAuthState({
          isAuthenticated: true,
          user: authData.user,
          loginTime: authData.loginTime,
          sessionExpiry: authData.sessionExpiry
        });
      }
    }
  }, []);

  // Verificar periodicamente se a sessão ainda é válida e renovar automaticamente
  useEffect(() => {
    const interval = setInterval(() => {
      if (authState.isAuthenticated) {
        const sessionInfo = getSessionInfo();
        
        if (!sessionInfo) {
          logout();
          return;
        }

        // Se a sessão está expirando em menos de 30 minutos, renovar automaticamente
        if (sessionInfo.isExpiringSoon) {
          const renewed = handleRenewSession();
          if (!renewed) {
            logout();
          }
        }
        
        // Se a sessão já expirou
        if (sessionInfo.timeRemaining <= 0) {
          logout();
        }
      }
    }, 60000); // Verificar a cada minuto

    return () => clearInterval(interval);
  }, [authState.isAuthenticated]);

  return {
    ...authState,
    login,
    logout,
    checkAuth,
    renewSession: handleRenewSession,
    sessionInfo: getSessionInfo()
  };
}