import { useState, useMemo, useCallback } from 'react';
import { useEstoque, type Venda } from '../utils/EstoqueContextSupabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { Textarea } from './ui/textarea';
import { useToast } from './ToastProvider';
import { validateVenda, validateQuantidade } from '../utils/validation';
import { 
  Plus, 
  Search, 
  Eye, 
  ShoppingCart, 
  Calendar, 
  DollarSign, 
  ShoppingBag, 
  UserPlus, 
  Users, 
  X,
  CalendarDays,
  Filter,
  PackageX,
  Trash2
} from 'lucide-react';

interface VendaFormData {
  cliente: string;
  vendedorId: string;
  formaPagamento: string;
  desconto: string;
  observacoes: string;
}

interface ItemCarrinho {
  produtoId: string;
  produto: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

interface VendedorFormData {
  nome: string;
  email: string;
  telefone: string;
  comissao: string;
}

const initialVendaForm: VendaFormData = {
  cliente: '',
  vendedorId: '',
  formaPagamento: '',
  desconto: '',
  observacoes: ''
};

const initialVendedorForm: VendedorFormData = {
  nome: '',
  email: '',
  telefone: '',
  comissao: ''
};

const Vendas = () => {
  const { 
    produtos, 
    vendedores, 
    vendas, 
    actions: { adicionarVendedor, adicionarVenda }
  } = useEstoque();
  
  const { addToast } = useToast();
  
  // Estados de filtros
  const [filtro, setFiltro] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('todos');
  const [vendedorFiltro, setVendedorFiltro] = useState('todos');
  const [periodoFiltro, setPeriodoFiltro] = useState('30dias');

  // Estados dos modais
  const [modalNovaVenda, setModalNovaVenda] = useState(false);
  const [modalNovoVendedor, setModalNovoVendedor] = useState(false);
  const [modalDetalhesVenda, setModalDetalhesVenda] = useState(false);
  const [vendaSelecionada, setVendaSelecionada] = useState<Venda | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Estados dos formulários
  const [formVenda, setFormVenda] = useState<VendaFormData>(initialVendaForm);
  const [formVendedor, setFormVendedor] = useState<VendedorFormData>(initialVendedorForm);

  // Estados do carrinho
  const [carrinhoItens, setCarrinhoItens] = useState<ItemCarrinho[]>([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState('');
  const [quantidadeProduto, setQuantidadeProduto] = useState('');

  // Handlers estáveis para formulários
  const handleVendedorNomeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormVendedor(prev => ({...prev, nome: e.target.value}));
  }, []);

  const handleVendedorEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormVendedor(prev => ({...prev, email: e.target.value}));
  }, []);

  const handleVendedorTelefoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormVendedor(prev => ({...prev, telefone: e.target.value}));
  }, []);

  const handleVendedorComissaoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormVendedor(prev => ({...prev, comissao: e.target.value}));
  }, []);

  const handleClienteChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormVenda(prev => ({...prev, cliente: e.target.value}));
  }, []);

  const handleVendedorIdChange = useCallback((value: string) => {
    setFormVenda(prev => ({...prev, vendedorId: value}));
  }, []);

  const handleFormaPagamentoChange = useCallback((value: string) => {
    setFormVenda(prev => ({...prev, formaPagamento: value}));
  }, []);

  const handleDescontoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormVenda(prev => ({...prev, desconto: e.target.value}));
  }, []);

  const handleObservacoesChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormVenda(prev => ({...prev, observacoes: e.target.value}));
  }, []);

  const handleQuantidadeProdutoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuantidadeProduto(e.target.value);
  }, []);

  // Filtrar vendas por período
  const vendasPorPeriodo = useMemo(() => {
    const hoje = new Date();
    let dataLimite: Date;

    switch (periodoFiltro) {
      case '7dias':
        dataLimite = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30dias':
        dataLimite = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90dias':
        dataLimite = new Date(hoje.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'hoje':
        dataLimite = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
        break;
      case 'mes':
        dataLimite = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        break;
      default:
        dataLimite = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return vendas.filter(venda => {
      const dataVenda = new Date(venda.data);
      return dataVenda >= dataLimite;
    });
  }, [vendas, periodoFiltro]);

  // Filtrar vendas
  const vendasFiltradas = useMemo(() => {
    return vendasPorPeriodo.filter(venda => {
      const matchFiltro = venda.id.toLowerCase().includes(filtro.toLowerCase()) ||
                         venda.nomeProduto.toLowerCase().includes(filtro.toLowerCase()) ||
                         (venda as any).cliente?.toLowerCase().includes(filtro.toLowerCase());
      const matchVendedor = vendedorFiltro === 'todos' || venda.vendedor === vendedorFiltro;
      return matchFiltro && matchVendedor;
    });
  }, [vendasPorPeriodo, filtro, vendedorFiltro]);

  // Calcular estatísticas
  const estatisticas = useMemo(() => {
    const hoje = new Date();
    const vendasHoje = vendas.filter(v => {
      const dataVenda = new Date(v.data);
      return dataVenda.toDateString() === hoje.toDateString();
    });

    const totalVendasHoje = vendasHoje.reduce((total, v) => total + v.precoTotal, 0);
    const totalVendasPeriodo = vendasPorPeriodo.length;
    const receitaPeriodo = vendasPorPeriodo.reduce((total, v) => total + v.precoTotal, 0);

    return {
      vendasHoje: vendasHoje.length,
      totalVendasHoje,
      totalVendasPeriodo,
      receitaPeriodo,
      vendedoresAtivos: vendedores.length
    };
  }, [vendas, vendasPorPeriodo, vendedores]);

  // Função para adicionar vendedor
  const handleAdicionarVendedor = useCallback(async () => {
    if (!formVendedor.nome.trim()) {
      addToast({
        type: 'error',
        title: 'Erro na validação',
        description: 'Nome do vendedor é obrigatório'
      });
      return;
    }

    setIsLoading(true);
    try {
      await adicionarVendedor(formVendedor.nome.trim());

      addToast({
        type: 'success',
        title: 'Vendedor adicionado',
        description: `${formVendedor.nome.trim()} foi cadastrado com sucesso!`
      });
      setFormVendedor(initialVendedorForm);
      setModalNovoVendedor(false);
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Erro ao cadastrar vendedor',
        description: 'Tente novamente.'
      });
    } finally {
      setIsLoading(false);
    }
  }, [formVendedor, adicionarVendedor, addToast]);

  // Função para adicionar produto ao carrinho
  const adicionarAoCarrinho = useCallback(() => {
    if (!produtoSelecionado || !quantidadeProduto) {
      addToast({
        type: 'error',
        title: 'Seleção incompleta',
        description: 'Selecione um produto e quantidade!'
      });
      return;
    }

    const produto = produtos.find(p => p.id === produtoSelecionado);
    if (!produto) return;

    const quantidade = parseInt(quantidadeProduto);
    
    // Validar quantidade
    if (isNaN(quantidade) || quantidade <= 0) {
      addToast({
        type: 'error',
        title: 'Quantidade inválida',
        description: 'Digite uma quantidade válida maior que zero'
      });
      return;
    }

    if (quantidade > produto.quantidade) {
      addToast({
        type: 'error',
        title: 'Estoque insuficiente',
        description: `Disponível: ${produto.quantidade} unidades`
      });
      return;
    }

    // Verificar se produto já está no carrinho
    const itemExistente = carrinhoItens.find(item => item.produtoId === produtoSelecionado);
    if (itemExistente) {
      const novaQuantidade = itemExistente.quantidade + quantidade;
      if (novaQuantidade > produto.quantidade) {
        addToast({
          type: 'error',
          title: 'Estoque insuficiente',
          description: 'Quantidade total excede o estoque disponível!'
        });
        return;
      }
      
      setCarrinhoItens(prev => prev.map(item => 
        item.produtoId === produtoSelecionado
          ? {
              ...item,
              quantidade: novaQuantidade,
              subtotal: novaQuantidade * item.precoUnitario
            }
          : item
      ));
    } else {
      const precoUnitario = (produto as any).emPromocao && (produto as any).precoPromocional 
        ? (produto as any).precoPromocional 
        : produto.preco;

      const novoItem: ItemCarrinho = {
        produtoId: produto.id,
        produto: produto.nome,
        quantidade,
        precoUnitario,
        subtotal: quantidade * precoUnitario
      };

      setCarrinhoItens(prev => [...prev, novoItem]);
    }

    setProdutoSelecionado('');
    setQuantidadeProduto('');
    addToast({
      type: 'success',
      title: 'Produto adicionado',
      description: `${produto.nome} foi adicionado ao carrinho`
    });
  }, [produtoSelecionado, quantidadeProduto, produtos, carrinhoItens, addToast]);

  // Função para remover item do carrinho
  const removerDoCarrinho = useCallback((produtoId: string) => {
    setCarrinhoItens(prev => prev.filter(item => item.produtoId !== produtoId));
  }, []);

  // Função para finalizar venda
  const finalizarVenda = useCallback(async () => {
    if (!formVenda.cliente.trim() || !formVenda.vendedorId || !formVenda.formaPagamento) {
      addToast({
        type: 'error',
        title: 'Dados incompletos',
        description: 'Preencha todos os campos obrigatórios'
      });
      return;
    }

    if (carrinhoItens.length === 0) {
      addToast({
        type: 'error',
        title: 'Carrinho vazio',
        description: 'Adicione pelo menos um produto!'
      });
      return;
    }

    setIsLoading(true);
    try {
      // Para cada item do carrinho, criar uma venda individual (compatibilidade com sistema antigo)
      for (const item of carrinhoItens) {
        const desconto = parseFloat(formVenda.desconto) || 0;
        const descontoItem = (desconto / carrinhoItens.length); // Distribuir desconto proporcionalmente
        
        await adicionarVenda({
          produtoId: item.produtoId,
          nomeProduto: item.produto,
          quantidade: item.quantidade,
          precoUnitario: item.precoUnitario,
          precoTotal: item.subtotal - descontoItem,
          vendedor: formVenda.vendedorId,
          categoria: 'Produto',
          formaPagamento: formVenda.formaPagamento as any,
          desconto: descontoItem,
          data: new Date().toISOString(),
          observacoes: formVenda.observacoes.trim(),
          cliente: formVenda.cliente.trim(),
          numero: `V${Date.now()}`,
          status: 'concluida',
          total: item.subtotal - descontoItem
        });
      }

      addToast({
        type: 'success',
        title: 'Venda finalizada',
        description: `Venda registrada com sucesso!`
      });
      
      // Limpar formulário
      setFormVenda(initialVendaForm);
      setCarrinhoItens([]);
      setModalNovaVenda(false);
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Erro ao finalizar venda',
        description: 'Tente novamente.'
      });
    } finally {
      setIsLoading(false);
    }
  }, [formVenda, carrinhoItens, adicionarVenda, addToast]);

  // Funções auxiliares
  const getStatusBadge = useCallback((status: string) => {
    switch (status) {
      case 'concluida':
        return <Badge className="bg-green-100 text-green-800 border-green-200 font-semibold">✅ Concluída</Badge>;
      case 'pendente':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 font-semibold">⏳ Pendente</Badge>;
      case 'cancelada':
        return <Badge className="bg-red-100 text-red-800 border-red-200 font-semibold">❌ Cancelada</Badge>;
      default:
        return <Badge variant="outline" className="font-medium">{status}</Badge>;
    }
  }, []);

  const getPeriodoLabel = useCallback((periodo: string) => {
    switch (periodo) {
      case 'hoje': return 'Hoje';
      case '7dias': return 'Últimos 7 dias';
      case '30dias': return 'Últimos 30 dias';
      case '90dias': return 'Últimos 90 dias';
      case 'mes': return 'Este mês';
      default: return 'Últimos 30 dias';
    }
  }, []);

  // Calcular total do carrinho
  const totalCarrinho = useMemo(() => {
    const subtotal = carrinhoItens.reduce((total, item) => total + item.subtotal, 0);
    const desconto = parseFloat(formVenda.desconto) || 0;
    return Math.max(0, subtotal - desconto);
  }, [carrinhoItens, formVenda.desconto]);

  // Estado vazio
  if (vendas.length === 0) {
    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Cards de resumo vazios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="bentin-card border-l-4 border-l-bentin-pink">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Vendas Hoje</CardTitle>
              <div className="bentin-icon-wrapper bg-bentin-pink/10">
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-bentin-pink" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-bentin-pink">0</div>
              <p className="text-xs text-gray-600 font-medium">🛍️ vendas realizadas</p>
            </CardContent>
          </Card>

          <Card className="bentin-card border-l-4 border-l-bentin-blue">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Receita Hoje</CardTitle>
              <div className="bentin-icon-wrapper bg-bentin-blue/10">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-bentin-blue" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-bentin-blue">R$ 0,00</div>
              <p className="text-xs text-gray-600 font-medium">💰 faturamento do dia</p>
            </CardContent>
          </Card>

          <Card className="bentin-card border-l-4 border-l-bentin-green">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total de Vendas</CardTitle>
              <div className="bentin-icon-wrapper bg-bentin-green/10">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-bentin-green" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-bentin-green">0</div>
              <p className="text-xs text-gray-600 font-medium">📈 vendas realizadas</p>
            </CardContent>
          </Card>

          <Card className="bentin-card border-l-4 border-l-bentin-orange">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Vendedores</CardTitle>
              <div className="bentin-icon-wrapper bg-bentin-orange/10">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-bentin-orange" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-bentin-orange">{vendedores.length}</div>
              <p className="text-xs text-gray-600 font-medium">👥 equipe ativa</p>
            </CardContent>
          </Card>
        </div>

        {/* Estado vazio */}
        <Card className="bentin-card">
          <CardContent className="text-center py-12 sm:py-16">
            <ShoppingCart className="h-16 w-16 sm:h-20 sm:w-20 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
              Nenhuma venda registrada
            </h3>
            <p className="text-sm sm:text-base text-gray-500 mb-6 max-w-md mx-auto">
              Comece registrando suas primeiras vendas para acompanhar o desempenho e receita da loja.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Dialog open={modalNovaVenda} onOpenChange={setModalNovaVenda}>
                <DialogTrigger asChild>
                  <Button className="bentin-button-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Primeira Venda
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-4xl mx-auto max-h-[90vh] overflow-hidden">
                  <DialogHeader>
                    <DialogTitle>Registrar Nova Venda</DialogTitle>
                    <DialogDescription>
                      Complete os dados da venda e adicione produtos ao carrinho
                    </DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="max-h-[70vh] px-1">
                    <div className="space-y-6 py-4">
                      
                      {/* Dados da Venda */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="cliente-empty">Cliente *</Label>
                          <Input
                            key="cliente-empty"
                            id="cliente-empty"
                            value={formVenda.cliente}
                            onChange={handleClienteChange}
                            placeholder="Nome do cliente"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Vendedor *</Label>
                          <Select 
                            key="vendedor-empty"
                            value={formVenda.vendedorId} 
                            onValueChange={handleVendedorIdChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o vendedor" />
                            </SelectTrigger>
                            <SelectContent>
                              {vendedores.map((vendedor, index) => (
                                <SelectItem key={`vendedor-empty-${index}`} value={vendedor}>
                                  {vendedor}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Forma de Pagamento *</Label>
                          <Select 
                            key="forma-pagamento-empty"
                            value={formVenda.formaPagamento} 
                            onValueChange={handleFormaPagamentoChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a forma" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="dinheiro">Dinheiro</SelectItem>
                              <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                              <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                              <SelectItem value="pix">PIX</SelectItem>
                              <SelectItem value="transferencia">Transferência</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="desconto-empty">Desconto (R$)</Label>
                          <Input
                            key="desconto-empty"
                            id="desconto-empty"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formVenda.desconto}
                            onChange={handleDescontoChange}
                            placeholder="0,00"
                          />
                        </div>
                      </div>

                      {/* Adicionar Produtos */}
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <h4 className="font-semibold mb-3">Adicionar Produtos</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="space-y-2">
                            <Label>Produto</Label>
                            <Select key="produto-empty" value={produtoSelecionado} onValueChange={setProdutoSelecionado}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o produto" />
                              </SelectTrigger>
                              <SelectContent>
                                {produtos.filter(p => p.quantidade > 0).map((produto) => (
                                  <SelectItem key={produto.id} value={produto.id}>
                                    {produto.nome} - Estoque: {produto.quantidade}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="quantidade-empty">Quantidade</Label>
                            <Input
                              key="quantidade-empty"
                              id="quantidade-empty"
                              type="number"
                              min="1"
                              value={quantidadeProduto}
                              onChange={handleQuantidadeProdutoChange}
                              placeholder="1"
                            />
                          </div>
                          
                          <div className="flex items-end">
                            <Button onClick={adicionarAoCarrinho} className="w-full">
                              <Plus className="h-4 w-4 mr-2" />
                              Adicionar
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Carrinho */}
                      {carrinhoItens.length > 0 && (
                        <div className="border rounded-lg p-4">
                          <h4 className="font-semibold mb-3">Itens da Venda</h4>
                          <div className="space-y-2">
                            {carrinhoItens.map((item, index) => (
                              <div key={`carrinho-empty-${item.produtoId}-${index}`} className="flex items-center justify-between p-3 bg-white rounded border">
                                <div className="flex-1">
                                  <p className="font-medium">{item.produto}</p>
                                  <p className="text-sm text-gray-600">
                                    {item.quantidade}x R$ {item.precoUnitario.toFixed(2)}
                                  </p>
                                </div>
                                <div className="text-right mr-3">
                                  <p className="font-bold">R$ {item.subtotal.toFixed(2)}</p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removerDoCarrinho(item.produtoId)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            
                            <div className="border-t pt-3 mt-3">
                              <div className="flex justify-between items-center">
                                <span className="font-semibold">Total:</span>
                                <span className="font-bold text-lg text-bentin-green">
                                  R$ {totalCarrinho.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Observações */}
                      <div className="space-y-2">
                        <Label htmlFor="observacoes-empty">Observações</Label>
                        <Textarea
                          key="observacoes-empty"
                          id="observacoes-empty"
                          value={formVenda.observacoes}
                          onChange={handleObservacoesChange}
                          placeholder="Observações adicionais sobre a venda..."
                          rows={3}
                        />
                      </div>
                    </div>
                  </ScrollArea>
                  
                  <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setModalNovaVenda(false);
                        setFormVenda(initialVendaForm);
                        setCarrinhoItens([]);
                      }}
                      disabled={isLoading}
                      className="order-2 sm:order-1"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      onClick={finalizarVenda} 
                      className="bentin-button-primary order-1 sm:order-2"
                      disabled={isLoading || carrinhoItens.length === 0}
                    >
                      {isLoading ? 'Finalizando...' : `Finalizar Venda (R$ ${totalCarrinho.toFixed(2)})`}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Dialog open={modalNovoVendedor} onOpenChange={setModalNovoVendedor}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="rounded-xl">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Primeiro Vendedor
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-md mx-auto">
                  <DialogHeader>
                    <DialogTitle>Cadastrar Novo Vendedor</DialogTitle>
                    <DialogDescription>
                      Adicione um novo vendedor ao sistema
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome-vendedor-empty">Nome Completo *</Label>
                      <Input
                        key="nome-vendedor-empty"
                        id="nome-vendedor-empty"
                        value={formVendedor.nome}
                        onChange={handleVendedorNomeChange}
                        placeholder="Ex: Maria Silva"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-vendedor-empty">Email</Label>
                      <Input
                        key="email-vendedor-empty"
                        id="email-vendedor-empty"
                        type="email"
                        value={formVendedor.email}
                        onChange={handleVendedorEmailChange}
                        placeholder="maria@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefone-vendedor-empty">Telefone</Label>
                      <Input
                        key="telefone-vendedor-empty"
                        id="telefone-vendedor-empty"
                        value={formVendedor.telefone}
                        onChange={handleVendedorTelefoneChange}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="comissao-vendedor-empty">Comissão (%)</Label>
                      <Input
                        key="comissao-vendedor-empty"
                        id="comissao-vendedor-empty"
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={formVendedor.comissao}
                        onChange={handleVendedorComissaoChange}
                        placeholder="5.0"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleAdicionarVendedor} className="flex-1" disabled={isLoading}>
                        {isLoading ? 'Salvando...' : 'Salvar Vendedor'}
                      </Button>
                      <Button variant="outline" onClick={() => {
                        setModalNovoVendedor(false);
                        setFormVendedor(initialVendedorForm);
                      }}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Resumo das Vendas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="bentin-card border-l-4 border-l-bentin-pink">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Vendas Hoje</CardTitle>
            <div className="bentin-icon-wrapper bg-bentin-pink/10">
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-bentin-pink" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-bentin-pink">{estatisticas.vendasHoje}</div>
            <p className="text-xs text-gray-600 font-medium">🛍️ vendas realizadas</p>
          </CardContent>
        </Card>

        <Card className="bentin-card border-l-4 border-l-bentin-blue">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Receita Hoje</CardTitle>
            <div className="bentin-icon-wrapper bg-bentin-blue/10">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-bentin-blue" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-bentin-blue">
              R$ {estatisticas.totalVendasHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-600 font-medium">💰 faturamento do dia</p>
          </CardContent>
        </Card>

        <Card className="bentin-card border-l-4 border-l-bentin-green">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Vendas ({getPeriodoLabel(periodoFiltro)})
            </CardTitle>
            <div className="bentin-icon-wrapper bg-bentin-green/10">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-bentin-green" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-bentin-green">{estatisticas.totalVendasPeriodo}</div>
            <p className="text-xs text-gray-600 font-medium">📈 vendas no período</p>
          </CardContent>
        </Card>

        <Card className="bentin-card border-l-4 border-l-bentin-orange">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Receita Total</CardTitle>
            <div className="bentin-icon-wrapper bg-bentin-orange/10">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-bentin-orange" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-bentin-orange">
              R$ {estatisticas.receitaPeriodo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-600 font-medium">💰 receita no período</p>
          </CardContent>
        </Card>
      </div>

      {/* Controles e Lista de Vendas */}
      <Card className="bentin-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <div className="bentin-icon-wrapper bg-bentin-pink/10">
                  <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-bentin-pink" />
                </div>
                Vendas Realizadas
              </CardTitle>
              <CardDescription className="text-sm">Gerencie e acompanhe todas as vendas</CardDescription>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Dialog open={modalNovoVendedor} onOpenChange={setModalNovoVendedor}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="rounded-xl w-full sm:w-auto">
                    <UserPlus className="h-4 w-4 mr-2" />
                    <span className="sm:inline">Novo Vendedor</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-md mx-auto">
                  <DialogHeader>
                    <DialogTitle>Cadastrar Novo Vendedor</DialogTitle>
                    <DialogDescription>
                      Adicione um novo vendedor ao sistema
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome-vendedor">Nome Completo *</Label>
                      <Input
                        key="nome-vendedor"
                        id="nome-vendedor"
                        value={formVendedor.nome}
                        onChange={handleVendedorNomeChange}
                        placeholder="Ex: Maria Silva"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-vendedor">Email</Label>
                      <Input
                        key="email-vendedor"
                        id="email-vendedor"
                        type="email"
                        value={formVendedor.email}
                        onChange={handleVendedorEmailChange}
                        placeholder="maria@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefone-vendedor">Telefone</Label>
                      <Input
                        key="telefone-vendedor"
                        id="telefone-vendedor"
                        value={formVendedor.telefone}
                        onChange={handleVendedorTelefoneChange}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="comissao-vendedor">Comissão (%)</Label>
                      <Input
                        key="comissao-vendedor"
                        id="comissao-vendedor"
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={formVendedor.comissao}
                        onChange={handleVendedorComissaoChange}
                        placeholder="5.0"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleAdicionarVendedor} className="flex-1" disabled={isLoading}>
                        {isLoading ? 'Salvando...' : 'Salvar Vendedor'}
                      </Button>
                      <Button variant="outline" onClick={() => {
                        setModalNovoVendedor(false);
                        setFormVendedor(initialVendedorForm);
                      }}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Dialog open={modalNovaVenda} onOpenChange={setModalNovaVenda}>
                <DialogTrigger asChild>
                  <Button className="bentin-button-primary w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="sm:inline">Nova Venda</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-4xl mx-auto max-h-[90vh] overflow-hidden">
                  <DialogHeader>
                    <DialogTitle>Registrar Nova Venda</DialogTitle>
                    <DialogDescription>
                      Complete os dados da venda e adicione produtos ao carrinho
                    </DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="max-h-[70vh] px-1">
                    <div className="space-y-6 py-4">
                      
                      {/* Dados da Venda */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="cliente-venda">Cliente *</Label>
                          <Input
                            key="cliente-venda"
                            id="cliente-venda"
                            value={formVenda.cliente}
                            onChange={handleClienteChange}
                            placeholder="Nome do cliente"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Vendedor *</Label>
                          <Select 
                            key="vendedor-venda"
                            value={formVenda.vendedorId} 
                            onValueChange={handleVendedorIdChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o vendedor" />
                            </SelectTrigger>
                            <SelectContent>
                              {vendedores.map((vendedor, index) => (
                                <SelectItem key={`vendedor-venda-${index}`} value={vendedor}>
                                  {vendedor}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Forma de Pagamento *</Label>
                          <Select 
                            key="forma-pagamento"
                            value={formVenda.formaPagamento} 
                            onValueChange={handleFormaPagamentoChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a forma" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="dinheiro">Dinheiro</SelectItem>
                              <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                              <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                              <SelectItem value="pix">PIX</SelectItem>
                              <SelectItem value="transferencia">Transferência</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="desconto-venda">Desconto (R$)</Label>
                          <Input
                            key="desconto-venda"
                            id="desconto-venda"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formVenda.desconto}
                            onChange={handleDescontoChange}
                            placeholder="0,00"
                          />
                        </div>
                      </div>

                      {/* Adicionar Produtos */}
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <h4 className="font-semibold mb-3">Adicionar Produtos</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="space-y-2">
                            <Label>Produto</Label>
                            <Select key="produto-select" value={produtoSelecionado} onValueChange={setProdutoSelecionado}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o produto" />
                              </SelectTrigger>
                              <SelectContent>
                                {produtos.filter(p => p.quantidade > 0).map((produto) => (
                                  <SelectItem key={produto.id} value={produto.id}>
                                    {produto.nome} - Estoque: {produto.quantidade}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="quantidade-venda">Quantidade</Label>
                            <Input
                              key="quantidade-venda"
                              id="quantidade-venda"
                              type="number"
                              min="1"
                              value={quantidadeProduto}
                              onChange={handleQuantidadeProdutoChange}
                              placeholder="1"
                            />
                          </div>
                          
                          <div className="flex items-end">
                            <Button onClick={adicionarAoCarrinho} className="w-full">
                              <Plus className="h-4 w-4 mr-2" />
                              Adicionar
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Carrinho */}
                      {carrinhoItens.length > 0 && (
                        <div className="border rounded-lg p-4">
                          <h4 className="font-semibold mb-3">Itens da Venda</h4>
                          <div className="space-y-2">
                            {carrinhoItens.map((item, index) => (
                              <div key={`carrinho-${item.produtoId}-${index}`} className="flex items-center justify-between p-3 bg-white rounded border">
                                <div className="flex-1">
                                  <p className="font-medium">{item.produto}</p>
                                  <p className="text-sm text-gray-600">
                                    {item.quantidade}x R$ {item.precoUnitario.toFixed(2)}
                                  </p>
                                </div>
                                <div className="text-right mr-3">
                                  <p className="font-bold">R$ {item.subtotal.toFixed(2)}</p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removerDoCarrinho(item.produtoId)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            
                            <div className="border-t pt-3 mt-3">
                              <div className="flex justify-between items-center">
                                <span className="font-semibold">Total:</span>
                                <span className="font-bold text-lg text-bentin-green">
                                  R$ {totalCarrinho.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Observações */}
                      <div className="space-y-2">
                        <Label htmlFor="observacoes-venda">Observações</Label>
                        <Textarea
                          key="observacoes-venda"
                          id="observacoes-venda"
                          value={formVenda.observacoes}
                          onChange={handleObservacoesChange}
                          placeholder="Observações adicionais sobre a venda..."
                          rows={3}
                        />
                      </div>
                    </div>
                  </ScrollArea>
                  
                  <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setModalNovaVenda(false);
                        setFormVenda(initialVendaForm);
                        setCarrinhoItens([]);
                      }}
                      disabled={isLoading}
                      className="order-2 sm:order-1"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      onClick={finalizarVenda} 
                      className="bentin-button-primary order-1 sm:order-2"
                      disabled={isLoading || carrinhoItens.length === 0}
                    >
                      {isLoading ? 'Finalizando...' : `Finalizar Venda (R$ ${totalCarrinho.toFixed(2)})`}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar vendas..."
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-4">
              <Select value={vendedorFiltro} onValueChange={setVendedorFiltro}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Vendedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {vendedores.map((vendedor, index) => (
                    <SelectItem key={`filtro-vendedor-${index}`} value={vendedor}>
                      {vendedor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={periodoFiltro} onValueChange={setPeriodoFiltro}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hoje">Hoje</SelectItem>
                  <SelectItem value="7dias">7 dias</SelectItem>
                  <SelectItem value="30dias">30 dias</SelectItem>
                  <SelectItem value="90dias">90 dias</SelectItem>
                  <SelectItem value="mes">Este mês</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabela de Vendas */}
          <div className="border rounded-2xl border-border/50 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Vendedor</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="hidden md:table-cell">Pagamento</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendasFiltradas.length > 0 ? (
                    vendasFiltradas.map((venda) => (
                      <TableRow key={venda.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">
                              {new Date(venda.data).toLocaleDateString('pt-BR')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(venda.data).toLocaleTimeString('pt-BR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <p className="font-medium text-sm">
                            {(venda as any).cliente || 'Cliente não informado'}
                          </p>
                        </TableCell>
                        
                        <TableCell>
                          <p className="font-medium text-sm">{venda.nomeProduto}</p>
                        </TableCell>
                        
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {venda.vendedor}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <span className="text-sm font-medium">{venda.quantidade}</span>
                        </TableCell>
                        
                        <TableCell>
                          <p className="font-bold text-sm text-bentin-green">
                            R$ {venda.precoTotal.toFixed(2)}
                          </p>
                        </TableCell>
                        
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="secondary" className="text-xs">
                            {venda.formaPagamento?.replace('_', ' ') || 'N/A'}
                          </Badge>
                        </TableCell>
                        
                        <TableCell className="text-center">
                          {getStatusBadge((venda as any).status || 'concluida')}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6">
                        <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-500">Nenhuma venda encontrada</p>
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

export default Vendas;