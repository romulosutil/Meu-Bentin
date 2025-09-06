-- Migração 006: Adicionar colunas extras para produtos aprimorados
-- Execute este arquivo no SQL Editor do Supabase para adicionar as colunas extras

-- Adicionar colunas extras à tabela produtos
ALTER TABLE produtos
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS tamanhos TEXT[],
ADD COLUMN IF NOT EXISTS genero TEXT CHECK (genero IN ('masculino', 'feminino', 'unissex')),
ADD COLUMN IF NOT EXISTS cores TEXT[],
ADD COLUMN IF NOT EXISTS tipo_tecido TEXT;

-- Comentários para documentação
COMMENT ON COLUMN produtos.image_url IS 'URL da imagem do produto';
COMMENT ON COLUMN produtos.tamanhos IS 'Array de tamanhos disponíveis (P, M, G, 4, 6, 8, etc)';
COMMENT ON COLUMN produtos.genero IS 'Classificação por gênero: masculino, feminino, unissex';
COMMENT ON COLUMN produtos.cores IS 'Array de cores disponíveis';
COMMENT ON COLUMN produtos.tipo_tecido IS 'Tipo de tecido do produto (Algodão, Poliéster, etc)';

-- Definir valores padrão para produtos existentes
UPDATE produtos 
SET genero = 'unissex' 
WHERE genero IS NULL;

-- Verificar se as colunas foram criadas
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'produtos' 
AND column_name IN ('image_url', 'tamanhos', 'genero', 'cores', 'tipo_tecido');