-- MIGRAÇÃO PARA CORREÇÕES DO MODAL EDITAR PRODUTO
-- Execute este SQL no Supabase para garantir que todas as colunas existem

-- 1. Verificar se a coluna SKU existe (pode já existir se você criou antes)
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS sku TEXT;

-- 2. Verificar estrutura da tabela para confirmar que todas as colunas necessárias existem
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'produtos' 
AND column_name IN (
    'sku', 
    'codigo_barras', 
    'fornecedor', 
    'image_url', 
    'tamanhos', 
    'genero', 
    'cores', 
    'tipo_tecido'
)
ORDER BY column_name;

-- 3. Resultado esperado: todas essas colunas devem aparecer na consulta acima
-- Se alguma estiver faltando, execute as linhas abaixo conforme necessário:

-- ALTER TABLE produtos ADD COLUMN IF NOT EXISTS sku TEXT;
-- ALTER TABLE produtos ADD COLUMN IF NOT EXISTS codigo_barras TEXT;
-- ALTER TABLE produtos ADD COLUMN IF NOT EXISTS fornecedor TEXT;
-- ALTER TABLE produtos ADD COLUMN IF NOT EXISTS image_url TEXT;
-- ALTER TABLE produtos ADD COLUMN IF NOT EXISTS tamanhos TEXT[];
-- ALTER TABLE produtos ADD COLUMN IF NOT EXISTS genero TEXT CHECK (genero IN ('masculino', 'feminino', 'unissex'));
-- ALTER TABLE produtos ADD COLUMN IF NOT EXISTS cores TEXT[];
-- ALTER TABLE produtos ADD COLUMN IF NOT EXISTS tipo_tecido TEXT;

-- 4. Definir valor padrão para gênero em produtos existentes (se necessário)
UPDATE produtos 
SET genero = 'unissex' 
WHERE genero IS NULL;

-- 5. Conferir se tudo está correto
SELECT COUNT(*) as total_produtos FROM produtos;
SELECT COUNT(*) as produtos_com_genero FROM produtos WHERE genero IS NOT NULL;