/**
 * Utilitário para testar a conexão com o Supabase
 */

import { SUPABASE_CONFIG } from './envConfig';
import { createClient } from '@supabase/supabase-js';

export async function testSupabaseConnection() {
  try {
    console.log('🔍 Testando conexão com Supabase...');
    
    // Verificar configurações
    if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
      throw new Error('Configurações do Supabase não encontradas');
    }
    
    // Criar cliente de teste
    const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    
    // Testar uma query simples
    const { data, error } = await supabase
      .from('produtos')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro na conexão:', error);
      return {
        success: false,
        error: error.message,
        details: error
      };
    }
    
    console.log('✅ Conexão com Supabase estabelecida!');
    return {
      success: true,
      message: 'Conexão estabelecida com sucesso',
      data
    };
    
  } catch (error) {
    console.error('❌ Erro no teste de conexão:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      details: error
    };
  }
}

export async function checkDatabaseTables() {
  try {
    console.log('🔍 Verificando tabelas do banco...');
    
    const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    
    const tables = ['produtos', 'vendas', 'categorias', 'vendedores', 'configuracoes'];
    const results: Record<string, any> = {};
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        results[table] = {
          exists: !error,
          error: error?.message,
          sample: data
        };
        
        if (error) {
          console.warn(`⚠️ Problema com tabela ${table}:`, error.message);
        } else {
          console.log(`✅ Tabela ${table} acessível`);
        }
      } catch (err) {
        results[table] = {
          exists: false,
          error: err instanceof Error ? err.message : 'Erro desconhecido'
        };
      }
    }
    
    return {
      success: true,
      tables: results
    };
    
  } catch (error) {
    console.error('❌ Erro ao verificar tabelas:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

// Função para executar todos os testes
export async function runDiagnostics() {
  console.log('🚀 Executando diagnósticos do Supabase...');
  
  const connectionTest = await testSupabaseConnection();
  const tablesTest = await checkDatabaseTables();
  
  const diagnostics = {
    connection: connectionTest,
    tables: tablesTest,
    timestamp: new Date().toISOString(),
    environment: SUPABASE_CONFIG.environment
  };
  
  console.log('📊 Diagnósticos completos:', diagnostics);
  return diagnostics;
}