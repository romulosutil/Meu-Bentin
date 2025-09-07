# 🚨 **CORREÇÃO URGENTE - Tabela capital_giro**

## ❌ **ERRO IDENTIFICADO:**
```
Erro ao buscar capital de giro: {
  "code": "PGRST205",
  "details": null,
  "hint": "Perhaps you meant the table 'public.categorias'",
  "message": "Could not find the table 'public.capital_giro' in the schema cache"
}
```

## ✅ **SOLUÇÃO CRIADA:**
Foi criada a migração `008_create_capital_giro_table.sql` que precisa ser executada no Supabase.

---

## 📋 **EXECUTAR NO SUPABASE SQL EDITOR:**

### **1. Acesse o Painel do Supabase:**
- Vá para [supabase.com](https://supabase.com)
- Acesse seu projeto
- Vá em **SQL Editor** no menu lateral

### **2. Execute o SQL da Migração:**
```sql
-- Migração para criar tabela capital_giro
-- Esta tabela armazena o capital de giro da loja

-- Criar tabela capital_giro
CREATE TABLE IF NOT EXISTS public.capital_giro (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    valor_inicial DECIMAL(10,2) NOT NULL,
    data_configuracao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    historico JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentários para documentação
COMMENT ON TABLE public.capital_giro IS 'Armazena informações sobre o capital de giro da loja';
COMMENT ON COLUMN public.capital_giro.id IS 'Identificador único do registro';
COMMENT ON COLUMN public.capital_giro.valor_inicial IS 'Valor inicial do capital de giro em reais';
COMMENT ON COLUMN public.capital_giro.data_configuracao IS 'Data de configuração do capital';
COMMENT ON COLUMN public.capital_giro.historico IS 'Histórico de movimentações do capital (JSON)';

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_capital_giro_data_configuracao 
    ON public.capital_giro(data_configuracao DESC);

-- RLS (Row Level Security)
ALTER TABLE public.capital_giro ENABLE ROW LEVEL SECURITY;

-- Policy para permitir todas as operações (ajustar conforme necessário)
CREATE POLICY "Permitir todas operações em capital_giro" 
    ON public.capital_giro 
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_capital_giro_updated_at 
    BEFORE UPDATE ON public.capital_giro 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

### **3. Clique em "Run" para executar**

### **4. Verificar se a Tabela foi Criada:**
```sql
-- Verificar se a tabela foi criada corretamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'capital_giro' 
AND table_schema = 'public';
```

---

## 🧪 **TESTAR A CORREÇÃO:**

### **1. Teste de Inserção:**
```sql
-- Inserir um registro de teste
INSERT INTO public.capital_giro (valor_inicial, historico) 
VALUES (
    50000.00, 
    '[{"data": "2025-01-01T00:00:00Z", "valor": 50000, "tipo": "inicial", "descricao": "Capital inicial configurado"}]'::jsonb
);
```

### **2. Teste de Consulta:**
```sql
-- Consultar registros
SELECT * FROM public.capital_giro ORDER BY data_configuracao DESC;
```

---

## ✅ **DEPOIS DA EXECUÇÃO:**

Após executar a migração no Supabase:

1. ✅ **Tabela `capital_giro` criada**
2. ✅ **Erro PGRST205 resolvido**  
3. ✅ **Funcionalidade de capital de giro funcionando**
4. ✅ **Sistema pronto para uso**

---

## 🎯 **RESULTADO ESPERADO:**

- **Antes:** Erro ao acessar aba "Receita" → Capital de Giro
- **Depois:** Capital de giro funcionando normalmente, dados persistidos no Supabase

---

## ⚠️ **IMPORTANTE:**
- Execute apenas UMA VEZ no SQL Editor do Supabase
- A migração usa `IF NOT EXISTS` para evitar duplicação
- Após executar, teste a funcionalidade no sistema