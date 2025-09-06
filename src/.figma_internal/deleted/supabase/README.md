# Configuração Supabase - Meu Bentin

## Status do Projeto

O sistema **Meu Bentin** atualmente funciona 100% com **localStorage** e não requer conexão com Supabase para funcionar. A estrutura Supabase foi criada para evolução futura do projeto.

## Correção do Erro 403

O erro 403 no deploy das Edge Functions foi corrigido removendo as funções desnecessárias. O projeto não utiliza Edge Functions.

### Estrutura Atual

```
/supabase/
├── config.toml              # Configuração principal (sem edge functions)
├── .gitignore              # Arquivos a ignorar
├── config.example.env      # Exemplo de variáveis de ambiente
├── migrations/             # Scripts SQL para estrutura do banco
│   ├── 001_create_database_structure.sql
│   └── 002_insert_initial_data.sql
└── functions/              # REMOVIDO - causava erro 403
```

## Como Configurar (Opcional)

Se quiser conectar com Supabase no futuro:

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma nova conta ou faça login
3. Crie um novo projeto
4. Anote a URL e as chaves API

### 2. Configurar Variáveis de Ambiente

1. Copie o arquivo `/supabase/config.example.env` para `.env.local` na raiz do projeto
2. Substitua os valores pelas informações do seu projeto Supabase:

```env
VITE_SUPABASE_URL=https://seu-projeto-id.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

### 3. Executar Migrações

No dashboard do Supabase:

1. Vá em **SQL Editor**
2. Cole o conteúdo de `001_create_database_structure.sql`
3. Execute
4. Cole o conteúdo de `002_insert_initial_data.sql`
5. Execute

### 4. Testar Conexão

Use o hook `useSupabase()` para testar:

```tsx
import { useSupabase } from '../hooks/useSupabase';

function TesteConexao() {
  const { isConnected, isLoading, error } = useSupabase();
  
  if (isLoading) return <div>Testando conexão...</div>;
  if (error) return <div>Erro: {error}</div>;
  if (isConnected) return <div>✅ Conectado ao Supabase!</div>;
  
  return <div>❌ Não conectado</div>;
}
```

## Migração do localStorage para Supabase

Para migrar os dados do localStorage para Supabase:

1. Use os hooks em `/hooks/useSupabase.ts`
2. Implemente migração gradual:
   - `useProdutos()` para produtos
   - `useVendas()` para vendas
   - `useCategorias()` para categorias
   - `useVendedores()` para vendedores

## Estrutura do Banco de Dados

### Tabelas Principais

- **usuarios** - Usuários do sistema
- **produtos** - Catálogo de produtos
- **categorias** - Categorias de produtos
- **vendedores** - Vendedores/funcionários
- **vendas** - Registro de vendas
- **itens_venda** - Itens de cada venda
- **historico_estoque** - Movimentações de estoque
- **configuracoes** - Configurações do sistema

### Funcionalidades Incluídas

- ✅ Autenticação de usuários
- ✅ Controle de estoque automático
- ✅ Histórico de movimentações
- ✅ Relatórios e análises
- ✅ Triggers para integridade
- ✅ Views para consultas otimizadas
- ✅ Funções personalizadas para relatórios

## Notas Importantes

- **O sistema funciona 100% sem Supabase** (usa localStorage)
- As edge functions foram removidas para evitar erro 403
- A estrutura está pronta para migração futura
- Todos os dados de exemplo estão incluídos nas migrações
- O cliente Supabase já está configurado e pronto para uso

## Suporte

Para dúvidas sobre a configuração do Supabase:
1. Consulte a [documentação oficial](https://supabase.com/docs)
2. Verifique os hooks em `/hooks/useSupabase.ts`
3. Revise o cliente em `/utils/supabaseClient.ts`