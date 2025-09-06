import React, { useState, useMemo, useCallback } from 'react';
import { useEstoque, type Venda } from '../utils/EstoqueContextSupabase';
import { useClientes, type Cliente } from '../hooks/useClientes';
import GerenciarClientes from './GerenciarClientes';
import DebugSistemaClientes from './DebugSistemaClientes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';

import { FormSection, FormField, FormGrid } from './ui/form-section';
import { ResponsiveTable } from './ui/responsive-table';
import { StatsCard } from './ui/stats-card';
import { EmptyState } from './ui/empty-state';
import { LoadingState } from './ui/loading-state';
import { ModalBase } from './ui/modal-base';
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
  Trash2,
  Filter,
  Settings,
  CheckCircle,
  Phone,
  Mail,
  Edit3
} from 'lucide-react';

interface VendaFormData {
  cliente_id: string;
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

interface FiltrosVenda {
  busca: string;
  vendedor: string;
  periodo: string;
  status: string;
}

const initialVendaForm: VendaFormData = {
  cliente_id: '',
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

const VendasModernasFixed = () => {
  const { 
    produtos, 
    vendedores, 
    vendas, 
    actions: { adicionarVendedor, adicionarVenda }
  } = useEstoque();
  
  const { clientes, criarCliente } = useClientes();
  const { addToast } = useToast();
  
  // Estados de filtros
  const [filtros, setFiltros] = useState<FiltrosVenda>({
    busca: '',
    vendedor: 'todos',
    periodo: '30dias',
    status: 'todos'
  });

  // Estados dos modais
  const [modalNovaVenda, setModalNovaVenda] = useState(false);
  const [modalNovoVendedor, setModalNovoVendedor] = useState(false);
  const [modalDetalhesVenda, setModalDetalhesVenda] = useState(false);
  const [modalGerenciarClientes, setModalGerenciarClientes] = useState(false);
  const [modalDebugClientes, setModalDebugClientes] = useState(false);
  const [modalSelecionarCliente, setModalSelecionarCliente] = useState(false);
  const [vendaSelecionada, setVendaSelecionada] = useState<Venda | null>(null);
  const [clienteVenda, setClienteVenda] = useState<Cliente | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Estados dos formulários
  const [formVenda, setFormVenda] = useState<VendaFormData>(initialVendaForm);
  const [formVendedor, setFormVendedor] = useState<VendedorFormData>(initialVendedorForm);

  // Estados do carrinho
  const [carrinhoItens, setCarrinhoItens] = useState<ItemCarrinho[]>([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState('');
  const [quantidadeProduto, setQuantidadeProduto] = useState('');

  // Estados para seleção de cliente
  const [buscaCliente, setBuscaCliente] = useState('');
  
  // Estado para cadastro rápido de cliente
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
      vendedor: 'todos',
      periodo: '30dias',
      status: 'todos'
    });
  }, []);

  // Atualização de formulários
  const atualizarFormVenda = useCallback((campo: keyof VendaFormData, valor: string) => {
    setFormVenda(prev => ({ ...prev, [campo]: valor }));
  }, []);

  const atualizarFormVendedor = useCallback((campo: keyof VendedorFormData, valor: string) => {
    setFormVendedor(prev => ({ ...prev, [campo]: valor }));
  }, []);

  // Filtrar clientes para busca
  const clientesFiltrados = useMemo(() => {
    if (!buscaCliente.trim()) return clientes.slice(0, 10);
    
    const termoBusca = buscaCliente.toLowerCase();
    return clientes.filter(cliente => 
      cliente.nome.toLowerCase().includes(termoBusca) ||
      cliente.email?.toLowerCase().includes(termoBusca) ||
      cliente.telefone?.includes(buscaCliente)
    );
  }, [clientes, buscaCliente]);

  // Função para selecionar cliente
  const selecionarCliente = useCallback((cliente: Cliente) => {
    setClienteVenda(cliente);
    atualizarFormVenda('cliente_id', cliente.id || '');
    atualizarFormVenda('cliente', cliente.nome);
    setModalSelecionarCliente(false);
    setBuscaCliente('');
  }, [atualizarFormVenda]);

  // Função para limpar cliente
  const limparCliente = useCallback(() => {
    setClienteVenda(null);
    atualizarFormVenda('cliente_id', '');
    atualizarFormVenda('cliente', '');
  }, [atualizarFormVenda]);

  // Filtrar vendas por período
  const vendasPorPeriodo = useMemo(() => {
    const hoje = new Date();
    let dataLimite: Date;

    switch (filtros.periodo) {
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
  }, [vendas, filtros.periodo]);

  // Filtrar vendas
  const vendasFiltradas = useMemo(() => {
    return vendasPorPeriodo.filter(venda => {
      const matchBusca = venda.id.toLowerCase().includes(filtros.busca.toLowerCase()) ||
                         venda.nomeProduto.toLowerCase().includes(filtros.busca.toLowerCase()) ||
                         (venda as any).cliente?.toLowerCase().includes(filtros.busca.toLowerCase());
      const matchVendedor = filtros.vendedor === 'todos' || venda.vendedor === filtros.vendedor;
      const matchStatus = filtros.status === 'todos' || (venda as any).status === filtros.status;
      
      return matchBusca && matchVendedor && matchStatus;
    });
  }, [vendasPorPeriodo, filtros]);

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
    // Validar se cliente está selecionado (obrigatório agora)
    if (!clienteVenda || !clienteVenda.id) {
      addToast({
        type: 'error',
        title: 'Cliente não selecionado',
        description: 'É necessário selecionar um cliente para prosseguir com a venda'
      });
      return;
    }
    
    if (!formVenda.vendedorId || !formVenda.formaPagamento) {
      addToast({
        type: 'error',
        title: 'Dados incompletos',
        description: 'Selecione um vendedor e forma de pagamento'
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
      // Para cada item do carrinho, criar uma venda individual incluindo cliente_id
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
          cliente: clienteVenda.nome, // Nome do cliente selecionado
          cliente_id: clienteVenda.id, // ID do cliente selecionado (obrigatório)
          numero: `V${Date.now()}`,
          status: 'concluida',
          total: item.subtotal - descontoItem
        });
      }

      addToast({
        type: 'success',
        title: 'Venda finalizada',
        description: `Venda registrada com ${clienteVenda.nome} com sucesso! Cliente associado automaticamente.`
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
      const novoCliente = await criarCliente({
        nome: novoClienteRapido.nome.trim(),
        telefone: novoClienteRapido.telefone.trim() || undefined,
        email: novoClienteRapido.email.trim() || undefined,
        ativo: true
      });

      if (novoCliente) {
        setClienteVenda(novoCliente);
        setNovoClienteRapido({ nome: '', telefone: '', email: '' });
        addToast({
          type: 'success',
          title: 'Cliente cadastrado',
          description: `${novoCliente.nome} foi cadastrado e selecionado para a venda.`
        });
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erro ao cadastrar',
        description: 'Não foi possível cadastrar o cliente. Tente novamente.'
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

  // Calcular total do carrinho
  const totalCarrinho = useMemo(() => {
    const subtotal = carrinhoItens.reduce((total, item) => total + item.subtotal, 0);
    const desconto = parseFloat(formVenda.desconto) || 0;
    return Math.max(0, subtotal - desconto);
  }, [carrinhoItens, formVenda.desconto]);

  // Colunas da tabela de vendas
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
      hideOnMobile: true,
      render: (data: string) => new Date(data).toLocaleDateString('pt-BR')
    },
    {
      key: 'nomeProduto',
      label: 'Produto',
      className: 'min-w-[150px]'
    },
    {
      key: 'quantidade',
      label: 'Qtd',
      width: 'w-16',
      className: 'text-center'
    },
    {
      key: 'precoTotal',
      label: 'Total',
      width: 'w-24',
      render: (precoTotal: number) => (
        <span className="font-medium">
          R$ {precoTotal.toFixed(2)}
        </span>
      )
    },
    {
      key: 'vendedor',
      label: 'Vendedor',
      width: 'w-32',
      hideOnMobile: true
    },
    {
      key: 'status',
      label: 'Status',
      width: 'w-24',
      hideOnTablet: true,
      render: (_: any, venda: Venda) => getStatusBadge((venda as any).status || 'concluida')
    },
    {
      key: 'acoes',
      label: 'Ações',
      width: 'w-20',
      className: 'text-right',
      render: (_: any, venda: Venda) => (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
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

  // Estado vazio
  if (vendas.length === 0) {
    return (
      <div className="space-y-6">
        {/* Cards de resumo vazios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
          
          <StatsCard
            title="Vendedores"
            value={vendedores.length}
            description="equipe ativa"
            icon={<UserPlus />}
            color="warning"
          />
        </div>

        {/* Guia de Primeiros Passos */}
        <Card className="bentin-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <ShoppingBag className="h-6 w-6 text-bentin-pink" />
              Primeiros Passos - Sistema de Vendas
            </CardTitle>
            <CardDescription>
              Configure seu sistema antes de registrar a primeira venda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Passo 1: Gerenciar Clientes */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-bentin-pink text-white rounded-full flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <h3 className="font-semibold text-gray-900">Gerenciar Clientes</h3>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">
                  {clientes.length === 0 ? (
                    "Cadastre seus primeiros clientes. Toda venda deve estar associada a um cliente."
                  ) : (
                    `${clientes.length} cliente${clientes.length !== 1 ? 's' : ''} cadastrado${clientes.length !== 1 ? 's' : ''}. Gerencie ou adicione novos clientes.`
                  )}
                </p>
                
                <div className="flex flex-col gap-2">
                  <Button 
                    onClick={() => {
                      console.log('🔘 Botão Gerenciar Clientes clicado!');
                      try {
                        setModalGerenciarClientes(true);
                        console.log('✅ Modal de clientes ativado');
                      } catch (error) {
                        console.error('❌ Erro ao abrir modal de clientes:', error);
                        addToast({
                          type: 'error',
                          title: 'Erro ao abrir modal',
                          description: 'Tente novamente.'
                        });
                      }
                    }}
                    className="w-full bentin-button-primary flex items-center justify-center gap-2"
                  >
                    <Users className="h-4 w-4" />
                    {clientes.length === 0 ? 'Cadastrar Primeiro Cliente' : 'Gerenciar Clientes'}
                  </Button>
                  {clientes.length > 0 && (
                    <Button 
                      onClick={() => {
                        console.log('🔘 Botão Debug clicado!');
                        try {
                          setModalDebugClientes(true);
                          console.log('✅ Modal de debug ativado');
                        } catch (error) {
                          console.error('❌ Erro ao abrir modal de debug:', error);
                          addToast({
                            type: 'error',
                            title: 'Erro ao abrir debug',
                            description: 'Tente novamente.'
                          });
                        }
                      }}
                      variant="outline"
                      className="w-full text-xs border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                    >
                      <Settings className="h-3 w-3 mr-1" />
                      Verificar Sistema
                    </Button>
                  )}
                </div>
              </div>

              {/* Passo 2: Configurar Vendedores */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-bentin-blue text-white rounded-full flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <h3 className="font-semibold text-gray-900">Equipe de Vendas</h3>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">
                  {vendedores.length === 0 ? (
                    "Adicione vendedores à sua equipe para organizar as vendas por responsável."
                  ) : (
                    `${vendedores.length} vendedor${vendedores.length !== 1 ? 'es' : ''} cadastrado${vendedores.length !== 1 ? 's' : ''}. Adicione mais vendedores se necessário.`
                  )}
                </p>
                
                <Button 
                  onClick={() => {
                    console.log('🔘 Botão Novo Vendedor clicado!');
                    try {
                      setModalNovoVendedor(true);
                      console.log('✅ Modal de vendedor ativado');
                    } catch (error) {
                      console.error('❌ Erro ao abrir modal de vendedor:', error);
                      addToast({
                        type: 'error',
                        title: 'Erro ao abrir modal',
                        description: 'Tente novamente.'
                      });
                    }
                  }}
                  variant="outline"
                  className="w-full border-bentin-blue text-bentin-blue hover:bg-bentin-blue hover:text-white"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {vendedores.length === 0 ? 'Adicionar Primeiro Vendedor' : 'Novo Vendedor'}
                </Button>
              </div>

              {/* Passo 3: Nova Venda */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-bentin-green text-white rounded-full flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <h3 className="font-semibold text-gray-900">Registrar Vendas</h3>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">
                  Registre vendas rapidamente. O sistema permite cadastrar novos clientes durante a venda se necessário.
                </p>
                
                <Button 
                  onClick={() => {
                    console.log('🔘 Botão Nova Venda clicado!');
                    try {
                      setModalNovaVenda(true);
                      console.log('✅ Modal de nova venda ativado');
                    } catch (error) {
                      console.error('❌ Erro ao abrir modal de venda:', error);
                      addToast({
                        type: 'error',
                        title: 'Erro ao abrir modal',
                        description: 'Tente novamente.'
                      });
                    }
                  }}
                  className="w-full bg-bentin-green hover:bg-bentin-green/90 text-white"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Nova Venda
                </Button>
              </div>
            </div>

            {/* Ação Principal Simplificada */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-center">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Pronto para Vender!</h3>
                  <p className="text-sm text-gray-600">
                    Sistema configurado. Comece registrando vendas agora mesmo.
                  </p>
                </div>
                
                <Button 
                  onClick={() => {
                    console.log('🔘 Botão Nova Venda Principal clicado!');
                    try {
                      setModalNovaVenda(true);
                      console.log('✅ Modal de nova venda ativado');
                    } catch (error) {
                      console.error('❌ Erro ao abrir modal de venda:', error);
                      addToast({
                        type: 'error',
                        title: 'Erro ao abrir modal',
                        description: 'Tente novamente.'
                      });
                    }
                  }}
                  className="bentin-button-primary text-lg px-8 py-4"
                >
                  <ShoppingCart className="h-5 w-5 mr-3" />
                  Nova Venda
                </Button>
                
                <div className="flex justify-center gap-4 mt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4 text-bentin-pink" />
                    {clientes.length} Cliente{clientes.length !== 1 ? 's' : ''}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <UserPlus className="h-4 w-4 text-bentin-blue" />
                    {vendedores.length} Vendedor{vendedores.length !== 1 ? 'es' : ''}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Vendas Hoje"
          value={estatisticas.vendasHoje}
          description="vendas realizadas"
          icon={<ShoppingCart />}
          color="primary"
        />
        
        <StatsCard
          title="Receita Hoje"
          value={`R$ ${estatisticas.totalVendasHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          description="faturamento do dia"
          icon={<DollarSign />}
          color="success"
        />
        
        <StatsCard
          title={`Vendas - ${getPeriodoLabel(filtros.periodo)}`}
          value={estatisticas.totalVendasPeriodo}
          description="vendas no período"
          icon={<Calendar />}
          color="info"
        />
        
        <StatsCard
          title="Vendedores"
          value={estatisticas.vendedoresAtivos}
          description="equipe ativa"
          icon={<Users />}
          color="warning"
        />
      </div>

      {/* Controles Principais */}
      <Card className="bentin-card">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-3">
                <ShoppingBag className="h-6 w-6 text-bentin-pink" />
                Sistema de Vendas
              </CardTitle>
              <CardDescription className="mt-2">
                Gerencie suas vendas, vendedores e acompanhe o desempenho em tempo real
              </CardDescription>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => setModalDebugClientes(true)}
                variant="outline"
                size="sm"
                className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
              >
                <Settings className="h-4 w-4 mr-2" />
                Debug
              </Button>
              <Button 
                onClick={() => setModalGerenciarClientes(true)}
                variant="outline"
              >
                <Users className="h-4 w-4 mr-2" />
                Clientes
              </Button>
              <Button 
                onClick={() => setModalNovoVendedor(true)}
                variant="outline"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Vendedor
              </Button>
              <Button 
                onClick={() => setModalNovaVenda(true)}
                className="bentin-button-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Venda
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Filtros */}
          <FormSection 
            title="Filtros" 
            description="Filtre as vendas por período, vendedor ou status"
            icon={<Filter className="h-5 w-5" />}
          >
            <FormGrid cols={4}>
              <FormField label="Buscar Venda">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="ID, produto ou cliente..."
                    value={filtros.busca}
                    onChange={(e) => atualizarFiltro('busca', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </FormField>

              <FormField label="Período">
                <Select value={filtros.periodo} onValueChange={(value) => atualizarFiltro('periodo', value)}>
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

              <FormField label="Vendedor">
                <Select value={filtros.vendedor} onValueChange={(value) => atualizarFiltro('vendedor', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os vendedores</SelectItem>
                    {vendedores.map((vendedor) => (
                      <SelectItem key={vendedor} value={vendedor}>
                        {vendedor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Status">
                <Select value={filtros.status} onValueChange={(value) => atualizarFiltro('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os status</SelectItem>
                    <SelectItem value="concluida">Concluídas</SelectItem>
                    <SelectItem value="pendente">Pendentes</SelectItem>
                    <SelectItem value="cancelada">Canceladas</SelectItem>
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

          {/* Tabela de Vendas */}
          <ResponsiveTable
            columns={colunasVendas}
            data={vendasFiltradas}
            emptyMessage="Nenhuma venda encontrada com os filtros aplicados."
          />
        </CardContent>
      </Card>

      {/* Modal de Nova Venda */}
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
          setModalSelecionarCliente(false);
        }}
        onSubmit={finalizarVenda}
        submitText="Finalizar Venda"
        isLoading={isLoading}
        icon={<ShoppingCart className="h-6 w-6" />}
      >
        <div className="space-y-6">
          {/* NOVA SEÇÃO: Fluxo de Associação de Cliente */}
          <FormSection 
            title="Associação de Cliente" 
            description="Selecione um cliente existente ou cadastre um novo cliente para esta venda"
            icon={<Users className="h-5 w-5" />}
          >
            {!clienteVenda ? (
              <div className="space-y-4">
                {/* Botões de Ação Principais */}
                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={() => setModalSelecionarCliente(true)}
                    variant="outline"
                    className="flex-1 border-bentin-blue text-bentin-blue hover:bg-bentin-blue hover:text-white"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Selecionar Cliente
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setModalGerenciarClientes(true)}
                    className="flex-1 bentin-button-primary"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Adicionar Novo Cliente
                  </Button>
                </div>
                
                {/* Informação sobre a necessidade de selecionar cliente */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Cliente necessário</p>
                      <p className="text-xs text-blue-600 mt-1">
                        Selecione um cliente existente na base de dados ou cadastre um novo cliente para prosseguir com a venda.
                      </p>
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

          {/* Dados da Venda */}
          <FormSection title="Dados da Venda" icon={<ShoppingBag className="h-5 w-5" />}>
            <FormGrid cols={2}>
              
              <FormField label="Vendedor" required>
                <Select 
                  value={formVenda.vendedorId} 
                  onValueChange={(value) => atualizarFormVenda('vendedorId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o vendedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendedores.map((vendedor) => (
                      <SelectItem key={vendedor} value={vendedor}>
                        {vendedor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              
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
          </FormSection>

          {/* Adicionar Produtos */}
          <FormSection title="Adicionar Produtos" icon={<Plus className="h-5 w-5" />}>
            <div className="p-4 border rounded-lg bg-gray-50">
              <FormGrid cols={3}>
                <FormField label="Produto">
                  <Select value={produtoSelecionado} onValueChange={setProdutoSelecionado}>
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
                </FormField>
                
                <FormField label="Quantidade">
                  <Input
                    type="number"
                    min="1"
                    value={quantidadeProduto}
                    onChange={(e) => setQuantidadeProduto(e.target.value)}
                    placeholder="1"
                  />
                </FormField>
                
                <div className="flex items-end">
                  <Button onClick={adicionarAoCarrinho} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </FormGrid>
            </div>
          </FormSection>

          {/* Carrinho */}
          {carrinhoItens.length > 0 && (
            <FormSection title="Itens da Venda" icon={<ShoppingCart className="h-5 w-5" />}>
              <div className="space-y-2">
                {carrinhoItens.map((item, index) => (
                  <div key={`${item.produtoId}-${index}`} className="flex items-center justify-between p-3 bg-white rounded border">
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
            </FormSection>
          )}

          {/* Observações */}
          <FormField label="Observações">
            <Textarea
              value={formVenda.observacoes}
              onChange={(e) => atualizarFormVenda('observacoes', e.target.value)}
              placeholder="Observações adicionais sobre a venda..."
              rows={3}
            />
          </FormField>
        </div>
      </ModalBase>

      {/* Modal de Seleção de Cliente */}
      <ModalBase
        open={modalSelecionarCliente}
        onOpenChange={setModalSelecionarCliente}
        title="Selecionar Cliente"
        description="Escolha um cliente existente para associar à venda"
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

      {/* Modal de Novo Vendedor */}
      <ModalBase
        open={modalNovoVendedor}
        onOpenChange={setModalNovoVendedor}
        title="Cadastrar Vendedor"
        description="Adicione um novo vendedor à equipe"
        size="md"
        onCancel={() => {
          setModalNovoVendedor(false);
          setFormVendedor(initialVendedorForm);
        }}
        onSubmit={handleAdicionarVendedor}
        submitText="Cadastrar Vendedor"
        isLoading={isLoading}
        icon={<UserPlus className="h-6 w-6" />}
      >
        <FormGrid cols={1}>
          <FormField label="Nome do Vendedor" required>
            <Input
              value={formVendedor.nome}
              onChange={(e) => atualizarFormVendedor('nome', e.target.value)}
              placeholder="Nome completo"
            />
          </FormField>
          
          <FormField label="Email">
            <Input
              type="email"
              value={formVendedor.email}
              onChange={(e) => atualizarFormVendedor('email', e.target.value)}
              placeholder="email@exemplo.com"
            />
          </FormField>
          
          <FormField label="Telefone">
            <Input
              value={formVendedor.telefone}
              onChange={(e) => atualizarFormVendedor('telefone', e.target.value)}
              placeholder="(11) 99999-9999"
            />
          </FormField>
          
          <FormField label="Comissão (%)">
            <Input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={formVendedor.comissao}
              onChange={(e) => atualizarFormVendedor('comissao', e.target.value)}
              placeholder="5.0"
            />
          </FormField>
        </FormGrid>
      </ModalBase>

      {/* Modal de Detalhes da Venda */}
      <ModalBase
        open={modalDetalhesVenda}
        onOpenChange={setModalDetalhesVenda}
        title="Detalhes da Venda"
        description={vendaSelecionada ? `Venda ${vendaSelecionada.id.slice(-6)}` : ""}
        size="md"
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
                <Label>Vendedor</Label>
                <p className="font-medium">{vendaSelecionada.vendedor}</p>
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

      {/* Modal de Gerenciar Clientes */}
      <ModalBase
        open={modalGerenciarClientes}
        onOpenChange={setModalGerenciarClientes}
        title="Gerenciar Clientes"
        description="Cadastre novos clientes ou gerencie os existentes"
        size="wide"
        showFooter={false}
        icon={<Users className="h-6 w-6" />}
      >
        <GerenciarClientes />
      </ModalBase>

      {/* Modal de Debug do Sistema de Clientes */}
      <ModalBase
        open={modalDebugClientes}
        onOpenChange={setModalDebugClientes}
        title="Debug - Sistema de Clientes"
        description="Diagnóstico e verificação do funcionamento do sistema"
        size="2xl"
        showFooter={false}
        icon={<Settings className="h-6 w-6" />}
      >
        <DebugSistemaClientes />
      </ModalBase>
    </div>
  );
};

export default VendasModernasFixed;