// =====================================================
// ARQUIVO REMOVIDO - SUBSTITUÍDO POR VendasSemVendedorFixed.tsx
// =====================================================
// Este componente foi substituído por VendasSemVendedorFixed.tsx
// devido a problemas de cache e referências de importação.
// Use o novo componente em seu lugar.
// =====================================================

export default function VendasSemVendedor() {
  return (
    <div className="p-8 text-center">
      <h2 className="text-2xl font-bold text-red-600 mb-4">
        Componente Removido
      </h2>
      <p className="text-gray-600">
        Este componente foi substituído por VendasSemVendedorFixed.tsx
      </p>
    </div>
  );
}
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { FormSection, FormField, FormGrid } from './ui/form-section';
import { ResponsiveTable } from './ui/responsive-table';
import { StatsCard } from './ui/stats-card';
import { LoadingState } from './ui/loading-state';
import { ModalBase } from './ui/modal-base';
import { useToast } from './ToastProvider';
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
  Trash2,
  Filter,
  CheckCircle,
  Phone,
  Mail,
  Edit3,
  Package,
  TrendingUp
} from 'lucide-react';

// Tipos para o formulário (sem vendedor)
interface VendaFormData {
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

interface FiltrosVenda {
  busca: string;
  periodo: string;
  status: string;
}

const initialVendaForm: VendaFormData = {
  formaPagamento: '',
  desconto: '0',
  observacoes: ''
};

const VendasSemVendedor = () => {
  const {
    vendas,
    produtos,
    adicionarVenda,
    loading
  } = useEstoque();
  
  const { clientes, criarCliente } = useClientes();
  const { addToast } = useToast();
  
  // Estados de filtros (sem vendedor)
  const [filtros, setFiltros] = useState<FiltrosVenda>({
    busca: '',
    periodo: '30dias',
    status: 'todos'
  });

  // Estados dos modais
  const [modalNovaVenda, setModalNovaVenda] = useState(false);
  const [modalDetalhesVenda, setModalDetalhesVenda] = useState(false);
  const [modalGerenciarClientes, setModalGerenciarClientes] = useState(false);
  const [modalSelecionarCliente, setModalSelecionarCliente] = useState(false);
  const [vendaSelecionada, setVendaSelecionada] = useState<Venda | null>(null);
  const [clienteVenda, setClienteVenda] = useState<Cliente | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Estados dos formulários
  const [formVenda, setFormVenda] = useState<VendaFormData>(initialVendaForm);

  // Estados do carrinho
  const [carrinhoItens, setCarrinhoItens] = useState<ItemCarrinho[]>([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState('');
  const [quantidadeProduto, setQuantidadeProduto] = useState('');

  // Estados para cliente
  const [buscaCliente, setBuscaCliente] = useState('');
  const [novoClienteRapido, setNovoClienteRapido] = useState({
    nome: '',
    telefone: '',
    email: ''
  });

  // Atualização de filtros
  const atualizarFiltro = useCallback((campo: keyof FiltrosVenda, valor: string) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  }, []);

  const limparFiltros = useCallback(() => {
    setFiltros({
      busca: '',
      periodo: '30dias',
      status: 'todos'
    });
  }, []);

  // Calcular vendas por período
  const vendasPorPeriodo = useMemo(() => {
    const agora = new Date();
    let dataLimite: Date;

    switch (filtros.periodo) {
      case 'hoje':
        dataLimite = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
        break;
      case '7dias':
        dataLimite = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30dias':
        dataLimite = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90dias':
        dataLimite = new Date(agora.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'mes':
        dataLimite = new Date(agora.getFullYear(), agora.getMonth(), 1);
        break;
      default:
        dataLimite = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return vendas.filter(venda => new Date(venda.data) >= dataLimite);
  }, [vendas, filtros.periodo]);

  // Filtrar vendas (sem vendedor)
  const vendasFiltradas = useMemo(() => {
    return vendasPorPeriodo.filter(venda => {
      const matchBusca = !filtros.busca || 
        venda.nomeProduto.toLowerCase().includes(filtros.busca.toLowerCase()) ||
        (venda.cliente && venda.cliente.toLowerCase().includes(filtros.busca.toLowerCase()));
      
      const matchStatus = filtros.status === 'todos' || (venda as any).status === filtros.status;

      return matchBusca && matchStatus;
    });
  }, [vendasPorPeriodo, filtros]);

  // Métricas do dashboard
  const metricas = useMemo(() => {
    const hoje = new Date();
    const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const vendasHoje = vendas.filter(venda => new Date(venda.data) >= inicioHoje);

    const totalVendasHoje = vendasHoje.reduce((total, v) => total + v.precoTotal, 0);
    const totalVendasPeriodo = vendasPorPeriodo.length;
    const receitaPeriodo = vendasPorPeriodo.reduce((total, v) => total + v.precoTotal, 0);

    return {
      vendasHoje: vendasHoje.length,
      totalVendasHoje,
      totalVendasPeriodo,
      receitaPeriodo
    };
  }, [vendas, vendasPorPeriodo]);

  // Funções para clientes
  const selecionarCliente = useCallback((cliente: Cliente) => {
    setClienteVenda(cliente);
    setModalSelecionarCliente(false);
    setBuscaCliente('');
    addToast({
      type: 'success',
      title: 'Cliente selecionado',
      description: `Cliente ${cliente.nome} foi selecionado para a venda.`
    });
  }, [addToast]);

  const limparCliente = useCallback(() => {
    setClienteVenda(null);
    addToast({
      type: 'info',
      title: 'Cliente removido',
      description: 'Cliente foi removido da venda.'
    });
  }, [addToast]);

  const cadastrarClienteRapido = useCallback(async () => {
    if (!novoClienteRapido.nome.trim()) {
      addToast({
        type: 'error',
        title: 'Nome obrigatório',
        description: 'Por favor, digite o nome do cliente.'
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔄 [VENDAS] Iniciando cadastro rápido de cliente:', novoClienteRapido);
      
      const novoCliente = await criarCliente({
        nome: novoClienteRapido.nome.trim(),
        telefone: novoClienteRapido.telefone.trim() || undefined,
        email: novoClienteRapido.email.trim() || undefined,
        ativo: true
      });

      console.log('📝 [VENDAS] Resultado do cadastro:', novoCliente);

      if (novoCliente) {
        setClienteVenda(novoCliente);
        setNovoClienteRapido({ nome: '', telefone: '', email: '' });
        addToast({
          type: 'success',
          title: 'Cliente cadastrado!',
          description: `${novoCliente.nome} foi cadastrado e selecionado para a venda.`
        });
      } else {
        throw new Error('Falha ao criar cliente - resultado nulo');
      }
    } catch (error) {
      console.error('❌ [VENDAS] Erro no cadastro rápido:', error);
      addToast({
        type: 'error',
        title: 'Erro ao cadastrar cliente',
        description: error instanceof Error ? error.message : 'Erro desconhecido. Tente novamente.'
      });
    } finally {
      setIsLoading(false);
    }
  }, [novoClienteRapido, criarCliente, addToast]);

  // Filtrar clientes para busca
  const clientesFiltrados = useMemo(() => {
    if (!buscaCliente.trim()) return clientes;
    
    const termo = buscaCliente.toLowerCase();
    return clientes.filter(cliente => 
      cliente.nome.toLowerCase().includes(termo) ||
      (cliente.telefone && cliente.telefone.toLowerCase().includes(termo)) ||
      (cliente.email && cliente.email.toLowerCase().includes(termo))
    );
  }, [clientes, buscaCliente]);

  // Função para adicionar produto ao carrinho
  const adicionarAoCarrinho = useCallback(() => {
    if (!produtoSelecionado || !quantidadeProduto) {
      addToast({
        type: 'error',
        title: 'Dados incompletos',
        description: 'Selecione um produto e digite a quantidade.'
      });
      return;
    }

    const produto = produtos.find(p => p.id === produtoSelecionado);
    if (!produto) {
      addToast({
        type: 'error',
        title: 'Produto não encontrado',
        description: 'O produto selecionado não foi encontrado.'
      });
      return;
    }

    const quantidade = parseInt(quantidadeProduto);
    if (isNaN(quantidade) || quantidade <= 0) {
      addToast({
        type: 'error',
        title: 'Quantidade inválida',
        description: 'Digite uma quantidade válida.'
      });
      return;
    }

    if (quantidade > produto.quantidade) {
      addToast({
        type: 'error',
        title: 'Estoque insuficiente',
        description: `Apenas ${produto.quantidade} unidade(s) disponível(eis).`
      });
      return;
    }

    const itemExistente = carrinhoItens.find(item => item.produtoId === produto.id);
    if (itemExistente) {
      const novaQuantidade = itemExistente.quantidade + quantidade;
      if (novaQuantidade > produto.quantidade) {
        addToast({
          type: 'error',
          title: 'Estoque insuficiente',
          description: `Total no carrinho (${novaQuantidade}) excede estoque disponível (${produto.quantidade}).`
        });
        return;
      }

      setCarrinhoItens(prev => prev.map(item => 
        item.produtoId === produto.id 
          ? { ...item, quantidade: novaQuantidade, subtotal: novaQuantidade * produto.preco }
          : item
      ));
    } else {
      const novoItem: ItemCarrinho = {
        produtoId: produto.id,
        produto: produto.nome,
        quantidade,
        precoUnitario: produto.preco,
        subtotal: quantidade * produto.preco
      };
      setCarrinhoItens(prev => [...prev, novoItem]);
    }

    setProdutoSelecionado('');
    setQuantidadeProduto('');
    addToast({
      type: 'success',
      title: 'Produto adicionado',
      description: `${produto.nome} foi adicionado ao carrinho.`
    });
  }, [produtoSelecionado, quantidadeProduto, produtos, carrinhoItens, addToast]);

  const removerDoCarrinho = useCallback((index: number) => {
    setCarrinhoItens(prev => prev.filter((_, i) => i !== index));
    addToast({
      type: 'info',
      title: 'Produto removido',
      description: 'Produto foi removido do carrinho.'
    });
  }, [addToast]);

  const atualizarFormVenda = useCallback((campo: keyof VendaFormData, valor: string) => {
    setFormVenda(prev => ({ ...prev, [campo]: valor }));
  }, []);

  // Finalizar venda (sem vendedor)
  const finalizarVenda = useCallback(async () => {
    // Validações
    if (!clienteVenda) {
      addToast({
        type: 'error',
        title: 'Cliente necessário',
        description: 'Selecione um cliente para a venda.'
      });
      return;
    }

    if (carrinhoItens.length === 0) {
      addToast({
        type: 'error',
        title: 'Carrinho vazio',
        description: 'Adicione pelo menos um produto ao carrinho.'
      });
      return;
    }

    if (!formVenda.formaPagamento) {
      addToast({
        type: 'error',
        title: 'Forma de pagamento necessária',
        description: 'Selecione a forma de pagamento.'
      });
      return;
    }

    setIsLoading(true);
    try {
      // Para cada item do carrinho, criar uma venda individual (sem vendedor)
      for (const item of carrinhoItens) {
        const desconto = parseFloat(formVenda.desconto) || 0;
        const descontoItem = (desconto / carrinhoItens.length); // Distribuir desconto proporcionalmente
        
        await adicionarVenda({
          produtoId: item.produtoId,
          nomeProduto: item.produto,
          quantidade: item.quantidade,
          precoUnitario: item.precoUnitario,
          precoTotal: item.subtotal - descontoItem,
          vendedor: 'Venda Direta', // Valor fixo para manter compatibilidade
          categoria: 'Produto',
          formaPagamento: formVenda.formaPagamento as any,
          desconto: descontoItem,
          data: new Date().toISOString(),
          observacoes: formVenda.observacoes.trim(),
          cliente: clienteVenda.nome,
          cliente_id: clienteVenda.id,
          numero: `V${Date.now()}`,
          status: 'concluida',
          total: item.subtotal - descontoItem
        });
      }

      addToast({
        type: 'success',
        title: 'Venda finalizada',
        description: `Venda registrada com ${clienteVenda.nome} com sucesso!`
      });
      
      // Limpar formulário e cliente selecionado
      setFormVenda(initialVendaForm);
      setCarrinhoItens([]);
      setClienteVenda(null);
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
  }, [formVenda, carrinhoItens, clienteVenda, adicionarVenda, addToast]);

  // Funções auxiliares
  const getStatusBadge = useCallback((status: string) => {
    switch (status) {
      case 'concluida':
        return <Badge className="bg-green-100 text-green-800 border-green-200">✅ Concluída</Badge>;
      case 'pendente':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">⏳ Pendente</Badge>;
      case 'cancelada':
        return <Badge className="bg-red-100 text-red-800 border-red-200">❌ Cancelada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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

  // Colunas da tabela de vendas (sem vendedor)
  const colunasVendas = useMemo(() => [
    {
      key: 'id',
      label: 'ID',
      width: 'w-24',
      render: (id: string) => (
        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
          {id.slice(-6)}
        </code>
      )
    },
    {
      key: 'data',
      label: 'Data',
      width: 'w-32',
      render: (data: string) => new Date(data).toLocaleDateString('pt-BR')
    },
    {
      key: 'nomeProduto',
      label: 'Produto',
      width: 'w-48'
    },
    {
      key: 'quantidade',
      label: 'Qtd.',
      width: 'w-20',
      className: 'text-center'
    },
    {
      key: 'cliente',
      label: 'Cliente',
      width: 'w-40',
      render: (cliente: string) => cliente || 'Não informado'
    },
    {
      key: 'formaPagamento',
      label: 'Pagamento',
      width: 'w-32',
      render: (forma: string) => {
        const formas: { [key: string]: string } = {
          'dinheiro': 'Dinheiro',
          'cartao_debito': 'Cartão Débito',
          'cartao_credito': 'Cartão Crédito',
          'pix': 'PIX',
          'transferencia': 'Transferência'
        };
        return formas[forma] || forma;
      }
    },
    {
      key: 'precoTotal',
      label: 'Total',
      width: 'w-28',
      className: 'text-right',
      render: (valor: number) => (
        <span className="font-semibold text-green-600">
          R$ {valor.toFixed(2)}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Ações',
      width: 'w-20',
      className: 'text-center',
      render: (_: any, venda: Venda) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setVendaSelecionada(venda);
            setModalDetalhesVenda(true);
          }}
          className="h-8 w-8 p-0"
          title="Ver detalhes"
        >
          <Eye className="h-4 w-4" />
        </Button>
      )
    }
  ], [getStatusBadge]);

  if (loading) {
    return <LoadingState message="Carregando vendas..." />;
  }

  // Estado vazio
  if (vendas.length === 0) {
    return (
      <div className="space-y-6">
        {/* Cards de resumo vazios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatsCard
            title="Vendas Hoje"
            value="0"
            description="vendas realizadas"
            icon={<ShoppingCart />}
            color="primary"
          />
          
          <StatsCard
            title="Receita Hoje"
            value="R$ 0,00"
            description="faturamento do dia"
            icon={<DollarSign />}
            color="success"
          />
          
          <StatsCard
            title="Clientes Cadastrados"
            value={clientes.length}
            description="base de clientes"
            icon={<Users />}
            color="info"
          />
        </div>

        {/* Ação Principal Simplificada */}
        <Card className="bentin-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <ShoppingBag className="h-6 w-6 text-bentin-pink" />
              Sistema de Vendas - Meu Bentin
            </CardTitle>
            <CardDescription>
              Registre vendas rapidamente com busca e cadastro de clientes integrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Comece a Vender!</h3>
                <p className="text-gray-600">
                  Sistema pronto para registrar vendas. Cadastre novos clientes durante a venda se necessário.
                </p>
              </div>
              
              <Button 
                onClick={() => setModalNovaVenda(true)}
                className="bentin-button-primary text-lg px-8 py-4"
              >
                <ShoppingCart className="h-5 w-5 mr-3" />
                Nova Venda
              </Button>
              
              <div className="flex justify-center gap-6 mt-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4 text-bentin-pink" />
                  {clientes.length} Cliente{clientes.length !== 1 ? 's' : ''}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <ShoppingBag className="h-4 w-4 text-bentin-green" />
                  {produtos.length} Produto{produtos.length !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Ação secundária */}
              <div className="flex justify-center mt-6">
                <Button 
                  onClick={() => setModalGerenciarClientes(true)}
                  variant="outline"
                  className="border-bentin-pink text-bentin-pink hover:bg-bentin-pink hover:text-white"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Gerenciar Clientes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modal Nova Venda - Experiência Modernizada */}
        {modalNovaVenda && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/20 backdrop-blur-sm" 
              onClick={() => {
                setModalNovaVenda(false);
                setFormVenda(initialVendaForm);
                setCarrinhoItens([]);
                setClienteVenda(null);
              }}
            />
            
            {/* Modal */}
            <div className="modal-container relative bg-white rounded-xl shadow-xl w-[90vw] max-w-5xl flex flex-col border border-gray-200" style={{ maxHeight: '90vh', overflow: 'hidden' }}>
              
              {/* Header */}
              <div className="modal-header flex items-center justify-between p-6 border-b border-gray-200 bg-white" style={{ flexShrink: 0 }}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-bentin-green/10 border border-bentin-green/20">
                    <ShoppingCart className="h-5 w-5 text-bentin-green" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Nova Venda</h2>
                    <p className="text-sm text-gray-600">
                      Registre uma nova venda no sistema com busca integrada de clientes
                    </p>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setModalNovaVenda(false);
                    setFormVenda(initialVendaForm);
                    setCarrinhoItens([]);
                    setClienteVenda(null);
                  }}
                  className="h-9 w-9 p-0 hover:bg-gray-100 rounded-lg"
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Conteúdo scrollável */}
              <div className="modal-body bentin-scroll p-6 space-y-6" style={{ flexGrow: 1, overflowY: 'auto' }}>
                <div className="space-y-6">
            {/* Seleção/Cadastro de Cliente */}
            <FormSection 
              title="Cliente da Venda" 
              description="Selecione um cliente existente ou cadastre rapidamente um novo cliente"
              icon={<Users className="h-5 w-5" />}
            >
              {!clienteVenda ? (
                <div className="space-y-6">
                  {/* Campo de busca de clientes */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2">
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        Buscar Cliente Existente
                      </Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Digite nome, telefone ou email..."
                          value={buscaCliente}
                          onChange={(e) => setBuscaCliente(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      
                      {/* Resultados da busca */}
                      {buscaCliente && clientesFiltrados.length > 0 && (
                        <div className="mt-2 max-h-40 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
                          {clientesFiltrados.slice(0, 5).map((cliente) => (
                            <div
                              key={cliente.id}
                              onClick={() => {
                                selecionarCliente(cliente);
                                setBuscaCliente('');
                              }}
                              className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-gray-900">{cliente.nome}</p>
                                  <p className="text-sm text-gray-600">
                                    {cliente.telefone || cliente.email}
                                  </p>
                                </div>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-end">
                      <Button
                        type="button"
                        onClick={() => setModalSelecionarCliente(true)}
                        variant="outline"
                        className="w-full border-bentin-blue text-bentin-blue hover:bg-bentin-blue hover:text-white"
                      >
                        <Search className="h-4 w-4 mr-2" />
                        Ver Todos
                      </Button>
                    </div>
                  </div>

                  {/* Divisor OU */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500 font-medium">OU</span>
                    </div>
                  </div>

                  {/* Cadastro rápido de novo cliente */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <UserPlus className="h-5 w-5 text-bentin-pink" />
                      <h3 className="font-semibold text-gray-900">Cadastro Rápido</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Nome *</Label>
                        <Input
                          placeholder="Nome completo"
                          value={novoClienteRapido.nome}
                          onChange={(e) => setNovoClienteRapido(prev => ({ ...prev, nome: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>Telefone</Label>
                        <Input
                          placeholder="(11) 99999-9999"
                          value={novoClienteRapido.telefone}
                          onChange={(e) => setNovoClienteRapido(prev => ({ ...prev, telefone: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          type="email"
                          placeholder="email@exemplo.com"
                          value={novoClienteRapido.email}
                          onChange={(e) => setNovoClienteRapido(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          type="button"
                          onClick={cadastrarClienteRapido}
                          disabled={!novoClienteRapido.nome.trim() || isLoading}
                          className="w-full bentin-button-primary"
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Cadastrar e Selecionar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Exibição do Cliente Selecionado */
                <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <h3 className="font-semibold text-green-800">Cliente Selecionado</h3>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="font-bold text-lg text-green-900">{clienteVenda.nome}</p>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          {clienteVenda.telefone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              {clienteVenda.telefone}
                            </div>
                          )}
                          {clienteVenda.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              {clienteVenda.email}
                            </div>
                          )}
                          {clienteVenda.data_nascimento && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date().getFullYear() - new Date(clienteVenda.data_nascimento).getFullYear()} anos
                            </div>
                          )}
                        </div>

                        {clienteVenda.filhos && clienteVenda.filhos.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                              Filhos ({clienteVenda.filhos.length}):
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {clienteVenda.filhos.map((filho) => (
                                <Badge key={filho.id} variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                  {filho.nome}
                                  {filho.data_nascimento && (
                                    <span className="ml-1">
                                      ({new Date().getFullYear() - new Date(filho.data_nascimento).getFullYear()}a)
                                    </span>
                                  )}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={() => setModalSelecionarCliente(true)}
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700"
                        title="Alterar cliente"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        onClick={limparCliente}
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-red-600"
                        title="Remover cliente"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </FormSection>

            {/* Dados da Venda (sem vendedor) */}
            <FormSection title="Dados da Venda" icon={<ShoppingBag className="h-5 w-5" />}>
              <FormGrid cols={2}>
                <FormField label="Forma de Pagamento" required>
                  <Select 
                    value={formVenda.formaPagamento} 
                    onValueChange={(value) => atualizarFormVenda('formaPagamento', value)}
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
                </FormField>
                
                <FormField label="Desconto (R$)">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formVenda.desconto}
                    onChange={(e) => atualizarFormVenda('desconto', e.target.value)}
                    placeholder="0,00"
                  />
                </FormField>
              </FormGrid>
              
              <FormField label="Observações">
                <Textarea
                  value={formVenda.observacoes}
                  onChange={(e) => atualizarFormVenda('observacoes', e.target.value)}
                  placeholder="Observações sobre a venda..."
                  rows={2}
                />
              </FormField>
            </FormSection>

            {/* Produtos */}
            <FormSection title="Produtos" icon={<Package className="h-5 w-5" />}>
              <FormGrid cols={3}>
                <FormField label="Produto" required>
                  <Select value={produtoSelecionado} onValueChange={setProdutoSelecionado}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {produtos.map((produto) => (
                        <SelectItem key={produto.id} value={produto.id}>
                          {produto.nome} - R$ {produto.preco.toFixed(2)} (Est: {produto.quantidade})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                
                <FormField label="Quantidade" required>
                  <Input
                    type="number"
                    min="1"
                    value={quantidadeProduto}
                    onChange={(e) => setQuantidadeProduto(e.target.value)}
                    placeholder="1"
                  />
                </FormField>
                
                <div className="flex items-end">
                  <Button
                    type="button"
                    onClick={adicionarAoCarrinho}
                    disabled={!produtoSelecionado || !quantidadeProduto}
                    className="w-full"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </FormGrid>

              {/* Carrinho */}
              {carrinhoItens.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Carrinho de Compras</h4>
                  <div className="space-y-2">
                    {carrinhoItens.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{item.produto}</p>
                          <p className="text-sm text-gray-600">
                            {item.quantidade}x R$ {item.precoUnitario.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold">R$ {item.subtotal.toFixed(2)}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removerDoCarrinho(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 p-4 bg-green-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total:</span>
                      <span className="text-xl font-bold text-green-600">
                        R$ {totalCarrinho.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
                </FormSection>
                </div>

                {/* Footer com Ações */}
                <div className="modal-footer flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50" style={{ flexShrink: 0 }}>
                  <div className="flex items-center gap-4">
                    {carrinhoItens.length > 0 && (
                      <div className="text-lg font-semibold text-bentin-green">
                        Total: R$ {totalCarrinho.toFixed(2)}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setModalNovaVenda(false);
                        setFormVenda(initialVendaForm);
                        setCarrinhoItens([]);
                        setClienteVenda(null);
                      }}
                      disabled={isLoading}
                    >
                      Cancelar
                    </Button>
                    
                    <Button
                      type="button"
                      onClick={finalizarVenda}
                      disabled={isLoading || !clienteVenda || carrinhoItens.length === 0 || !formVenda.formaPagamento}
                      className="bentin-button-primary"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Finalizando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Finalizar Venda
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Seleção de Cliente - Experiência Modernizada */}
        {modalSelecionarCliente && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/20 backdrop-blur-sm" 
              onClick={() => setModalSelecionarCliente(false)}
            />
            
            {/* Modal */}
            <div className="modal-container relative bg-white rounded-xl shadow-xl w-[85vw] max-w-3xl flex flex-col border border-gray-200" style={{ maxHeight: '85vh', overflow: 'hidden' }}>
              
              {/* Header */}
              <div className="modal-header flex items-center justify-between p-6 border-b border-gray-200 bg-white" style={{ flexShrink: 0 }}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-bentin-blue/10 border border-bentin-blue/20">
                    <Search className="h-5 w-5 text-bentin-blue" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Selecionar Cliente</h2>
                    <p className="text-sm text-gray-600">
                      Escolha um cliente da lista ou busque por nome, telefone ou email
                    </p>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setModalSelecionarCliente(false)}
                  className="h-9 w-9 p-0 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Conteúdo scrollável */}
              <div className="modal-body bentin-scroll p-6 space-y-4" style={{ flexGrow: 1, overflowY: 'auto' }}>
                {/* Campo de Busca Aprimorado */}
                <FormSection 
                  title="Buscar Cliente" 
                  description="Digite para filtrar os clientes cadastrados"
                  icon={<Search className="h-4 w-4" />}
                >
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por nome, email ou telefone..."
                      value={buscaCliente}
                      onChange={(e) => setBuscaCliente(e.target.value)}
                      className="pl-10 h-11"
                      autoFocus
                    />
                  </div>
                </FormSection>

                {/* Lista de Clientes */}
                <FormSection 
                  title={`Clientes ${clientesFiltrados.length > 0 ? `(${clientesFiltrados.length})` : ''}`}
                  description="Clique em um cliente para selecioná-lo"
                  icon={<Users className="h-4 w-4" />}
                >
                  <div className="max-h-80 overflow-y-auto space-y-3 bentin-scroll">
                    {clientesFiltrados.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        {buscaCliente ? (
                          <>
                            <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p className="font-medium">Nenhum cliente encontrado</p>
                            <p className="text-sm">Tente ajustar os termos de busca</p>
                          </>
                        ) : (
                          <>
                            <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p className="font-medium">Nenhum cliente cadastrado</p>
                            <p className="text-sm">Cadastre o primeiro cliente para começar</p>
                          </>
                        )}
                      </div>
                    ) : (
                      clientesFiltrados.map((cliente) => (
                        <div
                          key={cliente.id}
                          onClick={() => selecionarCliente(cliente)}
                          className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-bentin-pink hover:bg-pink-50 transition-all duration-200 group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 group-hover:text-bentin-pink transition-colors">
                                {cliente.nome}
                              </h3>
                              
                              <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                                {cliente.telefone && (
                                  <div className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {cliente.telefone}
                                  </div>
                                )}
                                {cliente.email && (
                                  <div className="flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {cliente.email}
                                  </div>
                                )}
                              </div>

                              {cliente.filhos && cliente.filhos.length > 0 && (
                                <div className="mt-2">
                                  <div className="flex flex-wrap gap-1">
                                    {cliente.filhos.map((filho) => (
                                      <Badge 
                                        key={filho.id} 
                                        variant="secondary" 
                                        className="text-xs bg-blue-100 text-blue-800"
                                      >
                                        {filho.nome}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <CheckCircle className="h-5 w-5 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </FormSection>
              </div>

              {/* Footer */}
              <div className="modal-footer flex justify-end p-6 border-t border-gray-200 bg-gray-50" style={{ flexShrink: 0 }}>
                <Button 
                  variant="outline" 
                  onClick={() => setModalSelecionarCliente(false)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Detalhes da Venda - Experiência Modernizada */}
        {modalDetalhesVenda && vendaSelecionada && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/20 backdrop-blur-sm" 
              onClick={() => setModalDetalhesVenda(false)}
            />
            
            {/* Modal */}
            <div className="modal-container relative bg-white rounded-xl shadow-xl w-[85vw] max-w-2xl flex flex-col border border-gray-200" style={{ maxHeight: '85vh', overflow: 'hidden' }}>
              
              {/* Header */}
              <div className="modal-header flex items-center justify-between p-6 border-b border-gray-200 bg-white" style={{ flexShrink: 0 }}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-bentin-orange/10 border border-bentin-orange/20">
                    <Eye className="h-5 w-5 text-bentin-orange" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Detalhes da Venda</h2>
                    <p className="text-sm text-gray-600">
                      Informações completas da venda #{vendaSelecionada.id?.slice(-6)}
                    </p>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setModalDetalhesVenda(false)}
                  className="h-9 w-9 p-0 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Conteúdo scrollável */}
              <div className="modal-body bentin-scroll p-6 space-y-6" style={{ flexGrow: 1, overflowY: 'auto' }}>
                {/* Informações da Venda */}
                <FormSection 
                  title="Informações da Venda" 
                  description="Dados detalhados da transação"
                  icon={<ShoppingCart className="h-4 w-4" />}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Data e Hora</Label>
                      <p className="font-semibold text-gray-900 mt-1">
                        {new Date(vendaSelecionada.data).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</Label>
                      <div className="mt-1">
                        {getStatusBadge((vendaSelecionada as any).status || 'concluida')}
                      </div>
                    </div>
                    
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Produto</Label>
                      <p className="font-semibold text-gray-900 mt-1">{vendaSelecionada.nomeProduto}</p>
                    </div>
                    
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Quantidade</Label>
                      <p className="font-semibold text-gray-900 mt-1">{vendaSelecionada.quantidade} unidade(s)</p>
                    </div>
                    
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Cliente</Label>
                      <p className="font-semibold text-gray-900 mt-1">{vendaSelecionada.cliente || 'Não informado'}</p>
                    </div>
                    
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <Label className="text-xs font-medium text-green-600 uppercase tracking-wide">Valor Total</Label>
                      <p className="font-bold text-xl text-green-700 mt-1">
                        R$ {vendaSelecionada.precoTotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </FormSection>

                {/* Informações de Pagamento */}
                <FormSection 
                  title="Forma de Pagamento" 
                  icon={<DollarSign className="h-4 w-4" />}
                >
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="font-semibold text-blue-900">
                      {(() => {
                        const formas: { [key: string]: string } = {
                          'dinheiro': 'Dinheiro',
                          'cartao_debito': 'Cartão de Débito',
                          'cartao_credito': 'Cartão de Crédito',
                          'pix': 'PIX',
                          'transferencia': 'Transferência'
                        };
                        return formas[vendaSelecionada.formaPagamento] || vendaSelecionada.formaPagamento;
                      })()}
                    </p>
                  </div>
                </FormSection>
                
                {/* Observações */}
                {(vendaSelecionada as any).observacoes && (
                  <FormSection 
                    title="Observações" 
                    icon={<Edit3 className="h-4 w-4" />}
                  >
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <p className="text-gray-700">
                        {(vendaSelecionada as any).observacoes}
                      </p>
                    </div>
                  </FormSection>
                )}
              </div>

              {/* Footer */}
              <div className="modal-footer flex justify-end p-6 border-t border-gray-200 bg-gray-50" style={{ flexShrink: 0 }}>
                <Button 
                  variant="outline" 
                  onClick={() => setModalDetalhesVenda(false)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Gerenciar Clientes */}
        <GerenciarClientesCorrigido 
          open={modalGerenciarClientes}
          onCancel={() => setModalGerenciarClientes(false)}
        />
      </div>
    );
  }

  // Estado normal com vendas
  return (
    <div className="space-y-6">
      {/* Cards de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard
          title="Vendas Hoje"
          value={metricas.vendasHoje.toString()}
          description="vendas realizadas"
          icon={<ShoppingCart />}
          color="primary"
        />
        
        <StatsCard
          title="Receita Hoje"
          value={`R$ ${metricas.totalVendasHoje.toFixed(2)}`}
          description="faturamento do dia"
          icon={<DollarSign />}
          color="success"
        />
        
        <StatsCard
          title={`Vendas ${getPeriodoLabel(filtros.periodo)}`}
          value={metricas.totalVendasPeriodo.toString()}
          description="no período"
          icon={<Calendar />}
          color="info"
        />
      </div>

      {/* Botão Nova Venda em destaque */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Gestão de Vendas</h2>
        <Button 
          onClick={() => setModalNovaVenda(true)}
          className="bentin-button-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Venda
        </Button>
      </div>

      {/* Card principal de vendas */}
      <Card className="bentin-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <ShoppingBag className="h-6 w-6 text-bentin-green" />
            Histórico de Vendas
          </CardTitle>
          <CardDescription>
            Acompanhe todas as vendas realizadas no período selecionado
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filtros (sem vendedor) */}
          <FormSection title="Filtros" icon={<Filter className="h-5 w-5" />}>
            <FormGrid cols={3}>
              <FormField label="Buscar">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Produto, cliente..."
                    value={filtros.busca}
                    onChange={(e) => atualizarFiltro('busca', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </FormField>
              
              <FormField label="Período">
                <Select value={filtros.periodo} onValueChange={(valor) => atualizarFiltro('periodo', valor)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hoje">Hoje</SelectItem>
                    <SelectItem value="7dias">Últimos 7 dias</SelectItem>
                    <SelectItem value="30dias">Últimos 30 dias</SelectItem>
                    <SelectItem value="90dias">Últimos 90 dias</SelectItem>
                    <SelectItem value="mes">Este mês</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              
              <Button 
                variant="outline" 
                onClick={limparFiltros}
                className="self-end"
              >
                <X className="h-4 w-4 mr-2" />
                Limpar Filtros
              </Button>
            </FormGrid>
          </FormSection>

          {/* Tabela de Vendas */}
          <ResponsiveTable
            columns={colunasVendas}
            data={vendasFiltradas}
            emptyMessage="Nenhuma venda encontrada com os filtros aplicados."
          />
        </CardContent>
      </Card>

      {/* Modais para estado com vendas */}
      <ModalBase
        open={modalNovaVenda}
        onOpenChange={setModalNovaVenda}
        title="Nova Venda"
        description="Registre uma nova venda no sistema"
        size="3xl"
        onCancel={() => {
          setModalNovaVenda(false);
          setFormVenda(initialVendaForm);
          setCarrinhoItens([]);
          setClienteVenda(null);
        }}
        onSubmit={finalizarVenda}
        submitText="Finalizar Venda"
        isLoading={isLoading}
        icon={<ShoppingCart className="h-6 w-6" />}
      >
        <div className="space-y-6">
          {/* Seleção/Cadastro de Cliente */}
          <FormSection 
            title="Cliente da Venda" 
            description="Selecione um cliente existente ou cadastre rapidamente um novo cliente"
            icon={<Users className="h-5 w-5" />}
          >
            {!clienteVenda ? (
              <div className="space-y-6">
                {/* Campo de busca de clientes */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2">
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Buscar Cliente Existente
                    </Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Digite nome, telefone ou email..."
                        value={buscaCliente}
                        onChange={(e) => setBuscaCliente(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    {/* Resultados da busca */}
                    {buscaCliente && clientesFiltrados.length > 0 && (
                      <div className="mt-2 max-h-40 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
                        {clientesFiltrados.slice(0, 5).map((cliente) => (
                          <div
                            key={cliente.id}
                            onClick={() => {
                              selecionarCliente(cliente);
                              setBuscaCliente('');
                            }}
                            className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">{cliente.nome}</p>
                                <p className="text-sm text-gray-600">
                                  {cliente.telefone || cliente.email}
                                </p>
                              </div>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-end">
                    <Button
                      type="button"
                      onClick={() => setModalSelecionarCliente(true)}
                      variant="outline"
                      className="w-full border-bentin-blue text-bentin-blue hover:bg-bentin-blue hover:text-white"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Ver Todos
                    </Button>
                  </div>
                </div>

                {/* Divisor OU */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 font-medium">OU</span>
                  </div>
                </div>

                {/* Cadastro rápido de novo cliente */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <UserPlus className="h-5 w-5 text-bentin-pink" />
                    <h3 className="font-semibold text-gray-900">Cadastro Rápido</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Nome *</Label>
                      <Input
                        placeholder="Nome completo"
                        value={novoClienteRapido.nome}
                        onChange={(e) => setNovoClienteRapido(prev => ({ ...prev, nome: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Telefone</Label>
                      <Input
                        placeholder="(11) 99999-9999"
                        value={novoClienteRapido.telefone}
                        onChange={(e) => setNovoClienteRapido(prev => ({ ...prev, telefone: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        type="email"
                        placeholder="email@exemplo.com"
                        value={novoClienteRapido.email}
                        onChange={(e) => setNovoClienteRapido(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        onClick={cadastrarClienteRapido}
                        disabled={!novoClienteRapido.nome.trim()}
                        className="w-full bentin-button-primary"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Cadastrar e Selecionar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Exibição do Cliente Selecionado */
              <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <h3 className="font-semibold text-green-800">Cliente Selecionado</h3>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="font-bold text-lg text-green-900">{clienteVenda.nome}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        {clienteVenda.telefone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {clienteVenda.telefone}
                          </div>
                        )}
                        {clienteVenda.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {clienteVenda.email}
                          </div>
                        )}
                        {clienteVenda.data_nascimento && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date().getFullYear() - new Date(clienteVenda.data_nascimento).getFullYear()} anos
                          </div>
                        )}
                      </div>

                      {clienteVenda.filhos && clienteVenda.filhos.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Filhos ({clienteVenda.filhos.length}):
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {clienteVenda.filhos.map((filho) => (
                              <Badge key={filho.id} variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                {filho.nome}
                                {filho.data_nascimento && (
                                  <span className="ml-1">
                                    ({new Date().getFullYear() - new Date(filho.data_nascimento).getFullYear()}a)
                                  </span>
                                )}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={() => setModalSelecionarCliente(true)}
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700"
                      title="Alterar cliente"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      onClick={limparCliente}
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-red-600"
                      title="Remover cliente"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </FormSection>

          {/* Dados da Venda (sem vendedor) */}
          <FormSection title="Dados da Venda" icon={<ShoppingBag className="h-5 w-5" />}>
            <FormGrid cols={2}>
              <FormField label="Forma de Pagamento" required>
                <Select 
                  value={formVenda.formaPagamento} 
                  onValueChange={(value) => atualizarFormVenda('formaPagamento', value)}
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
              </FormField>
              
              <FormField label="Desconto (R$)">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formVenda.desconto}
                  onChange={(e) => atualizarFormVenda('desconto', e.target.value)}
                  placeholder="0,00"
                />
              </FormField>
            </FormGrid>
            
            <FormField label="Observações">
              <Textarea
                value={formVenda.observacoes}
                onChange={(e) => atualizarFormVenda('observacoes', e.target.value)}
                placeholder="Observações sobre a venda..."
                rows={2}
              />
            </FormField>
          </FormSection>

          {/* Produtos */}
          <FormSection title="Produtos" icon={<Package className="h-5 w-5" />}>
            <FormGrid cols={3}>
              <FormField label="Produto" required>
                <Select value={produtoSelecionado} onValueChange={setProdutoSelecionado}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {produtos.map((produto) => (
                      <SelectItem key={produto.id} value={produto.id}>
                        {produto.nome} - R$ {produto.preco.toFixed(2)} (Est: {produto.quantidade})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              
              <FormField label="Quantidade" required>
                <Input
                  type="number"
                  min="1"
                  value={quantidadeProduto}
                  onChange={(e) => setQuantidadeProduto(e.target.value)}
                  placeholder="1"
                />
              </FormField>
              
              <div className="flex items-end">
                <Button
                  type="button"
                  onClick={adicionarAoCarrinho}
                  disabled={!produtoSelecionado || !quantidadeProduto}
                  className="w-full"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </FormGrid>

            {/* Carrinho */}
            {carrinhoItens.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-3">Carrinho de Compras</h4>
                <div className="space-y-2">
                  {carrinhoItens.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{item.produto}</p>
                        <p className="text-sm text-gray-600">
                          {item.quantidade}x R$ {item.precoUnitario.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">R$ {item.subtotal.toFixed(2)}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removerDoCarrinho(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total:</span>
                    <span className="text-xl font-bold text-green-600">
                      R$ {totalCarrinho.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </FormSection>
        </div>
      </ModalBase>

      <ModalBase
        open={modalDetalhesVenda}
        onOpenChange={setModalDetalhesVenda}
        title="Detalhes da Venda"
        description="Informações completas da venda"
        showFooter={false}
        icon={<Eye className="h-6 w-6" />}
      >
        {vendaSelecionada && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data</Label>
                <p className="font-medium">{new Date(vendaSelecionada.data).toLocaleString('pt-BR')}</p>
              </div>
              <div>
                <Label>Status</Label>
                <div className="mt-1">
                  {getStatusBadge((vendaSelecionada as any).status || 'concluida')}
                </div>
              </div>
              <div>
                <Label>Produto</Label>
                <p className="font-medium">{vendaSelecionada.nomeProduto}</p>
              </div>
              <div>
                <Label>Quantidade</Label>
                <p className="font-medium">{vendaSelecionada.quantidade}</p>
              </div>
              <div>
                <Label>Cliente</Label>
                <p className="font-medium">{vendaSelecionada.cliente || 'Não informado'}</p>
              </div>
              <div>
                <Label>Total</Label>
                <p className="font-bold text-lg text-bentin-green">
                  R$ {vendaSelecionada.precoTotal.toFixed(2)}
                </p>
              </div>
            </div>
            
            {(vendaSelecionada as any).observacoes && (
              <div>
                <Label>Observações</Label>
                <p className="mt-1 text-sm text-gray-600">
                  {(vendaSelecionada as any).observacoes}
                </p>
              </div>
            )}
          </div>
        )}
      </ModalBase>

      {/* Modal de Seleção de Cliente */}
      <ModalBase
        open={modalSelecionarCliente}
        onOpenChange={setModalSelecionarCliente}
        title="Selecionar Cliente"
        description="Escolha um cliente da lista"
        size="2xl"
        showFooter={false}
        icon={<Search className="h-6 w-6" />}
      >
        <div className="space-y-4">
          {/* Campo de Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome, email ou telefone..."
              value={buscaCliente}
              onChange={(e) => setBuscaCliente(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          {/* Lista de Clientes */}
          <div className="max-h-96 overflow-y-auto space-y-3">
            {clientesFiltrados.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {buscaCliente ? (
                  <>
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">Nenhum cliente encontrado</p>
                    <p className="text-sm">Tente ajustar os termos de busca</p>
                  </>
                ) : (
                  <>
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">Nenhum cliente cadastrado</p>
                    <p className="text-sm">Cadastre o primeiro cliente para começar</p>
                  </>
                )}
              </div>
            ) : (
              clientesFiltrados.map((cliente) => (
                <div
                  key={cliente.id}
                  onClick={() => selecionarCliente(cliente)}
                  className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-bentin-pink hover:bg-pink-50 transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-bentin-pink transition-colors">
                        {cliente.nome}
                      </h3>
                      
                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                        {cliente.telefone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {cliente.telefone}
                          </div>
                        )}
                        {cliente.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {cliente.email}
                          </div>
                        )}
                      </div>

                      {cliente.filhos && cliente.filhos.length > 0 && (
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-1">
                            {cliente.filhos.map((filho) => (
                              <Badge 
                                key={filho.id} 
                                variant="secondary" 
                                className="text-xs bg-blue-100 text-blue-800"
                              >
                                {filho.nome}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <CheckCircle className="h-5 w-5 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => setModalSelecionarCliente(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </ModalBase>

      {/* Modal de Gerenciar Clientes */}
      {modalGerenciarClientes && (
        <GerenciarClientesDefinitivo 
          open={modalGerenciarClientes}
          onCancel={() => setModalGerenciarClientes(false)}
        />
      )}
    </div>
  );
};

export default VendasSemVendedor;