-- =============================================
-- SCRIPT DE LIMPEZA DO BANCO SUPABASE
-- Remove todos os dados EXCETO estoque (produtos)
-- =============================================

-- IMPORTANTE: Execute este script no Supabase SQL Editor
-- Este script manterá apenas os dados da tabela de produtos (estoque)

BEGIN;

-- 1. LIMPAR TABELA DE VENDAS
-- Remove todas as vendas registradas
DELETE FROM vendas;
RESET IDENTITY IF EXISTS vendas RESTART IDENTITY CASCADE;

-- 2. LIMPAR TABELA DE CLIENTES  
-- Remove todos os clientes cadastrados
DELETE FROM clientes;
RESET IDENTITY IF EXISTS clientes RESTART IDENTITY CASCADE;

-- 3. LIMPAR TABELA DE METAS
-- Remove todas as metas configuradas
DELETE FROM metas;
RESET IDENTITY IF EXISTS metas RESTART IDENTITY CASCADE;

-- 4. LIMPAR TABELA DE CAPITAL DE GIRO
-- Remove configurações de capital de giro
DELETE FROM capital_giro;
RESET IDENTITY IF EXISTS capital_giro RESTART IDENTITY CASCADE;

-- 5. LIMPAR KEY-VALUE STORE (se existir)
-- Remove dados do sistema KV genérico
DELETE FROM kv_store_f57293e2;

-- 6. LIMPAR DADOS DE AUTENTICAÇÃO (opcional - descomente se necessário)
-- CUIDADO: Isso vai remover todos os usuários cadastrados
-- DELETE FROM auth.users;

-- 7. MANTER INTACTA A TABELA DE PRODUTOS (ESTOQUE)
-- A tabela 'produtos' NÃO será modificada
-- Todos os produtos cadastrados permanecerão

-- Verificar quais tabelas têm dados após limpeza
SELECT 
    'produtos' as tabela, 
    COUNT(*) as registros_restantes
FROM produtos
UNION ALL
SELECT 'vendas', COUNT(*) FROM vendas
UNION ALL  
SELECT 'clientes', COUNT(*) FROM clientes
UNION ALL
SELECT 'metas', COUNT(*) FROM metas
UNION ALL
SELECT 'capital_giro', COUNT(*) FROM capital_giro
UNION ALL
SELECT 'kv_store_f57293e2', COUNT(*) FROM kv_store_f57293e2;

COMMIT;

-- =============================================
-- RESUMO DA LIMPEZA:
-- ✅ MANTIDO: Tabela 'produtos' (estoque completo)
-- 🗑️ LIMPO: vendas, clientes, metas, capital_giro, kv_store
-- ⚠️  OPCIONAL: dados de autenticação (comentado)
-- =============================================