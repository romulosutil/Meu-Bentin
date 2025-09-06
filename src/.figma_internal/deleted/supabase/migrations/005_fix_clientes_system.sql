-- =====================================================
-- MIGRAÇÃO 005: CORREÇÃO E VERIFICAÇÃO DO SISTEMA DE CLIENTES
-- =====================================================
-- Esta migração corrige e garante que o sistema de clientes
-- esteja funcionando corretamente
-- =====================================================

-- 1. Criar tabela clientes se não existir
CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    data_nascimento DATE,
    telefone TEXT,
    email TEXT UNIQUE,
    instagram TEXT,
    endereco TEXT,
    observacoes TEXT,
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Criar tabela filhos se não existir
CREATE TABLE IF NOT EXISTS filhos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    data_nascimento DATE,
    genero TEXT CHECK (genero IN ('masculino', 'feminino', 'unissex')),
    tamanho_preferido TEXT,
    observacoes TEXT,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Verificar e adicionar coluna cliente_id na tabela vendas se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'vendas' AND column_name = 'cliente_id') THEN
        ALTER TABLE vendas ADD COLUMN cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 4. Verificar e adicionar coluna cliente_nome na tabela vendas se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'vendas' AND column_name = 'cliente_nome') THEN
        ALTER TABLE vendas ADD COLUMN cliente_nome TEXT;
    END IF;
END $$;

-- 5. Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email);
CREATE INDEX IF NOT EXISTS idx_clientes_telefone ON clientes(telefone);
CREATE INDEX IF NOT EXISTS idx_clientes_nome ON clientes(nome);
CREATE INDEX IF NOT EXISTS idx_clientes_ativo ON clientes(ativo);
CREATE INDEX IF NOT EXISTS idx_filhos_cliente_id ON filhos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_vendas_cliente_id ON vendas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_vendas_cliente_nome ON vendas(cliente_nome);

-- 6. Função para atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Criar triggers para atualização automática de timestamps
DROP TRIGGER IF EXISTS update_clientes_updated_at ON clientes;
CREATE TRIGGER update_clientes_updated_at
    BEFORE UPDATE ON clientes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_filhos_updated_at ON filhos;
CREATE TRIGGER update_filhos_updated_at
    BEFORE UPDATE ON filhos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 8. Inserir dados de exemplo se a tabela estiver vazia
INSERT INTO clientes (nome, telefone, email, instagram, ativo) 
SELECT 'Cliente Exemplo', '(11) 99999-9999', 'exemplo@test.com', '@exemplo', true
WHERE NOT EXISTS (SELECT 1 FROM clientes LIMIT 1);

-- 9. Inserir filho de exemplo
INSERT INTO filhos (cliente_id, nome, data_nascimento, genero, tamanho_preferido)
SELECT c.id, 'Criança Exemplo', '2020-01-01'::date, 'unissex', '4 anos'
FROM clientes c 
WHERE c.email = 'exemplo@test.com'
AND NOT EXISTS (SELECT 1 FROM filhos WHERE cliente_id = c.id);

-- 10. Função para verificar integridade do sistema
CREATE OR REPLACE FUNCTION verificar_sistema_clientes()
RETURNS TABLE (
    tabela TEXT,
    existe BOOLEAN,
    total_registros BIGINT,
    observacoes TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Verificar tabela clientes
    RETURN QUERY
    SELECT 
        'clientes'::TEXT as tabela,
        true as existe,
        (SELECT COUNT(*) FROM clientes)::BIGINT as total_registros,
        'Tabela clientes funcionando'::TEXT as observacoes;
    
    -- Verificar tabela filhos
    RETURN QUERY
    SELECT 
        'filhos'::TEXT as tabela,
        true as existe,
        (SELECT COUNT(*) FROM filhos)::BIGINT as total_registros,
        'Tabela filhos funcionando'::TEXT as observacoes;
    
    -- Verificar coluna cliente_id em vendas
    RETURN QUERY
    SELECT 
        'vendas.cliente_id'::TEXT as tabela,
        EXISTS(SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'vendas' AND column_name = 'cliente_id') as existe,
        (SELECT COUNT(*) FROM vendas WHERE cliente_id IS NOT NULL)::BIGINT as total_registros,
        'Coluna cliente_id em vendas'::TEXT as observacoes;
END;
$$;

-- 11. Comentários para documentação
COMMENT ON TABLE clientes IS 'Tabela principal para armazenar dados dos clientes responsáveis';
COMMENT ON TABLE filhos IS 'Tabela para armazenar filhos/dependentes vinculados aos clientes';
COMMENT ON COLUMN vendas.cliente_id IS 'Referência ao cliente que realizou a compra';
COMMENT ON COLUMN vendas.cliente_nome IS 'Nome do cliente (para compatibilidade e busca rápida)';

-- =====================================================
-- FIM DA MIGRAÇÃO 005
-- =====================================================