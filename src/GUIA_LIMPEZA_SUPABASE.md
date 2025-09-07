# 🗑️ Guia de Limpeza do Banco Supabase

## 📋 Objetivo
Remover **todos os dados** do Supabase **EXCETO** os dados de estoque (tabela `produtos`).

## ⚠️ IMPORTANTE - LEIA ANTES DE EXECUTAR
- ❌ **Esta operação é IRREVERSÍVEL**
- ✅ **Os produtos (estoque) serão PRESERVADOS**
- ❌ **Todos os outros dados serão PERMANENTEMENTE REMOVIDOS:**
  - Todas as vendas registradas
  - Todos os clientes cadastrados
  - Todas as metas configuradas
  - Configurações de capital de giro
  - Dados do sistema KV

## 🚀 Como Executar

### Opção 1: Script Simples (Recomendado)
```sql
-- Execute o arquivo: LIMPEZA_DADOS_SUPABASE.sql
-- No Supabase Dashboard > SQL Editor
```

### Opção 2: Script Seguro (Mais Verboso)
```sql
-- Execute o arquivo: LIMPEZA_DADOS_SUPABASE_SEGURA.sql  
-- No Supabase Dashboard > SQL Editor
-- Mostra logs detalhados do processo
```

## 📝 Passos Detalhados

### 1. Acesse o Supabase Dashboard
- Vá para: https://supabase.com/dashboard
- Faça login na sua conta
- Selecione o projeto "Meu Bentin"

### 2. Abra o SQL Editor
- No menu lateral, clique em **"SQL Editor"**
- Clique em **"New query"**

### 3. Cole o Script
- Copie todo o conteúdo de um dos arquivos SQL
- Cole no editor do Supabase

### 4. Execute o Script
- Clique em **"Run"** (botão verde)
- Aguarde a execução completa
- Verifique os resultados na aba "Results"

## ✅ Verificação Pós-Limpeza

Após executar o script, execute esta consulta para verificar:

```sql
-- Verificar quantos registros restaram em cada tabela
SELECT 
    'produtos' as tabela, 
    COUNT(*) as registros_restantes
FROM produtos
UNION ALL
SELECT 'vendas', COUNT(*) FROM vendas
UNION ALL  
SELECT 'clientes', COUNT(*) FROM clientes
UNION ALL
SELECT 'metas', COUNT(*) FROM metas
UNION ALL
SELECT 'capital_giro', COUNT(*) FROM capital_giro;
```

**Resultado Esperado:**
- `produtos`: **X registros** (seus produtos preservados)
- `vendas`: **0 registros**
- `clientes`: **0 registros** 
- `metas`: **0 registros**
- `capital_giro`: **0 registros**

## 🔄 O que Acontece no Sistema

### ✅ Continuará Funcionando:
- **Módulo Estoque**: Todos os produtos preservados
- **Sistema de autenticação**: Login funcionando
- **Estrutura do banco**: Tabelas intactas

### 🔄 Precisará Reconfigurar:
- **Módulo Vendas**: Histórico zerado
- **Módulo Clientes**: Lista vazia  
- **Módulo Receita**: Sem dados para análise
- **Capital de Giro**: Precisará reconfigurar
- **Metas**: Precisará definir novamente

## 🛡️ Backup (Opcional)

Se quiser fazer backup antes da limpeza:

```sql
-- Backup das vendas
CREATE TABLE vendas_backup AS SELECT * FROM vendas;

-- Backup dos clientes  
CREATE TABLE clientes_backup AS SELECT * FROM clientes;

-- Para restaurar (se necessário):
-- INSERT INTO vendas SELECT * FROM vendas_backup;
-- INSERT INTO clientes SELECT * FROM clientes_backup;
```

## 🎯 Após a Limpeza

1. **Teste o sistema** - Verifique se o estoque está funcionando
2. **Reconfigure capital de giro** - Defina novo valor inicial
3. **Cadastre clientes** - Se necessário para testes
4. **Registre vendas** - Para testar o fluxo completo

## ❓ Problemas Comuns

**Erro: "relation does not exist"**
- Solução: Use o script seguro que verifica existência das tabelas

**Erro: "permission denied"**  
- Solução: Verifique se está logado como owner do projeto

**Sistema não carrega após limpeza**
- Solução: Recarregue a página, o sistema deve detectar dados vazios automaticamente

---

**🚨 LEMBRE-SE: Esta operação é irreversível. Certifique-se de que realmente deseja limpar todos os dados exceto o estoque.**