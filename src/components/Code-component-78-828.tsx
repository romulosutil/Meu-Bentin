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
import { Plus, Search, Edit, Package, AlertTriangle, DollarSign, Trash2, ImageIcon, TrendingUp } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { useToast } from './ToastProvider';
import FormularioProdutoAprimorado from './FormularioProdutoAprimorado';
import { supabaseService, Produto } from '../utils/supabaseService';
import { ImageWithFallback } from './figma/ImageWithFallback';
import SistemaAprimoradoStatus from './SistemaAprimoradoStatus';

const EstoqueAprimorado = () => {
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
  const [modalEditarProduto, setModalEditarProduto] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  // Função para adicionar produto com o novo formulário aprimorado
  const handleAdicionarProdutoAprimorado = useCallback(async (produtoData: Omit<Produto, 'id' | 'dataAtualizacao'>) => {
    setIsLoading(true);
    try {
      // Primeiro, criar categoria se necessária
      if (produtoData.categoria && !categorias.includes(produtoData.categoria)) {
        await actions.adicionarCategoria(produtoData.categoria);
      }

      // Adicionar o produto usando o novo serviço
      await supabaseService.adicionarProduto(produtoData);
      
      // Também adicionar através do contexto para manter compatibilidade
      await actions.adicionarProduto({
        nome: produtoData.nome,
        categoria: produtoData.categoria,
        preco: produtoData.preco,
        custo: produtoData.custo,
        quantidade: produtoData.quantidade,
        minimo: produtoData.minimo,
        vendedor: produtoData.vendedor,
        ativo: produtoData.ativo,
        // Campos básicos de compatibilidade
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
      // Criar categoria se necessária
      if (produtoData.categoria && !categorias.includes(produtoData.categoria)) {
        await actions.adicionarCategoria(produtoData.categoria);
      }

      const produtoCompleto = {
        ...produtoData,
        id: produtoSelecionado.id,
        dataAtualizacao: new Date().toISOString()
      };

      // Atualizar usando o novo serviço
      await supabaseService.atualizarProduto(produtoCompleto);
      
      // Também atualizar através do contexto
      await actions.atualizarProduto(produtoCompleto);
      
      setModalEditarProduto(false);
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

  // Função para abrir modal de edição
  const abrirModalEdicao = useCallback((produto: Produto) => {
    setProdutoSelecionado(produto);
    setModalEditarProduto(true);
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

  // Estado vazio
  if (produtos.length === 0) {
    return (
      <div className="space-professional">
        {/* Cards de resumo vazios */}
        <div className="grid desktop-grid-3 gap-professional">
          <Card className="bentin-card border-l-4 border-l-bentin-green">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="font-medium">Total de Produtos</CardTitle>
              <Package className="icon-size-lg text-bentin-green" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-bentin-green mb-2">0</div>
              <p className="text-muted-foreground">Produtos cadastrados</p>
            </CardContent>
          </Card>

          <Card className="bentin-card border-l-4 border-l-orange-400">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="font-medium">Estoque Baixo</CardTitle>
              <AlertTriangle className="icon-size-lg text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-500 mb-2">0</div>
              <p className="text-muted-foreground">Produtos precisam reposição</p>
            </CardContent>
          </Card>

          <Card className="bentin-card border-l-4 border-l-bentin-blue">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="font-medium">Valor do Estoque</CardTitle>
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
              Comece adicionando seus primeiros produtos com o novo sistema aprimorado que inclui 
              imagem, múltiplos tamanhos, cores, gênero e cálculo automático de margem.
            </p>
            <Dialog open={modalNovoProduto} onOpenChange={setModalNovoProduto}>
              <DialogTrigger asChild>
                <Button className="bentin-button-primary">
                  <Plus className="icon-size-sm mr-2" />
                  Adicionar Primeiro Produto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="hidden">
                  <DialogTitle>Primeiro Produto</DialogTitle>
                  <DialogDescription>
                    Cadastre seu primeiro produto com o sistema aprimorado do Meu Bentin.
                  </DialogDescription>
                </DialogHeader>
                <FormularioProdutoAprimorado
                  onSubmit={handleAdicionarProdutoAprimorado}
                  onCancel={() => setModalNovoProduto(false)}
                  isSubmitting={isLoading}
                  categorias={categorias}
                />
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
            <CardTitle className="font-medium">Total de Produtos</CardTitle>
            <Package className="icon-size-lg text-bentin-green" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-bentin-green mb-2">{estatisticas.totalProdutos}</div>
            <p className="text-muted-foreground">Produtos cadastrados</p>
          </CardContent>
        </Card>

        <Card className="bentin-card border-l-4 border-l-orange-400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="font-medium">Estoque Baixo</CardTitle>
            <AlertTriangle className="icon-size-lg text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-500 mb-2">{estatisticas.produtosBaixoEstoque}</div>
            <p className="text-muted-foreground">Precisam reposição</p>
          </CardContent>
        </Card>

        <Card className="bentin-card border-l-4 border-l-bentin-blue">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="font-medium">Valor do Estoque</CardTitle>
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
            <CardTitle className="font-medium">Margem Média</CardTitle>
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
                Estoque Aprimorado
              </CardTitle>
              <CardDescription className="mt-2">
                Sistema completo com imagem, tamanhos múltiplos, cores, gênero e margem automática
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
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="hidden">
                  <DialogTitle>Novo Produto Aprimorado</DialogTitle>
                  <DialogDescription>
                    Cadastre um novo produto com informações completas incluindo imagem, tamanhos múltiplos, cores e margem automática.
                  </DialogDescription>
                </DialogHeader>
                <FormularioProdutoAprimorado
                  onSubmit={handleAdicionarProdutoAprimorado}
                  onCancel={() => setModalNovoProduto(false)}
                  isSubmitting={isLoading}
                  categorias={categorias}
                />
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

          {/* Tabela Desktop First */}
          <div className="table-container">
            <ScrollArea className="h-[700px]">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-12 min-w-[48px] px-3 py-3">Img</TableHead>
                    <TableHead className="min-w-[140px] px-3 py-3">Produto</TableHead>
                    <TableHead className="w-20 min-w-[80px] px-3 py-3">Categoria</TableHead>
                    <TableHead className="w-16 min-w-[64px] px-3 py-3">Gênero</TableHead>
                    <TableHead className="w-20 min-w-[80px] px-3 py-3">Tamanhos</TableHead>
                    <TableHead className="w-16 min-w-[64px] px-3 py-3">Cores</TableHead>
                    <TableHead className="w-16 min-w-[64px] px-3 py-3">Preço</TableHead>
                    <TableHead className="w-16 min-w-[64px] px-3 py-3">Custo</TableHead>
                    <TableHead className="w-14 min-w-[56px] px-3 py-3">Margem</TableHead>
                    <TableHead className="w-14 min-w-[56px] px-3 py-3">Estoque</TableHead>
                    <TableHead className="w-16 min-w-[64px] px-3 py-3">Status</TableHead>
                    <TableHead className="w-20 min-w-[80px] px-3 py-3">SKU</TableHead>
                    <TableHead className="w-16 min-w-[64px] px-3 py-3 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {produtosFiltrados.map((produto) => {
                    const status = getStatusEstoque(produto.quantidade, produto.minimo);
                    return (
                      <TableRow key={produto.id} className="hover:bg-gray-50">
                        <TableCell className="px-3 py-3">
                          {produto.imageUrl ? (
                            <ImageWithFallback 
                              src={produto.imageUrl} 
                              alt={produto.nome}
                              className="w-10 h-10 object-cover rounded-md flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                              <ImageIcon className="h-4 w-4 text-gray-400" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="px-3 py-3">
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{produto.nome}</p>
                            {produto.marca && (
                              <p className="text-xs text-muted-foreground truncate">{produto.marca}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-3 py-3 text-sm">
                          <span className="truncate block">{produto.categoria}</span>
                        </TableCell>
                        <TableCell className="px-3 py-3">
                          {produto.genero && (
                            <Badge variant="outline" className="capitalize text-xs">
                              {produto.genero.charAt(0)}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="px-3 py-3">
                          <div className="flex flex-wrap gap-1">
                            {produto.tamanhos?.slice(0, 1).map(tamanho => (
                              <Badge key={tamanho} variant="secondary" className="text-xs">
                                {tamanho}
                              </Badge>
                            ))}
                            {produto.tamanhos && produto.tamanhos.length > 1 && (
                              <Badge variant="secondary" className="text-xs">
                                +{produto.tamanhos.length - 1}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-3 py-3">
                          <div className="flex flex-wrap gap-1">
                            {produto.cores?.slice(0, 1).map(cor => (
                              <Badge key={cor} variant="outline" className="text-xs">
                                {cor.charAt(0)}
                              </Badge>
                            ))}
                            {produto.cores && produto.cores.length > 1 && (
                              <Badge variant="outline" className="text-xs">
                                +{produto.cores.length - 1}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-3 py-3 text-sm">
                          R$ {produto.preco.toFixed(0)}
                        </TableCell>
                        <TableCell className="px-3 py-3 text-sm">
                          {produto.custo ? `R$ ${produto.custo.toFixed(0)}` : '-'}
                        </TableCell>
                        <TableCell className="px-3 py-3 text-sm">
                          {produto.margemLucro ? (
                            <span className={getMargemColor(produto.margemLucro)}>
                              {produto.margemLucro.toFixed(0)}%
                            </span>
                          ) : '-'}
                        </TableCell>
                        <TableCell className="px-3 py-3 text-sm">{produto.quantidade}</TableCell>
                        <TableCell className="px-3 py-3">
                          <Badge className={`${status.classe} text-xs`}>
                            {status.texto.charAt(0)}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-3 py-3">
                          {produto.sku && (
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded block truncate max-w-16">
                              {produto.sku}
                            </code>
                          )}
                        </TableCell>
                        <TableCell className="px-3 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => abrirModalEdicao(produto)}
                              className="h-7 w-7 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                                  <Trash2 className="h-3 w-3" />
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
            </ScrollArea>
          </div>

          {/* Estado vazio para filtros */}
          {produtosFiltrados.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg">Nenhum produto encontrado com os filtros aplicados.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Edição */}
      <Dialog open={modalEditarProduto} onOpenChange={setModalEditarProduto}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="hidden">
            <DialogTitle>Editar Produto</DialogTitle>
            <DialogDescription>
              Atualize as informações do produto selecionado com o sistema aprimorado.
            </DialogDescription>
          </DialogHeader>
          {produtoSelecionado && (
            <FormularioProdutoAprimorado
              produto={produtoSelecionado}
              onSubmit={handleEditarProdutoAprimorado}
              onCancel={() => {
                setModalEditarProduto(false);
                setProdutoSelecionado(null);
              }}
              isSubmitting={isLoading}
              categorias={categorias}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EstoqueAprimorado;