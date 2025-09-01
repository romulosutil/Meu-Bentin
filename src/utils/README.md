# 📁 Utils - Sistema Meu Bentin

Esta pasta contém utilitários essenciais para o funcionamento do sistema de gestão.

## 📄 **Arquivos Principais**

### `EstoqueContext.tsx`
**Contexto Principal do Sistema**
- Gerenciamento global de estado
- Persistência via localStorage
- Interfaces TypeScript para type safety
- Funções para produtos, vendas, estoque e categorias

### `validation.ts`
**Validações e Helpers**
- Validação de formulários
- Formatação de dados
- Utilities para manipulação de dados

### `performance.ts`
**Otimizações de Performance**
- Hooks otimizados
- Funções de cache
- Debounce e throttle
- Memoização de cálculos

## 🎯 **Funcionalidades do EstoqueContext**

### **Produtos**
```typescript
// Adicionar produto
adicionarProduto(produto: Omit<Produto, 'id' | 'dataCriacao' | 'ultimaAtualizacao'>)

// Editar produto
editarProduto(id: string, produto: Partial<Produto>)

// Adicionar estoque
adicionarEstoque(produtoId: string, quantidade: number)

// Registrar perda
registrarPerda(produtoId: string, quantidade: number, motivo: string)
```

### **Vendas**
```typescript
// Nova venda (atualiza estoque automaticamente)
adicionarVenda(venda: Omit<Venda, 'id' | 'numero' | 'data'>)

// Atualizar estoque por venda
atualizarEstoquePorVenda(itens: ItemVenda[])
```

### **Categorias e Vendedores**
```typescript
// Adicionar categoria
adicionarCategoria(nome: string): Categoria

// Adicionar vendedor
adicionarVendedor(vendedor: Omit<Vendedor, 'id' | 'dataCadastro'>)

// Editar vendedor
editarVendedor(id: string, vendedor: Partial<Vendedor>)
```

## 💾 **Persistência LocalStorage**

Todos os dados são salvos automaticamente no localStorage com as chaves:
- `meu-bentin-produtos` - Lista de produtos
- `meu-bentin-categorias` - Categorias de produtos
- `meu-bentin-vendedores` - Vendedores cadastrados
- `meu-bentin-vendas` - Histórico de vendas
- `meu-bentin-perdas` - Registro de perdas

## 🔧 **Como Usar**

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

## ✅ **Sistema Limpo**
- ✅ Zero dependências externas
- ✅ 100% localStorage
- ✅ Type safety completo
- ✅ Performance otimizada
- ✅ Pronto para produção