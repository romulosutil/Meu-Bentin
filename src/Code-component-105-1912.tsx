# 🧹 Limpeza do Capital de Giro - Supabase

## 📋 **Objetivo**
Remover completamente todos os dados de capital de giro da base do Supabase para permitir uma nova configuração limpa.

## ⚠️ **IMPORTANTE - Leia Antes de Executar**

### **Atenção:**
- ✅ Esta operação é **IRREVERSÍVEL**
- ✅ Todos os dados de capital de giro serão **PERDIDOS**
- ✅ Faça **backup** se necessário antes de executar
- ✅ Execute apenas se tiver certeza

## 🚀 **Como Executar**

### **Passo 1: Acessar o Supabase Dashboard**
1. Acesse [supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Selecione o projeto **Meu Bentin**
4. Navegue para **SQL Editor** no menu lateral

### **Passo 2: Executar o Script de Limpeza**
1. Abra o arquivo `LIMPEZA_CAPITAL_GIRO_SUPABASE.sql`
2. **Copie todo o conteúdo** do arquivo
3. **Cole** no SQL Editor do Supabase
4. Clique em **"Run"** para executar

### **Passo 3: Verificar os Resultados**
Após executar, você deve ver:
```sql
registros_restantes: 0
```

## 📊 **O Que Será Removido**

### **Tabela `capital_giro`:**
- ✅ Todos os registros de capital configurado
- ✅ Histórico de movimentações
- ✅ Datas de configuração

### **Tabela `kv_store_f57293e2`:**
- ✅ Chaves relacionadas a capital de giro
- ✅ Dados temporários ou cache

## 🎯 **Resultado Esperado**

### **No Sistema (após limpeza):**
1. **Tela Receita** mostrará a mensagem:
   ```
   "Configure seu Capital de Giro"
   ```

2. **Botão visível:**
   ```
   [💰 Configurar Capital de Giro]
   ```

3. **Estado limpo:**
   - Nenhum valor de capital configurado
   - Nenhum histórico anterior
   - Sistema pronto para nova configuração

## 🔄 **Após a Limpeza**

### **Próximos Passos:**
1. ✅ Acesse a **aba Receita** no sistema
2. ✅ Verifique se o botão **"Configurar Capital de Giro"** está visível
3. ✅ Clique no botão para configurar um novo valor
4. ✅ Defina o capital inicial desejado

## 🐛 **Solução de Problemas**

### **Se o botão não aparecer:**
1. **Force refresh** da página (Ctrl+F5)
2. **Limpe o cache** do navegador
3. **Verifique o console** do navegador para erros
4. **Confirme** que o script foi executado com sucesso

### **Se houver erro na execução:**
1. **Verifique** se você tem permissões de administrador
2. **Confirme** que está no projeto correto
3. **Execute** linha por linha se necessário
4. **Verifique** se não há dependências bloqueando

## 📝 **Verificação Final**

### **Para confirmar que a limpeza funcionou:**

Execute no SQL Editor:
```sql
-- Deve retornar 0
SELECT COUNT(*) FROM public.capital_giro;

-- Deve retornar 0
SELECT COUNT(*) FROM public.kv_store_f57293e2 
WHERE key ILIKE '%capital%' OR key ILIKE '%giro%';
```

### **No Sistema Web:**
- ✅ Aba **Receita** mostra tela de configuração
- ✅ Botão **"Configurar Capital de Giro"** visível
- ✅ Nenhum valor de capital exibido

---

## ✅ **Conclusão**

Após executar a limpeza:
- Todos os dados antigos de capital de giro serão removidos
- O sistema ficará em estado limpo para nova configuração
- O botão de configuração ficará visível na tela Receita
- Você poderá definir um novo capital inicial do zero

---

**🚨 Lembre-se: Esta operação não pode ser desfeita!**