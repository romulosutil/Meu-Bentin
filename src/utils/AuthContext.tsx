import React, { createContext, useContext, useState, useEffect } from 'react';

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
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Verificar se há sessão salva no localStorage
    if (typeof window !== 'undefined') {
      const savedSession = localStorage.getItem('meu-bentin-auth');
      return !!savedSession;
    }
    return false;
  });

  // Verificar sessão existente no carregamento
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSession = localStorage.getItem('meu-bentin-auth');
      if (savedSession) {
        try {
          const sessionData = JSON.parse(savedSession);
          const now = new Date().getTime();
          
          // Verificar se a sessão não expirou (24 horas)
          if (sessionData.expiresAt > now) {
            setUser(sessionData.user);
            setIsAuthenticated(true);
          } else {
            // Sessão expirada, limpar
            localStorage.removeItem('meu-bentin-auth');
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('Erro ao verificar sessão:', error);
          localStorage.removeItem('meu-bentin-auth');
          setIsAuthenticated(false);
        }
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simular verificação de credenciais
      // Em produção, isso seria uma chamada para o Supabase
      if (email === 'nailanabernardo93@gmail.com' && password === '09082013#P') {
        const userData: User = {
          id: '1',
          email: email,
          name: 'Naila Nabernardo'
        };

        // Criar sessão com expiração de 24 horas
        const sessionData = {
          user: userData,
          loginAt: new Date().getTime(),
          expiresAt: new Date().getTime() + (24 * 60 * 60 * 1000) // 24 horas
        };

        // Salvar sessão no localStorage
        localStorage.setItem('meu-bentin-auth', JSON.stringify(sessionData));
        
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

  const logout = () => {
    localStorage.removeItem('meu-bentin-auth');
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