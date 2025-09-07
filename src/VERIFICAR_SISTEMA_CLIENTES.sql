-- =====================================================
-- SCRIPT DE VERIFICAÇÃO DO SISTEMA DE CLIENTES
-- =====================================================
-- Execute este script no SQL Editor do Supabase
-- para verificar se o sistema está funcionando
-- =====================================================

-- 1. Verificar se as tabelas existem
SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('clientes', 'filhos', 'vendas')
ORDER BY table_name;

-- 2. Verificar estrutura da tabela clientes
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'clientes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar estrutura da tabela filhos
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'filhos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Verificar se a coluna cliente_id existe na tabela vendas
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'vendas' 
AND table_schema = 'public'
AND column_name IN ('cliente_id', 'cliente_nome')
ORDER BY column_name;

-- 5. Contar registros em cada tabela
SELECT 
    'clientes' as tabela,
    COUNT(*) as total_registros
FROM clientes
UNION ALL
SELECT 
    'filhos' as tabela,
    COUNT(*) as total_registros
FROM filhos
UNION ALL
SELECT 
    'vendas' as tabela,
    COUNT(*) as total_registros
FROM vendas;

-- 6. Testar inserção de cliente de teste
INSERT INTO clientes (nome, telefone, email, ativo) 
VALUES ('TESTE Cliente', '(11) 99999-0000', 'teste@cliente.com', true)
ON CONFLICT (email) DO NOTHING
RETURNING id, nome, email;

-- 7. Verificar se a função de verificação existe
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'verificar_sistema_clientes';

-- 8. Executar função de verificação (se existir)
-- SELECT * FROM verificar_sistema_clientes();

-- =====================================================
-- INSTRUÇÕES DE USO:
-- =====================================================
-- 1. Copie e cole este script no SQL Editor do Supabase
-- 2. Execute cada seção uma por vez
-- 3. Verifique se todas as tabelas existem
-- 4. Se alguma tabela não existir, execute as migrações:
--    - 003_create_clientes_system.sql
--    - 005_fix_clientes_system.sql
-- =====================================================