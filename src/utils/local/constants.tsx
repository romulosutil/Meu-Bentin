/* LOCAL AUTH CONSTANTS - NO EXTERNAL DEPENDENCIES */

export const APP_NAME = "Meu Bentin"
export const APP_VERSION = "1.0.0"
export const AUTH_STORAGE_KEY = "meu-bentin-auth"
export const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 horas

// Configurações da aplicação
export const APP_CONFIG = {
  name: APP_NAME,
  version: APP_VERSION,
  author: "Meu Bentin",
  description: "Sistema completo de gestão para loja infantil"
}

// Configurações de autenticação local
export const AUTH_CONFIG = {
  storageKey: AUTH_STORAGE_KEY,
  sessionDuration: SESSION_DURATION,
  defaultUser: {
    email: 'nailanabernardo93@gmail.com',
    password: '09082013#P',
    name: 'Naila Nabernardo',
    role: 'admin'
  }
}