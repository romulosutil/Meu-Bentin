import React, { createContext, useContext, useState, useEffect } from 'react';

// Interfaces compartilhadas
export interface Produto {
  id: string;
  nome: string;
  categoria: string;
  preco: number;
  precoPromocional?: number;
  emPromocao: boolean;
  quantidade: number;
  estoqueMinimo: number;
  dataCriacao: Date;
  ultimaAtualizacao: Date;
}

export interface Categoria {
  id: string;
  nome: string;
}

export interface Vendedor {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  comissao: number;
  dataCadastro: Date;
  ativo: boolean;
}

export interface ItemVenda {
  produtoId: string;
  produto: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

export interface Venda {
  id: string;
  numero: string;
  data: Date;
  cliente: string;
  vendedorId: string;
  vendedor: string;
  itens: ItemVenda[];
  subtotal: number;
  desconto: number;
  total: number;
  formaPagamento: string;
  status: 'pendente' | 'concluida' | 'cancelada';
  observacoes?: string;
}

export interface RegistroPerda {
  id: string;
  produtoId: string;
  quantidade: number;
  motivo: string;
  data: Date;
}

// Context Interface
interface EstoqueContextType {
  // Produtos
  produtos: Produto[];
  adicionarProduto: (produto: Omit<Produto, 'id' | 'dataCriacao' | 'ultimaAtualizacao'>) => void;
  editarProduto: (id: string, produto: Partial<Produto>) => void;
  adicionarEstoque: (produtoId: string, quantidade: number) => void;
  registrarPerda: (produtoId: string, quantidade: number, motivo: string) => void;
  atualizarEstoquePorVenda: (itens: ItemVenda[]) => void;

  // Categorias
  categorias: Categoria[];
  adicionarCategoria: (nome: string) => Categoria;

  // Vendedores
  vendedores: Vendedor[];
  adicionarVendedor: (vendedor: Omit<Vendedor, 'id' | 'dataCadastro'>) => Vendedor;
  editarVendedor: (id: string, vendedor: Partial<Vendedor>) => void;

  // Vendas
  vendas: Venda[];
  adicionarVenda: (venda: Omit<Venda, 'id' | 'numero' | 'data'>) => Venda;

  // Perdas
  perdas: RegistroPerda[];
}

// Context
const EstoqueContext = createContext<EstoqueContextType | undefined>(undefined);

// Provider Component
export const EstoqueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [produtos, setProdutos] = useState<Produto[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('meu-bentin-produtos');
      return saved ? JSON.parse(saved).map((p: any) => ({
        ...p,
        dataCriacao: new Date(p.dataCriacao),
        ultimaAtualizacao: new Date(p.ultimaAtualizacao)
      })) : [];
    }
    return [];
  });
  
  const [categorias, setCategorias] = useState<Categoria[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('meu-bentin-categorias');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  
  const [vendedores, setVendedores] = useState<Vendedor[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('meu-bentin-vendedores');
      return saved ? JSON.parse(saved).map((v: any) => ({
        ...v,
        dataCadastro: new Date(v.dataCadastro)
      })) : [];
    }
    return [];
  });
  
  const [vendas, setVendas] = useState<Venda[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('meu-bentin-vendas');
      return saved ? JSON.parse(saved).map((v: any) => ({
        ...v,
        data: new Date(v.data)
      })) : [];
    }
    return [];
  });
  
  const [perdas, setPerdas] = useState<RegistroPerda[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('meu-bentin-perdas');
      return saved ? JSON.parse(saved).map((p: any) => ({
        ...p,
        data: new Date(p.data)
      })) : [];
    }
    return [];
  });

  // Persistir dados no localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('meu-bentin-produtos', JSON.stringify(produtos));
    }
  }, [produtos]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('meu-bentin-categorias', JSON.stringify(categorias));
    }
  }, [categorias]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('meu-bentin-vendedores', JSON.stringify(vendedores));
    }
  }, [vendedores]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('meu-bentin-vendas', JSON.stringify(vendas));
    }
  }, [vendas]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('meu-bentin-perdas', JSON.stringify(perdas));
    }
  }, [perdas]);

  // Inicializar dados básicos apenas se não existirem no localStorage
  useEffect(() => {
    if (categorias.length === 0) {
      const categoriasIniciais: Categoria[] = [
        { id: '1', nome: 'Roupas Infantis' },
        { id: '2', nome: 'Acessórios' },
        { id: '3', nome: 'Calçados' },
      ];
      setCategorias(categoriasIniciais);
    }

    if (vendedores.length === 0) {
      const vendedoresIniciais: Vendedor[] = [
        {
          id: '1',
          nome: 'Vendedor Exemplo',
          email: 'vendedor@meubentin.com',
          telefone: '(11) 99999-0000',
          comissao: 5.0,
          dataCadastro: new Date(),
          ativo: true
        }
      ];
      setVendedores(vendedoresIniciais);
    }
  }, []);

  // Funções para produtos
  const adicionarProduto = (novoProduto: Omit<Produto, 'id' | 'dataCriacao' | 'ultimaAtualizacao'>) => {
    const produto: Produto = {
      ...novoProduto,
      id: Date.now().toString(),
      dataCriacao: new Date(),
      ultimaAtualizacao: new Date()
    };
    setProdutos(prev => [...prev, produto]);
  };

  const editarProduto = (id: string, dadosAtualizados: Partial<Produto>) => {
    setProdutos(prev => prev.map(produto => 
      produto.id === id 
        ? { ...produto, ...dadosAtualizados, ultimaAtualizacao: new Date() }
        : produto
    ));
  };

  const adicionarEstoque = (produtoId: string, quantidade: number) => {
    setProdutos(prev => prev.map(produto => 
      produto.id === produtoId 
        ? { 
            ...produto, 
            quantidade: produto.quantidade + quantidade,
            ultimaAtualizacao: new Date()
          }
        : produto
    ));
  };

  const registrarPerda = (produtoId: string, quantidade: number, motivo: string) => {
    const produto = produtos.find(p => p.id === produtoId);
    if (!produto || quantidade > produto.quantidade) return;

    // Reduzir estoque
    setProdutos(prev => prev.map(p => 
      p.id === produtoId 
        ? { ...p, quantidade: p.quantidade - quantidade, ultimaAtualizacao: new Date() }
        : p
    ));

    // Registrar perda
    const novaPerda: RegistroPerda = {
      id: Date.now().toString(),
      produtoId,
      quantidade,
      motivo,
      data: new Date()
    };
    setPerdas(prev => [...prev, novaPerda]);
  };

  const atualizarEstoquePorVenda = (itens: ItemVenda[]) => {
    setProdutos(prev => prev.map(produto => {
      const item = itens.find(i => i.produtoId === produto.id);
      if (item) {
        return {
          ...produto,
          quantidade: produto.quantidade - item.quantidade,
          ultimaAtualizacao: new Date()
        };
      }
      return produto;
    }));
  };

  // Funções para categorias
  const adicionarCategoria = (nome: string): Categoria => {
    const novaCategoria: Categoria = {
      id: Date.now().toString(),
      nome
    };
    setCategorias(prev => [...prev, novaCategoria]);
    return novaCategoria;
  };

  // Funções para vendedores
  const adicionarVendedor = (novoVendedor: Omit<Vendedor, 'id' | 'dataCadastro'>) => {
    const vendedor: Vendedor = {
      ...novoVendedor,
      id: Date.now().toString(),
      dataCadastro: new Date()
    };
    setVendedores(prev => [...prev, vendedor]);
    return vendedor;
  };

  const editarVendedor = (id: string, dadosAtualizados: Partial<Vendedor>) => {
    setVendedores(prev => prev.map(vendedor => 
      vendedor.id === id 
        ? { ...vendedor, ...dadosAtualizados }
        : vendedor
    ));
  };

  // Funções para vendas
  const adicionarVenda = (novaVenda: Omit<Venda, 'id' | 'numero' | 'data'>) => {
    const venda: Venda = {
      ...novaVenda,
      id: Date.now().toString(),
      numero: `VD${String(vendas.length + 1).padStart(3, '0')}`,
      data: new Date()
    };

    setVendas(prev => [...prev, venda]);
    
    // Atualizar estoque automaticamente
    atualizarEstoquePorVenda(venda.itens);
    
    return venda;
  };

  const contextValue: EstoqueContextType = {
    // Produtos
    produtos,
    adicionarProduto,
    editarProduto,
    adicionarEstoque,
    registrarPerda,
    atualizarEstoquePorVenda,

    // Categorias
    categorias,
    adicionarCategoria,

    // Vendedores
    vendedores,
    adicionarVendedor,
    editarVendedor,

    // Vendas
    vendas,
    adicionarVenda,

    // Perdas
    perdas
  };

  return (
    <EstoqueContext.Provider value={contextValue}>
      {children}
    </EstoqueContext.Provider>
  );
};

// Hook para usar o contexto
export const useEstoque = () => {
  const context = useContext(EstoqueContext);
  if (context === undefined) {
    throw new Error('useEstoque deve ser usado dentro de um EstoqueProvider');
  }
  return context;
};