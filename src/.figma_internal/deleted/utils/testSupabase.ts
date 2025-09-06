/**
 * Utilitário para testar a conexão com o Supabase
 */

import { SUPABASE_CONFIG } from './envConfig';
import { createClient } from '@supabase/supabase-js';

export async function testSupabaseConnection() {
  try {    
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
      return {
        success: false,
        error: error.message,
        details: error
      };
    }
    
    return {
      success: true,
      message: 'Conexão estabelecida com sucesso',
      data
    };
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      details: error
    };
  }
}

export async function checkDatabaseTables() {
  try {
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
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

// Função para executar todos os testes
export async function runDiagnostics() {
  const connectionTest = await testSupabaseConnection();
  const tablesTest = await checkDatabaseTables();
  
  const diagnostics = {
    connection: connectionTest,
    tables: tablesTest,
    timestamp: new Date().toISOString(),
    environment: SUPABASE_CONFIG.environment
  };
  
  // Log simplificado para desenvolvimento
  if (SUPABASE_CONFIG.environment === 'development') {
    console.log('🔍 Diagnóstico Supabase:');
    console.log(`   Conexão: ${connectionTest.success ? '✅' : '❌'}`);
    
    if (tablesTest.success) {
      const existingTables = Object.entries(tablesTest.tables)
        .filter(([_, info]) => info.exists)
        .map(([name]) => name);
      
      if (existingTables.length > 0) {
        console.log(`   Tabelas encontradas: ${existingTables.length}/5`);
      } else {
        console.log('   Tabelas: Nenhuma encontrada (modo demo ativo)');
      }
    }
  }
  
  return diagnostics;
}