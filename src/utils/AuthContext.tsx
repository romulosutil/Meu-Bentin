import React, { createContext, useContext, useState, useEffect } from 'react';
import { AUTH_CONFIG } from './local/constants';
import { storage, STORAGE_KEYS } from './storage/hybridStorage';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar sessão existente no carregamento
  useEffect(() => {
    let mounted = true;
    
    const checkSession = async () => {
      if (typeof window === 'undefined' || !mounted) return;
      
      // Aguardar um pouco para garantir que o storage está inicializado
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (!mounted) return;
      
      try {
        const sessionData = await storage.get(STORAGE_KEYS.AUTH);
        if (!mounted) return;
        
        if (sessionData && sessionData.user && sessionData.expiresAt) {
          const now = new Date().getTime();
          
          if (sessionData.expiresAt > now) {
            setUser(sessionData.user);
            setIsAuthenticated(true);
          } else {
            // Sessão expirada, limpar
            await storage.remove(STORAGE_KEYS.AUTH);
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        if (mounted) {
          console.error('❌ Erro ao verificar sessão:', error);
          // Tentar limpar sem causar erro adicional
          try {
            await storage.remove(STORAGE_KEYS.AUTH);
          } catch {
            // Silencioso se não conseguir limpar
          }
          setIsAuthenticated(false);
        }
      }
    };

    checkSession();
    
    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Verificação de credenciais local
      if (email === AUTH_CONFIG.defaultUser.email && password === AUTH_CONFIG.defaultUser.password) {
        const userData: User = {
          id: '1',
          email: email,
          name: AUTH_CONFIG.defaultUser.name
        };

        // Criar sessão com expiração configurada
        const sessionData = {
          user: userData,
          loginAt: new Date().getTime(),
          expiresAt: new Date().getTime() + AUTH_CONFIG.sessionDuration
        };

        // Salvar sessão no storage híbrido
        await storage.set(STORAGE_KEYS.AUTH, sessionData);
        
        setUser(userData);
        setIsAuthenticated(true);
        setIsLoading(false);
        return true;
      } else {
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    await storage.remove(STORAGE_KEYS.AUTH);
    setUser(null);
    setIsAuthenticated(false);
  };

  const contextValue: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};