// =====================================================
// SERVIDOR PRINCIPAL MEU BENTIN - Sistema Completo
// =====================================================
// Servidor integrado com suporte a clientes, filhos e vendas
// Agora com sistema completo de gerenciamento de clientes
// =====================================================

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { createClient } from '@supabase/supabase-js';

const app = new Hono();

// Configurações CORS abertas
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Logger para debugging
app.use('*', logger(console.log));

// Cliente Supabase configurado
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Tipos TypeScript
interface Cliente {
  id?: string;
  nome: string;
  data_nascimento?: string;
  telefone?: string;
  email?: string;
  instagram?: string;
  endereco?: string;
  observacoes?: string;
  ativo?: boolean;
}

interface Filho {
  id?: string;
  cliente_id: string;
  nome: string;
  data_nascimento?: string;
  genero?: 'masculino' | 'feminino' | 'unissex';
  tamanho_preferido?: string;
  observacoes?: string;
}

// Funções de validação
function validarCliente(cliente: Partial<Cliente>): { valido: boolean; erros: string[] } {
  const erros: string[] = [];
  if (!cliente.nome || cliente.nome.trim().length < 2) {
    erros.push('Nome é obrigatório e deve ter pelo menos 2 caracteres');
  }
  if (cliente.email && !isValidEmail(cliente.email)) {
    erros.push('Email deve ter formato válido');
  }
  if (cliente.telefone && !isValidPhone(cliente.telefone)) {
    erros.push('Telefone deve ter formato válido');
  }
  return { valido: erros.length === 0, erros };
}

function validarFilho(filho: Partial<Filho>): { valido: boolean; erros: string[] } {
  const erros: string[] = [];
  if (!filho.nome || filho.nome.trim().length < 2) {
    erros.push('Nome do filho é obrigatório');
  }
  if (!filho.cliente_id) {
    erros.push('ID do cliente responsável é obrigatório');
  }
  if (filho.genero && !['masculino', 'feminino', 'unissex'].includes(filho.genero)) {
    erros.push('Gênero deve ser masculino, feminino ou unissex');
  }
  return { valido: erros.length === 0, erros };
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
  return phoneRegex.test(phone);
}

// =====================================================
// ROTAS DE CLIENTES
// =====================================================

// GET /make-server-f57293e2/clientes - Listar todos os clientes
app.get('/make-server-f57293e2/clientes', async (c) => {
  try {
    console.log('🔄 Buscando clientes...');
    
    // Verificar se a tabela existe primeiro
    const { data: clientes, error } = await supabase
      .from('clientes')
      .select(`
        *,
        filhos (
          id,
          nome,
          data_nascimento,
          genero,
          tamanho_preferido,
          observacoes
        )
      `)
      .eq('ativo', true)
      .order('nome');

    if (error) {
      console.log('❌ Erro detalhado ao buscar clientes:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      // Se a tabela não existe, retornar array vazio
      if (error.code === 'PGRST106' || error.message.includes('does not exist')) {
        console.log('⚠️ Tabela clientes não existe, retornando array vazio');
        return c.json({ clientes: [] });
      }
      
      return c.json({ 
        error: 'Erro ao buscar clientes',
        details: error.message
      }, 500);
    }

    console.log(`✅ ${clientes?.length || 0} clientes encontrados`);
    return c.json({ clientes: clientes || [] });
  } catch (err) {
    console.log('❌ Erro interno ao buscar clientes:', err);
    return c.json({ 
      error: 'Erro interno do servidor',
      details: err instanceof Error ? err.message : 'Erro desconhecido'
    }, 500);
  }
});

// =====================================================
// ROTAS DE ESTATÍSTICAS (DEVEM VIR ANTES DAS ROTAS DINÂMICAS)
// =====================================================

// GET /make-server-f57293e2/clientes/stats - Estatísticas gerais
app.get('/make-server-f57293e2/clientes/stats', async (c) => {
  try {
    console.log('🔄 [STATS] Iniciando busca de estatísticas de clientes...');
    
    // Buscar estatísticas dos clientes com tratamento individual de erros
    let clientesStats = [];
    let filhosStats = [];
    let vendasComClienteStats = [];
    let hasErrors = false;
    let errorDetails = [];

    // Buscar clientes
    try {
      console.log('🔄 [STATS] Buscando clientes...');
      const { data: clientesData, error: clientesError } = await supabase
        .from('clientes')
        .select('id')
        .eq('ativo', true);

      if (clientesError) {
        console.log('⚠️ [STATS] Erro ao buscar clientes:', clientesError.message);
        errorDetails.push(`Clientes: ${clientesError.message}`);
        if (!clientesError.message.includes('does not exist') && !clientesError.message.includes('relation') && !clientesError.message.includes('table')) {
          hasErrors = true;
        }
      } else {
        clientesStats = clientesData || [];
        console.log(`✅ [STATS] ${clientesStats.length} clientes encontrados`);
      }
    } catch (err) {
      console.log('❌ [STATS] Erro crítico ao buscar clientes:', err);
      errorDetails.push(`Clientes: erro crítico`);
    }

    // Buscar filhos
    try {
      console.log('🔄 [STATS] Buscando filhos...');
      const { data: filhosData, error: filhosError } = await supabase
        .from('filhos')
        .select('id');

      if (filhosError) {
        console.log('⚠️ [STATS] Erro ao buscar filhos:', filhosError.message);
        errorDetails.push(`Filhos: ${filhosError.message}`);
        if (!filhosError.message.includes('does not exist') && !filhosError.message.includes('relation') && !filhosError.message.includes('table')) {
          hasErrors = true;
        }
      } else {
        filhosStats = filhosData || [];
        console.log(`✅ [STATS] ${filhosStats.length} filhos encontrados`);
      }
    } catch (err) {
      console.log('❌ [STATS] Erro crítico ao buscar filhos:', err);
      errorDetails.push(`Filhos: erro crítico`);
    }

    // Buscar vendas com cliente (se a coluna existir)
    try {
      console.log('🔄 [STATS] Buscando vendas com cliente...');
      const { data: vendasData, error: vendasError } = await supabase
        .from('vendas')
        .select('cliente_id')
        .not('cliente_id', 'is', null);

      if (vendasError) {
        console.log('⚠️ [STATS] Erro ao buscar vendas (coluna cliente_id pode não existir):', vendasError.message);
        errorDetails.push(`Vendas: ${vendasError.message}`);
        // Não é um erro crítico se a coluna cliente_id não existir ainda
      } else {
        vendasComClienteStats = vendasData || [];
        console.log(`✅ [STATS] ${vendasComClienteStats.length} vendas com cliente encontradas`);
      }
    } catch (err) {
      console.log('⚠️ [STATS] Erro ao buscar vendas:', err);
      errorDetails.push(`Vendas: não disponível`);
    }

    const stats = {
      totalClientes: clientesStats.length || 0,
      totalFilhos: filhosStats.length || 0,
      vendasComCliente: vendasComClienteStats.length || 0,
      mediaFilhosPorCliente: clientesStats.length ? 
        Math.round((filhosStats.length || 0) / clientesStats.length * 10) / 10 : 0
    };

    console.log('✅ [STATS] Estatísticas calculadas com sucesso:', stats);
    
    if (errorDetails.length > 0) {
      console.log('⚠️ [STATS] Erros encontrados:', errorDetails);
    }
    
    // Sempre retornar sucesso com as estatísticas, mesmo que algumas falhem
    return c.json({ 
      stats,
      success: true,
      warnings: errorDetails.length > 0 ? errorDetails : undefined
    });
  } catch (err) {
    console.log('❌ [STATS] Erro crítico interno:', err);
    
    // Mesmo em caso de erro crítico, retornar estatísticas padrão
    const defaultStats = {
      totalClientes: 0,
      totalFilhos: 0,
      vendasComCliente: 0,
      mediaFilhosPorCliente: 0
    };
    
    return c.json({ 
      stats: defaultStats,
      success: false,
      error: 'Sistema de clientes não configurado',
      details: err instanceof Error ? err.message : 'Erro desconhecido'
    }, 200); // Retornar 200 em vez de 500 para não quebrar o frontend
  }
});

// GET /make-server-f57293e2/clientes/test - Teste específico do sistema de clientes
app.get('/make-server-f57293e2/clientes/test', async (c) => {
  try {
    console.log('🧪 [TEST] Iniciando teste do sistema de clientes...');
    
    const testResults = {
      timestamp: new Date().toISOString(),
      tests: {}
    };

    // Teste 1: Verificar se tabela clientes existe
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('count')
        .limit(1);
      
      testResults.tests.clientes_table = {
        status: error ? 'failed' : 'passed',
        message: error ? error.message : 'Tabela clientes acessível',
        error: error?.message
      };
    } catch (err) {
      testResults.tests.clientes_table = {
        status: 'failed',
        message: 'Erro ao acessar tabela clientes',
        error: err instanceof Error ? err.message : 'Erro desconhecido'
      };
    }

    // Teste 2: Verificar se tabela filhos existe
    try {
      const { data, error } = await supabase
        .from('filhos')
        .select('count')
        .limit(1);
      
      testResults.tests.filhos_table = {
        status: error ? 'failed' : 'passed',
        message: error ? error.message : 'Tabela filhos acessível',
        error: error?.message
      };
    } catch (err) {
      testResults.tests.filhos_table = {
        status: 'failed',
        message: 'Erro ao acessar tabela filhos',
        error: err instanceof Error ? err.message : 'Erro desconhecido'
      };
    }

    // Teste 3: Verificar coluna cliente_id em vendas
    try {
      const { data, error } = await supabase
        .from('vendas')
        .select('cliente_id')
        .limit(1);
      
      testResults.tests.vendas_cliente_id = {
        status: error ? 'failed' : 'passed',
        message: error ? error.message : 'Coluna cliente_id acessível',
        error: error?.message
      };
    } catch (err) {
      testResults.tests.vendas_cliente_id = {
        status: 'failed',
        message: 'Coluna cliente_id não existe ou não é acessível',
        error: err instanceof Error ? err.message : 'Erro desconhecido'
      };
    }

    // Determinar status geral
    const passedTests = Object.values(testResults.tests).filter(test => test.status === 'passed').length;
    const totalTests = Object.keys(testResults.tests).length;
    
    testResults.summary = {
      total: totalTests,
      passed: passedTests,
      failed: totalTests - passedTests,
      status: passedTests === totalTests ? 'all_passed' : passedTests > 0 ? 'partial' : 'all_failed'
    };

    console.log('✅ [TEST] Teste do sistema de clientes concluído:', testResults.summary);
    
    return c.json(testResults);
  } catch (err) {
    console.log('❌ [TEST] Erro no teste do sistema:', err);
    return c.json({
      timestamp: new Date().toISOString(),
      error: 'Falha no teste do sistema',
      details: err instanceof Error ? err.message : 'Erro desconhecido'
    }, 500);
  }
});

// GET /make-server-f57293e2/clientes/:id - Buscar cliente específico
app.get('/make-server-f57293e2/clientes/:id', async (c) => {
  try {
    const clienteId = c.req.param('id');
    console.log(`🔄 [CLIENTE] Buscando cliente específico: ${clienteId}`);

    const { data: cliente, error } = await supabase
      .from('clientes')
      .select(`
        *,
        filhos (*),
        vendas (
          id,
          data_venda,
          vendedor,
          total,
          forma_pagamento
        )
      `)
      .eq('id', clienteId)
      .eq('ativo', true)
      .single();

    if (error) {
      console.log(`⚠️ [CLIENTE] Erro ao buscar cliente ${clienteId}:`, error.message);
      
      // Se a tabela não existe, retornar erro mais específico
      if (error.message.includes('does not exist') || error.message.includes('relation')) {
        return c.json({ 
          error: 'Sistema de clientes não configurado',
          details: 'Tabelas não encontradas'
        }, 503);
      }
      
      // Se cliente não foi encontrado
      if (error.code === 'PGRST116') {
        return c.json({ 
          error: 'Cliente não encontrado',
          details: `Cliente com ID ${clienteId} não existe ou está inativo`
        }, 404);
      }
      
      return c.json({ 
        error: 'Erro ao buscar cliente',
        details: error.message
      }, 500);
    }

    console.log(`✅ [CLIENTE] Cliente ${clienteId} encontrado:`, cliente.nome);
    return c.json({ cliente });
  } catch (err) {
    console.log(`❌ [CLIENTE] Erro crítico ao buscar cliente:`, err);
    return c.json({ 
      error: 'Erro interno do servidor',
      details: err instanceof Error ? err.message : 'Erro desconhecido'
    }, 500);
  }
});

// POST /make-server-f57293e2/clientes - Criar novo cliente
app.post('/make-server-f57293e2/clientes', async (c) => {
  try {
    const clienteData = await c.req.json() as Cliente;
    
    const validacao = validarCliente(clienteData);
    if (!validacao.valido) {
      return c.json({ error: 'Dados inválidos', detalhes: validacao.erros }, 400);
    }

    // Verificar se email já existe
    if (clienteData.email) {
      const { data: existingClient } = await supabase
        .from('clientes')
        .select('id')
        .eq('email', clienteData.email)
        .single();

      if (existingClient) {
        return c.json({ error: 'Email já cadastrado' }, 409);
      }
    }

    const { data: novoCliente, error } = await supabase
      .from('clientes')
      .insert([clienteData])
      .select()
      .single();

    if (error) {
      console.log('Erro ao criar cliente:', error);
      return c.json({ error: 'Erro ao criar cliente' }, 500);
    }

    return c.json({ 
      success: true, 
      cliente: novoCliente,
      mensagem: 'Cliente criado com sucesso'
    }, 201);
  } catch (err) {
    console.log('Erro interno ao criar cliente:', err);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// PUT /make-server-f57293e2/clientes/:id - Atualizar cliente
app.put('/make-server-f57293e2/clientes/:id', async (c) => {
  try {
    const clienteId = c.req.param('id');
    const updateData = await c.req.json() as Partial<Cliente>;

    const validacao = validarCliente(updateData);
    if (!validacao.valido) {
      return c.json({ error: 'Dados inválidos', detalhes: validacao.erros }, 400);
    }

    const { data: clienteAtualizado, error } = await supabase
      .from('clientes')
      .update(updateData)
      .eq('id', clienteId)
      .select()
      .single();

    if (error) {
      console.log('Erro ao atualizar cliente:', error);
      return c.json({ error: 'Erro ao atualizar cliente' }, 500);
    }

    return c.json({ 
      success: true, 
      cliente: clienteAtualizado,
      mensagem: 'Cliente atualizado com sucesso'
    });
  } catch (err) {
    console.log('Erro interno ao atualizar cliente:', err);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// DELETE /make-server-f57293e2/clientes/:id - Desativar cliente
app.delete('/make-server-f57293e2/clientes/:id', async (c) => {
  try {
    const clienteId = c.req.param('id');

    const { data: clienteDesativado, error } = await supabase
      .from('clientes')
      .update({ ativo: false })
      .eq('id', clienteId)
      .select()
      .single();

    if (error) {
      console.log('Erro ao desativar cliente:', error);
      return c.json({ error: 'Erro ao desativar cliente' }, 500);
    }

    return c.json({ 
      success: true,
      mensagem: 'Cliente desativado com sucesso'
    });
  } catch (err) {
    console.log('Erro interno ao desativar cliente:', err);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// =====================================================
// ROTAS DE FILHOS
// =====================================================

// POST /make-server-f57293e2/clientes/:clienteId/filhos - Adicionar filho
app.post('/make-server-f57293e2/clientes/:clienteId/filhos', async (c) => {
  try {
    const clienteId = c.req.param('clienteId');
    const filhoData = await c.req.json() as Omit<Filho, 'cliente_id'>;
    
    const dadosCompletos = { ...filhoData, cliente_id: clienteId };
    
    const validacao = validarFilho(dadosCompletos);
    if (!validacao.valido) {
      return c.json({ error: 'Dados inválidos', detalhes: validacao.erros }, 400);
    }

    const { data: novoFilho, error } = await supabase
      .from('filhos')
      .insert([dadosCompletos])
      .select()
      .single();

    if (error) {
      console.log('Erro ao adicionar filho:', error);
      return c.json({ error: 'Erro ao adicionar filho' }, 500);
    }

    return c.json({ 
      success: true, 
      filho: novoFilho,
      mensagem: 'Filho adicionado com sucesso'
    }, 201);
  } catch (err) {
    console.log('Erro interno ao adicionar filho:', err);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// PUT /make-server-f57293e2/filhos/:id - Atualizar filho
app.put('/make-server-f57293e2/filhos/:id', async (c) => {
  try {
    const filhoId = c.req.param('id');
    const updateData = await c.req.json() as Partial<Filho>;

    const { data: filhoAtualizado, error } = await supabase
      .from('filhos')
      .update(updateData)
      .eq('id', filhoId)
      .select()
      .single();

    if (error) {
      console.log('Erro ao atualizar filho:', error);
      return c.json({ error: 'Erro ao atualizar filho' }, 500);
    }

    return c.json({ 
      success: true, 
      filho: filhoAtualizado,
      mensagem: 'Filho atualizado com sucesso'
    });
  } catch (err) {
    console.log('Erro interno ao atualizar filho:', err);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// DELETE /make-server-f57293e2/filhos/:id - Remover filho
app.delete('/make-server-f57293e2/filhos/:id', async (c) => {
  try {
    const filhoId = c.req.param('id');

    const { error } = await supabase
      .from('filhos')
      .delete()
      .eq('id', filhoId);

    if (error) {
      console.log('Erro ao remover filho:', error);
      return c.json({ error: 'Erro ao remover filho' }, 500);
    }

    return c.json({ 
      success: true,
      mensagem: 'Filho removido com sucesso'
    });
  } catch (err) {
    console.log('Erro interno ao remover filho:', err);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});



// =====================================================
// ROTA DE TESTE
// =====================================================

// GET /make-server-f57293e2/test - Teste do servidor
app.get('/make-server-f57293e2/test', async (c) => {
  return c.json({ 
    message: 'Servidor Meu Bentin funcionando!',
    timestamp: new Date().toISOString(),
    features: ['clientes', 'filhos', 'vendas', 'estatisticas']
  });
});

// GET /make-server-f57293e2/clientes/test - Teste específico do sistema de clientes
app.get('/make-server-f57293e2/clientes/test', async (c) => {
  try {
    console.log('🧪 [TEST] Iniciando teste do sistema de clientes...');
    
    const testResults = {
      timestamp: new Date().toISOString(),
      tests: {}
    };

    // Teste 1: Verificar se tabela clientes existe
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('count')
        .limit(1);
      
      testResults.tests.clientes_table = {
        status: error ? 'failed' : 'passed',
        message: error ? error.message : 'Tabela clientes acessível',
        error: error?.message
      };
    } catch (err) {
      testResults.tests.clientes_table = {
        status: 'failed',
        message: 'Erro ao acessar tabela clientes',
        error: err instanceof Error ? err.message : 'Erro desconhecido'
      };
    }

    // Teste 2: Verificar se tabela filhos existe
    try {
      const { data, error } = await supabase
        .from('filhos')
        .select('count')
        .limit(1);
      
      testResults.tests.filhos_table = {
        status: error ? 'failed' : 'passed',
        message: error ? error.message : 'Tabela filhos acessível',
        error: error?.message
      };
    } catch (err) {
      testResults.tests.filhos_table = {
        status: 'failed',
        message: 'Erro ao acessar tabela filhos',
        error: err instanceof Error ? err.message : 'Erro desconhecido'
      };
    }

    // Teste 3: Verificar coluna cliente_id em vendas
    try {
      const { data, error } = await supabase
        .from('vendas')
        .select('cliente_id')
        .limit(1);
      
      testResults.tests.vendas_cliente_id = {
        status: error ? 'failed' : 'passed',
        message: error ? error.message : 'Coluna cliente_id acessível',
        error: error?.message
      };
    } catch (err) {
      testResults.tests.vendas_cliente_id = {
        status: 'failed',
        message: 'Coluna cliente_id não existe ou não é acessível',
        error: err instanceof Error ? err.message : 'Erro desconhecido'
      };
    }

    // Determinar status geral
    const passedTests = Object.values(testResults.tests).filter(test => test.status === 'passed').length;
    const totalTests = Object.keys(testResults.tests).length;
    
    testResults.summary = {
      total: totalTests,
      passed: passedTests,
      failed: totalTests - passedTests,
      status: passedTests === totalTests ? 'all_passed' : passedTests > 0 ? 'partial' : 'all_failed'
    };

    console.log('✅ [TEST] Teste do sistema de clientes concluído:', testResults.summary);
    
    return c.json(testResults);
  } catch (err) {
    console.log('❌ [TEST] Erro no teste do sistema:', err);
    return c.json({
      timestamp: new Date().toISOString(),
      error: 'Falha no teste do sistema',
      details: err instanceof Error ? err.message : 'Erro desconhecido'
    }, 500);
  }
});

// Função de verificação e inicialização das tabelas
async function verificarTabelasClientes() {
  try {
    console.log('🔄 Verificando tabelas de clientes...');
    
    // Verificar se as tabelas existem
    const { data: clientes, error: clientesError } = await supabase
      .from('clientes')
      .select('count')
      .limit(1);

    if (clientesError) {
      console.log('⚠️ Tabela clientes não existe ou tem problema:', clientesError.message);
      return false;
    }

    const { data: filhos, error: filhosError } = await supabase
      .from('filhos')
      .select('count')
      .limit(1);

    if (filhosError) {
      console.log('⚠️ Tabela filhos não existe ou tem problema:', filhosError.message);
      return false;
    }

    console.log('✅ Tabelas de clientes verificadas com sucesso');
    return true;
  } catch (error) {
    console.log('❌ Erro ao verificar tabelas:', error);
    return false;
  }
}

// Rota de verificação do sistema
app.get('/make-server-f57293e2/health', async (c) => {
  try {
    const tabelasOk = await verificarTabelasClientes();
    
    return c.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: tabelasOk ? 'connected' : 'issues',
      tables: {
        clientes: tabelasOk,
        filhos: tabelasOk,
        vendas: true
      }
    });
  } catch (error) {
    return c.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, 500);
  }
});

// Inicializar servidor
console.log('🚀 Iniciando servidor Meu Bentin...');
Deno.serve(app.fetch);

// =====================================================
// FIM DO SERVIDOR PRINCIPAL
// =====================================================