# Migração SQL - Produtos Aprimorados

## Objetivo
Adicionar novas colunas à tabela `produtos` no Supabase para suportar funcionalidades avançadas do sistema aprimorado.

## Comando SQL para Execução

Execute este comando no **SQL Editor** do seu projeto Supabase:

```sql
-- Migração 003: Produtos Aprimorados
-- Adiciona colunas para: imagem, múltiplos tamanhos, gênero, cores, tipo de tecido

ALTER TABLE produtos
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS tamanhos TEXT[],
ADD COLUMN IF NOT EXISTS genero TEXT,
ADD COLUMN IF NOT EXISTS cores TEXT[],
ADD COLUMN IF NOT EXISTS tipo_tecido TEXT;

-- Comentários para documentação
COMMENT ON COLUMN produtos.image_url IS 'URL da imagem do produto';
COMMENT ON COLUMN produtos.tamanhos IS 'Array de tamanhos disponíveis (P, M, G, 4, 6, 8, etc)';
COMMENT ON COLUMN produtos.genero IS 'Classificação por gênero: masculino, feminino, unissex';
COMMENT ON COLUMN produtos.cores IS 'Array de cores disponíveis';
COMMENT ON COLUMN produtos.tipo_tecido IS 'Tipo de tecido do produto (Algodão, Poliéster, etc)';

-- Verificar se as colunas foram criadas
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'produtos' 
AND column_name IN ('image_url', 'tamanhos', 'genero', 'cores', 'tipo_tecido');
```

## Como Executar

1. **Acesse o Supabase Dashboard** do seu projeto
2. **Vá para SQL Editor** no menu lateral
3. **Cole o comando acima** na área de texto
4. **Execute** clicando em "Run" ou Ctrl+Enter
5. **Verifique** se as colunas foram criadas com sucesso

## Verificação Pós-Migração

Após executar a migração, você deve ver as seguintes colunas adicionadas:

- ✅ `image_url` (TEXT) - Para URLs de imagens
- ✅ `tamanhos` (TEXT[]) - Array de tamanhos 
- ✅ `genero` (TEXT) - Gênero do produto
- ✅ `cores` (TEXT[]) - Array de cores
- ✅ `tipo_tecido` (TEXT) - Tipo de tecido

## Funcionalidades Ativadas

Com essa migração, o sistema aprimorado oferece:

### 🎨 **Interface Aprimorada**
- Formulário completo com upload de imagem
- Seleção múltipla de tamanhos com tags visuais
- Sistema de cores com input de tags
- Classificação por gênero (masculino/feminino/unissex)
- Seleção de tipo de tecido

### 📊 **Cálculos Automáticos**
- Margem de lucro calculada automaticamente
- Geração de SKU automática
- Indicadores visuais de margem (baixa/boa/alta)

### 📱 **Responsividade Total**
- Interface otimizada para desktop, tablet e mobile
- Tabela responsiva que vira cards em dispositivos móveis
- Modais ajustados para diferentes tamanhos de tela

### 🔄 **Compatibilidade**
- Mantém compatibilidade com dados existentes
- Sistema híbrido que funciona com produtos antigos e novos
- Não quebra funcionalidades existentes

## Status do Sistema

Após a migração, você verá:
- ✅ **Sistema Aprimorado Ativo** na interface
- 📸 Upload de imagem (URL por enquanto)
- 🏷️ Tags de tamanhos e cores interativas
- 📊 Cálculo automático de margem de lucro
- 🔍 Filtros avançados por gênero

## Próximos Passos

1. Execute a migração SQL
2. Teste o cadastro de novos produtos
3. Verifique se todos os campos aparecem
4. Teste a responsividade em diferentes dispositivos
5. Comece a utilizar as novas funcionalidades

## Suporte

Se houver algum erro na migração, verifique:
- Se você tem permissões de admin no Supabase
- Se a tabela `produtos` existe
- Se não há conflitos de nome de colunas

**Backup recomendado**: Antes de executar, faça um backup dos dados existentes por precaução.