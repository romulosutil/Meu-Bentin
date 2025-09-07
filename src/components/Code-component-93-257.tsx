// =====================================================
// COMPONENTE DE VENDAS SEM VENDEDOR - VERSÃO CORRIGIDA
// =====================================================
// Sistema simplificado de vendas diretas
// Sem conceito de vendedor - foco apenas em clientes e produtos
// =====================================================

import React, { useState, useMemo, useCallback } from 'react';
import { useEstoque, type Venda } from '../utils/EstoqueContextSemVendedor';
import { useClientes, type Cliente } from '../hooks/useClientes';
import GerenciarClientesDefinitivo from './GerenciarClientesDefinitivo';
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

const VendasSemVendedorFixed = () => {
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

  // Funções para clientes (definidas cedo para evitar problemas de hoisting)
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
    setBuscaCliente('');
  }, []);

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

  // Filtrar clientes
  const clientesFiltrados = useMemo(() => {
    if (!buscaCliente.trim()) return [];
    
    return clientes.filter(cliente =>
      cliente.nome.toLowerCase().includes(buscaCliente.toLowerCase()) ||
      cliente.telefone?.includes(buscaCliente) ||
      cliente.email?.toLowerCase().includes(buscaCliente.toLowerCase())
    );
  }, [clientes, buscaCliente]);

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

  // Funções de formulário
  const atualizarFormVenda = useCallback((campo: keyof VendaFormData, valor: string) => {
    setFormVenda(prev => ({ ...prev, [campo]: valor }));
  }, []);

  // Funções do carrinho
  const adicionarProdutoAoCarrinho = useCallback(() => {
    if (!produtoSelecionado || !quantidadeProduto) {
      addToast({
        type: 'error',
        title: 'Erro',
        description: 'Selecione um produto e informe a quantidade.'
      });
      return;
    }

    const produto = produtos.find(p => p.id === produtoSelecionado);
    if (!produto) return;

    const quantidade = parseInt(quantidadeProduto);
    if (quantidade <= 0 || quantidade > produto.quantidade) {
      addToast({
        type: 'error',
        title: 'Quantidade inválida',
        description: `Quantidade deve ser entre 1 e ${produto.quantidade}.`
      });
      return;
    }

    const itemExistente = carrinhoItens.find(item => item.produtoId === produtoSelecionado);
    
    if (itemExistente) {
      setCarrinhoItens(prev => prev.map(item => 
        item.produtoId === produtoSelecionado
          ? { ...item, quantidade: item.quantidade + quantidade, subtotal: (item.quantidade + quantidade) * produto.preco }
          : item
      ));
    } else {
      const novoItem: ItemCarrinho = {
        produtoId: produto.id,
        produto: produto.nome,
        quantidade,
        precoUnitario: produto.preco,
        subtotal: produto.preco * quantidade
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

  const removerProdutoDoCarrinho = useCallback((produtoId: string) => {
    setCarrinhoItens(prev => prev.filter(item => item.produtoId !== produtoId));
  }, []);

  const totalCarrinho = useMemo(() => {
    return carrinhoItens.reduce((total, item) => total + item.subtotal, 0);
  }, [carrinhoItens]);

  // Finalizar venda
  const finalizarVenda = useCallback(async () => {
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
        title: 'Forma de pagamento obrigatória',
        description: 'Selecione a forma de pagamento.'
      });
      return;
    }

    setIsLoading(true);

    try {
      for (const item of carrinhoItens) {
        const produto = produtos.find(p => p.id === item.produtoId);
        if (produto) {
          const vendaData = {
            produto: produto,
            quantidade: item.quantidade,
            precoUnitario: item.precoUnitario,
            precoTotal: item.subtotal - (formVenda.desconto ? parseFloat(formVenda.desconto) : 0),
            cliente: clienteVenda?.nome || '',
            data: new Date(),
            formaPagamento: formVenda.formaPagamento,
            observacoes: formVenda.observacoes
          };

          await adicionarVenda(vendaData);
        }
      }

      addToast({
        type: 'success',
        title: '✅ Venda finalizada',
        description: `Venda de R$ ${totalCarrinho.toFixed(2)} realizada com sucesso!`
      });

      // Resetar formulário
      setModalNovaVenda(false);
      setFormVenda(initialVendaForm);
      setCarrinhoItens([]);
      setClienteVenda(null);
      
    } catch (error) {
      console.error('Erro ao finalizar venda:', error);
      addToast({
        type: 'error',
        title: 'Erro ao finalizar venda',
        description: 'Tente novamente ou contate o suporte.'
      });
    } finally {
      setIsLoading(false);
    }
  }, [carrinhoItens, formVenda, clienteVenda, produtos, totalCarrinho, adicionarVenda, addToast]);

  // Badge de status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'concluida':
        return <Badge className="bg-green-100 text-green-800">Concluída</Badge>;
      case 'pendente':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'cancelada':
        return <Badge className="bg-red-100 text-red-800">Cancelada</Badge>;
      default:
        return <Badge className="bg-green-100 text-green-800">Concluída</Badge>;
    }
  };

  // Colunas da tabela
  const colunasVendas = [
    { key: 'data', label: 'Data', mobile: true },
    { key: 'produto', label: 'Produto', mobile: true },
    { key: 'cliente', label: 'Cliente', mobile: false },
    { key: 'quantidade', label: 'Qtd', mobile: false },
    { key: 'valor', label: 'Valor', mobile: true },
    { key: 'acoes', label: '', mobile: true }
  ];

  // Loading state
  if (loading) {
    return <LoadingState message="Carregando dados de vendas..." />;
  }

  // Estado sem vendas (primeira utilização)
  if (vendas.length === 0) {
    return (
      <div className="space-y-8">
        
        {/* Cards de métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Vendas Hoje"
            value={metricas.vendasHoje}
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
            title="Clientes"
            value={clientes.length}
            description="clientes cadastrados"
            icon={<Users />}
            color="info"
          />
          
          <StatsCard
            title="Produtos"
            value={produtos.length}
            description="itens em estoque"
            icon={<Package />}
            color="warning"
          />
        </div>

        {/* Card de boas-vindas/primeira venda */}
        <Card className="bentin-card text-center">
          <CardContent className="py-16 px-8">
            <div className="max-w-md mx-auto space-y-6">
              <div className="p-4 rounded-full bg-gradient-to-br from-bentin-green/10 to-bentin-green/20 w-20 h-20 mx-auto flex items-center justify-center">
                <ShoppingCart className="h-8 w-8 text-bentin-green" />
              </div>
              
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-gray-900">
                  Bem-vindo ao Sistema de Vendas! 🎉
                </h3>
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
      </div>
    );
  }

  // Estado com vendas
  return (
    <div className="space-y-8">
      
      {/* Cards de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Vendas Hoje"
          value={metricas.vendasHoje}
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
          title={`Vendas (${filtros.periodo})`}
          value={metricas.totalVendasPeriodo}
          description="vendas no período"
          icon={<TrendingUp />}
          color="info"
        />
        
        <StatsCard
          title="Receita do Período"
          value={`R$ ${metricas.receitaPeriodo.toFixed(2)}`}
          description="faturamento total"
          icon={<DollarSign />}
          color="warning"
        />
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

                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <span className="text-sm text-gray-500">ou</span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                {/* Cadastro rápido de cliente */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <UserPlus className="h-4 w-4 text-bentin-green" />
                    <Label className="font-medium text-gray-700">Cadastro Rápido</Label>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <Input
                      placeholder="Nome do cliente"
                      value={novoClienteRapido.nome}
                      onChange={(e) => setNovoClienteRapido(prev => ({ ...prev, nome: e.target.value }))}
                    />
                    <Input
                      placeholder="Telefone"
                      value={novoClienteRapido.telefone}
                      onChange={(e) => setNovoClienteRapido(prev => ({ ...prev, telefone: e.target.value }))}
                    />
                    <Input
                      type="email"
                      placeholder="Email (opcional)"
                      value={novoClienteRapido.email}
                      onChange={(e) => setNovoClienteRapido(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={async () => {
                        if (!novoClienteRapido.nome.trim()) {
                          addToast({
                            type: 'error',
                            title: 'Nome obrigatório',
                            description: 'Digite o nome do cliente.'
                          });
                          return;
                        }

                        try {
                          const novoCliente = await criarCliente({
                            nome: novoClienteRapido.nome,
                            telefone: novoClienteRapido.telefone || undefined,
                            email: novoClienteRapido.email || undefined,
                            ativo: true
                          });

                          if (novoCliente) {
                            setClienteVenda(novoCliente);
                            setNovoClienteRapido({ nome: '', telefone: '', email: '' });
                            addToast({
                              type: 'success',
                              title: 'Cliente criado',
                              description: `${novoCliente.nome} foi cadastrado e selecionado.`
                            });
                          }
                        } catch (error) {
                          addToast({
                            type: 'error',
                            title: 'Erro ao criar cliente',
                            description: 'Tente novamente ou contate o suporte.'
                          });
                        }
                      }}
                      className="bentin-button-secondary"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Cadastrar e Selecionar
                    </Button>
                    
                    <Button
                      type="button"
                      onClick={() => setModalGerenciarClientes(true)}
                      variant="outline"
                      className="border-bentin-orange text-bentin-orange hover:bg-bentin-orange hover:text-white"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Gerenciar Clientes
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-green-100">
                      <Users className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-800">{clienteVenda.nome}</h4>
                      <p className="text-sm text-green-700">
                        {clienteVenda.telefone || clienteVenda.email || 'Cliente selecionado'}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={limparCliente}
                    size="sm"
                    variant="ghost"
                    className="text-green-600 hover:bg-green-100"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </FormSection>

          {/* Configurações da Venda */}
          <FormSection title="Configurações da Venda" icon={<DollarSign className="h-5 w-5" />}>
            <FormGrid cols={2}>
              <FormField label="Forma de Pagamento" required>
                <Select value={formVenda.formaPagamento} onValueChange={(value) => atualizarFormVenda('formaPagamento', value)}>
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
                  onClick={adicionarProdutoAoCarrinho}
                  className="bentin-button-secondary w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </FormGrid>

            {/* Carrinho */}
            {carrinhoItens.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">Carrinho</h4>
                <div className="space-y-2">
                  {carrinhoItens.map((item) => (
                    <div key={item.produtoId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.produto}</p>
                        <p className="text-sm text-gray-600">
                          {item.quantidade}x R$ {item.precoUnitario.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-900">
                          R$ {item.subtotal.toFixed(2)}
                        </span>
                        <Button
                          type="button"
                          onClick={() => removerProdutoDoCarrinho(item.produtoId)}
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:bg-red-50"
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
                    <p className="font-medium">Digite para buscar clientes</p>
                    <p className="text-sm">Nome, telefone ou email</p>
                  </>
                )}
              </div>
            ) : (
              clientesFiltrados.map((cliente) => (
                <div
                  key={cliente.id}
                  onClick={() => selecionarCliente(cliente)}
                  className="p-4 bg-white border border-gray-200 rounded-lg hover:border-bentin-blue hover:bg-blue-50 cursor-pointer transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-bentin-blue/10 group-hover:bg-bentin-blue/20">
                        <Users className="h-4 w-4 text-bentin-blue" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{cliente.nome}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          {cliente.telefone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {cliente.telefone}
                            </span>
                          )}
                          {cliente.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {cliente.email}
                            </span>
                          )}
                        </div>
                      </div>
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

export default VendasSemVendedorFixed;