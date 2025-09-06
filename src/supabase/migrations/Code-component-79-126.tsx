-- =====================================================
-- MIGRAÇÃO 004: ADICIONAR CLIENTE_ID À TABELA VENDAS
-- =====================================================
-- Esta migração adiciona a referência de cliente às vendas
-- para integração completa com o sistema de clientes
-- =====================================================

-- 1. Verificar se a coluna cliente_id já existe, se não existir, adicionar
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'vendas' AND column_name = 'cliente_id') THEN
        ALTER TABLE vendas ADD COLUMN cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL;
        
        -- Adicionar índice para performance
        CREATE INDEX IF NOT EXISTS idx_vendas_cliente_id ON vendas(cliente_id);
        
        -- Comentário para documentação
        COMMENT ON COLUMN vendas.cliente_id IS 'Referência ao cliente que realizou a compra';
        
        RAISE NOTICE 'Coluna cliente_id adicionada à tabela vendas com sucesso';
    ELSE
        RAISE NOTICE 'Coluna cliente_id já existe na tabela vendas';
    END IF;
END $$;

-- 2. Verificar se a coluna cliente_nome já existe, se não existir, adicionar
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'vendas' AND column_name = 'cliente_nome') THEN
        ALTER TABLE vendas ADD COLUMN cliente_nome TEXT;
        
        -- Comentário para documentação
        COMMENT ON COLUMN vendas.cliente_nome IS 'Nome do cliente (para compatibilidade e busca rápida)';
        
        RAISE NOTICE 'Coluna cliente_nome adicionada à tabela vendas com sucesso';
    ELSE
        RAISE NOTICE 'Coluna cliente_nome já existe na tabela vendas';
    END IF;
END $$;

-- 3. Adicionar índice para busca por nome de cliente
CREATE INDEX IF NOT EXISTS idx_vendas_cliente_nome ON vendas(cliente_nome);

-- 4. Função para buscar vendas com informações de cliente
CREATE OR REPLACE FUNCTION get_vendas_com_clientes()
RETURNS TABLE (
    venda_id UUID,
    data_venda TIMESTAMPTZ,
    total DECIMAL,
    cliente_id UUID,
    cliente_nome TEXT,
    cliente_telefone TEXT,
    vendedor TEXT,
    forma_pagamento TEXT,
    status TEXT
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.id,
        v.data_venda,
        v.total,
        v.cliente_id,
        COALESCE(c.nome, v.cliente_nome) as cliente_nome,
        c.telefone as cliente_telefone,
        v.vendedor,
        v.forma_pagamento,
        v.status::TEXT
    FROM vendas v
    LEFT JOIN clientes c ON v.cliente_id = c.id
    WHERE v.status = 'concluida'
    ORDER BY v.data_venda DESC;
END;
$$;

-- 5. Função para buscar histórico de compras de um cliente
CREATE OR REPLACE FUNCTION get_historico_cliente(cliente_uuid UUID)
RETURNS TABLE (
    venda_id UUID,
    data_venda TIMESTAMPTZ,
    total DECIMAL,
    produto_nome TEXT,
    quantidade INTEGER,
    vendedor TEXT,
    forma_pagamento TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.id,
        v.data_venda,
        v.total,
        iv.produto_nome,
        iv.quantidade,
        v.vendedor,
        v.forma_pagamento
    FROM vendas v
    JOIN itens_venda iv ON v.id = iv.venda_id
    WHERE v.cliente_id = cliente_uuid 
    AND v.status = 'concluida'
    ORDER BY v.data_venda DESC;
END;
$$;

-- 6. Função para estatísticas de clientes
CREATE OR REPLACE FUNCTION get_stats_clientes()
RETURNS TABLE (
    total_clientes BIGINT,
    total_filhos BIGINT,
    vendas_com_cliente BIGINT,
    vendas_sem_cliente BIGINT,
    receita_total_com_cliente DECIMAL
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM clientes WHERE ativo = true)::BIGINT as total_clientes,
        (SELECT COUNT(*) FROM filhos)::BIGINT as total_filhos,
        (SELECT COUNT(*) FROM vendas WHERE cliente_id IS NOT NULL AND status = 'concluida')::BIGINT as vendas_com_cliente,
        (SELECT COUNT(*) FROM vendas WHERE cliente_id IS NULL AND status = 'concluida')::BIGINT as vendas_sem_cliente,
        (SELECT COALESCE(SUM(total), 0) FROM vendas WHERE cliente_id IS NOT NULL AND status = 'concluida')::DECIMAL as receita_total_com_cliente;
END;
$$;

-- 7. View para facilitar consultas de vendas com clientes
CREATE OR REPLACE VIEW view_vendas_completas AS
SELECT 
    v.id as venda_id,
    v.data_venda,
    v.total,
    v.desconto,
    v.forma_pagamento,
    v.vendedor,
    v.observacoes,
    v.status,
    -- Informações do cliente
    c.id as cliente_id,
    c.nome as cliente_nome,
    c.telefone as cliente_telefone,
    c.email as cliente_email,
    c.instagram as cliente_instagram,
    -- Contagem de filhos
    (SELECT COUNT(*) FROM filhos f WHERE f.cliente_id = c.id) as total_filhos,
    -- Itens da venda
    json_agg(
        json_build_object(
            'produto_id', iv.produto_id,
            'produto_nome', iv.produto_nome,
            'quantidade', iv.quantidade,
            'preco_unitario', iv.preco_unitario,
            'subtotal', iv.subtotal
        )
    ) as itens
FROM vendas v
LEFT JOIN clientes c ON v.cliente_id = c.id
LEFT JOIN itens_venda iv ON v.id = iv.venda_id
WHERE v.status = 'concluida'
GROUP BY v.id, c.id
ORDER BY v.data_venda DESC;

-- 8. Comentários finais para documentação
COMMENT ON FUNCTION get_vendas_com_clientes() IS 'Retorna todas as vendas com informações de cliente associado';
COMMENT ON FUNCTION get_historico_cliente(UUID) IS 'Retorna histórico de compras de um cliente específico';
COMMENT ON FUNCTION get_stats_clientes() IS 'Retorna estatísticas gerais sobre clientes e vendas';
COMMENT ON VIEW view_vendas_completas IS 'View que combina vendas, clientes e itens para consultas completas';

-- =====================================================
-- FIM DA MIGRAÇÃO 004
-- =====================================================