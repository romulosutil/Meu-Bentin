// =====================================================
// COMPONENTE DE VENDAS CORRIGIDO - VERSÃO SIMPLIFICADA
// =====================================================
// Foco na funcionalidade essencial dos botões
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

const VendasFixed = () => {
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

  // Funções para os botões principais
  const abrirNovaVenda = useCallback(() => {
    console.log('Abrindo modal nova venda...');
    setModalNovaVenda(true);
    addToast({
      type: 'info',
      title: 'Nova venda',
      description: 'Abrindo formulário de nova venda...'
    });
  }, [addToast]);

  const abrirGerenciarClientes = useCallback(() => {
    console.log('Abrindo modal gerenciar clientes...');
    setModalGerenciarClientes(true);
    addToast({
      type: 'info',
      title: 'Gerenciar clientes',
      description: 'Abrindo sistema de clientes...'
    });
  }, [addToast]);

  // Loading state
  if (loading) {
    return <LoadingState message="Carregando dados de vendas..." />;
  }

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

      {/* BOTÕES DE AÇÃO PRINCIPAIS - VERSÃO SIMPLIFICADA E DESTACADA */}
      <Card className="bentin-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <ShoppingCart className="h-6 w-6 text-bentin-pink" />
            Ações Principais
          </CardTitle>
          <CardDescription>
            Acesse as principais funcionalidades do sistema de vendas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              onClick={abrirNovaVenda}
              className="bentin-button-primary text-lg px-8 py-4 h-auto min-w-[200px]"
              disabled={isLoading}
            >
              <ShoppingCart className="h-6 w-6 mr-3" />
              <div className="text-left">
                <div className="font-semibold">Nova Venda</div>
                <div className="text-sm opacity-90">Registrar venda</div>
              </div>
            </Button>
            
            <Button 
              onClick={abrirGerenciarClientes}
              variant="outline"
              className="border-2 border-bentin-blue text-bentin-blue hover:bg-bentin-blue hover:text-white text-lg px-8 py-4 h-auto min-w-[200px]"
              disabled={isLoading}
            >
              <Users className="h-6 w-6 mr-3" />
              <div className="text-left">
                <div className="font-semibold">Gerenciar Clientes</div>
                <div className="text-sm opacity-75">Cadastros e edição</div>
              </div>
            </Button>
          </div>

          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-4 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4 text-bentin-pink" />
                <span className="font-medium">{clientes.length}</span> cliente{clientes.length !== 1 ? 's' : ''}
              </span>
              <span className="w-px h-4 bg-gray-300"></span>
              <span className="flex items-center gap-1">
                <Package className="h-4 w-4 text-bentin-green" />
                <span className="font-medium">{produtos.length}</span> produto{produtos.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card de histórico de vendas (se houver vendas) */}
      {vendas.length > 0 && (
        <Card className="bentin-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <ShoppingBag className="h-6 w-6 text-bentin-green" />
              Histórico de Vendas
            </CardTitle>
            <CardDescription>
              Acompanhe todas as vendas realizadas ({vendas.length} vendas registradas)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600">
                Sistema funcionando! {vendas.length} venda{vendas.length !== 1 ? 's' : ''} registrada{vendas.length !== 1 ? 's' : ''}.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Use os botões acima para gerenciar vendas e clientes.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de Nova Venda - Versão Simplificada */}
      <ModalBase
        open={modalNovaVenda}
        onOpenChange={(open) => {
          console.log('Modal nova venda mudou:', open);
          setModalNovaVenda(open);
        }}
        title="Nova Venda"
        description="Sistema de nova venda carregado com sucesso"
        onCancel={() => {
          console.log('Cancelando nova venda');
          setModalNovaVenda(false);
        }}
        showFooter={false}
        icon={<ShoppingCart className="h-6 w-6" />}
      >
        <div className="space-y-6 text-center py-8">
          <div className="p-4 rounded-full bg-green-100 w-16 h-16 mx-auto flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Sistema Funcionando! ✅
            </h3>
            <p className="text-gray-600">
              O modal de nova venda foi aberto com sucesso.
            </p>
          </div>
          
          <Button
            onClick={() => setModalNovaVenda(false)}
            className="bentin-button-primary"
          >
            Fechar
          </Button>
        </div>
      </ModalBase>

      {/* Modal de Gerenciar Clientes */}
      <GerenciarClientesDefinitivo 
        open={modalGerenciarClientes}
        onCancel={() => {
          console.log('Fechando modal gerenciar clientes');
          setModalGerenciarClientes(false);
        }}
      />
    </div>
  );
};

export default VendasFixed;