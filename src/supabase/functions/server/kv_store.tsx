/* MOCK FILE - Para compatibilidade com build Vercel */

// Mock do KV Store para evitar dependências JSR durante o build
// Todas as funções retornam Promises para compatibilidade com o código existente

// Set stores a key-value pair in the database.
export const set = async (key: string, value: any): Promise<void> => {
  console.warn(`KV Store mock: set(${key}) - usando localStorage`);
  // Em produção, poderia usar localStorage se necessário
  return Promise.resolve();
};

// Get retrieves a key-value pair from the database.
export const get = async (key: string): Promise<any> => {
  console.warn(`KV Store mock: get(${key}) - retornando null`);
  return Promise.resolve(null);
};

// Delete deletes a key-value pair from the database.
export const del = async (key: string): Promise<void> => {
  console.warn(`KV Store mock: del(${key}) - operação mock`);
  return Promise.resolve();
};

// Sets multiple key-value pairs in the database.
export const mset = async (keys: string[], values: any[]): Promise<void> => {
  console.warn(`KV Store mock: mset(${keys.length} keys) - operação mock`);
  return Promise.resolve();
};

// Gets multiple key-value pairs from the database.
export const mget = async (keys: string[]): Promise<any[]> => {
  console.warn(`KV Store mock: mget(${keys.length} keys) - retornando array vazio`);
  return Promise.resolve([]);
};

// Deletes multiple key-value pairs from the database.
export const mdel = async (keys: string[]): Promise<void> => {
  console.warn(`KV Store mock: mdel(${keys.length} keys) - operação mock`);
  return Promise.resolve();
};

// Search for key-value pairs by prefix.
export const getByPrefix = async (prefix: string): Promise<any[]> => {
  console.warn(`KV Store mock: getByPrefix(${prefix}) - retornando array vazio`);
  return Promise.resolve([]);
};