import { useState, useMemo, useCallback } from 'react';
import { useEstoque, type Produto } from '../utils/EstoqueContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Textarea } from './ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Plus, Search, Edit, Package, AlertTriangle, DollarSign, TrendingUp, Minus, Trash2, Filter, MoreHorizontal } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface FormState {
  nome: string;
  categoria: string;
  novaCategoria: string;
  preco: string;
  emPromocao: boolean;
  precoPromocional: string;
  quantidade: string;
  estoqueMinimo: string;
}

const initialFormState: FormState = {
  nome: '',
  categoria: '',
  novaCategoria: '',
  preco: '',
  emPromocao: false,
  precoPromocional: '',
  quantidade: '',
  estoqueMinimo: ''
};

const Estoque = () => {
  const { 
    produtos, 
    categorias, 
    actions
  } = useEstoque();

  // Estados para filtros
  const [filtro, setFiltro] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos');
  const [statusFiltro, setStatusFiltro] = useState('todos');
  
  // Estados dos modais
  const [modalNovoProduto, setModalNovoProduto] = useState(false);
  const [modalEditarProduto, setModalEditarProduto] = useState(false);
  const [modalAdicionarEstoque, setModalAdicionarEstoque] = useState(false);
  const [modalRegistrarPerda, setModalRegistrarPerda] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);

  // Estados dos formulários
  const [formNovoProduto, setFormNovoProduto] = useState<FormState>(initialFormState);
  const [formEditarProduto, setFormEditarProduto] = useState<FormState>(initialFormState);

  // Estados para ações de estoque
  const [quantidadeAdicionar, setQuantidadeAdicionar] = useState('');
  const [quantidadePerda, setQuantidadePerda] = useState('');
  const [motivoPerda, setMotivoPerda] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Função para limpar formulário de novo produto
  const limparFormNovoProduto = useCallback(() => {
    setFormNovoProduto(initialFormState);
  }, []);

  // Função para adicionar novo produto com validação melhorada
  const handleAdicionarProduto = useCallback(async () => {
    if (!formNovoProduto.nome.trim() || !formNovoProduto.preco || !formNovoProduto.quantidade || !formNovoProduto.estoqueMinimo) {
      alert('Preencha todos os campos obrigatórios!');
      return;
    }

    if (!formNovoProduto.categoria && !formNovoProduto.novaCategoria) {
      alert('Selecione uma categoria ou crie uma nova!');
      return;
    }

    // Validação de números
    const preco = parseFloat(formNovoProduto.preco);
    const quantidade = parseInt(formNovoProduto.quantidade);
    const estoqueMinimo = parseInt(formNovoProduto.estoqueMinimo);
    
    if (isNaN(preco) || preco <= 0) {
      alert('Preço deve ser um número válido maior que zero!');
      return;
    }
    
    if (isNaN(quantidade) || quantidade < 0) {
      alert('Quantidade deve ser um número válido maior ou igual a zero!');
      return;
    }
    
    if (isNaN(estoqueMinimo) || estoqueMinimo <= 0) {
      alert('Estoque mínimo deve ser um número válido maior que zero!');
      return;
    }

    setIsLoading(true);
    try {
      let categoriaFinal = formNovoProduto.categoria;
      
      if (formNovoProduto.novaCategoria.trim()) {
        await actions.adicionarCategoria(formNovoProduto.novaCategoria.trim());
        categoriaFinal = formNovoProduto.novaCategoria.trim();
      }

      await actions.adicionarProduto({
        nome: formNovoProduto.nome.trim(),
        categoria: categoriaFinal,
        preco: preco,
        custo: preco * 0.6, // Custo padrão estimado em 60% do preço
        quantidade: quantidade,
        minimo: estoqueMinimo,
        vendedor: 'Naila', // Vendedor padrão
        ativo: true,
        emPromocao: formNovoProduto.emPromocao,
        precoPromocional: formNovoProduto.precoPromocional ? parseFloat(formNovoProduto.precoPromocional) : undefined,
        estoqueMinimo: estoqueMinimo
      });

      limparFormNovoProduto();
      setModalNovoProduto(false);
      alert('Produto adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      alert('Erro ao adicionar produto. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, [formNovoProduto, actions, limparFormNovoProduto]);

  // Função para abrir modal de edição
  const abrirModalEdicao = useCallback((produto: Produto) => {
    setProdutoSelecionado(produto);
    setFormEditarProduto({
      nome: produto.nome,
      categoria: produto.categoria,
      novaCategoria: '',
      preco: produto.preco.toString(),
      emPromocao: (produto as any).emPromocao || false,
      precoPromocional: (produto as any).precoPromocional?.toString() || '',
      estoqueMinimo: produto.minimo.toString(),
      quantidade: ''
    });
    setModalEditarProduto(true);
  }, []);

  // Funções auxiliares com memoização
  const produtosFiltrados = useMemo(() => {
    return produtos.filter(produto => {
      const matchFiltro = produto.nome.toLowerCase().includes(filtro.toLowerCase());
      const matchCategoria = categoriaFiltro === 'todos' || produto.categoria === categoriaFiltro;
      
      let matchStatus = true;
      if (statusFiltro !== 'todos') {
        const status = getStatusEstoque(produto.quantidade, produto.minimo);
        matchStatus = status.texto.toLowerCase() === statusFiltro.toLowerCase();
      }
      
      return matchFiltro && matchCategoria && matchStatus;
    });
  }, [produtos, filtro, categoriaFiltro, statusFiltro]);

  const getStatusEstoque = useCallback((quantidade: number, minimo: number) => {
    if (quantidade === 0) return { 
      texto: 'Esgotado', 
      variant: 'destructive' as const, 
      classe: 'bg-red-100 text-red-800 border-red-200 font-semibold' 
    };
    if (quantidade <= minimo / 2) return { 
      texto: 'Crítico', 
      variant: 'destructive' as const, 
      classe: 'bg-orange-100 text-orange-800 border-orange-200 font-semibold' 
    };
    if (quantidade <= minimo) return { 
      texto: 'Baixo', 
      variant: 'secondary' as const, 
      classe: 'bg-yellow-100 text-yellow-800 border-yellow-200 font-medium' 
    };
    return { 
      texto: 'Normal', 
      variant: 'default' as const, 
      classe: 'bg-green-100 text-green-800 border-green-200 font-medium' 
    };
  }, []);

  const getPrecoExibicao = useCallback((produto: Produto) => {
    return (produto as any).emPromocao && (produto as any).precoPromocional 
      ? (produto as any).precoPromocional 
      : produto.preco;
  }, []);

  // Estatísticas com memoização
  const estatisticas = useMemo(() => {
    const totalProdutos = produtos.length;
    const produtosBaixoEstoque = produtos.filter(p => p.quantidade <= p.minimo).length;
    const valorTotalEstoque = produtos.reduce((total, p) => {
      const preco = getPrecoExibicao(p);
      return total + (preco * p.quantidade);
    }, 0);

    return { totalProdutos, produtosBaixoEstoque, valorTotalEstoque };
  }, [produtos, getPrecoExibicao]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Resumo do Estoque */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <Card className="bentin-card border-l-4 border-l-bentin-green">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total de Produtos</CardTitle>
            <div className="bentin-icon-wrapper bg-bentin-green/10">
              <Package className="h-4 w-4 sm:h-5 sm:w-5 text-bentin-green" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-bentin-green">{estatisticas.totalProdutos}</div>
            <p className="text-xs text-gray-600 font-medium">
              📦 Produtos cadastrados
            </p>
          </CardContent>
        </Card>

        <Card className="bentin-card border-l-4 border-l-orange-400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Estoque Baixo</CardTitle>
            <div className="bentin-icon-wrapper bg-orange-100">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-orange-500">{estatisticas.produtosBaixoEstoque}</div>
            <p className="text-xs text-gray-600 font-medium">
              ⚠️ Produtos precisam reposição
            </p>
          </CardContent>
        </Card>

        <Card className="bentin-card border-l-4 border-l-bentin-blue">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Valor do Estoque</CardTitle>
            <div className="bentin-icon-wrapper bg-bentin-blue/10">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-bentin-blue" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-bentin-blue">
              R$ {estatisticas.valorTotalEstoque.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-600 font-medium">
              💰 Valor total investido
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Controles e Filtros */}
      <Card className="bentin-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <div className="bentin-icon-wrapper bg-bentin-mint/10">
                  <Package className="h-4 w-4 sm:h-5 sm:w-5 text-bentin-mint" />
                </div>
                Controle de Estoque
              </CardTitle>
              <CardDescription className="text-sm">Gerencie seus produtos e quantidades</CardDescription>
            </div>
            
            {/* Botão Novo Produto */}
            <Dialog open={modalNovoProduto} onOpenChange={setModalNovoProduto}>
              <DialogTrigger asChild>
                <Button className="bentin-button-primary w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="sm:inline">Novo Produto</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-2xl mx-auto max-h-[90vh] overflow-hidden">
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Produto</DialogTitle>
                  <DialogDescription>
                    Cadastre um novo produto no estoque com todas as informações necessárias
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh] px-1">
                  <div className="space-y-4 py-4">
                    {/* Nome */}
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome do Produto *</Label>
                      <Input 
                        id="nome" 
                        value={formNovoProduto.nome}
                        onChange={(e) => setFormNovoProduto(prev => ({...prev, nome: e.target.value}))}
                        placeholder="Ex: Camiseta Infantil Unicórnio"
                      />
                    </div>

                    {/* Categoria */}
                    <div className="space-y-2">
                      <Label>Categoria *</Label>
                      <Select 
                        value={formNovoProduto.categoria} 
                        onValueChange={(value) => setFormNovoProduto(prev => ({...prev, categoria: value, novaCategoria: ''}))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categorias.map((categoria, index) => (
                            <SelectItem key={`categoria-${index}-${categoria}`} value={categoria}>
                              {categoria}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Ou criar nova categoria"
                        value={formNovoProduto.novaCategoria}
                        onChange={(e) => setFormNovoProduto(prev => ({...prev, novaCategoria: e.target.value, categoria: ''}))}
                      />
                    </div>

                    {/* Preço e Promoção */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="preco">Preço *</Label>
                        <Input 
                          id="preco" 
                          type="number" 
                          step="0.01" 
                          value={formNovoProduto.preco}
                          onChange={(e) => setFormNovoProduto(prev => ({...prev, preco: e.target.value}))}
                          placeholder="0,00"
                        />
                      </div>

                      {formNovoProduto.emPromocao && (
                        <div className="space-y-2">
                          <Label>Preço Promocional</Label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0,00"
                            value={formNovoProduto.precoPromocional}
                            onChange={(e) => setFormNovoProduto(prev => ({...prev, precoPromocional: e.target.value}))}
                          />
                        </div>
                      )}
                    </div>

                    {/* Checkbox Promoção */}
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="promocao"
                        checked={formNovoProduto.emPromocao}
                        onCheckedChange={(checked) => setFormNovoProduto(prev => ({...prev, emPromocao: !!checked}))}
                      />
                      <Label htmlFor="promocao">Produto em promoção</Label>
                    </div>

                    {/* Quantidade e Estoque Mínimo */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="quantidade">Quantidade Inicial *</Label>
                        <Input 
                          id="quantidade" 
                          type="number" 
                          value={formNovoProduto.quantidade}
                          onChange={(e) => setFormNovoProduto(prev => ({...prev, quantidade: e.target.value}))}
                          placeholder="0"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="estoqueMinimo">Estoque Mínimo *</Label>
                        <Input 
                          id="estoqueMinimo" 
                          type="number" 
                          value={formNovoProduto.estoqueMinimo}
                          onChange={(e) => setFormNovoProduto(prev => ({...prev, estoqueMinimo: e.target.value}))}
                          placeholder="5"
                        />
                      </div>
                    </div>
                  </div>
                </ScrollArea>
                <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setModalNovoProduto(false);
                      limparFormNovoProduto();
                    }}
                    disabled={isLoading}
                    className="order-2 sm:order-1"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleAdicionarProduto} 
                    className="bentin-button-primary order-1 sm:order-2"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Salvando...' : 'Salvar Produto'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Filtros Responsivos */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar produtos..."
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-4">
              <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas as categorias</SelectItem>
                  {categorias.map((categoria, index) => (
                    <SelectItem key={`filtro-categoria-${index}-${categoria}`} value={categoria}>
                      {categoria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFiltro} onValueChange={setStatusFiltro}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="status-todos" value="todos">Todos</SelectItem>
                  <SelectItem key="status-normal" value="normal">Normal</SelectItem>
                  <SelectItem key="status-baixo" value="baixo">Baixo</SelectItem>
                  <SelectItem key="status-critico" value="crítico">Crítico</SelectItem>
                  <SelectItem key="status-esgotado" value="esgotado">Esgotado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabela Responsiva */}
          <div className="border rounded-2xl border-border/50 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Produto</TableHead>
                    <TableHead className="hidden sm:table-cell">Categoria</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Estoque</TableHead>
                    <TableHead className="hidden md:table-cell">Status</TableHead>
                    <TableHead className="text-center w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {produtosFiltrados.length > 0 ? (
                    produtosFiltrados.map((produto) => {
                      const status = getStatusEstoque(produto.quantidade, produto.minimo);
                      const precoExibicao = getPrecoExibicao(produto);
                      
                      return (
                        <TableRow key={produto.id} className="hover:bg-muted/50">
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium leading-tight">{produto.nome}</p>
                              <div className="flex flex-wrap gap-1">
                                {(produto as any).emPromocao && (
                                  <Badge variant="secondary" className="text-xs bg-bentin-pink/10 text-bentin-pink">
                                    PROMOÇÃO
                                  </Badge>
                                )}
                                <Badge variant="outline" className="text-xs sm:hidden">
                                  {produto.categoria}
                                </Badge>
                              </div>
                            </div>
                          </TableCell>
                          
                          <TableCell className="hidden sm:table-cell">
                            <span className="text-sm text-muted-foreground">{produto.categoria}</span>
                          </TableCell>
                          
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">R$ {precoExibicao.toFixed(2)}</p>
                              {(produto as any).emPromocao && (produto as any).precoPromocional && (
                                <p className="text-xs text-muted-foreground line-through">
                                  R$ {produto.preco.toFixed(2)}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div>
                              <p className={`text-sm font-medium ${produto.quantidade <= produto.minimo ? 'text-orange-600' : ''}`}>
                                {produto.quantidade}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Min: {produto.minimo}
                              </p>
                              <div className="md:hidden mt-1">
                                <Badge variant={status.variant} className={`${status.classe} text-xs`}>
                                  {status.texto}
                                </Badge>
                              </div>
                            </div>
                          </TableCell>
                          
                          <TableCell className="hidden md:table-cell">
                            <Badge variant={status.variant} className={status.classe}>
                              {status.texto}
                            </Badge>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {/* Botão Editar */}
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => abrirModalEdicao(produto)}
                                className="p-2 h-8 w-8"
                                aria-label="Editar produto"
                              >
                                <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p className="text-gray-500">Nenhum produto encontrado</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Estoque;