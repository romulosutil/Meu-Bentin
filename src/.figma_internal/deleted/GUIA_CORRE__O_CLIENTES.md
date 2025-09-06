# 🔧 GUIA DE CORREÇÃO - Sistema de Clientes

## 🚨 **PROBLEMA IDENTIFICADO**

Erro relatado:
- ❌ "Erro ao carregar clientes: Error: Erro interno do servidor"
- ❌ "Erro ao carregar estatísticas: Error: Cliente não encontrado"

## 🎯 **SOLUÇÃO PASSO A PASSO**

### **PASSO 1: Executar Script SQL no Supabase**

1. Acesse o **Supabase Dashboard**
2. Vá para **SQL Editor**
3. Execute o script completo que está no arquivo `EXECUTAR_NO_SUPABASE.sql`

```sql
-- COPIE E COLE ESTE SCRIPT NO SQL EDITOR:

-- 1. Criar tabela clientes
CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    data_nascimento DATE,
    telefone TEXT,
    email TEXT UNIQUE,
    instagram TEXT,
    endereco TEXT,
    observacoes TEXT,
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Criar tabela filhos
CREATE TABLE IF NOT EXISTS filhos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    data_nascimento DATE,
    genero TEXT CHECK (genero IN ('masculino', 'feminino', 'unissex')),
    tamanho_preferido TEXT,
    observacoes TEXT,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Adicionar colunas na tabela vendas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'vendas' AND column_name = 'cliente_id') THEN
        ALTER TABLE vendas ADD COLUMN cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'vendas' AND column_name = 'cliente_nome') THEN
        ALTER TABLE vendas ADD COLUMN cliente_nome TEXT;
    END IF;
END $$;

-- 4. Inserir dados de exemplo
INSERT INTO clientes (nome, telefone, email, instagram)
SELECT 'Maria Silva', '(11) 99999-1234', 'maria@example.com', '@maria_silva'
WHERE NOT EXISTS (SELECT 1 FROM clientes LIMIT 1);

INSERT INTO filhos (cliente_id, nome, data_nascimento, genero, tamanho_preferido)
SELECT c.id, 'João Silva', '2018-05-15'::date, 'masculino', '4 anos'
FROM clientes c 
WHERE c.email = 'maria@example.com'
AND NOT EXISTS (SELECT 1 FROM filhos WHERE cliente_id = c.id);
```

### **PASSO 2: Verificar o Servidor Edge Function**

1. Vá para **Edge Functions** no Supabase Dashboard
2. Verifique se a função `make-server-f57293e2` está deployada
3. Se não estiver, faça o deploy:

```bash
supabase functions deploy make-server-f57293e2 --project-ref YOUR_PROJECT_ID
```

### **PASSO 3: Usar o Debug do Sistema**

1. Acesse a página **Vendas** no sistema
2. Clique no botão **"Debug"** (amarelo) 
3. Execute a verificação automática
4. Siga as instruções apresentadas

### **PASSO 4: Verificação Manual**

Execute estas queries para verificar se tudo está funcionando:

```sql
-- Verificar se as tabelas existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('clientes', 'filhos');

-- Verificar dados
SELECT COUNT(*) as total_clientes FROM clientes;
SELECT COUNT(*) as total_filhos FROM filhos;

-- Verificar coluna cliente_id em vendas
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'vendas' AND column_name = 'cliente_id';
```

## 🔍 **DIAGNÓSTICO DOS ERROS**

### **Erro: "Erro interno do servidor"**
**Causa:** Tabelas `clientes` e/ou `filhos` não existem no banco
**Solução:** Executar o script SQL do Passo 1

### **Erro: "Cliente não encontrado"**
**Causa:** Endpoint de estatísticas falhando
**Solução:** Verificar se o servidor Edge Function está deployado

### **Erro: "PGRST106" ou "table does not exist"**
**Causa:** Tabelas não foram criadas
**Solução:** Executar script SQL e verificar permissões

## ✅ **VERIFICAÇÃO FINAL**

Após executar as correções, teste:

1. **Acesse Vendas → Debug** e verifique se todos os componentes estão ✅
2. **Acesse Vendas → Clientes** e veja se carrega sem erros
3. **Teste criar um novo cliente** no sistema
4. **Verifique as estatísticas** na página de clientes

## 🎯 **RESULTADO ESPERADO**

Após a correção, você deve ver:
- ✅ Sistema de clientes funcionando
- ✅ Estatísticas carregando corretamente
- ✅ Possibilidade de criar e gerenciar clientes
- ✅ Associação de clientes às vendas

## 🆘 **SE AINDA HOUVER PROBLEMAS**

1. **Verifique as permissões RLS** no Supabase:
   - Authentication → Policies
   - Certifique-se que as tabelas `clientes` e `filhos` têm políticas adequadas

2. **Verifique os logs do Edge Function**:
   - Edge Functions → make-server-f57293e2 → Logs

3. **Confirme as variáveis de ambiente**:
   - Project Settings → API
   - Verifique se `SUPABASE_URL` e `SUPABASE_ANON_KEY` estão corretas

---

## 📞 **Status Final**

Depois de seguir este guia, o sistema de clientes deve estar **100% funcional**! 

O botão de Debug vai confirmar que tudo está funcionando corretamente. 🎉