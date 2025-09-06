-- Criação da estrutura de banco de dados para o Sistema Meu Bentin
-- Este arquivo define todas as tabelas necessárias para o sistema de gestão

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Função para atualizar o timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    senha_hash TEXT NOT NULL,
    ativo BOOLEAN DEFAULT true,
    ultimo_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de categorias de produtos
CREATE TABLE IF NOT EXISTS categorias (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome VARCHAR(100) UNIQUE NOT NULL,
    descricao TEXT,
    cor VARCHAR(7), -- Código hex da cor
    ativa BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de vendedores
CREATE TABLE IF NOT EXISTS vendedores (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(255),
    comissao_percentual DECIMAL(5,2) DEFAULT 0.00,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS produtos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    categoria_id UUID REFERENCES categorias(id),
    categoria VARCHAR(100), -- Para compatibilidade com sistema antigo
    preco DECIMAL(10,2) NOT NULL CHECK (preco >= 0),
    preco_custo DECIMAL(10,2) DEFAULT 0.00 CHECK (preco_custo >= 0),
    quantidade_estoque INTEGER NOT NULL DEFAULT 0 CHECK (quantidade_estoque >= 0),
    estoque_minimo INTEGER DEFAULT 0 CHECK (estoque_minimo >= 0),
    tamanho VARCHAR(20),
    cor VARCHAR(50),
    marca VARCHAR(100),
    fornecedor VARCHAR(100),
    codigo_barras VARCHAR(50),
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de vendas
CREATE TABLE IF NOT EXISTS vendas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    vendedor_id UUID REFERENCES vendedores(id),
    vendedor VARCHAR(100), -- Para compatibilidade com sistema antigo
    cliente_nome VARCHAR(200),
    cliente_telefone VARCHAR(20),
    data_venda TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00 CHECK (subtotal >= 0),
    desconto DECIMAL(10,2) NOT NULL DEFAULT 0.00 CHECK (desconto >= 0),
    total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
    forma_pagamento VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'concluida' CHECK (status IN ('pendente', 'concluida', 'cancelada')),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de itens da venda
CREATE TABLE IF NOT EXISTS itens_venda (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    venda_id UUID REFERENCES vendas(id) ON DELETE CASCADE,
    produto_id UUID REFERENCES produtos(id),
    produto_nome VARCHAR(200) NOT NULL, -- Para histórico
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    preco_unitario DECIMAL(10,2) NOT NULL CHECK (preco_unitario >= 0),
    desconto_item DECIMAL(10,2) DEFAULT 0.00 CHECK (desconto_item >= 0),
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0)
);

-- Tabela de histórico de estoque
CREATE TABLE IF NOT EXISTS historico_estoque (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    produto_id UUID REFERENCES produtos(id) ON DELETE CASCADE,
    tipo_movimento VARCHAR(20) NOT NULL CHECK (tipo_movimento IN ('entrada', 'saida', 'ajuste')),
    quantidade_anterior INTEGER NOT NULL,
    quantidade_movimento INTEGER NOT NULL,
    quantidade_nova INTEGER NOT NULL,
    motivo VARCHAR(100),
    observacoes TEXT,
    usuario_id UUID REFERENCES usuarios(id),
    venda_id UUID REFERENCES vendas(id), -- Para rastrear vendas
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS configuracoes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    chave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    tipo VARCHAR(20) DEFAULT 'texto' CHECK (tipo IN ('texto', 'numero', 'boolean', 'json')),
    descricao TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Triggers para updated_at
CREATE TRIGGER trigger_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_vendedores_updated_at BEFORE UPDATE ON vendedores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_produtos_updated_at BEFORE UPDATE ON produtos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_vendas_updated_at BEFORE UPDATE ON vendas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_configuracoes_updated_at BEFORE UPDATE ON configuracoes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON produtos(categoria);
CREATE INDEX IF NOT EXISTS idx_produtos_nome ON produtos(nome);
CREATE INDEX IF NOT EXISTS idx_produtos_ativo ON produtos(ativo);
CREATE INDEX IF NOT EXISTS idx_vendas_data ON vendas(data_venda);
CREATE INDEX IF NOT EXISTS idx_vendas_vendedor ON vendas(vendedor);
CREATE INDEX IF NOT EXISTS idx_vendas_status ON vendas(status);
CREATE INDEX IF NOT EXISTS idx_itens_venda_produto ON itens_venda(produto_id);
CREATE INDEX IF NOT EXISTS idx_historico_estoque_produto ON historico_estoque(produto_id);
CREATE INDEX IF NOT EXISTS idx_historico_estoque_data ON historico_estoque(created_at);

-- Views úteis para relatórios
CREATE OR REPLACE VIEW view_vendas_completas AS
SELECT 
    v.id,
    v.vendedor,
    v.cliente_nome,
    v.data_venda,
    v.total,
    v.desconto,
    v.forma_pagamento,
    v.status,
    COUNT(iv.id) as total_itens,
    SUM(iv.quantidade) as total_produtos
FROM vendas v
LEFT JOIN itens_venda iv ON v.id = iv.venda_id
GROUP BY v.id, v.vendedor, v.cliente_nome, v.data_venda, v.total, v.desconto, v.forma_pagamento, v.status;

CREATE OR REPLACE VIEW view_produtos_estoque AS
SELECT 
    p.id,
    p.nome,
    p.categoria,
    p.preco,
    p.quantidade_estoque,
    p.estoque_minimo,
    CASE 
        WHEN p.quantidade_estoque <= p.estoque_minimo THEN 'baixo'
        WHEN p.quantidade_estoque = 0 THEN 'zerado'
        ELSE 'normal'
    END as status_estoque,
    p.ativo
FROM produtos p;

-- Funções para relatórios e análises
CREATE OR REPLACE FUNCTION get_top_produtos(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    produto_nome TEXT,
    categoria TEXT,
    total_vendido BIGINT,
    receita_total NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        iv.produto_nome::TEXT,
        COALESCE(p.categoria, 'Sem categoria')::TEXT,
        SUM(iv.quantidade)::BIGINT as total_vendido,
        SUM(iv.subtotal)::NUMERIC as receita_total
    FROM itens_venda iv
    LEFT JOIN produtos p ON iv.produto_id = p.id
    LEFT JOIN vendas v ON iv.venda_id = v.id
    WHERE v.status = 'concluida'
    GROUP BY iv.produto_nome, p.categoria
    ORDER BY total_vendido DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_vendas_por_vendedor()
RETURNS TABLE (
    vendedor_nome TEXT,
    total_vendas BIGINT,
    receita_total NUMERIC,
    ticket_medio NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.vendedor::TEXT,
        COUNT(*)::BIGINT as total_vendas,
        SUM(v.total)::NUMERIC as receita_total,
        AVG(v.total)::NUMERIC as ticket_medio
    FROM vendas v
    WHERE v.status = 'concluida'
    GROUP BY v.vendedor
    ORDER BY receita_total DESC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_vendas_por_periodo(
    data_inicio DATE,
    data_fim DATE
)
RETURNS TABLE (
    data_venda DATE,
    total_vendas BIGINT,
    receita_total NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.data_venda::DATE,
        COUNT(*)::BIGINT as total_vendas,
        SUM(v.total)::NUMERIC as receita_total
    FROM vendas v
    WHERE v.status = 'concluida'
        AND v.data_venda::DATE BETWEEN data_inicio AND data_fim
    GROUP BY v.data_venda::DATE
    ORDER BY v.data_venda::DATE;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar estoque automaticamente nas vendas
CREATE OR REPLACE FUNCTION trigger_atualizar_estoque_venda()
RETURNS TRIGGER AS $$
BEGIN
    -- Se for uma nova venda concluída, diminuir estoque
    IF TG_OP = 'INSERT' THEN
        UPDATE produtos 
        SET quantidade_estoque = quantidade_estoque - NEW.quantidade
        WHERE id = NEW.produto_id;
        
        -- Registrar movimento no histórico
        INSERT INTO historico_estoque (produto_id, tipo_movimento, quantidade_anterior, quantidade_movimento, quantidade_nova, motivo, venda_id)
        SELECT 
            NEW.produto_id,
            'saida',
            p.quantidade_estoque + NEW.quantidade,
            NEW.quantidade,
            p.quantidade_estoque,
            'Venda',
            (SELECT venda_id FROM itens_venda WHERE id = NEW.id)
        FROM produtos p WHERE p.id = NEW.produto_id;
        
    -- Se for atualização de item, ajustar diferença
    ELSIF TG_OP = 'UPDATE' THEN
        IF NEW.quantidade != OLD.quantidade THEN
            UPDATE produtos 
            SET quantidade_estoque = quantidade_estoque + OLD.quantidade - NEW.quantidade
            WHERE id = NEW.produto_id;
            
            -- Registrar movimento no histórico
            INSERT INTO historico_estoque (produto_id, tipo_movimento, quantidade_anterior, quantidade_movimento, quantidade_nova, motivo, venda_id)
            SELECT 
                NEW.produto_id,
                CASE WHEN NEW.quantidade > OLD.quantidade THEN 'saida' ELSE 'entrada' END,
                p.quantidade_estoque - OLD.quantidade + NEW.quantidade,
                ABS(NEW.quantidade - OLD.quantidade),
                p.quantidade_estoque,
                'Ajuste de venda',
                NEW.venda_id
            FROM produtos p WHERE p.id = NEW.produto_id;
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger nos itens de venda (apenas para vendas concluídas)
CREATE TRIGGER trigger_itens_venda_estoque
    AFTER INSERT OR UPDATE ON itens_venda
    FOR EACH ROW
    WHEN ((SELECT status FROM vendas WHERE id = COALESCE(NEW.venda_id, OLD.venda_id)) = 'concluida')
    EXECUTE FUNCTION trigger_atualizar_estoque_venda();