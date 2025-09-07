-- SQL para verificar se as colunas SKU e fornecedor existem
-- Execute este comando no SQL Editor do Supabase

-- 1. Verificar todas as colunas da tabela produtos
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'produtos' 
ORDER BY ordinal_position;

-- 2. Verificar se as colunas específicas existem
SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'produtos' AND column_name = 'sku'
    ) THEN '✅ sku existe' ELSE '❌ sku NÃO existe' END as sku_status,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'produtos' AND column_name = 'codigo_barras'
    ) THEN '✅ codigo_barras existe' ELSE '❌ codigo_barras NÃO existe' END as codigo_barras_status,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'produtos' AND column_name = 'fornecedor'
    ) THEN '✅ fornecedor existe' ELSE '❌ fornecedor NÃO existe' END as fornecedor_status;

-- 3. Se SKU não existe, execute este comando para criar:
-- ALTER TABLE produtos ADD COLUMN IF NOT EXISTS sku TEXT;