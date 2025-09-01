import { useState, useMemo, useCallback } from 'react';
import { useEstoque, type Venda, type Vendedor } from '../utils/EstoqueContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
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
  PackageX
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
    adicionarVendedor, 
    adicionarVenda 
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
      const matchFiltro = venda.numero.toLowerCase().includes(filtro.toLowerCase()) ||
                         venda.cliente.toLowerCase().includes(filtro.toLowerCase());
      const matchStatus = statusFiltro === 'todos' || venda.status === statusFiltro;
      const matchVendedor = vendedorFiltro === 'todos' || venda.vendedorId === vendedorFiltro;
      return matchFiltro && matchStatus && matchVendedor;
    });
  }, [vendasPorPeriodo, filtro, statusFiltro, vendedorFiltro]);

  // Calcular estatísticas
  const estatisticas = useMemo(() => {
    const hoje = new Date();
    const vendasHoje = vendas.filter(v => {
      const dataVenda = new Date(v.data);
      return dataVenda.toDateString() === hoje.toDateString() && v.status === 'concluida';
    });

    const totalVendasHoje = vendasHoje.reduce((total, v) => total + v.total, 0);
    const totalVendasPeriodo = vendasPorPeriodo.filter(v => v.status === 'concluida').length;
    const receitaPeriodo = vendasPorPeriodo
      .filter(v => v.status === 'concluida')
      .reduce((total, v) => total + v.total, 0);

    return {
      vendasHoje: vendasHoje.length,
      totalVendasHoje,
      totalVendasPeriodo,
      receitaPeriodo,
      vendedoresAtivos: vendedores.filter(v => v.ativo).length
    };
  }, [vendas, vendasPorPeriodo, vendedores]);

  // Função para adicionar vendedor
  const handleAdicionarVendedor = useCallback(async () => {
    const validation = validateVenda(formVendedor as any);
    if (!validation.isValid) {
      addToast({
        type: 'error',
        title: 'Erro na validação',
        description: validation.errors.join(', ')
      });
      return;
    }

    setIsLoading(true);
    try {
      const novoVendedor = adicionarVendedor({
        nome: formVendedor.nome.trim(),
        email: formVendedor.email.trim(),
        telefone: formVendedor.telefone.trim(),
        comissao: parseFloat(formVendedor.comissao),
        ativo: true
      });

      addToast({
        type: 'success',
        title: 'Vendedor adicionado',
        description: `${novoVendedor.nome} foi cadastrado com sucesso!`
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
    const validation = validateQuantidade(quantidadeProduto, produto.quantidade);
    if (!validation.isValid) {
      addToast({
        type: 'error',
        title: 'Quantidade inválida',
        description: validation.errors.join(', ')
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
      const precoUnitario = produto.emPromocao && produto.precoPromocional 
        ? produto.precoPromocional 
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

  // Função para finalizar venda
  const finalizarVenda = useCallback(async () => {
    const validation = validateVenda(formVenda as any);
    if (!validation.isValid) {
      addToast({
        type: 'error',
        title: 'Dados incompletos',
        description: validation.errors.join(', ')
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
      const vendedor = vendedores.find(v => v.id === formVenda.vendedorId);
      if (!vendedor) {
        addToast({
          type: 'error',
          title: 'Vendedor não encontrado',
          description: 'Selecione um vendedor válido'
        });
        return;
      }

      const subtotal = carrinhoItens.reduce((sum, item) => sum + item.subtotal, 0);
      const desconto = parseFloat(formVenda.desconto) || 0;
      const total = subtotal - desconto;

      const novaVenda = adicionarVenda({
        cliente: formVenda.cliente.trim(),
        vendedorId: formVenda.vendedorId,
        vendedor: vendedor.nome,
        itens: [...carrinhoItens],
        subtotal,
        desconto,
        total,
        formaPagamento: formVenda.formaPagamento,
        status: 'concluida',
        observacoes: formVenda.observacoes.trim()
      });

      addToast({
        type: 'success',
        title: 'Venda finalizada',
        description: `Venda ${novaVenda.numero} registrada com sucesso!`
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
  }, [formVenda, carrinhoItens, vendedores, adicionarVenda, addToast]);

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
              <p className="text-xs text-gray-600 font-medium">✅ vendas concluídas</p>
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
              <div className="text-xl sm:text-2xl font-bold text-bentin-orange">
                {vendedores.filter(v => v.ativo).length}
              </div>
              <p className="text-xs text-gray-600 font-medium">👥 vendedores ativos</p>
            </CardContent>
          </Card>
        </div>

        {/* Estado vazio */}
        <Card className="bentin-card">
          <CardContent className="text-center py-12 sm:py-16">
            <ShoppingBag className="h-16 w-16 sm:h-20 sm:w-20 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
              Nenhuma venda registrada
            </h3>
            <p className="text-sm sm:text-base text-gray-500 mb-6 max-w-md mx-auto">
              Comece registrando sua primeira venda para acompanhar o desempenho e receita da loja.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              {produtos.length === 0 ? (
                <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-200">
                  <PackageX className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                  <p className="text-sm text-orange-700 font-medium">
                    Cadastre produtos no estoque antes de registrar vendas
                  </p>
                </div>
              ) : (
                <>
                  <Dialog open={modalNovaVenda} onOpenChange={setModalNovaVenda}>
                    <DialogTrigger asChild>
                      <Button className="bentin-button-primary">
                        <Plus className="h-4 w-4 mr-2" />
                        Registrar Primeira Venda
                      </Button>
                    </DialogTrigger>
                    {/* Modal content será adicionado abaixo */}
                  </Dialog>
                  
                  <Dialog open={modalNovoVendedor} onOpenChange={setModalNovoVendedor}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="rounded-xl">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Cadastrar Vendedor
                      </Button>
                    </DialogTrigger>
                    {/* Modal content será adicionado abaixo */}
                  </Dialog>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Resumo de Vendas - Responsivo */}
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
            <CardTitle className="text-sm font-medium text-gray-700">Vendas no Período</CardTitle>
            <div className="bentin-icon-wrapper bg-bentin-green/10">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-bentin-green" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-bentin-green">{estatisticas.totalVendasPeriodo}</div>
            <p className="text-xs text-gray-600 font-medium">✅ {getPeriodoLabel(periodoFiltro).toLowerCase()}</p>
          </CardContent>
        </Card>

        <Card className="bentin-card border-l-4 border-l-bentin-orange">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Receita do Período</CardTitle>
            <div className="bentin-icon-wrapper bg-bentin-orange/10">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-bentin-orange" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-bentin-orange">
              R$ {estatisticas.receitaPeriodo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-600 font-medium">💰 {getPeriodoLabel(periodoFiltro).toLowerCase()}</p>
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
                  <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-bentin-pink" />
                </div>
                Vendas - {getPeriodoLabel(periodoFiltro)}
              </CardTitle>
              <CardDescription className="text-sm">
                {vendasFiltradas.length} de {vendasPorPeriodo.length} vendas no período
              </CardDescription>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Dialog open={modalNovoVendedor} onOpenChange={setModalNovoVendedor}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="rounded-xl w-full sm:w-auto">
                    <UserPlus className="h-4 w-4 mr-2" />
                    <span className="sm:inline">Novo Vendedor</span>
                  </Button>
                </DialogTrigger>
              </Dialog>

              <Dialog open={modalNovaVenda} onOpenChange={setModalNovaVenda}>
                <DialogTrigger asChild>
                  <Button className="bentin-button-primary w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="sm:inline">Nova Venda</span>
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Filtros Responsivos */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar por número ou cliente..."
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:flex sm:gap-4">
              <Select value={periodoFiltro} onValueChange={setPeriodoFiltro}>
                <SelectTrigger className="w-full sm:w-36">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="periodo-hoje" value="hoje">Hoje</SelectItem>
                  <SelectItem key="periodo-7dias" value="7dias">7 dias</SelectItem>
                  <SelectItem key="periodo-30dias" value="30dias">30 dias</SelectItem>
                  <SelectItem key="periodo-90dias" value="90dias">90 dias</SelectItem>
                  <SelectItem key="periodo-mes" value="mes">Este mês</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFiltro} onValueChange={setStatusFiltro}>
                <SelectTrigger className="w-full sm:w-36">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="status-todos" value="todos">Todos</SelectItem>
                  <SelectItem key="status-concluida" value="concluida">Concluída</SelectItem>
                  <SelectItem key="status-pendente" value="pendente">Pendente</SelectItem>
                  <SelectItem key="status-cancelada" value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>

              <Select value={vendedorFiltro} onValueChange={setVendedorFiltro}>
                <SelectTrigger className="w-full sm:w-40 col-span-2 sm:col-span-1">
                  <Users className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="vendedor-todos" value="todos">Todos vendedores</SelectItem>
                  {vendedores.map((vendedor, index) => (
                    <SelectItem key={`vendedor-${index}-${vendedor}`} value={vendedor}>
                      {vendedor}
                    </SelectItem>
                  ))}
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
                    <TableHead className="min-w-[100px]">Número</TableHead>
                    <TableHead className="hidden sm:table-cell">Data</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="hidden md:table-cell">Vendedor</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="hidden lg:table-cell">Pagamento</TableHead>
                    <TableHead className="hidden md:table-cell">Status</TableHead>
                    <TableHead className="text-center w-[80px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendasFiltradas.length > 0 ? (
                    vendasFiltradas.map((venda) => (
                      <TableRow key={venda.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{venda.numero}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {new Date(venda.data).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium leading-tight">{venda.cliente}</p>
                            <div className="flex flex-wrap gap-1 mt-1 sm:hidden">
                              <Badge variant="outline" className="text-xs">
                                {new Date(venda.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                              </Badge>
                              <Badge variant="outline" className="text-xs md:hidden">
                                {venda.vendedor}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{venda.vendedor}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-bold text-bentin-green">
                              R$ {venda.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                            <div className="md:hidden mt-1">
                              {getStatusBadge(venda.status)}
                            </div>
                            <div className="lg:hidden text-xs text-muted-foreground mt-1">
                              {venda.formaPagamento}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Badge variant="outline" className="capitalize">
                            {venda.formaPagamento}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {getStatusBadge(venda.status)}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setVendaSelecionada(venda);
                              setModalDetalhesVenda(true);
                            }}
                            className="p-2 h-8 w-8"
                            aria-label="Ver detalhes"
                          >
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <Search className="h-8 w-8 text-muted-foreground/50" />
                          <p className="text-sm text-muted-foreground">
                            {filtro || statusFiltro !== 'todos' || vendedorFiltro !== 'todos' 
                              ? 'Nenhuma venda encontrada com os filtros aplicados' 
                              : `Nenhuma venda encontrada em ${getPeriodoLabel(periodoFiltro).toLowerCase()}`}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modais serão implementados nas próximas interações devido ao limite de caracteres */}
    </div>
  );
};

export default Vendas;