-- =====================================================
-- SCRIPT DE TESTE PARA SISTEMA DE FILHOS
-- =====================================================
-- Execute este script no Supabase SQL Editor para 
-- verificar se as tabelas estão funcionando corretamente
-- =====================================================

-- 1. Verificar se as tabelas existem
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_name IN ('clientes', 'filhos') 
AND table_schema = 'public';

-- 2. Verificar estrutura da tabela filhos
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'filhos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar se há clientes para teste
SELECT id, nome, email, telefone, ativo 
FROM clientes 
WHERE ativo = true
LIMIT 5;

-- 4. Verificar se há filhos existentes
SELECT f.id, f.nome, f.genero, c.nome as nome_cliente
FROM filhos f
JOIN clientes c ON f.cliente_id = c.id
LIMIT 5;

-- 5. Teste de inserção de filho (substitua o cliente_id por um ID válido)
-- PRIMEIRO: pegue um ID de cliente válido da consulta acima
-- DEPOIS: execute o INSERT abaixo com o ID real

/*
INSERT INTO filhos (cliente_id, nome, data_nascimento, genero, tamanho_preferido)
VALUES (
    'SEU_CLIENTE_ID_AQUI', -- Substitua por um ID válido da consulta acima
    'Teste Filho',
    '2020-01-01',
    'unissex',
    'P'
);
*/

-- 6. Verificar permissões RLS (Row Level Security)
SELECT schemaname, tablename, hasrls, hasinserts, hasselects, hasupdates, hasdeletes
FROM pg_tables 
WHERE tablename IN ('clientes', 'filhos')
AND schemaname = 'public';

-- 7. Verificar políticas RLS se estiverem ativas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('clientes', 'filhos')
AND schemaname = 'public';

-- 8. Teste de relacionamento (FK)
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'filhos';

-- =====================================================
-- INSTRUÇÕES DE USO:
-- =====================================================
-- 1. Execute as consultas 1-4 para verificar estrutura
-- 2. Se a consulta 3 retornar clientes, copie um ID
-- 3. Descomente a consulta 5 e substitua o ID
-- 4. Execute a consulta 5 para testar inserção
-- 5. Execute as consultas 6-8 para verificar permissões
-- =====================================================