-- ============================================================================
-- SCRIPT DE LIMPEZA: CAPITAL DE GIRO - SUPABASE
-- ============================================================================
-- 
-- Este script remove todos os dados de capital de giro da base do Supabase
-- Executar no SQL Editor do Supabase Dashboard
--
-- ⚠️ ATENÇÃO: Esta operação é IRREVERSÍVEL!
-- ⚠️ Faça backup dos dados antes de executar se necessário
--
-- Data: ${new Date().toLocaleDateString('pt-BR')}
-- Sistema: Meu Bentin - Gerenciador de Vendas
-- ============================================================================

-- 1. VERIFICAR DADOS EXISTENTES (opcional - para conferência)
-- ============================================================================
-- Descomente as linhas abaixo para ver os dados antes da limpeza:

-- SELECT 
--     id,
--     valor_inicial,
--     data_configuracao,
--     historico,
--     created_at
-- FROM public.capital_giro 
-- ORDER BY created_at DESC;

-- SELECT COUNT(*) as total_registros FROM public.capital_giro;


-- 2. LIMPEZA COMPLETA DOS DADOS
-- ============================================================================

-- Remover todos os registros de capital de giro
DELETE FROM public.capital_giro;

-- Verificar se a limpeza foi bem-sucedida
SELECT COUNT(*) as registros_restantes FROM public.capital_giro;


-- 3. RESETAR SEQUÊNCIA (se necessário)
-- ============================================================================
-- Como usamos UUID, não há sequência para resetar
-- Mas vamos garantir que não há dependências orfãs


-- 4. LIMPEZA DO KV_STORE (se houver dados relacionados)
-- ============================================================================
-- Remove qualquer referência no kv_store que possa estar relacionada ao capital

DELETE FROM public.kv_store_f57293e2 
WHERE key LIKE '%capital%' 
   OR key LIKE '%giro%'
   OR key LIKE '%Capital%'
   OR key LIKE '%Giro%';


-- 5. VERIFICAÇÃO FINAL
-- ============================================================================

-- Confirmar que não há mais dados de capital de giro
SELECT 
    'capital_giro' as tabela,
    COUNT(*) as total_registros 
FROM public.capital_giro

UNION ALL

SELECT 
    'kv_store relacionado' as tabela,
    COUNT(*) as total_registros 
FROM public.kv_store_f57293e2 
WHERE key ILIKE '%capital%' OR key ILIKE '%giro%';


-- ============================================================================
-- RESULTADO ESPERADO:
-- ============================================================================
-- - capital_giro: 0 registros
-- - kv_store relacionado: 0 registros
--
-- Após executar este script:
-- 1. O sistema não terá nenhum capital de giro configurado
-- 2. O botão "Configurar Capital de Giro" aparecerá na tela de Receita
-- 3. Será possível configurar um novo capital do zero
-- ============================================================================

-- ✅ SCRIPT FINALIZADO
-- Execute todas as queries acima no SQL Editor do Supabase