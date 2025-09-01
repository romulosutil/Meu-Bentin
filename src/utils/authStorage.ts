/**
 * Utilitários para gerenciar dados de autenticação no localStorage
 * Parte do sistema de autenticação do Meu Bentin
 */

export interface AuthData {
  isAuthenticated: boolean;
  user: string;
  loginTime: string;
  sessionExpiry: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

// Chaves do localStorage
const STORAGE_KEYS = {
  AUTH: 'meu-bentin-authenticated',
  USER: 'meu-bentin-user',
  LOGIN_TIME: 'meu-bentin-login-time',
  SESSION_EXPIRY: 'meu-bentin-session-expiry'
} as const;

// Credenciais válidas (em produção, isso viria de uma API)
export const VALID_CREDENTIALS: LoginCredentials = {
  username: 'nailanabernardo',
  password: '09082013#*'
};

// Duração da sessão (24 horas)
export const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 horas em ms

/**
 * Salva dados de autenticação no localStorage
 */
export function saveAuthData(username: string): void {
  const now = new Date();
  const expiry = new Date(now.getTime() + SESSION_DURATION);

  try {
    localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
    localStorage.setItem(STORAGE_KEYS.USER, username);
    localStorage.setItem(STORAGE_KEYS.LOGIN_TIME, now.toISOString());
    localStorage.setItem(STORAGE_KEYS.SESSION_EXPIRY, expiry.toISOString());
  } catch (error) {
    console.error('Erro ao salvar dados de autenticação:', error);
    throw new Error('Falha ao salvar sessão');
  }
}

/**
 * Recupera dados de autenticação do localStorage
 */
export function getAuthData(): AuthData | null {
  try {
    const isAuth = localStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    const loginTime = localStorage.getItem(STORAGE_KEYS.LOGIN_TIME);
    const sessionExpiry = localStorage.getItem(STORAGE_KEYS.SESSION_EXPIRY);

    if (!isAuth || !user || !loginTime || !sessionExpiry) {
      return null;
    }

    return {
      isAuthenticated: isAuth,
      user,
      loginTime,
      sessionExpiry
    };
  } catch (error) {
    console.error('Erro ao recuperar dados de autenticação:', error);
    return null;
  }
}

/**
 * Verifica se a sessão ainda é válida
 */
export function isSessionValid(): boolean {
  const authData = getAuthData();
  
  if (!authData) {
    return false;
  }

  try {
    const now = new Date();
    const expiry = new Date(authData.sessionExpiry);
    
    return now.getTime() < expiry.getTime();
  } catch (error) {
    console.error('Erro ao verificar validade da sessão:', error);
    return false;
  }
}

/**
 * Remove todos os dados de autenticação do localStorage
 */
export function clearAuthData(): void {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Erro ao limpar dados de autenticação:', error);
  }
}

/**
 * Valida credenciais de login
 */
export function validateCredentials(credentials: LoginCredentials): boolean {
  return (
    credentials.username === VALID_CREDENTIALS.username &&
    credentials.password === VALID_CREDENTIALS.password
  );
}

/**
 * Atualiza o tempo de expiração da sessão (renovação automática)
 */
export function renewSession(): boolean {
  const authData = getAuthData();
  
  if (!authData || !isSessionValid()) {
    return false;
  }

  try {
    const newExpiry = new Date(Date.now() + SESSION_DURATION);
    localStorage.setItem(STORAGE_KEYS.SESSION_EXPIRY, newExpiry.toISOString());
    return true;
  } catch (error) {
    console.error('Erro ao renovar sessão:', error);
    return false;
  }
}

/**
 * Obtém informações sobre a sessão atual
 */
export function getSessionInfo(): {
  timeRemaining: number;
  expiresAt: Date | null;
  isExpiringSoon: boolean;
} | null {
  const authData = getAuthData();
  
  if (!authData) {
    return null;
  }

  try {
    const now = new Date();
    const expiry = new Date(authData.sessionExpiry);
    const timeRemaining = expiry.getTime() - now.getTime();
    const isExpiringSoon = timeRemaining < (30 * 60 * 1000); // 30 minutos

    return {
      timeRemaining,
      expiresAt: expiry,
      isExpiringSoon
    };
  } catch (error) {
    console.error('Erro ao obter informações da sessão:', error);
    return null;
  }
}

/**
 * Formata o tempo de login para exibição
 */
export function formatLoginTime(loginTime: string): string {
  try {
    const date = new Date(loginTime);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Data inválida';
  }
}