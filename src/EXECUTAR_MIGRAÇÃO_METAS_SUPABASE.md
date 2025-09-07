# 🎯 MIGRAÇÃO: Sistema de Metas para Supabase

## ✅ **Instruções de Execução**

### **1. Executar Migração SQL no Supabase**

Acesse o **Supabase Dashboard** → **SQL Editor** e execute o seguinte SQL:

```sql
-- Migração para criar tabela de metas de vendas
-- Execute este SQL no Supabase SQL Editor

-- Criar tabela de metas
CREATE TABLE IF NOT EXISTS metas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    valor DECIMAL(10, 2) NOT NULL CHECK (valor > 0),
    mes VARCHAR(20) NOT NULL,
    ano INTEGER NOT NULL CHECK (ano >= 2020 AND ano <= 2050),
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint para garantir que só existe uma meta ativa por mês/ano
    CONSTRAINT unique_meta_mes_ano UNIQUE (mes, ano, ativo) 
    DEFERRABLE INITIALLY DEFERRED
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_metas_mes_ano ON metas(mes, ano);
CREATE INDEX IF NOT EXISTS idx_metas_ativo ON metas(ativo);
CREATE INDEX IF NOT EXISTS idx_metas_ano_desc ON metas(ano DESC);

-- Adicionar comentários para documentação
COMMENT ON TABLE metas IS 'Tabela para armazenar metas de vendas mensais';
COMMENT ON COLUMN metas.valor IS 'Valor da meta em reais';
COMMENT ON COLUMN metas.mes IS 'Nome do mês (Janeiro, Fevereiro, etc.)';
COMMENT ON COLUMN metas.ano IS 'Ano da meta';
COMMENT ON COLUMN metas.data_inicio IS 'Data de início do período da meta';
COMMENT ON COLUMN metas.data_fim IS 'Data de fim do período da meta';
COMMENT ON COLUMN metas.ativo IS 'Se a meta está ativa (apenas uma meta ativa por mês/ano)';

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at na tabela metas
DROP TRIGGER IF EXISTS update_metas_updated_at ON metas;
CREATE TRIGGER update_metas_updated_at
    BEFORE UPDATE ON metas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir meta inicial para o mês atual (opcional)
INSERT INTO metas (valor, mes, ano, data_inicio, data_fim, ativo)
VALUES (
    50000.00,
    TRIM(TO_CHAR(CURRENT_DATE, 'Month')),
    EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
    DATE_TRUNC('month', CURRENT_DATE)::DATE,
    (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::DATE,
    true
) ON CONFLICT (mes, ano, ativo) DO NOTHING;

-- Verificar se a tabela foi criada corretamente
SELECT 
    'Tabela metas criada com sucesso!' as status,
    COUNT(*) as total_metas
FROM metas;
```

### **2. Verificar se Funcionou**

Após executar a migração, execute esta consulta para verificar:

```sql
-- Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'metas' 
ORDER BY ordinal_position;

-- Verificar dados inseridos
SELECT * FROM metas;
```

### **3. Resultado Esperado**

✅ **Sucesso se você ver:**
- Tabela `metas` criada com todas as colunas
- Meta inicial inserida para o mês atual
- Mensagem: "Tabela metas criada com sucesso!"

## 🔄 **Funcionalidades Implementadas**

### **✅ Backend (Supabase Service)**
- ✅ `criarMeta()` - Criar nova meta
- ✅ `obterMetas()` - Listar todas as metas
- ✅ `obterMetaPorMesAno()` - Buscar meta específica
- ✅ `atualizarMeta()` - Atualizar meta existente
- ✅ `criarOuAtualizarMeta()` - Upsert inteligente

### **✅ Frontend (Hook + Dashboard)**
- ✅ Hook `useMetas()` para gerenciamento completo
- ✅ Dashboard integrado com Supabase
- ✅ Interface para criar/editar metas
- ✅ Carregamento e erro tratados
- ✅ Estados de loading bem definidos

### **✅ Migrações**
- ✅ Migração SQL completa com constraints
- ✅ Índices para performance
- ✅ Triggers para updated_at automático
- ✅ Meta inicial inserida automaticamente

## 🎯 **Após a Migração**

1. **Deploy do Frontend**: Pode fazer deploy normalmente
2. **Testar Metas**: Configure uma meta no Dashboard
3. **Verificar Persistência**: Meta deve permanecer após refresh
4. **Monitorar**: Verifique se não há erros no console

## 🔧 **Migração de Dados Existentes**

Se você tinha metas no localStorage, elas serão ignoradas. O sistema agora usa **apenas o Supabase**. Para migrar dados antigos manualmente:

```sql
-- Exemplo de inserção manual de meta antiga
INSERT INTO metas (valor, mes, ano, data_inicio, data_fim, ativo)
VALUES (75000.00, 'Setembro', 2025, '2025-09-01', '2025-09-30', true);
```

---

**✅ Execute a migração e confirme que funcionou antes de fazer o deploy!**