// =====================================================
// COMPONENTE DE VENDAS SIMPLIFICADO - VERSÃO LIMPA
// =====================================================
// Nova lógica simplificada: sempre "Nova Venda"
// Campo busca + cadastro rápido inline
// =====================================================

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
  Edit3,
  Package,
  TrendingUp
} from 'lucide-react';

// Tipos para o formulário
interface VendaFormData {
  vendedorId: string;
  formaPagamento: string;
  desconto: string;
  observacoes: string;
}

interface VendedorFormData {
  nome: string;
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
  vendedor: string;
  periodo: string;
  status: string;
}

const initialVendaForm: VendaFormData = {
  vendedorId: '',
  formaPagamento: '',
  desconto: '0',
  observacoes: ''
};

const initialVendedorForm: VendedorFormData = {
  nome: ''
};

const VendasSimplificadasLimpo = () => {
  const {
    vendas,
    produtos,
    vendedores,
    adicionarVenda,
    adicionarVendedor,
    loading
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
      vendedor: 'todos',
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

  // Filtrar vendas
  const vendasFiltradas = useMemo(() => {
    return vendasPorPeriodo.filter(venda => {
      const matchBusca = !filtros.busca || 
        venda.nomeProduto.toLowerCase().includes(filtros.busca.toLowerCase()) ||
        venda.vendedor.toLowerCase().includes(filtros.busca.toLowerCase());
      
      const matchVendedor = filtros.vendedor === 'todos' || venda.vendedor === filtros.vendedor;
      const matchStatus = filtros.status === 'todos' || (venda as any).status === filtros.status;

      return matchBusca && matchVendedor && matchStatus;
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
      receitaPeriodo,
      vendedoresAtivos: vendedores.length
    };
  }, [vendas, vendasPorPeriodo, vendedores]);

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

  const atualizarFormVenda = useCallback((campo: keyof VendaFormData, valor: string) => {
    setFormVenda(prev => ({ ...prev, [campo]: valor }));
  }, []);

  // Calcular total do carrinho
  const totalCarrinho = useMemo(() => {
    const subtotal = carrinhoItens.reduce((total, item) => total + item.subtotal, 0);
    const desconto = parseFloat(formVenda.desconto) || 0;
    return Math.max(0, subtotal - desconto);
  }, [carrinhoItens, formVenda.desconto]);

  if (loading) {
    return <LoadingState message="Carregando vendas..." />;
  }

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
                  <UserPlus className="h-4 w-4 text-bentin-blue" />
                  {vendedores.length} Vendedor{vendedores.length !== 1 ? 'es' : ''}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <ShoppingBag className="h-4 w-4 text-bentin-green" />
                  {produtos.length} Produto{produtos.length !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Ações secundárias */}
              <div className="flex justify-center gap-3 mt-6">
                <Button 
                  onClick={() => setModalGerenciarClientes(true)}
                  variant="outline"
                  className="border-bentin-pink text-bentin-pink hover:bg-bentin-pink hover:text-white"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Gerenciar Clientes
                </Button>
                <Button 
                  onClick={() => setModalNovoVendedor(true)}
                  variant="outline"
                  className="border-bentin-blue text-bentin-blue hover:bg-bentin-blue hover:text-white"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Adicionar Vendedor
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modais simplificados para estado vazio */}
        <ModalBase
          open={modalNovaVenda}
          onOpenChange={setModalNovaVenda}
          title="Nova Venda"
          description="Sistema simplificado de vendas"
          showFooter={false}
        >
          <div className="text-center py-8">
            <p className="text-gray-600">
              Interface de venda será exibida aqui quando os dados estiverem carregados.
            </p>
          </div>
        </ModalBase>

        <ModalBase
          open={modalGerenciarClientes}
          onOpenChange={setModalGerenciarClientes}
          title="Gerenciar Clientes"
          description="Cadastre novos clientes"
          size="wide"
          showFooter={false}
        >
          <GerenciarClientes />
        </ModalBase>

        <ModalBase
          open={modalNovoVendedor}
          onOpenChange={setModalNovoVendedor}
          title="Cadastrar Vendedor"
          description="Adicione um novo vendedor"
          onCancel={() => setModalNovoVendedor(false)}
          onSubmit={() => {}}
          submitText="Cadastrar"
        >
          <div className="space-y-4">
            <Label>Nome do Vendedor</Label>
            <Input placeholder="Digite o nome completo" />
          </div>
        </ModalBase>
      </div>
    );
  }

  // Estado normal com vendas (implementação básica)
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Sistema de Vendas</h2>
      <p>Interface completa será implementada aqui.</p>
      
      <Button 
        onClick={() => setModalNovaVenda(true)}
        className="bentin-button-primary"
      >
        <Plus className="h-4 w-4 mr-2" />
        Nova Venda
      </Button>
    </div>
  );
};

export default VendasSimplificadasLimpo;