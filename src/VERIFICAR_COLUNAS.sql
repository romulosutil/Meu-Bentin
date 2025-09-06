-- SQL para verificar se as colunas extras foram criadas na tabela produtos
-- Execute este comando no SQL Editor do Supabase para verificar

-- 1. Verificar estrutura da tabela produtos
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'produtos' 
ORDER BY ordinal_position;

-- 2. Verificar se as colunas específicas existem
SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'produtos' AND column_name = 'image_url'
    ) THEN '✅ image_url existe' ELSE '❌ image_url NÃO existe' END as image_url_status,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'produtos' AND column_name = 'tamanhos'
    ) THEN '✅ tamanhos existe' ELSE '❌ tamanhos NÃO existe' END as tamanhos_status,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'produtos' AND column_name = 'genero'
    ) THEN '✅ genero existe' ELSE '❌ genero NÃO existe' END as genero_status,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'produtos' AND column_name = 'cores'
    ) THEN '✅ cores existe' ELSE '❌ cores NÃO existe' END as cores_status,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'produtos' AND column_name = 'tipo_tecido'
    ) THEN '✅ tipo_tecido existe' ELSE '❌ tipo_tecido NÃO existe' END as tipo_tecido_status;

-- 3. Se as colunas NÃO existem, execute este comando para criá-las:
/*
ALTER TABLE produtos
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS tamanhos TEXT[],
ADD COLUMN IF NOT EXISTS genero TEXT CHECK (genero IN ('masculino', 'feminino', 'unissex')),
ADD COLUMN IF NOT EXISTS cores TEXT[],
ADD COLUMN IF NOT EXISTS tipo_tecido TEXT;

-- Definir valores padrão para produtos existentes
UPDATE produtos 
SET genero = 'unissex' 
WHERE genero IS NULL;
*/