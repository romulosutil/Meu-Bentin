# 📁 Utils - Sistema Meu Bentin

Utilitários essenciais para o funcionamento do sistema de gestão.

## 📄 **Arquivos**

### `EstoqueContext.tsx`
**Contexto Principal do Sistema**
- Gerenciamento global de estado
- Persistência via localStorage
- Interfaces TypeScript completas
- Funções para produtos, vendas, estoque e categorias

### `validation.ts`
**Validações e Helpers**
- Validação de formulários
- Formatação de dados
- Utilities para manipulação

### `performance.ts`
**Otimizações**
- Hooks otimizados
- Funções de cache
- Memoização de cálculos

## 🎯 **Como Usar o EstoqueContext**

```typescript
import { useEstoque } from '../utils/EstoqueContext';

function MeuComponente() {
  const { 
    produtos, 
    vendas, 
    adicionarProduto, 
    adicionarVenda 
  } = useEstoque();
  
  // Usar as funções e dados do contexto
}
```

## 💾 **Persistência LocalStorage**

Dados salvos automaticamente:
- `meu-bentin-produtos` - Lista de produtos
- `meu-bentin-categorias` - Categorias de produtos
- `meu-bentin-vendedores` - Vendedores cadastrados
- `meu-bentin-vendas` - Histórico de vendas
- `meu-bentin-perdas` - Registro de perdas

## ✅ **Sistema Limpo**
- ✅ Zero dependências externas
- ✅ 100% localStorage
- ✅ Type safety completo
- ✅ Performance otimizada
- ✅ Pronto para produção