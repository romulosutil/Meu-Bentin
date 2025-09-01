import { useState, useMemo, useCallback } from 'react';
import { useEstoque, type Produto } from '../utils/EstoqueContextSupabase';
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
import { Plus, Search, Edit, Package, AlertTriangle, DollarSign, Minus, Trash2, Filter, MoreHorizontal } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { useToast } from './ToastProvider';

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

  const { addToast } = useToast();

  // Estados para filtros
  const [filtro, setFiltro] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos');
  const [statusFiltro, setStatusFiltro] = useState('todos');
  
  // Estados dos modais - com keys únicos para evitar conflitos
  const [modalNovoProduto, setModalNovoProduto] = useState(false);
  const [modalEditarProduto, setModalEditarProduto] = useState(false);
  const [modalAdicionarEstoque, setModalAdicionarEstoque] = useState(false);
  const [modalRegistrarPerda, setModalRegistrarPerda] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);

  // Estados dos formulários - separados para evitar conflitos
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

  // Validação melhorada
  const validarFormulario = useCallback((form: FormState, isEdicao = false) => {
    const erros: string[] = [];

    if (!form.nome.trim()) erros.push('Nome do produto é obrigatório');
    if (!form.categoria && !form.novaCategoria.trim()) erros.push('Selecione ou crie uma categoria');
    
    const preco = parseFloat(form.preco);
    if (isNaN(preco) || preco <= 0) erros.push('Preço deve ser maior que zero');
    
    if (!isEdicao) {
      const quantidade = parseInt(form.quantidade);
      if (isNaN(quantidade) || quantidade < 0) erros.push('Quantidade deve ser um número válido');
    }
    
    const estoqueMinimo = parseInt(form.estoqueMinimo);
    if (isNaN(estoqueMinimo) || estoqueMinimo <= 0) erros.push('Estoque mínimo deve ser maior que zero');

    if (form.emPromocao && form.precoPromocional) {
      const precoPromo = parseFloat(form.precoPromocional);
      if (isNaN(precoPromo) || precoPromo <= 0 || precoPromo >= preco) {
        erros.push('Preço promocional deve ser menor que o preço normal');
      }
    }

    return erros;
  }, []);

  // Handlers memoizados para evitar re-criação
  const handleNomeNovoProdutoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormNovoProduto(prev => ({...prev, nome: e.target.value}));
  }, []);

  const handleCategoriaNovoProdutoChange = useCallback((value: string) => {
    setFormNovoProduto(prev => ({...prev, categoria: value, novaCategoria: ''}));
  }, []);

  const handleNovaCategoriaChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormNovoProduto(prev => ({...prev, novaCategoria: e.target.value, categoria: ''}));
  }, []);

  const handlePrecoNovoProdutoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormNovoProduto(prev => ({...prev, preco: e.target.value}));
  }, []);

  const handlePrecoPromocionalChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormNovoProduto(prev => ({...prev, precoPromocional: e.target.value}));
  }, []);

  const handlePromocaoChange = useCallback((checked: boolean) => {
    setFormNovoProduto(prev => ({...prev, emPromocao: checked}));
  }, []);

  const handleQuantidadeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormNovoProduto(prev => ({...prev, quantidade: e.target.value}));
  }, []);

  const handleEstoqueMinimoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormNovoProduto(prev => ({...prev, estoqueMinimo: e.target.value}));
  }, []);

  // Função para adicionar novo produto
  const handleAdicionarProduto = useCallback(async () => {
    const erros = validarFormulario(formNovoProduto, false);
    if (erros.length > 0) {
      addToast({
        type: 'error',
        title: 'Erro na validação',
        description: erros.join(', ')
      });
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
        preco: parseFloat(formNovoProduto.preco),
        custo: parseFloat(formNovoProduto.preco) * 0.6, // Custo estimado em 60% do preço
        quantidade: parseInt(formNovoProduto.quantidade),
        minimo: parseInt(formNovoProduto.estoqueMinimo),
        vendedor: 'Naila', // Vendedor padrão
        ativo: true,
        emPromocao: formNovoProduto.emPromocao,
        precoPromocional: formNovoProduto.precoPromocional ? parseFloat(formNovoProduto.precoPromocional) : undefined,
        estoqueMinimo: parseInt(formNovoProduto.estoqueMinimo)
      });

      limparFormNovoProduto();
      setModalNovoProduto(false);
      addToast({
        type: 'success',
        title: 'Produto adicionado',
        description: 'Produto cadastrado com sucesso!'
      });
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      addToast({
        type: 'error',
        title: 'Erro ao adicionar produto',
        description: 'Tente novamente.'
      });
    } finally {
      setIsLoading(false);
    }
  }, [formNovoProduto, actions, limparFormNovoProduto, validarFormulario, addToast]);

  // Função para editar produto
  const handleEditarProduto = useCallback(async () => {
    if (!produtoSelecionado) return;
    
    const erros = validarFormulario(formEditarProduto, true);
    if (erros.length > 0) {
      addToast({
        type: 'error',
        title: 'Erro na validação',
        description: erros.join(', ')
      });
      return;
    }

    setIsLoading(true);
    try {
      let categoriaFinal = formEditarProduto.categoria;
      
      if (formEditarProduto.novaCategoria.trim()) {
        await actions.adicionarCategoria(formEditarProduto.novaCategoria.trim());
        categoriaFinal = formEditarProduto.novaCategoria.trim();
      }

      const produtoAtualizado: Produto = {
        ...produtoSelecionado,
        nome: formEditarProduto.nome.trim(),
        categoria: categoriaFinal,
        preco: parseFloat(formEditarProduto.preco),
        minimo: parseInt(formEditarProduto.estoqueMinimo),
        emPromocao: formEditarProduto.emPromocao,
        precoPromocional: formEditarProduto.precoPromocional ? parseFloat(formEditarProduto.precoPromocional) : undefined,
        estoqueMinimo: parseInt(formEditarProduto.estoqueMinimo),
        dataAtualizacao: new Date().toISOString()
      };

      await actions.atualizarProduto(produtoAtualizado);
      setModalEditarProduto(false);
      setProdutoSelecionado(null);
      addToast({
        type: 'success',
        title: 'Produto atualizado',
        description: 'Alterações salvas com sucesso!'
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
  }, [formEditarProduto, produtoSelecionado, actions, validarFormulario, addToast]);

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

  // Função para adicionar estoque
  const handleAdicionarEstoque = useCallback(async () => {
    if (!produtoSelecionado || !quantidadeAdicionar) return;

    const quantidade = parseInt(quantidadeAdicionar);
    if (isNaN(quantidade) || quantidade <= 0) {
      addToast({
        type: 'error',
        title: 'Quantidade inválida',
        description: 'Digite uma quantidade válida'
      });
      return;
    }

    setIsLoading(true);
    try {
      await actions.adicionarEstoque(produtoSelecionado.id, quantidade);
      setModalAdicionarEstoque(false);
      setQuantidadeAdicionar('');
      setProdutoSelecionado(null);
      addToast({
        type: 'success',
        title: 'Estoque atualizado',
        description: `${quantidade} unidades adicionadas`
      });
    } catch (error) {
      console.error('Erro ao adicionar estoque:', error);
      addToast({
        type: 'error',
        title: 'Erro ao adicionar estoque',
        description: 'Tente novamente.'
      });
    } finally {
      setIsLoading(false);
    }
  }, [produtoSelecionado, quantidadeAdicionar, actions, addToast]);

  // Função para registrar perda
  const handleRegistrarPerda = useCallback(async () => {
    if (!produtoSelecionado || !quantidadePerda) return;

    const quantidade = parseInt(quantidadePerda);
    if (isNaN(quantidade) || quantidade <= 0) {
      addToast({
        type: 'error',
        title: 'Quantidade inválida',
        description: 'Digite uma quantidade válida'
      });
      return;
    }

    if (quantidade > produtoSelecionado.quantidade) {
      addToast({
        type: 'error',
        title: 'Quantidade excede estoque',
        description: 'Não é possível registrar perda maior que o estoque atual'
      });
      return;
    }

    setIsLoading(true);
    try {
      await actions.registrarPerda(produtoSelecionado.id, quantidade, motivoPerda);
      setModalRegistrarPerda(false);
      setQuantidadePerda('');
      setMotivoPerda('');
      setProdutoSelecionado(null);
      addToast({
        type: 'success',
        title: 'Perda registrada',
        description: `${quantidade} unidades registradas como perda`
      });
    } catch (error) {
      console.error('Erro ao registrar perda:', error);
      addToast({
        type: 'error',
        title: 'Erro ao registrar perda',
        description: 'Tente novamente.'
      });
    } finally {
      setIsLoading(false);
    }
  }, [produtoSelecionado, quantidadePerda, motivoPerda, actions, addToast]);

  // Função para remover produto
  const handleRemoverProduto = useCallback(async (produto: Produto) => {
    setIsLoading(true);
    try {
      await actions.removerProduto(produto.id);
      addToast({
        type: 'success',
        title: 'Produto removido',
        description: 'Produto removido com sucesso'
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

  // Produtos filtrados com memoização
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

  // Estado vazio para quando não há produtos
  if (produtos.length === 0) {
    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Cards de resumo vazios */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <Card className="bentin-card border-l-4 border-l-bentin-green">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total de Produtos</CardTitle>
              <div className="bentin-icon-wrapper bg-bentin-green/10">
                <Package className="h-4 w-4 sm:h-5 sm:w-5 text-bentin-green" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-bentin-green">0</div>
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
              <div className="text-xl sm:text-2xl font-bold text-orange-500">0</div>
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
              <div className="text-xl sm:text-2xl font-bold text-bentin-blue">R$ 0,00</div>
              <p className="text-xs text-gray-600 font-medium">
                💰 Valor total investido
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Estado vazio */}
        <Card className="bentin-card">
          <CardContent className="text-center py-12 sm:py-16">
            <Package className="h-16 w-16 sm:h-20 sm:w-20 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
              Nenhum produto cadastrado
            </h3>
            <p className="text-sm sm:text-base text-gray-500 mb-6 max-w-md mx-auto">
              Comece adicionando seus primeiros produtos ao estoque para controlar quantidades e vendas.
            </p>
            <Dialog open={modalNovoProduto} onOpenChange={setModalNovoProduto}>
              <DialogTrigger asChild>
                <Button className="bentin-button-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Produto
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
                      <Label htmlFor="nome-empty">Nome do Produto *</Label>
                      <Input 
                        key="nome-empty"
                        id="nome-empty" 
                        value={formNovoProduto.nome}
                        onChange={handleNomeNovoProdutoChange}
                        placeholder="Ex: Camiseta Infantil Unicórnio"
                      />
                    </div>

                    {/* Categoria */}
                    <div className="space-y-2">
                      <Label>Categoria *</Label>
                      <Select 
                        key="categoria-empty"
                        value={formNovoProduto.categoria} 
                        onValueChange={handleCategoriaNovoProdutoChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categorias.map((categoria, index) => (
                            <SelectItem key={`categoria-empty-${index}-${categoria}`} value={categoria}>
                              {categoria}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        key="nova-categoria-empty"
                        placeholder="Ou criar nova categoria"
                        value={formNovoProduto.novaCategoria}
                        onChange={handleNovaCategoriaChange}
                      />
                    </div>

                    {/* Preços */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="preco-empty">Preço *</Label>
                        <Input 
                          key="preco-empty"
                          id="preco-empty" 
                          type="number" 
                          step="0.01" 
                          value={formNovoProduto.preco}
                          onChange={handlePrecoNovoProdutoChange}
                          placeholder="0,00"
                        />
                      </div>

                      {formNovoProduto.emPromocao && (
                        <div className="space-y-2">
                          <Label>Preço Promocional</Label>
                          <Input
                            key="preco-promocional-empty"
                            type="number"
                            step="0.01"
                            placeholder="0,00"
                            value={formNovoProduto.precoPromocional}
                            onChange={handlePrecoPromocionalChange}
                          />
                        </div>
                      )}
                    </div>

                    {/* Checkbox Promoção */}
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        key="promocao-empty"
                        id="promocao-empty"
                        checked={formNovoProduto.emPromocao}
                        onCheckedChange={handlePromocaoChange}
                      />
                      <Label htmlFor="promocao-empty">Produto em promoção</Label>
                    </div>

                    {/* Quantidade e Estoque Mínimo */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="quantidade-empty">Quantidade Inicial *</Label>
                        <Input 
                          key="quantidade-empty"
                          id="quantidade-empty" 
                          type="number" 
                          value={formNovoProduto.quantidade}
                          onChange={handleQuantidadeChange}
                          placeholder="0"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="estoqueMinimo-empty">Estoque Mínimo *</Label>
                        <Input 
                          key="estoqueMinimo-empty"
                          id="estoqueMinimo-empty" 
                          type="number" 
                          value={formNovoProduto.estoqueMinimo}
                          onChange={handleEstoqueMinimoChange}
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
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Resumo do Estoque - Responsivo */}
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

      {/* Controles e Filtros - Layout Mobile Otimizado */}
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
                      <Label htmlFor="nome-main">Nome do Produto *</Label>
                      <Input 
                        key="nome-main"
                        id="nome-main" 
                        value={formNovoProduto.nome}
                        onChange={handleNomeNovoProdutoChange}
                        placeholder="Ex: Camiseta Infantil Unicórnio"
                      />
                    </div>

                    {/* Categoria */}
                    <div className="space-y-2">
                      <Label>Categoria *</Label>
                      <Select 
                        key="categoria-main"
                        value={formNovoProduto.categoria} 
                        onValueChange={handleCategoriaNovoProdutoChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categorias.map((categoria, index) => (
                            <SelectItem key={`categoria-main-${index}-${categoria}`} value={categoria}>
                              {categoria}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        key="nova-categoria-main"
                        placeholder="Ou criar nova categoria"
                        value={formNovoProduto.novaCategoria}
                        onChange={handleNovaCategoriaChange}
                      />
                    </div>

                    {/* Preços */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="preco-main">Preço *</Label>
                        <Input 
                          key="preco-main"
                          id="preco-main" 
                          type="number" 
                          step="0.01" 
                          value={formNovoProduto.preco}
                          onChange={handlePrecoNovoProdutoChange}
                          placeholder="0,00"
                        />
                      </div>

                      {formNovoProduto.emPromocao && (
                        <div className="space-y-2">
                          <Label>Preço Promocional</Label>
                          <Input
                            key="preco-promocional-main"
                            type="number"
                            step="0.01"
                            placeholder="0,00"
                            value={formNovoProduto.precoPromocional}
                            onChange={handlePrecoPromocionalChange}
                          />
                        </div>
                      )}
                    </div>

                    {/* Checkbox Promoção */}
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        key="promocao-main"
                        id="promocao-main"
                        checked={formNovoProduto.emPromocao}
                        onCheckedChange={handlePromocaoChange}
                      />
                      <Label htmlFor="promocao-main">Produto em promoção</Label>
                    </div>

                    {/* Quantidade e Estoque Mínimo */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="quantidade-main">Quantidade Inicial *</Label>
                        <Input 
                          key="quantidade-main"
                          id="quantidade-main" 
                          type="number" 
                          value={formNovoProduto.quantidade}
                          onChange={handleQuantidadeChange}
                          placeholder="0"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="estoqueMinimo-main">Estoque Mínimo *</Label>
                        <Input 
                          key="estoqueMinimo-main"
                          id="estoqueMinimo-main" 
                          type="number" 
                          value={formNovoProduto.estoqueMinimo}
                          onChange={handleEstoqueMinimoChange}
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
                  <SelectItem key="status-crítico" value="crítico">Crítico</SelectItem>
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
                    <TableHead className="text-center w-[120px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {produtosFiltrados.length > 0 ? (
                    produtosFiltrados.map((produto) => {
                      const status = getStatusEstoque(produto.quantidade, produto.estoqueMinimo || produto.minimo);
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
                              <p className={`text-sm font-medium ${produto.quantidade <= (produto.estoqueMinimo || produto.minimo) ? 'text-orange-600' : ''}`}>
                                {produto.quantidade}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Min: {produto.estoqueMinimo || produto.minimo}
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
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              
                              {/* Botão Adicionar Estoque */}
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setProdutoSelecionado(produto);
                                  setModalAdicionarEstoque(true);
                                }}
                                className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                              
                              {/* Botão Remover Estoque */}
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setProdutoSelecionado(produto);
                                  setModalRegistrarPerda(true);
                                }}
                                className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              
                              {/* Botão Remover Produto */}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Confirmar remoção</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja remover o produto "{produto.nome}"? Esta ação não pode ser desfeita.
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
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6">
                        <Package className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-500">Nenhum produto encontrado</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Editar Produto */}
      <Dialog open={modalEditarProduto} onOpenChange={setModalEditarProduto}>
        <DialogContent className="w-[95vw] max-w-2xl mx-auto max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
            <DialogDescription>
              Atualize as informações do produto
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] px-1">
            <div className="space-y-4 py-4">
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="nome-edit">Nome do Produto *</Label>
                <Input 
                  key="nome-edit"
                  id="nome-edit" 
                  value={formEditarProduto.nome}
                  onChange={(e) => setFormEditarProduto(prev => ({...prev, nome: e.target.value}))}
                  placeholder="Ex: Camiseta Infantil Unicórnio"
                />
              </div>

              {/* Categoria */}
              <div className="space-y-2">
                <Label>Categoria *</Label>
                <Select 
                  key="categoria-edit"
                  value={formEditarProduto.categoria} 
                  onValueChange={(value) => setFormEditarProduto(prev => ({...prev, categoria: value, novaCategoria: ''}))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((categoria, index) => (
                      <SelectItem key={`categoria-edit-${index}-${categoria}`} value={categoria}>
                        {categoria}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  key="nova-categoria-edit"
                  placeholder="Ou criar nova categoria"
                  value={formEditarProduto.novaCategoria}
                  onChange={(e) => setFormEditarProduto(prev => ({...prev, novaCategoria: e.target.value, categoria: ''}))}
                />
              </div>

              {/* Preços */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="preco-edit">Preço *</Label>
                  <Input 
                    key="preco-edit"
                    id="preco-edit" 
                    type="number" 
                    step="0.01" 
                    value={formEditarProduto.preco}
                    onChange={(e) => setFormEditarProduto(prev => ({...prev, preco: e.target.value}))}
                    placeholder="0,00"
                  />
                </div>

                {formEditarProduto.emPromocao && (
                  <div className="space-y-2">
                    <Label>Preço Promocional</Label>
                    <Input
                      key="preco-promocional-edit"
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={formEditarProduto.precoPromocional}
                      onChange={(e) => setFormEditarProduto(prev => ({...prev, precoPromocional: e.target.value}))}
                    />
                  </div>
                )}
              </div>

              {/* Checkbox Promoção */}
              <div className="flex items-center space-x-2">
                <Checkbox 
                  key="promocao-edit"
                  id="promocao-edit"
                  checked={formEditarProduto.emPromocao}
                  onCheckedChange={(checked) => setFormEditarProduto(prev => ({...prev, emPromocao: !!checked}))}
                />
                <Label htmlFor="promocao-edit">Produto em promoção</Label>
              </div>

              {/* Estoque Mínimo */}
              <div className="space-y-2">
                <Label htmlFor="estoqueMinimo-edit">Estoque Mínimo *</Label>
                <Input 
                  key="estoqueMinimo-edit"
                  id="estoqueMinimo-edit" 
                  type="number" 
                  value={formEditarProduto.estoqueMinimo}
                  onChange={(e) => setFormEditarProduto(prev => ({...prev, estoqueMinimo: e.target.value}))}
                  placeholder="5"
                />
              </div>
            </div>
          </ScrollArea>
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => {
                setModalEditarProduto(false);
                setProdutoSelecionado(null);
              }}
              disabled={isLoading}
              className="order-2 sm:order-1"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleEditarProduto} 
              className="bentin-button-primary order-1 sm:order-2"
              disabled={isLoading}
            >
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Adicionar Estoque */}
      <Dialog open={modalAdicionarEstoque} onOpenChange={setModalAdicionarEstoque}>
        <DialogContent className="w-[95vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Adicionar ao Estoque</DialogTitle>
            <DialogDescription>
              Adicionar unidades ao produto: {produtoSelecionado?.nome}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quantidade-adicionar">Quantidade a adicionar</Label>
              <Input
                key="quantidade-adicionar"
                id="quantidade-adicionar"
                type="number"
                placeholder="0"
                value={quantidadeAdicionar}
                onChange={(e) => setQuantidadeAdicionar(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdicionarEstoque} className="flex-1" disabled={isLoading}>
                {isLoading ? 'Adicionando...' : 'Adicionar'}
              </Button>
              <Button variant="outline" onClick={() => {
                setModalAdicionarEstoque(false);
                setQuantidadeAdicionar('');
                setProdutoSelecionado(null);
              }}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Registrar Perda */}
      <Dialog open={modalRegistrarPerda} onOpenChange={setModalRegistrarPerda}>
        <DialogContent className="w-[95vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Registrar Perda</DialogTitle>
            <DialogDescription>
              Registrar perda para: {produtoSelecionado?.nome}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quantidade-perda">Quantidade perdida</Label>
              <Input
                key="quantidade-perda"
                id="quantidade-perda"
                type="number"
                placeholder="0"
                value={quantidadePerda}
                onChange={(e) => setQuantidadePerda(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Estoque atual: {produtoSelecionado?.quantidade} unidades
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="motivo-perda">Motivo da perda</Label>
              <Textarea
                key="motivo-perda"
                id="motivo-perda"
                placeholder="Ex: Produto danificado, vencido, etc."
                value={motivoPerda}
                onChange={(e) => setMotivoPerda(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleRegistrarPerda} className="flex-1" disabled={isLoading}>
                {isLoading ? 'Registrando...' : 'Registrar Perda'}
              </Button>
              <Button variant="outline" onClick={() => {
                setModalRegistrarPerda(false);
                setQuantidadePerda('');
                setMotivoPerda('');
                setProdutoSelecionado(null);
              }}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Estoque;