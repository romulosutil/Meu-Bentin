-- Migração para adicionar coluna SKU se necessário
-- Execute este SQL no Supabase se a coluna SKU não existir

-- Verificar se precisa adicionar coluna SKU
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS sku TEXT;

-- Comentário: Se você preferir usar codigo_barras como SKU, não precisa executar a migração acima.
-- O sistema já está configurado para usar codigo_barras como SKU.