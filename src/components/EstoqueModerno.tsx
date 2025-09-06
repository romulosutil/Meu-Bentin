import React, { useState, useMemo, useCallback } from 'react';
import { useEstoque } from '../utils/EstoqueContextSemVendedor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';

import { FormSection, FormField, FormGrid } from './ui/form-section';
import { ResponsiveTable } from './ui/responsive-table';
import { StatsCard } from './ui/stats-card';
import { EmptyState } from './ui/empty-state';
import { LoadingState } from './ui/loading-state';
import { Plus, Search, Edit, Package, AlertTriangle, DollarSign, Trash2, ImageIcon, TrendingUp, Eye, X } from 'lucide-react';
import { useToast } from './ToastProvider';
import FormularioProduto from './FormularioProduto';
import VisualizacaoProduto from './VisualizacaoProduto';
import { supabaseService, Produto } from '../utils/supabaseServiceSemVendedor';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface FiltrosEstoque {
  busca: string;
  categoria: string;
  genero: string;
  status: string;
}

const EstoqueModerno = () => {
  const { produtos, categorias, actions } = useEstoque();
  const { addToast } = useToast();

  // Estados para filtros
  const [filtros, setFiltros] = useState<FiltrosEstoque>({
    busca: '',
    categoria: 'todos',
    genero: 'todos',
    status: 'todos'
  });

  // Estados dos modais
  const [modalNovoProduto, setModalNovoProduto] = useState(false);
  const [modalVisualizarProduto, setModalVisualizarProduto] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Atualização de filtros
  const atualizarFiltro = useCallback((campo: keyof FiltrosEstoque, valor: string) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  }, []);

  const limparFiltros = useCallback(() => {
    setFiltros({
      busca: '',
      categoria: 'todos',
      genero: 'todos',
      status: 'todos'
    });
  }, []);

  // Função para adicionar produto
  const handleAdicionarProduto = useCallback(async (produtoData: Omit<Produto, 'id' | 'dataAtualizacao'>) => {
    setIsLoading(true);
    try {
      if (produtoData.categoria && !categorias.includes(produtoData.categoria)) {
        await actions.adicionarCategoria(produtoData.categoria);
      }

      await supabaseService.adicionarProduto(produtoData);
      
      await actions.adicionarProduto({
        nome: produtoData.nome,
        categoria: produtoData.categoria,
        preco: produtoData.preco,
        custo: produtoData.custo,
        quantidade: produtoData.quantidade,
        minimo: produtoData.minimo,
        vendedor: produtoData.vendedor,
        ativo: produtoData.ativo,
        cor: produtoData.cores?.join(', ') || produtoData.cor,
        tamanho: produtoData.tamanhos?.join(', ') || produtoData.tamanho,
        marca: produtoData.marca,
        descricao: produtoData.descricao,
        emPromocao: produtoData.emPromocao,
        precoPromocional: produtoData.precoPromocional,
        estoqueMinimo: produtoData.estoqueMinimo
      });

      setModalNovoProduto(false);
      addToast({
        type: 'success',
        title: '🎉 Produto cadastrado!',
        description: `${produtoData.nome} foi adicionado ao estoque.`
      });
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      addToast({
        type: 'error',
        title: 'Erro ao adicionar produto',
        description: 'Tente novamente. Verifique se todos os campos estão preenchidos.'
      });
    } finally {
      setIsLoading(false);
    }
  }, [actions, addToast, categorias]);

  // Função para editar produto
  const handleEditarProduto = useCallback(async (produtoData: Omit<Produto, 'id' | 'dataAtualizacao'>) => {
    if (!produtoSelecionado) return;
    
    setIsLoading(true);
    try {
      if (produtoData.categoria && !categorias.includes(produtoData.categoria)) {
        await actions.adicionarCategoria(produtoData.categoria);
      }

      const produtoCompleto = {
        ...produtoData,
        id: produtoSelecionado.id,
        dataAtualizacao: new Date().toISOString()
      };

      await supabaseService.atualizarProduto(produtoCompleto);
      await actions.atualizarProduto(produtoCompleto);
      
      setModalVisualizarProduto(false);
      setModoEdicao(false);
      setProdutoSelecionado(null);
      
      addToast({
        type: 'success',
        title: '✅ Produto atualizado!',
        description: `${produtoData.nome} foi atualizado com sucesso.`
      });
    } catch (error) {
      console.error('Erro ao editar produto:', error);
      addToast({
        type: 'error',
        title: 'Erro ao editar produto',
        description: 'Tente novamente.'
      });
    } finally {
      setIsLoading(false);
    }
  }, [produtoSelecionado, actions, addToast, categorias]);

  // Função para remover produto
  const handleRemoverProduto = useCallback(async (produto: Produto) => {
    setIsLoading(true);
    try {
      await actions.removerProduto(produto.id);
      addToast({
        type: 'success',
        title: '🗑️ Produto removido',
        description: `${produto.nome} foi removido do estoque`
      });
    } catch (error) {
      console.error('Erro ao remover produto:', error);
      addToast({
        type: 'error',
        title: 'Erro ao remover produto',
        description: 'Tente novamente.'
      });
    } finally {
      setIsLoading(false);
    }
  }, [actions, addToast]);

  // Produtos filtrados
  const produtosFiltrados = useMemo(() => {
    return produtos.filter(produto => {
      const matchBusca = produto.nome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
        produto.categoria.toLowerCase().includes(filtros.busca.toLowerCase()) ||
        (produto.sku && produto.sku.toLowerCase().includes(filtros.busca.toLowerCase()));
      
      const matchCategoria = filtros.categoria === 'todos' || produto.categoria === filtros.categoria;
      const matchGenero = filtros.genero === 'todos' || produto.genero === filtros.genero;
      
      let matchStatus = true;
      if (filtros.status !== 'todos') {
        if (filtros.status === 'esgotado') {
          matchStatus = produto.quantidade === 0;
        } else if (filtros.status === 'baixo') {
          matchStatus = produto.quantidade > 0 && produto.quantidade <= produto.minimo;
        } else if (filtros.status === 'normal') {
          matchStatus = produto.quantidade > produto.minimo;
        }
      }
      
      return matchBusca && matchCategoria && matchGenero && matchStatus;
    });
  }, [produtos, filtros]);

  // Estatísticas
  const estatisticas = useMemo(() => {
    const totalProdutos = produtos.length;
    const produtosBaixoEstoque = produtos.filter(p => p.quantidade <= p.minimo).length;
    const produtosEsgotados = produtos.filter(p => p.quantidade === 0).length;
    const valorTotalEstoque = produtos.reduce((total, p) => total + (p.preco * p.quantidade), 0);
    const produtosComMargem = produtos.filter(p => p.margemLucro).length;
    const margemMedia = produtosComMargem > 0 
      ? produtos.reduce((total, p) => total + (p.margemLucro || 0), 0) / produtosComMargem 
      : 0;

    return { 
      totalProdutos, 
      produtosBaixoEstoque, 
      produtosEsgotados, 
      valorTotalEstoque, 
      margemMedia 
    };
  }, [produtos]);

  // Helpers
  const getStatusEstoque = useCallback((quantidade: number, minimo: number) => {
    if (quantidade === 0) return { 
      texto: 'Esgotado', 
      classe: 'bg-red-100 text-red-800 border-red-200' 
    };
    if (quantidade <= minimo) return { 
      texto: 'Baixo', 
      classe: 'bg-yellow-100 text-yellow-800 border-yellow-200' 
    };
    return { 
      texto: 'Normal', 
      classe: 'bg-green-100 text-green-800 border-green-200' 
    };
  }, []);

  // Colunas da tabela
  const colunas = useMemo(() => [
    {
      key: 'imageUrl',
      label: 'Img',
      width: 'w-16',
      render: (imageUrl: string, produto: Produto) => (
        imageUrl ? (
          <ImageWithFallback 
            src={imageUrl} 
            alt={produto.nome}
            className="w-12 h-12 object-cover rounded-lg"
          />
        ) : (
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            <ImageIcon className="h-5 w-5 text-gray-400" />
          </div>
        )
      )
    },
    {
      key: 'nome',
      label: 'Produto',
      className: 'min-w-[200px]',
      render: (_: any, produto: Produto) => (
        <div>
          <p className="font-medium">{produto.nome}</p>
          {produto.marca && <p className="text-sm text-muted-foreground">{produto.marca}</p>}
          {produto.sku && (
            <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
              {produto.sku}
            </code>
          )}
        </div>
      )
    },
    {
      key: 'categoria',
      label: 'Categoria',
      width: 'w-32',
    },
    {
      key: 'genero',
      label: 'Gênero',
      width: 'w-24',
      hideOnMobile: true,
      render: (genero: string) => genero && (
        <Badge variant="outline" className="capitalize text-xs">
          {genero}
        </Badge>
      )
    },
    {
      key: 'tamanhos',
      label: 'Tamanhos',
      width: 'w-32',
      hideOnTablet: true,
      render: (tamanhos: string[]) => (
        <div className="flex flex-wrap gap-1">
          {tamanhos?.slice(0, 2).map(tamanho => (
            <Badge key={tamanho} variant="secondary" className="text-xs">
              {tamanho}
            </Badge>
          ))}
          {tamanhos && tamanhos.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{tamanhos.length - 2}
            </Badge>
          )}
        </div>
      )
    },
    {
      key: 'preco',
      label: 'Preço',
      width: 'w-24',
      render: (preco: number) => (
        <span className="font-medium">
          R$ {preco.toFixed(0)}
        </span>
      )
    },
    {
      key: 'quantidade',
      label: 'Estoque',
      width: 'w-20',
      render: (quantidade: number) => (
        <span className="font-medium">{quantidade}</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      width: 'w-24',
      render: (_: any, produto: Produto) => {
        const status = getStatusEstoque(produto.quantidade, produto.minimo);
        return <Badge className={`${status.classe} text-xs`}>{status.texto}</Badge>;
      }
    },
    {
      key: 'acoes',
      label: 'Ações',
      width: 'w-20',
      className: 'text-right',
      render: (_: any, produto: Produto) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setProdutoSelecionado(produto);
              setModoEdicao(false);
              setModalVisualizarProduto(true);
            }}
            className="h-8 w-8 p-0"
            title="Visualizar produto"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 w-8 p-0"
                title="Remover produto"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle>Remover produto?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja remover "{produto.nome}"? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => handleRemoverProduto(produto)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Remover
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )
    }
  ], [getStatusEstoque, handleRemoverProduto]);

  // Estado vazio
  if (produtos.length === 0) {
    return (
      <div className="space-y-6">
        {/* Cards de resumo vazios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatsCard
            title="Total de Produtos"
            value="0"
            description="Produtos cadastrados"
            icon={<Package />}
            color="success"
          />
          
          <StatsCard
            title="Estoque Baixo"
            value="0"
            description="Precisam reposição"
            icon={<AlertTriangle />}
            color="warning"
          />
          
          <StatsCard
            title="Valor do Estoque"
            value="R$ 0,00"
            description="Valor total investido"
            icon={<DollarSign />}
            color="info"
          />
        </div>

        <EmptyState
          icon={<Package className="h-full w-full" />}
          title="Nenhum produto cadastrado"
          description="Comece adicionando seus primeiros produtos com o sistema moderno que inclui navegação por etapas, upload por drag & drop, validação inteligente e prévia em tempo real."
          action={{
            label: 'Adicionar Primeiro Produto',
            onClick: () => setModalNovoProduto(true)
          }}
        />

        {/* Modal de novo produto - Estado Vazio com Experiência Expandida */}
        <FormularioProduto
          open={modalNovoProduto}
          onSubmit={handleAdicionarProduto}
          onCancel={() => setModalNovoProduto(false)}
          isSubmitting={isLoading}
          categorias={categorias}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total de Produtos"
          value={estatisticas.totalProdutos}
          description="Produtos cadastrados"
          icon={<Package />}
          color="success"
        />
        
        <StatsCard
          title="Estoque Baixo"
          value={estatisticas.produtosBaixoEstoque}
          description="Precisam reposição"
          icon={<AlertTriangle />}
          color="warning"
        />
        
        <StatsCard
          title="Valor do Estoque"
          value={`R$ ${estatisticas.valorTotalEstoque.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          description="Valor total investido"
          icon={<DollarSign />}
          color="info"
        />
        
        <StatsCard
          title="Margem Média"
          value={`${estatisticas.margemMedia.toFixed(1)}%`}
          description="Lucro médio"
          icon={<TrendingUp />}
          color="primary"
        />
      </div>

      {/* Controles Principais */}
      <Card className="bentin-card">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-3">
                <Package className="h-6 w-6 text-bentin-green" />
                Sistema Moderno de Estoque
              </CardTitle>
              <CardDescription className="mt-2">
                Interface aprimorada com formulário por etapas, validação inteligente e experiência otimizada
              </CardDescription>
              <div className="mt-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-600 font-medium">Sistema Ativo</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {estatisticas.totalProdutos} produtos • {estatisticas.produtosBaixoEstoque} em baixo estoque
                  </div>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={() => setModalNovoProduto(true)}
              className="bentin-button-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Filtros */}
          <FormSection 
            title="Filtros" 
            description="Use os filtros para encontrar produtos específicos"
            icon={<Search className="h-5 w-5" />}
          >
            <FormGrid cols={4}>
              <FormField label="Buscar Produto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Nome, categoria ou SKU..."
                    value={filtros.busca}
                    onChange={(e) => atualizarFiltro('busca', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </FormField>

              <FormField label="Categoria">
                <Select value={filtros.categoria} onValueChange={(value) => atualizarFiltro('categoria', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas as categorias</SelectItem>
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria} value={categoria}>
                        {categoria}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Gênero">
                <Select value={filtros.genero} onValueChange={(value) => atualizarFiltro('genero', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os gêneros" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os gêneros</SelectItem>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="feminino">Feminino</SelectItem>
                    <SelectItem value="unissex">Unissex</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Status">
                <Select value={filtros.status} onValueChange={(value) => atualizarFiltro('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os status</SelectItem>
                    <SelectItem value="normal">Estoque Normal</SelectItem>
                    <SelectItem value="baixo">Estoque Baixo</SelectItem>
                    <SelectItem value="esgotado">Esgotado</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </FormGrid>
            
            <div className="flex justify-end">
              <Button variant="outline" onClick={limparFiltros}>
                Limpar Filtros
              </Button>
            </div>
          </FormSection>

          {/* Tabela de Produtos */}
          <ResponsiveTable
            columns={colunas}
            data={produtosFiltrados}
            onRowClick={(produto) => {
              setProdutoSelecionado(produto);
              setModoEdicao(false);
              setModalVisualizarProduto(true);
            }}
            emptyMessage="Nenhum produto encontrado com os filtros aplicados."
          />
        </CardContent>
      </Card>

      {/* Modal de Novo Produto - Experiência Expandida */}
      <FormularioProduto
        open={modalNovoProduto}
        onSubmit={handleAdicionarProduto}
        onCancel={() => setModalNovoProduto(false)}
        isSubmitting={isLoading}
        categorias={categorias}
      />

      {/* Modal de Visualização/Edição - Experiência Expandida */}
      {produtoSelecionado && (
        <>
          {modoEdicao ? (
            <FormularioProduto
              open={modalVisualizarProduto && modoEdicao}
              produto={produtoSelecionado}
              onSubmit={handleEditarProduto}
              onCancel={() => {
                setModoEdicao(false);
                setModalVisualizarProduto(false);
                setProdutoSelecionado(null);
              }}
              isSubmitting={isLoading}
              categorias={categorias}
            />
          ) : (
            modalVisualizarProduto && !modoEdicao && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                {/* Backdrop */}
                <div 
                  className="absolute inset-0 bg-black/20 backdrop-blur-sm" 
                  onClick={() => {
                    setModalVisualizarProduto(false);
                    setModoEdicao(false);
                    setProdutoSelecionado(null);
                  }}
                />
                
                {/* Modal */}
                <div className="modal-container relative bg-white rounded-xl shadow-xl w-[85vw] max-w-4xl flex flex-col border border-gray-200" style={{ maxHeight: '90vh', overflow: 'hidden' }}>
                  
                  {/* Header */}
                  <div className="modal-header flex items-center justify-between p-6 border-b border-gray-200 bg-white" style={{ flexShrink: 0 }}>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-bentin-blue/10 border border-bentin-blue/20">
                        <Eye className="h-5 w-5 text-bentin-blue" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">Visualizar Produto</h2>
                        <p className="text-sm text-gray-600">
                          {produtoSelecionado.nome}
                        </p>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setModalVisualizarProduto(false);
                        setModoEdicao(false);
                        setProdutoSelecionado(null);
                      }}
                      className="h-9 w-9 p-0 hover:bg-gray-100 rounded-lg"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Conteúdo scrollável */}
                  <div className="modal-body bentin-scroll p-6 space-y-6" style={{ flexGrow: 1, overflowY: 'auto' }}>
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-gray-900">Informações do Produto</h3>
                        <Button 
                          onClick={() => setModoEdicao(true)}
                          variant="outline"
                          size="sm"
                          className="border-bentin-blue text-bentin-blue hover:bg-bentin-blue hover:text-white"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                      </div>
                      
                      <VisualizacaoProduto produto={produtoSelecionado} />
                  </div>
                </div>
              </div>
            )
          )}
        </>
      )}
    </div>
  );
};

export default EstoqueModerno;