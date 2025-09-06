import React, { useState, useMemo, useCallback } from 'react';
import { useEstoque } from '../utils/EstoqueContextSupabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Plus, Search, Edit, Package, AlertTriangle, DollarSign, Trash2, ImageIcon, TrendingUp, Eye, ArrowRight, Calendar, ShoppingBag, User, Hash, Palette, Ruler, BadgePercent } from 'lucide-react';
import { useToast } from './ToastProvider';
import FormularioProdutoModerno from './FormularioProdutoSimples';
import { supabaseService, Produto } from '../utils/supabaseService';
import { ImageWithFallback } from './figma/ImageWithFallback';
import SistemaAprimoradoStatus from './SistemaAprimoradoStatus';

const EstoqueAprimoradoResponsivo = () => {
  const { 
    produtos, 
    categorias, 
    actions
  } = useEstoque();

  const { addToast } = useToast();

  // Estados para filtros
  const [filtro, setFiltro] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos');
  const [generoFiltro, setGeneroFiltro] = useState('todos');
  
  // Estados dos modais
  const [modalNovoProduto, setModalNovoProduto] = useState(false);
  const [modalVisualizarProduto, setModalVisualizarProduto] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
  const [modoEdicao, setModoEdicao] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  // Função para adicionar produto
  const handleAdicionarProdutoAprimorado = useCallback(async (produtoData: Omit<Produto, 'id' | 'dataAtualizacao'>) => {
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
        description: `${produtoData.nome} foi adicionado ao estoque com todas as informações detalhadas.`
      });
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      addToast({
        type: 'error',
        title: 'Erro ao adicionar produto',
        description: 'Tente novamente. Verifique se todos os campos obrigatórios estão preenchidos.'
      });
    } finally {
      setIsLoading(false);
    }
  }, [actions, addToast, categorias]);

  // Função para editar produto
  const handleEditarProdutoAprimorado = useCallback(async (produtoData: Omit<Produto, 'id' | 'dataAtualizacao'>) => {
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

  // Função para abrir visualização do produto
  const abrirVisualizacoProduto = useCallback((produto: Produto) => {
    setProdutoSelecionado(produto);
    setModoEdicao(false);
    setModalVisualizarProduto(true);
  }, []);

  // Função para ativar modo de edição
  const ativarModoEdicao = useCallback(() => {
    setModoEdicao(true);
  }, []);

  // Função para fechar modal de visualização
  const fecharModalVisualizacao = useCallback(() => {
    setModalVisualizarProduto(false);
    setModoEdicao(false);
    setProdutoSelecionado(null);
  }, []);

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
      const matchFiltro = produto.nome.toLowerCase().includes(filtro.toLowerCase()) ||
        produto.categoria.toLowerCase().includes(filtro.toLowerCase()) ||
        (produto.sku && produto.sku.toLowerCase().includes(filtro.toLowerCase()));
      const matchCategoria = categoriaFiltro === 'todos' || produto.categoria === categoriaFiltro;
      const matchGenero = generoFiltro === 'todos' || produto.genero === generoFiltro;
      
      return matchFiltro && matchCategoria && matchGenero;
    });
  }, [produtos, filtro, categoriaFiltro, generoFiltro]);

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

  const getMargemColor = useCallback((margem?: number) => {
    if (!margem) return 'text-gray-500';
    if (margem < 15) return 'text-red-600';
    if (margem < 30) return 'text-yellow-600';
    return 'text-green-600';
  }, []);

  // Estatísticas
  const estatisticas = useMemo(() => {
    const totalProdutos = produtos.length;
    const produtosBaixoEstoque = produtos.filter(p => p.quantidade <= p.minimo).length;
    const valorTotalEstoque = produtos.reduce((total, p) => total + (p.preco * p.quantidade), 0);
    const produtosComMargem = produtos.filter(p => p.margemLucro).length;
    const margemMedia = produtosComMargem > 0 
      ? produtos.reduce((total, p) => total + (p.margemLucro || 0), 0) / produtosComMargem 
      : 0;

    return { totalProdutos, produtosBaixoEstoque, valorTotalEstoque, margemMedia };
  }, [produtos]);

  // Função para verificar campos não editáveis
  const getCamposNaoEditaveis = useCallback((produto: Produto) => {
    // Campos que não podem ser editados após criação
    const camposFixos = ['sku', 'id', 'dataCriacao'];
    
    // Se o produto já foi vendido, alguns campos adicionais ficam bloqueados
    // Isso poderia vir de uma verificação de vendas
    const produtoComVendas = false; // TODO: implementar verificação real
    
    if (produtoComVendas) {
      camposFixos.push('nome', 'categoria');
    }
    
    return camposFixos;
  }, []);

  // Estado vazio
  if (produtos.length === 0) {
    return (
      <div className="space-professional">
        {/* Cards de resumo vazios */}
        <div className="grid desktop-grid-3 gap-professional">
          <Card className="bentin-card border-l-4 border-l-bentin-green">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Total de Produtos</CardTitle>
              <Package className="icon-size-lg text-bentin-green" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-bentin-green mb-2">0</div>
              <p className="text-muted-foreground">Produtos cadastrados</p>
            </CardContent>
          </Card>

          <Card className="bentin-card border-l-4 border-l-orange-400">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Estoque Baixo</CardTitle>
              <AlertTriangle className="icon-size-lg text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-500 mb-2">0</div>
              <p className="text-muted-foreground">Produtos precisam reposição</p>
            </CardContent>
          </Card>

          <Card className="bentin-card border-l-4 border-l-bentin-blue">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Valor do Estoque</CardTitle>
              <DollarSign className="icon-size-lg text-bentin-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-bentin-blue mb-2">R$ 0,00</div>
              <p className="text-muted-foreground">Valor total investido</p>
            </CardContent>
          </Card>
        </div>

        {/* Estado vazio */}
        <Card className="bentin-card">
          <CardContent className="text-center py-16">
            <Package className="h-20 w-20 mx-auto mb-6 text-gray-300" />
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">
              Nenhum produto cadastrado
            </h3>
            <p className="text-gray-500 mb-8 max-w-lg mx-auto">
              Comece adicionando seus primeiros produtos com o novo sistema moderno que inclui 
              navegação por etapas, upload por drag & drop, validação inteligente e prévia em tempo real.
            </p>
            <Dialog open={modalNovoProduto} onOpenChange={setModalNovoProduto}>
              <DialogTrigger asChild>
                <Button className="bentin-button-primary">
                  <Plus className="icon-size-sm mr-2" />
                  Adicionar Primeiro Produto
                </Button>
              </DialogTrigger>
              <DialogContent className="p-0 gap-0 max-w-7xl w-[95vw] max-h-[95vh] border-0 shadow-xl">
                <div className="h-full overflow-hidden rounded-lg">
                  <FormularioProdutoModerno
                    onSubmit={handleAdicionarProdutoAprimorado}
                    onCancel={() => setModalNovoProduto(false)}
                    isSubmitting={isLoading}
                    categorias={categorias}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-professional">
      {/* Resumo do Estoque - Desktop First */}
      <div className="grid desktop-grid-4 gap-professional">
        <Card className="bentin-card border-l-4 border-l-bentin-green">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>Total de Produtos</CardTitle>
            <Package className="icon-size-lg text-bentin-green" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-bentin-green mb-2">{estatisticas.totalProdutos}</div>
            <p className="text-muted-foreground">Produtos cadastrados</p>
          </CardContent>
        </Card>

        <Card className="bentin-card border-l-4 border-l-orange-400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>Estoque Baixo</CardTitle>
            <AlertTriangle className="icon-size-lg text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-500 mb-2">{estatisticas.produtosBaixoEstoque}</div>
            <p className="text-muted-foreground">Precisam reposição</p>
          </CardContent>
        </Card>

        <Card className="bentin-card border-l-4 border-l-bentin-blue">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>Valor do Estoque</CardTitle>
            <DollarSign className="icon-size-lg text-bentin-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-bentin-blue mb-2">
              R$ {estatisticas.valorTotalEstoque.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-muted-foreground">Valor total investido</p>
          </CardContent>
        </Card>

        <Card className="bentin-card border-l-4 border-l-bentin-mint">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>Margem Média</CardTitle>
            <TrendingUp className="icon-size-lg text-bentin-mint" />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold mb-2 ${getMargemColor(estatisticas.margemMedia)}`}>
              {estatisticas.margemMedia.toFixed(1)}%
            </div>
            <p className="text-muted-foreground">Lucro médio</p>
          </CardContent>
        </Card>
      </div>

      {/* Controles e Filtros */}
      <Card className="bentin-card">
        <CardHeader>
          <div className="flex justify-between items-start gap-6">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-3">
                <Package className="icon-size-lg text-bentin-green" />
                Sistema Moderno de Estoque
              </CardTitle>
              <CardDescription className="mt-2">
                Interface aprimorada com formulário por etapas, validação inteligente e experiência otimizada
              </CardDescription>
              <div className="mt-4">
                <SistemaAprimoradoStatus />
              </div>
            </div>
            
            <Dialog open={modalNovoProduto} onOpenChange={setModalNovoProduto}>
              <DialogTrigger asChild>
                <Button className="bentin-button-primary">
                  <Plus className="icon-size-sm mr-2" />
                  Novo Produto
                </Button>
              </DialogTrigger>
              <DialogContent className="p-0 gap-0 max-w-7xl w-[95vw] max-h-[95vh] border-0 shadow-xl">
                <div className="h-full overflow-hidden rounded-lg">
                  <FormularioProdutoModerno
                    onSubmit={handleAdicionarProdutoAprimorado}
                    onCancel={() => setModalNovoProduto(false)}
                    isSubmitting={isLoading}
                    categorias={categorias}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent className="form-container">
          {/* Filtros Desktop First */}
          <div className="form-grid">
            <div className="space-y-2">
              <Label htmlFor="filtro">Buscar Produto</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 icon-size-sm text-gray-400" />
                <Input
                  id="filtro"
                  placeholder="Nome, categoria ou SKU..."
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
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
            </div>

            <div className="space-y-2">
              <Label>Gênero</Label>
              <Select value={generoFiltro} onValueChange={setGeneroFiltro}>
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
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setFiltro('');
                  setCategoriaFiltro('todos');
                  setGeneroFiltro('todos');
                }}
                className="w-full"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>

          {/* Tabela Responsiva - Desktop First */}
          <div className="rounded-lg border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-16 px-4 py-3">Img</TableHead>
                    <TableHead className="min-w-[200px] px-4 py-3">Produto</TableHead>
                    <TableHead className="w-32 px-4 py-3">Categoria</TableHead>
                    <TableHead className="w-24 px-4 py-3 hidden md:table-cell">Gênero</TableHead>
                    <TableHead className="w-32 px-4 py-3 hidden lg:table-cell">Tamanhos</TableHead>
                    <TableHead className="w-24 px-4 py-3">Preço</TableHead>
                    <TableHead className="w-20 px-4 py-3">Estoque</TableHead>
                    <TableHead className="w-24 px-4 py-3">Status</TableHead>
                    <TableHead className="w-20 px-4 py-3 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {produtosFiltrados.map((produto) => {
                    const status = getStatusEstoque(produto.quantidade, produto.minimo);
                    return (
                      <TableRow 
                        key={produto.id} 
                        className="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                        onClick={(e) => {
                          // Não abrir modal se clicar nas ações
                          if ((e.target as HTMLElement).closest('[data-actions]')) {
                            return;
                          }
                          abrirVisualizacoProduto(produto);
                        }}
                      >
                        <TableCell className="px-4 py-3">
                          {produto.imageUrl ? (
                            <ImageWithFallback 
                              src={produto.imageUrl} 
                              alt={produto.nome}
                              className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <ImageIcon className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <div className="min-w-0">
                            <p className="font-medium truncate">{produto.nome}</p>
                            {produto.marca && (
                              <p className="text-sm text-muted-foreground truncate">{produto.marca}</p>
                            )}
                            {produto.sku && (
                              <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                                {produto.sku}
                              </code>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <span className="truncate block">{produto.categoria}</span>
                        </TableCell>
                        <TableCell className="px-4 py-3 hidden md:table-cell">
                          {produto.genero && (
                            <Badge variant="outline" className="capitalize text-xs">
                              {produto.genero}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-3 hidden lg:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {produto.tamanhos?.slice(0, 2).map(tamanho => (
                              <Badge key={tamanho} variant="secondary" className="text-xs">
                                {tamanho}
                              </Badge>
                            ))}
                            {produto.tamanhos && produto.tamanhos.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{produto.tamanhos.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <span className="font-medium">
                            R$ {produto.preco.toFixed(0)}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <span className="font-medium">{produto.quantidade}</span>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <Badge className={`${status.classe} text-xs`}>
                            {status.texto}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right" data-actions>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                abrirVisualizacoProduto(produto);
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
                                  onClick={(e) => e.stopPropagation()}
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
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Estado vazio para filtros */}
          {produtosFiltrados.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg">Nenhum produto encontrado com os filtros aplicados.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Visualização/Edição */}
      <Dialog open={modalVisualizarProduto} onOpenChange={(open) => {
        if (!open) {
          fecharModalVisualizacao();
        }
      }}>
        <DialogContent className="p-0 gap-0 max-w-7xl w-[95vw] max-h-[95vh] border-0 shadow-xl">
          <div className="h-full overflow-hidden rounded-lg">
            {produtoSelecionado && (
              <>
                {modoEdicao ? (
                  <FormularioProdutoModerno
                    produto={produtoSelecionado}
                    produtoExistente={produtoSelecionado}
                    onSubmit={handleEditarProdutoAprimorado}
                    onCancel={fecharModalVisualizacao}
                    isSubmitting={isLoading}
                    categorias={categorias}
                    camposNaoEditaveis={getCamposNaoEditaveis(produtoSelecionado)}
                  />
                ) : (
                  <div className="p-8 space-y-6 max-h-[95vh] overflow-auto">
                    {/* Header da visualização */}
                    <div className="flex items-center justify-between border-b pb-6">
                      <div className="flex items-center gap-4">
                        {produtoSelecionado.imageUrl ? (
                          <ImageWithFallback 
                            src={produtoSelecionado.imageUrl} 
                            alt={produtoSelecionado.nome}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">{produtoSelecionado.nome}</h2>
                          <div className="flex items-center gap-3 mt-2">
                            <Badge className="capitalize">{produtoSelecionado.categoria}</Badge>
                            {produtoSelecionado.genero && (
                              <Badge variant="outline" className="capitalize">
                                {produtoSelecionado.genero}
                              </Badge>
                            )}
                            {produtoSelecionado.sku && (
                              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {produtoSelecionado.sku}
                              </code>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Button 
                          onClick={ativarModoEdicao}
                          className="bentin-button-secondary"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={fecharModalVisualizacao}
                        >
                          Fechar
                        </Button>
                      </div>
                    </div>

                    {/* Conteúdo da visualização em grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Coluna esquerda - Informações principais */}
                      <div className="space-y-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Package className="h-5 w-5 text-bentin-green" />
                              Informações do Produto
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium text-gray-600">Marca</Label>
                                <p className="text-base">{produtoSelecionado.marca || 'Não informado'}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-600">Vendedor</Label>
                                <p className="text-base">{produtoSelecionado.vendedor}</p>
                              </div>
                            </div>
                            
                            {produtoSelecionado.descricao && (
                              <div>
                                <Label className="text-sm font-medium text-gray-600">Descrição</Label>
                                <p className="text-base text-gray-700 leading-relaxed">
                                  {produtoSelecionado.descricao}
                                </p>
                              </div>
                            )}

                            {produtoSelecionado.fornecedorNome && (
                              <div>
                                <Label className="text-sm font-medium text-gray-600">Fornecedor</Label>
                                <p className="text-base">{produtoSelecionado.fornecedorNome}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <DollarSign className="h-5 w-5 text-bentin-green" />
                              Preços & Margem
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium text-gray-600">Preço de Venda</Label>
                                <p className="text-xl font-bold text-bentin-green">
                                  R$ {produtoSelecionado.preco.toFixed(2)}
                                </p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-600">Custo</Label>
                                <p className="text-xl font-bold">
                                  R$ {produtoSelecionado.custo.toFixed(2)}
                                </p>
                              </div>
                            </div>
                            
                            {produtoSelecionado.margemLucro && (
                              <div>
                                <Label className="text-sm font-medium text-gray-600">Margem de Lucro</Label>
                                <p className={`text-xl font-bold ${getMargemColor(produtoSelecionado.margemLucro)}`}>
                                  {produtoSelecionado.margemLucro.toFixed(1)}%
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>

                      {/* Coluna direita - Estoque e variações */}
                      <div className="space-y-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Package className="h-5 w-5 text-bentin-blue" />
                              Controle de Estoque
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium text-gray-600">Quantidade</Label>
                                <p className="text-2xl font-bold">{produtoSelecionado.quantidade}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-600">Estoque Mínimo</Label>
                                <p className="text-2xl font-bold">{produtoSelecionado.minimo}</p>
                              </div>
                            </div>
                            
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Status</Label>
                              <div className="mt-2">
                                {(() => {
                                  const status = getStatusEstoque(produtoSelecionado.quantidade, produtoSelecionado.minimo);
                                  return (
                                    <Badge className={status.classe}>
                                      {status.texto}
                                    </Badge>
                                  );
                                })()}
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Palette className="h-5 w-5 text-bentin-orange" />
                              Variações
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {produtoSelecionado.tamanhos && produtoSelecionado.tamanhos.length > 0 && (
                              <div>
                                <Label className="text-sm font-medium text-gray-600">Tamanhos</Label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {produtoSelecionado.tamanhos.map(tamanho => (
                                    <Badge key={tamanho} variant="secondary">
                                      {tamanho}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {produtoSelecionado.cores && produtoSelecionado.cores.length > 0 && (
                              <div>
                                <Label className="text-sm font-medium text-gray-600">Cores</Label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {produtoSelecionado.cores.map(cor => (
                                    <Badge key={cor} variant="outline">
                                      {cor}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {produtoSelecionado.tipoTecido && (
                              <div>
                                <Label className="text-sm font-medium text-gray-600">Tipo de Tecido</Label>
                                <p className="text-base">{produtoSelecionado.tipoTecido}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EstoqueAprimoradoResponsivo;