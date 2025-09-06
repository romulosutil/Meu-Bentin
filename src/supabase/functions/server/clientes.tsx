// =====================================================
// SERVIDOR DE CLIENTES - Sistema Completo
// =====================================================
// Gerenciamento completo de clientes e dependentes
// com validações, operações CRUD e histórico de vendas
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

// Tipos TypeScript para melhor type safety
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

// Função de validação para clientes
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

// Função de validação para filhos
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

// Utilitários de validação
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
      console.log('Erro ao buscar clientes:', error);
      return c.json({ error: 'Erro interno do servidor' }, 500);
    }

    return c.json({ clientes: clientes || [] });
  } catch (err) {
    console.log('Erro interno ao buscar clientes:', err);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// GET /make-server-f57293e2/clientes/:id - Buscar cliente específico
app.get('/make-server-f57293e2/clientes/:id', async (c) => {
  try {
    const clienteId = c.req.param('id');

    const { data: cliente, error } = await supabase
      .from('clientes')
      .select(`
        *,
        filhos (*),
        vendas (
          id,
          data,
          vendedor,
          produto_id,
          nome_produto,
          preco_total,
          quantidade
        )
      `)
      .eq('id', clienteId)
      .single();

    if (error) {
      console.log('Erro ao buscar cliente:', error);
      return c.json({ error: 'Cliente não encontrado' }, 404);
    }

    return c.json({ cliente });
  } catch (err) {
    console.log('Erro interno ao buscar cliente:', err);
    return c.json({ error: 'Erro interno do servidor' }, 500);
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

// POST /make-server-f57293e2/clientes/:id/filhos - Adicionar filho
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
// ROTAS DE ESTATÍSTICAS
// =====================================================

// GET /make-server-f57293e2/clientes/stats - Estatísticas gerais
app.get('/make-server-f57293e2/clientes/stats', async (c) => {
  try {
    // Buscar estatísticas dos clientes
    const { data: clientesStats, error: clientesError } = await supabase
      .from('clientes')
      .select('id')
      .eq('ativo', true);

    const { data: filhosStats, error: filhosError } = await supabase
      .from('filhos')
      .select('id');

    const { data: vendasComClienteStats, error: vendasError } = await supabase
      .from('vendas')
      .select('cliente_id')
      .not('cliente_id', 'is', null);

    if (clientesError || filhosError || vendasError) {
      console.log('Erro ao buscar estatísticas');
      return c.json({ error: 'Erro ao buscar estatísticas' }, 500);
    }

    const stats = {
      totalClientes: clientesStats?.length || 0,
      totalFilhos: filhosStats?.length || 0,
      vendasComCliente: vendasComClienteStats?.length || 0,
      mediaFilhosPorCliente: clientesStats?.length ? 
        Math.round((filhosStats?.length || 0) / clientesStats.length * 10) / 10 : 0
    };

    return c.json({ stats });
  } catch (err) {
    console.log('Erro interno ao buscar estatísticas:', err);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// Iniciar servidor
export default {
  fetch: app.fetch,
};

// =====================================================
// FIM DO SERVIDOR DE CLIENTES
// =====================================================