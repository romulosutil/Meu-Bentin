-- =====================================================
-- MIGRAÇÃO 003: SISTEMA DE CLIENTES E DEPENDENTES
-- =====================================================
-- Esta migração cria a infraestrutura completa para 
-- gerenciamento de clientes e vinculação com vendas
-- =====================================================

-- 1. Criar tabela de clientes (responsáveis)
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

-- 2. Criar tabela de filhos (dependentes)
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

-- 3. Adicionar referência ao cliente na tabela vendas (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'vendas' AND column_name = 'cliente_id') THEN
        ALTER TABLE vendas ADD COLUMN cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 4. Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email);
CREATE INDEX IF NOT EXISTS idx_clientes_telefone ON clientes(telefone);
CREATE INDEX IF NOT EXISTS idx_clientes_nome ON clientes(nome);
CREATE INDEX IF NOT EXISTS idx_filhos_cliente_id ON filhos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_vendas_cliente_id ON vendas(cliente_id);

-- 5. Criar função para atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Criar triggers para atualização automática de timestamps
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

-- 7. Inserir dados de exemplo para testes (opcional)
INSERT INTO clientes (nome, telefone, email, instagram) VALUES
    ('Maria Silva', '(11) 99999-1234', 'maria.silva@email.com', '@maria_silva'),
    ('Ana Santos', '(11) 88888-5678', 'ana.santos@email.com', '@ana_santos'),
    ('Carla Oliveira', '(11) 77777-9012', 'carla.oliveira@email.com', '@carla_oliveira')
ON CONFLICT (email) DO NOTHING;

-- 8. Inserir filhos de exemplo vinculados aos clientes
INSERT INTO filhos (cliente_id, nome, data_nascimento, genero, tamanho_preferido)
SELECT 
    c.id,
    filho.nome,
    filho.data_nascimento,
    filho.genero,
    filho.tamanho_preferido
FROM clientes c
CROSS JOIN (VALUES
    ('João Silva', '2018-03-15'::date, 'masculino', '4 anos'),
    ('Pedro Silva', '2020-07-22'::date, 'masculino', '2 anos'),
    ('Julia Santos', '2017-11-08'::date, 'feminino', '5 anos'),
    ('Sofia Oliveira', '2019-05-12'::date, 'feminino', '3 anos')
) AS filho(nome, data_nascimento, genero, tamanho_preferido)
WHERE (c.nome = 'Maria Silva' AND filho.nome LIKE '%Silva') OR
      (c.nome = 'Ana Santos' AND filho.nome LIKE '%Santos') OR
      (c.nome = 'Carla Oliveira' AND filho.nome LIKE '%Oliveira');

-- 9. Comentários para documentação
COMMENT ON TABLE clientes IS 'Tabela principal para armazenar dados dos clientes responsáveis';
COMMENT ON TABLE filhos IS 'Tabela para armazenar filhos/dependentes vinculados aos clientes';
COMMENT ON COLUMN vendas.cliente_id IS 'Referência ao cliente que realizou a compra';

-- =====================================================
-- FIM DA MIGRAÇÃO 003
-- =====================================================