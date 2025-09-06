// =====================================================
// VERIFICAÇÃO DO SISTEMA DE CLIENTES
// =====================================================
// Script para verificar se o sistema de clientes está
// funcionando corretamente e corrigir problemas
// =====================================================

import { getSupabaseClient } from './supabaseClient';

interface VerificacaoResult {
  tabela: string;
  existe: boolean;
  totalRegistros: number;
  observacoes: string;
  erro?: string;
}

/**
 * Verifica se todas as tabelas necessárias para o sistema de clientes existem
 */
export async function verificarSistemaClientes(): Promise<{
  status: 'ok' | 'warning' | 'error';
  resultados: VerificacaoResult[];
  resumo: string;
}> {
  const supabase = getSupabaseClient();
  const resultados: VerificacaoResult[] = [];
  let warnings = 0;
  let errors = 0;

  console.log('🔍 Iniciando verificação do sistema de clientes...');

  // 1. Verificar tabela clientes
  try {
    const { data, error } = await supabase
      .from('clientes')
      .select('id')
      .limit(1);

    if (error) {
      resultados.push({
        tabela: 'clientes',
        existe: false,
        totalRegistros: 0,
        observacoes: 'Tabela não existe ou não está acessível',
        erro: error.message
      });
      errors++;
    } else {
      const { count } = await supabase
        .from('clientes')
        .select('*', { count: 'exact', head: true });

      resultados.push({
        tabela: 'clientes',
        existe: true,
        totalRegistros: count || 0,
        observacoes: count === 0 ? 'Tabela vazia' : 'Funcionando corretamente'
      });

      if (count === 0) warnings++;
    }
  } catch (err) {
    resultados.push({
      tabela: 'clientes',
      existe: false,
      totalRegistros: 0,
      observacoes: 'Erro na verificação',
      erro: err instanceof Error ? err.message : 'Erro desconhecido'
    });
    errors++;
  }

  // 2. Verificar tabela filhos
  try {
    const { data, error } = await supabase
      .from('filhos')
      .select('id')
      .limit(1);

    if (error) {
      resultados.push({
        tabela: 'filhos',
        existe: false,
        totalRegistros: 0,
        observacoes: 'Tabela não existe ou não está acessível',
        erro: error.message
      });
      errors++;
    } else {
      const { count } = await supabase
        .from('filhos')
        .select('*', { count: 'exact', head: true });

      resultados.push({
        tabela: 'filhos',
        existe: true,
        totalRegistros: count || 0,
        observacoes: count === 0 ? 'Tabela vazia' : 'Funcionando corretamente'
      });

      if (count === 0) warnings++;
    }
  } catch (err) {
    resultados.push({
      tabela: 'filhos',
      existe: false,
      totalRegistros: 0,
      observacoes: 'Erro na verificação',
      erro: err instanceof Error ? err.message : 'Erro desconhecido'
    });
    errors++;
  }

  // 3. Verificar coluna cliente_id na tabela vendas
  try {
    const { data, error } = await supabase
      .from('vendas')
      .select('cliente_id')
      .limit(1);

    if (error) {
      resultados.push({
        tabela: 'vendas.cliente_id',
        existe: false,
        totalRegistros: 0,
        observacoes: 'Coluna cliente_id não existe na tabela vendas',
        erro: error.message
      });
      warnings++;
    } else {
      const { count } = await supabase
        .from('vendas')
        .select('cliente_id', { count: 'exact', head: true })
        .not('cliente_id', 'is', null);

      resultados.push({
        tabela: 'vendas.cliente_id',
        existe: true,
        totalRegistros: count || 0,
        observacoes: count === 0 ? 'Nenhuma venda vinculada a cliente' : 'Funcionando corretamente'
      });
    }
  } catch (err) {
    resultados.push({
      tabela: 'vendas.cliente_id',
      existe: false,
      totalRegistros: 0,
      observacoes: 'Erro na verificação',
      erro: err instanceof Error ? err.message : 'Erro desconhecido'
    });
    warnings++;
  }

  // 4. Verificar se o servidor está respondendo
  try {
    const response = await fetch(`https://${process.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/make-server-f57293e2/health`, {
      headers: {
        'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`
      }
    });

    if (response.ok) {
      const healthData = await response.json();
      resultados.push({
        tabela: 'servidor',
        existe: true,
        totalRegistros: 1,
        observacoes: `Servidor funcionando - Status: ${healthData.status}`
      });
    } else {
      resultados.push({
        tabela: 'servidor',
        existe: false,
        totalRegistros: 0,
        observacoes: 'Servidor não está respondendo corretamente',
        erro: `HTTP ${response.status}`
      });
      errors++;
    }
  } catch (err) {
    resultados.push({
      tabela: 'servidor',
      existe: false,
      totalRegistros: 0,
      observacoes: 'Erro ao conectar com o servidor',
      erro: err instanceof Error ? err.message : 'Erro desconhecido'
    });
    errors++;
  }

  // Determinar status geral
  let status: 'ok' | 'warning' | 'error';
  let resumo: string;

  if (errors > 0) {
    status = 'error';
    resumo = `Sistema com problemas críticos: ${errors} erros e ${warnings} avisos`;
  } else if (warnings > 0) {
    status = 'warning';
    resumo = `Sistema funcionando com avisos: ${warnings} itens precisam de atenção`;
  } else {
    status = 'ok';
    resumo = 'Sistema de clientes funcionando perfeitamente';
  }

  console.log(`📊 Verificação concluída: ${resumo}`);

  return {
    status,
    resultados,
    resumo
  };
}

/**
 * Tenta corrigir problemas comuns do sistema de clientes
 */
export async function tentarCorrigirSistema(): Promise<{
  success: boolean;
  acoes: string[];
  erros: string[];
}> {
  const supabase = getSupabaseClient();
  const acoes: string[] = [];
  const erros: string[] = [];

  console.log('🔧 Tentando corrigir problemas do sistema...');

  try {
    // Executar migração para criar/corrigir tabelas
    const { error: migrationError } = await supabase.rpc('verificar_sistema_clientes');
    
    if (migrationError) {
      erros.push(`Erro na verificação: ${migrationError.message}`);
    } else {
      acoes.push('Verificação das tabelas executada com sucesso');
    }
  } catch (err) {
    erros.push(`Erro ao executar verificação: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
  }

  // Verificar se conseguimos inserir um cliente de teste
  try {
    const { data, error } = await supabase
      .from('clientes')
      .select('id')
      .eq('email', 'teste@sistema.com')
      .single();

    if (error && error.code === 'PGRST116') {
      // Cliente de teste não existe, vamos criar
      const { error: insertError } = await supabase
        .from('clientes')
        .insert([{
          nome: 'Cliente Teste Sistema',
          email: 'teste@sistema.com',
          telefone: '(11) 99999-0000',
          ativo: true
        }]);

      if (insertError) {
        erros.push(`Erro ao criar cliente de teste: ${insertError.message}`);
      } else {
        acoes.push('Cliente de teste criado com sucesso');
      }
    } else if (!error) {
      acoes.push('Cliente de teste já existe');
    }
  } catch (err) {
    erros.push(`Erro na verificação de cliente teste: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
  }

  const success = erros.length === 0;
  console.log(success ? '✅ Correções aplicadas com sucesso' : '❌ Algumas correções falharam');

  return {
    success,
    acoes,
    erros
  };
}

/**
 * Função de diagnóstico completo
 */
export async function diagnosticoCompleto(): Promise<void> {
  console.log('🚀 Iniciando diagnóstico completo do sistema de clientes...');

  const verificacao = await verificarSistemaClientes();
  
  console.log('\n📋 RELATÓRIO DE VERIFICAÇÃO:');
  console.log(`Status: ${verificacao.status.toUpperCase()}`);
  console.log(`Resumo: ${verificacao.resumo}\n`);

  verificacao.resultados.forEach(resultado => {
    const status = resultado.existe ? '✅' : '❌';
    console.log(`${status} ${resultado.tabela}:`);
    console.log(`   Existe: ${resultado.existe}`);
    console.log(`   Registros: ${resultado.totalRegistros}`);
    console.log(`   Observações: ${resultado.observacoes}`);
    if (resultado.erro) {
      console.log(`   Erro: ${resultado.erro}`);
    }
    console.log('');
  });

  if (verificacao.status !== 'ok') {
    console.log('🔧 Tentando aplicar correções...\n');
    const correcao = await tentarCorrigirSistema();
    
    console.log('📝 RELATÓRIO DE CORREÇÕES:');
    console.log(`Sucesso: ${correcao.success ? 'SIM' : 'NÃO'}\n`);
    
    if (correcao.acoes.length > 0) {
      console.log('✅ Ações realizadas:');
      correcao.acoes.forEach(acao => console.log(`   - ${acao}`));
      console.log('');
    }
    
    if (correcao.erros.length > 0) {
      console.log('❌ Erros encontrados:');
      correcao.erros.forEach(erro => console.log(`   - ${erro}`));
      console.log('');
    }

    // Verificar novamente após correções
    console.log('🔍 Verificando sistema após correções...\n');
    const novaVerificacao = await verificarSistemaClientes();
    console.log(`Status final: ${novaVerificacao.status.toUpperCase()}`);
    console.log(`Resumo final: ${novaVerificacao.resumo}`);
  }

  console.log('\n🎯 Diagnóstico completo finalizado!');
}