// ====================================================================
// COMPONENTE DE VENDAS REFATORADO - VERSÃO LIMPA E FUNCIONAL
// ====================================================================
// Refatoração completa com foco na funcionalidade e performance
// Estrutura modular e bem organizada
// ====================================================================

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
import { StatsCard } from './ui/stats-card';
import { LoadingState } from './ui/loading-state';
import { ModalBase } from './ui/modal-base';
import { useToast } from './ToastProvider';
import { 
  ShoppingCart, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Package,
  TrendingUp,
  Plus,
  X,
  Trash2,
  CheckCircle,
  Eye,
  Search
} from 'lucide-react';

// ====================================================================
// TIPOS E INTERFACES
// ====================================================================
interface VendaForm {
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

interface MetricasVendas {
  vendasHoje: number;
  receitaHoje: number;
  totalVendas: number;
  receitaTotal: number;
}

// ====================================================================
// CONSTANTES
// ====================================================================
const INITIAL_FORM: VendaForm = {
  formaPagamento: '',
  desconto: '0',
  observacoes: ''
};

const FORMAS_PAGAMENTO = [
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'cartao_debito', label: 'Cartão de Débito' },
  { value: 'cartao_credito', label: 'Cartão de Crédito' },
  { value: 'pix', label: 'PIX' },
  { value: 'transferencia', label: 'Transferência' }
];

// ====================================================================
// COMPONENTE PRINCIPAL
// ====================================================================
const VendasRefatorado = () => {
  // ====================================================================
  // HOOKS E ESTADO
  // ====================================================================
  const { vendas, produtos, adicionarVenda, loading } = useEstoque();
  const { clientes } = useClientes();
  const { addToast } = useToast();

  // Estados dos modais
  const [modalNovaVenda, setModalNovaVenda] = useState(false);
  const [modalGerenciarClientes, setModalGerenciarClientes] = useState(false);
  const [modalDetalhesVenda, setModalDetalhesVenda] = useState(false);
  const [vendaSelecionada, setVendaSelecionada] = useState<Venda | null>(null);
  
  // Estados do formulário
  const [form, setForm] = useState<VendaForm>(INITIAL_FORM);
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [clienteVenda, setClienteVenda] = useState<Cliente | null>(null);
  const [produtoSelecionado, setProdutoSelecionado] = useState('');
  const [quantidade, setQuantidade] = useState('1');
  const [buscaCliente, setBuscaCliente] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ====================================================================
  // CÁLCULOS E MÉTRICAS
  // ====================================================================
  const metricas = useMemo((): MetricasVendas => {
    const hoje = new Date();
    const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const vendasHoje = vendas.filter(v => new Date(v.data) >= inicioHoje);

    return {
      vendasHoje: vendasHoje.length,
      receitaHoje: vendasHoje.reduce((total, v) => total + v.precoTotal, 0),
      totalVendas: vendas.length,
      receitaTotal: vendas.reduce((total, v) => total + v.precoTotal, 0)
    };
  }, [vendas]);

  const totalCarrinho = useMemo(() => {
    return carrinho.reduce((total, item) => total + item.subtotal, 0);
  }, [carrinho]);

  const clientesFiltrados = useMemo(() => {
    if (!buscaCliente.trim()) return clientes;
    
    const termo = buscaCliente.toLowerCase();
    return clientes.filter(cliente =>
      cliente.nome.toLowerCase().includes(termo) ||
      cliente.telefone?.includes(buscaCliente) ||
      cliente.email?.toLowerCase().includes(termo)
    );
  }, [clientes, buscaCliente]);

  // ====================================================================
  // FUNÇÕES DE MANIPULAÇÃO
  // ====================================================================
  const atualizarForm = useCallback((campo: keyof VendaForm, valor: string) => {
    setForm(prev => ({ ...prev, [campo]: valor }));
  }, []);

  const adicionarAoCarrinho = useCallback(() => {
    if (!produtoSelecionado || parseInt(quantidade) <= 0) {
      addToast({
        type: 'error',
        title: 'Erro',
        description: 'Selecione um produto e quantidade válida.'
      });
      return;
    }

    const produto = produtos.find(p => p.id === produtoSelecionado);
    if (!produto) return;

    const qtd = parseInt(quantidade);
    if (qtd > produto.quantidade) {
      addToast({
        type: 'error',
        title: 'Estoque insuficiente',
        description: `Disponível: ${produto.quantidade} unidades.`
      });
      return;
    }

    const itemExistente = carrinho.find(item => item.produtoId === produtoSelecionado);
    
    if (itemExistente) {
      setCarrinho(prev => prev.map(item => 
        item.produtoId === produtoSelecionado
          ? { ...item, quantidade: item.quantidade + qtd, subtotal: (item.quantidade + qtd) * produto.preco }
          : item
      ));
    } else {
      const novoItem: ItemCarrinho = {
        produtoId: produto.id,
        produto: produto.nome,
        quantidade: qtd,
        precoUnitario: produto.preco,
        subtotal: produto.preco * qtd
      };
      setCarrinho(prev => [...prev, novoItem]);
    }

    setProdutoSelecionado('');
    setQuantidade('1');
    
    addToast({
      type: 'success',
      title: 'Produto adicionado',
      description: `${produto.nome} foi adicionado ao carrinho.`
    });
  }, [produtoSelecionado, quantidade, produtos, carrinho, addToast]);

  const removerDoCarrinho = useCallback((produtoId: string) => {
    setCarrinho(prev => prev.filter(item => item.produtoId !== produtoId));
  }, []);

  const finalizarVenda = useCallback(async () => {
    if (carrinho.length === 0) {
      addToast({
        type: 'error',
        title: 'Carrinho vazio',
        description: 'Adicione produtos ao carrinho.'
      });
      return;
    }

    if (!form.formaPagamento) {
      addToast({
        type: 'error',
        title: 'Forma de pagamento obrigatória',
        description: 'Selecione a forma de pagamento.'
      });
      return;
    }

    setIsLoading(true);

    try {
      const desconto = parseFloat(form.desconto) || 0;

      for (const item of carrinho) {
        const produto = produtos.find(p => p.id === item.produtoId);
        if (produto) {
          await adicionarVenda({
            produto,
            quantidade: item.quantidade,
            precoUnitario: item.precoUnitario,
            precoTotal: item.subtotal - (desconto / carrinho.length),
            cliente: clienteVenda?.nome || '',
            data: new Date(),
            formaPagamento: form.formaPagamento,
            observacoes: form.observacoes
          });
        }
      }

      addToast({
        type: 'success',
        title: '✅ Venda finalizada',
        description: `Venda de R$ ${totalCarrinho.toFixed(2)} realizada com sucesso!`
      });

      // Reset
      setModalNovaVenda(false);
      setForm(INITIAL_FORM);
      setCarrinho([]);
      setClienteVenda(null);
      
    } catch (error) {
      console.error('Erro ao finalizar venda:', error);
      addToast({
        type: 'error',
        title: 'Erro ao finalizar venda',
        description: 'Tente novamente.'
      });
    } finally {
      setIsLoading(false);
    }
  }, [carrinho, form, clienteVenda, produtos, totalCarrinho, adicionarVenda, addToast]);

  const resetarFormulario = useCallback(() => {
    setForm(INITIAL_FORM);
    setCarrinho([]);
    setClienteVenda(null);
    setProdutoSelecionado('');
    setQuantidade('1');
    setBuscaCliente('');
  }, []);

  // ====================================================================
  // RENDER CONDITIONS
  // ====================================================================
  if (loading) {
    return <LoadingState message="Carregando sistema de vendas..." />;
  }

  // ====================================================================
  // RENDER PRINCIPAL
  // ====================================================================
  return (
    <div className="space-y-8">
      
      {/* CARDS DE MÉTRICAS */}
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
          value={`R$ ${metricas.receitaHoje.toFixed(2)}`}
          description="faturamento do dia"
          icon={<DollarSign />}
          color="success"
        />
        
        <StatsCard
          title="Total de Vendas"
          value={metricas.totalVendas}
          description="vendas registradas"
          icon={<TrendingUp />}
          color="info"
        />
        
        <StatsCard
          title="Receita Total"
          value={`R$ ${metricas.receitaTotal.toFixed(2)}`}
          description="faturamento geral"
          icon={<DollarSign />}
          color="warning"
        />
      </div>

      {/* BOTÕES DE AÇÃO PRINCIPAIS */}
      <Card className="bentin-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <ShoppingCart className="h-6 w-6 text-bentin-pink" />
            Sistema de Vendas
          </CardTitle>
          <CardDescription>
            Registre vendas e gerencie clientes de forma simples e eficiente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              onClick={() => {
                console.log('🔥 Nova Venda - Botão clicado!');
                resetarFormulario();
                setModalNovaVenda(true);
                addToast({
                  type: 'success',
                  title: '🚀 Nova Venda',
                  description: 'Sistema de vendas aberto!'
                });
              }}
              className="bentin-button-primary text-lg px-8 py-4 h-auto min-w-[250px]"
              disabled={isLoading}
            >
              <ShoppingCart className="h-6 w-6 mr-3" />
              <div className="text-left">
                <div className="font-bold">Nova Venda</div>
                <div className="text-sm opacity-90">Registrar nova venda</div>
              </div>
            </Button>
            
            <Button 
              onClick={() => {
                console.log('🔥 Gerenciar Clientes - Botão clicado!');
                setModalGerenciarClientes(true);
                addToast({
                  type: 'info',
                  title: '👥 Clientes',
                  description: 'Sistema de clientes aberto!'
                });
              }}
              variant="outline"
              className="border-2 border-bentin-blue text-bentin-blue hover:bg-bentin-blue hover:text-white text-lg px-8 py-4 h-auto min-w-[250px]"
              disabled={isLoading}
            >
              <Users className="h-6 w-6 mr-3" />
              <div className="text-left">
                <div className="font-bold">Gerenciar Clientes</div>
                <div className="text-sm opacity-75">Cadastros e edição</div>
              </div>
            </Button>
          </div>

          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-6 text-sm text-gray-600 bg-gray-50 px-6 py-3 rounded-xl">
              <span className="flex items-center gap-2">
                <Users className="h-5 w-5 text-bentin-pink" />
                <span className="font-semibold">{clientes.length}</span> 
                <span>cliente{clientes.length !== 1 ? 's' : ''}</span>
              </span>
              <span className="w-px h-5 bg-gray-300"></span>
              <span className="flex items-center gap-2">
                <Package className="h-5 w-5 text-bentin-green" />
                <span className="font-semibold">{produtos.length}</span> 
                <span>produto{produtos.length !== 1 ? 's' : ''}</span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* HISTÓRICO DE VENDAS */}
      {vendas.length > 0 && (
        <Card className="bentin-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <ShoppingBag className="h-6 w-6 text-bentin-green" />
              Últimas Vendas
            </CardTitle>
            <CardDescription>
              {vendas.length} venda{vendas.length !== 1 ? 's' : ''} registrada{vendas.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {vendas.slice(-10).reverse().map((venda, index) => (
                <div 
                  key={`${venda.id}-${index}`}
                  className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                  onClick={() => {
                    setVendaSelecionada(venda);
                    setModalDetalhesVenda(true);
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-bentin-green/20">
                      <ShoppingBag className="h-4 w-4 text-bentin-green" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{venda.nomeProduto}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(venda.data).toLocaleDateString('pt-BR')} • {venda.cliente || 'Cliente não informado'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-bold text-bentin-green">R$ {venda.precoTotal.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">{venda.quantidade}x</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* MODAL NOVA VENDA */}
      <ModalBase
        open={modalNovaVenda}
        onOpenChange={(open) => {
          console.log('Modal nova venda estado:', open);
          if (!open) resetarFormulario();
          setModalNovaVenda(open);
        }}
        title="🛒 Nova Venda"
        description="Registre uma nova venda no sistema"
        size="3xl"
        onCancel={() => {
          resetarFormulario();
          setModalNovaVenda(false);
        }}
        onSubmit={finalizarVenda}
        submitText="Finalizar Venda"
        isLoading={isLoading}
        icon={<ShoppingCart className="h-6 w-6" />}
      >
        <div className="space-y-6">
          
          {/* CLIENTE */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!clienteVenda ? (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar cliente por nome, telefone ou email..."
                      value={buscaCliente}
                      onChange={(e) => setBuscaCliente(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  {buscaCliente && (
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {clientesFiltrados.slice(0, 5).map((cliente) => (
                        <div
                          key={cliente.id}
                          onClick={() => {
                            setClienteVenda(cliente);
                            setBuscaCliente('');
                            addToast({
                              type: 'success',
                              title: 'Cliente selecionado',
                              description: cliente.nome
                            });
                          }}
                          className="p-3 bg-white border rounded-lg hover:border-bentin-blue cursor-pointer transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{cliente.nome}</p>
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
                  
                  <p className="text-sm text-gray-500 text-center">
                    Ou prossiga sem cliente específico
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-green-200">
                      <Users className="h-4 w-4 text-green-700" />
                    </div>
                    <div>
                      <p className="font-medium text-green-900">{clienteVenda.nome}</p>
                      <p className="text-sm text-green-700">
                        {clienteVenda.telefone || clienteVenda.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setClienteVenda(null);
                      setBuscaCliente('');
                    }}
                    className="text-green-700 hover:bg-green-200"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* PRODUTOS */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                Produtos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="md:col-span-1">
                  <Label>Produto</Label>
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
                </div>
                
                <div>
                  <Label>Quantidade</Label>
                  <Input
                    type="number"
                    min="1"
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                    placeholder="1"
                  />
                </div>
                
                <div className="flex items-end">
                  <Button
                    type="button"
                    onClick={adicionarAoCarrinho}
                    className="bentin-button-secondary w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </div>

              {/* CARRINHO */}
              {carrinho.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Carrinho de Compras</h4>
                  {carrinho.map((item) => (
                    <div key={item.produtoId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{item.produto}</p>
                        <p className="text-sm text-gray-600">
                          {item.quantidade}x R$ {item.precoUnitario.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-green-600">
                          R$ {item.subtotal.toFixed(2)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removerDoCarrinho(item.produtoId)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold">Total:</span>
                      <span className="text-2xl font-bold text-green-600">
                        R$ {totalCarrinho.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* PAGAMENTO */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Forma de Pagamento *</Label>
                  <Select value={form.formaPagamento} onValueChange={(value) => atualizarForm('formaPagamento', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a forma" />
                    </SelectTrigger>
                    <SelectContent>
                      {FORMAS_PAGAMENTO.map((forma) => (
                        <SelectItem key={forma.value} value={forma.value}>
                          {forma.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Desconto (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.desconto}
                    onChange={(e) => atualizarForm('desconto', e.target.value)}
                    placeholder="0,00"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <Label>Observações</Label>
                <Textarea
                  value={form.observacoes}
                  onChange={(e) => atualizarForm('observacoes', e.target.value)}
                  placeholder="Observações sobre a venda..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </ModalBase>

      {/* MODAL DETALHES VENDA */}
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
                <Label>Produto</Label>
                <p className="font-medium">{vendaSelecionada.nomeProduto}</p>
              </div>
              <div>
                <Label>Cliente</Label>
                <p className="font-medium">{vendaSelecionada.cliente || 'Não informado'}</p>
              </div>
              <div>
                <Label>Quantidade</Label>
                <p className="font-medium">{vendaSelecionada.quantidade}</p>
              </div>
              <div>
                <Label>Valor Unitário</Label>
                <p className="font-medium">R$ {vendaSelecionada.precoUnitario.toFixed(2)}</p>
              </div>
              <div>
                <Label>Total</Label>
                <p className="font-bold text-lg text-green-600">
                  R$ {vendaSelecionada.precoTotal.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}
      </ModalBase>

      {/* MODAL GERENCIAR CLIENTES */}
      <GerenciarClientesDefinitivo 
        open={modalGerenciarClientes}
        onCancel={() => setModalGerenciarClientes(false)}
      />
    </div>
  );
};

export default VendasRefatorado;