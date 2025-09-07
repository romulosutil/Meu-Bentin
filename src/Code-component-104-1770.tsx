-- =============================================
-- SCRIPT DE LIMPEZA SEGURA DO BANCO SUPABASE
-- Remove todos os dados EXCETO estoque (produtos)
-- Verifica existência das tabelas antes de limpar
-- =============================================

-- IMPORTANTE: Execute este script no Supabase SQL Editor
-- Este script é mais seguro pois verifica se as tabelas existem

DO $$
DECLARE
    table_count INTEGER;
BEGIN
    RAISE NOTICE 'Iniciando limpeza segura do banco de dados...';
    RAISE NOTICE 'MANTENDO: Tabela produtos (estoque)';
    RAISE NOTICE 'LIMPANDO: Todas as outras tabelas';
    RAISE NOTICE '==========================================';

    -- 1. LIMPAR VENDAS (se existir)
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_name = 'vendas' AND table_schema = 'public';
    
    IF table_count > 0 THEN
        SELECT COUNT(*) INTO table_count FROM vendas;
        DELETE FROM vendas;
        RAISE NOTICE 'Tabela VENDAS: % registros removidos', table_count;
    ELSE
        RAISE NOTICE 'Tabela VENDAS: não encontrada';
    END IF;

    -- 2. LIMPAR CLIENTES (se existir)
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_name = 'clientes' AND table_schema = 'public';
    
    IF table_count > 0 THEN
        SELECT COUNT(*) INTO table_count FROM clientes;
        DELETE FROM clientes;
        RAISE NOTICE 'Tabela CLIENTES: % registros removidos', table_count;
    ELSE
        RAISE NOTICE 'Tabela CLIENTES: não encontrada';
    END IF;

    -- 3. LIMPAR METAS (se existir)
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_name = 'metas' AND table_schema = 'public';
    
    IF table_count > 0 THEN
        SELECT COUNT(*) INTO table_count FROM metas;
        DELETE FROM metas;
        RAISE NOTICE 'Tabela METAS: % registros removidos', table_count;
    ELSE
        RAISE NOTICE 'Tabela METAS: não encontrada';
    END IF;

    -- 4. LIMPAR CAPITAL DE GIRO (se existir)
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_name = 'capital_giro' AND table_schema = 'public';
    
    IF table_count > 0 THEN
        SELECT COUNT(*) INTO table_count FROM capital_giro;
        DELETE FROM capital_giro;
        RAISE NOTICE 'Tabela CAPITAL_GIRO: % registros removidos', table_count;
    ELSE
        RAISE NOTICE 'Tabela CAPITAL_GIRO: não encontrada';
    END IF;

    -- 5. LIMPAR KV STORE (se existir)
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_name = 'kv_store_f57293e2' AND table_schema = 'public';
    
    IF table_count > 0 THEN
        SELECT COUNT(*) INTO table_count FROM kv_store_f57293e2;
        DELETE FROM kv_store_f57293e2;
        RAISE NOTICE 'Tabela KV_STORE: % registros removidos', table_count;
    ELSE
        RAISE NOTICE 'Tabela KV_STORE: não encontrada';
    END IF;

    -- 6. VERIFICAR PRODUTOS (mantidos)
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_name = 'produtos' AND table_schema = 'public';
    
    IF table_count > 0 THEN
        SELECT COUNT(*) INTO table_count FROM produtos;
        RAISE NOTICE 'Tabela PRODUTOS: % registros MANTIDOS (estoque preservado)', table_count;
    ELSE
        RAISE NOTICE 'Tabela PRODUTOS: não encontrada';
    END IF;

    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Limpeza concluída com sucesso!';
    RAISE NOTICE 'Estoque (produtos) preservado integralmente';
END $$;

-- Verificação final das tabelas
SELECT 
    schemaname,
    tablename,
    n_tup_ins as total_insertions,
    n_tup_upd as total_updates,
    n_tup_del as total_deletions
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY tablename;