# 🗂️ Configuração do Bucket de Imagens - Supabase Storage

## ⚠️ **IMPORTANTE - Configure antes de usar o upload**

Para o sistema de upload de imagens funcionar, você precisa criar e configurar um bucket no Supabase Storage.

## 🚀 **Passo a Passo**

### **1. Acesse o Painel do Supabase**
- Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard)
- Faça login com sua conta
- Selecione seu projeto "Meu Bentin"

### **2. Navegue para Storage**
- No menu lateral esquerdo, clique em **"Storage"**
- Você verá a página de gerenciamento de buckets

### **3. Criar Bucket de Imagens**
- Clique no botão **"New bucket"** (+ ou Novo bucket)
- Preencha os campos:
  - **Name (Nome)**: `produtos-images` (exatamente assim)
  - **Public bucket**: ✅ **Marque como público**
  - **File size limit**: `5242880` (5MB)
  - **Allowed MIME types**: 
    ```
    image/jpeg
    image/jpg  
    image/png
    image/webp
    ```

### **4. Configurar Políticas RLS (Row Level Security)**

Após criar o bucket, você precisa configurar as políticas de acesso:

#### **Política para Upload (INSERT)**
```sql
-- Permitir upload para usuários autenticados
CREATE POLICY "Allow authenticated users to upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'produtos-images');
```

#### **Política para Leitura (SELECT)**
```sql  
-- Permitir leitura pública das imagens
CREATE POLICY "Allow public read access to images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'produtos-images');
```

#### **Política para Atualização (UPDATE)**
```sql
-- Permitir usuários autenticados atualizarem suas imagens
CREATE POLICY "Allow authenticated users to update images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'produtos-images')
WITH CHECK (bucket_id = 'produtos-images');
```

#### **Política para Exclusão (DELETE)**
```sql
-- Permitir usuários autenticados excluírem imagens
CREATE POLICY "Allow authenticated users to delete images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'produtos-images');
```

### **5. Aplicar as Políticas**

1. Vá para **"SQL Editor"** no painel do Supabase
2. Cole e execute cada uma das políticas SQL acima
3. Execute uma por vez clicando em **"RUN"**

### **6. Verificar Configuração**

Para verificar se está tudo funcionando:

1. Volte para **Storage** > **produtos-images**
2. Tente fazer upload de uma imagem de teste
3. Verifique se a imagem aparece na listagem
4. Clique na imagem e copie a URL pública

## 🎯 **Configuração Alternativa Simplificada**

Se preferir uma configuração mais simples, você pode desabilitar completamente o RLS para o bucket:

```sql
-- ATENÇÃO: Esta configuração é menos segura mas mais simples
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

## ✅ **Verificação Final**

Após a configuração, teste o sistema:

1. Acesse o formulário de produtos
2. Clique em "Escolher Arquivo"
3. Selecione uma imagem (JPG, PNG ou WebP)
4. Verifique se o upload é bem-sucedido
5. Confirme se a imagem aparece no preview

## 🔧 **Estrutura do Bucket**

O bucket será organizado assim:
```
produtos-images/
├── produtos/
│   ├── 1703123456789-abc123.jpg
│   ├── 1703123789012-def456.png
│   └── ...
```

## 🚨 **Possíveis Erros**

### **"Bucket não encontrado"**
- Verifique se o nome do bucket é exatamente `produtos-images`
- Certifique-se de que o bucket foi criado

### **"Erro de permissão"**  
- Verifique se as políticas RLS foram configuradas corretamente
- Certifique-se de que o usuário está autenticado

### **"Tipo de arquivo não suportado"**
- Use apenas JPG, PNG ou WebP
- Verifique se o arquivo não está corrompido

### **"Arquivo muito grande"**
- Tamanho máximo: 5MB
- Comprima a imagem se necessário

## 📋 **Resumo da Configuração**

1. ✅ Criar bucket `produtos-images` (público)
2. ✅ Configurar limite de 5MB
3. ✅ Permitir tipos: JPG, PNG, WebP  
4. ✅ Aplicar 4 políticas RLS
5. ✅ Testar upload no sistema

**Após essa configuração, o sistema de upload estará 100% funcional!** 🎉