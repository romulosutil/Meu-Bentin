// ====================================================================
// MODAL DE NOVA VENDA - COMPONENTE INDEPENDENTE E LIMPO
// ====================================================================
// Modal reconstruído sem aninhamento, estrutura limpa e funcional
// ====================================================================

import React, { useState, useMemo, useCallback } from 'react';
import { useEstoque } from '../utils/EstoqueContextSemVendedor';
import { useClientes, type Cliente } from '../hooks/useClientes';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { useToast } from './ToastProvider';
import { 
  ShoppingCart, 
  DollarSign, 
  Users, 
  Package,
  Plus,
  X,
  Trash2,
  CheckCircle,
  Search,
  Loader2
} from 'lucide-react';

// ====================================================================
// TIPOS
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

interface NovaVendaModalProps {
  open: boolean;
  onClose: () => void;
}

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
const NovaVendaModal = ({ open, onClose }: NovaVendaModalProps) => {
  // ====================================================================
  // HOOKS E ESTADO
  // ====================================================================
  const { produtos, adicionarVenda } = useEstoque();
  const { clientes } = useClientes();
  const { addToast } = useToast();

  // Estados do formulário
  const [form, setForm] = useState<VendaForm>(INITIAL_FORM);
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [clienteVenda, setClienteVenda] = useState<Cliente | null>(null);
  const [produtoSelecionado, setProdutoSelecionado] = useState('');
  const [quantidade, setQuantidade] = useState('1');
  const [buscaCliente, setBuscaCliente] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ====================================================================
  // CÁLCULOS
  // ====================================================================
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
  // FUNÇÕES
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
        title: '✅ Venda finalizada com sucesso!',
        description: `Total: R$ ${totalCarrinho.toFixed(2)} • ${carrinho.length} item(ns)`
      });

      resetarFormulario();
      onClose();
      
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
  }, [carrinho, form, clienteVenda, produtos, totalCarrinho, adicionarVenda, addToast, onClose]);

  const resetarFormulario = useCallback(() => {
    setForm(INITIAL_FORM);
    setCarrinho([]);
    setClienteVenda(null);
    setProdutoSelecionado('');
    setQuantidade('1');
    setBuscaCliente('');
  }, []);

  const handleClose = useCallback(() => {
    resetarFormulario();
    onClose();
  }, [resetarFormulario, onClose]);

  // ====================================================================
  // RENDER
  // ====================================================================
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0">
        {/* HEADER */}
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-lg bg-bentin-pink/20">
              <ShoppingCart className="h-5 w-5 text-bentin-pink" />
            </div>
            Nova Venda
          </DialogTitle>
          <DialogDescription>
            Registre uma nova venda no sistema
          </DialogDescription>
        </DialogHeader>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          
          {/* CLIENTE */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-bentin-blue" />
                Cliente da Venda
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
                  
                  {buscaCliente && clientesFiltrados.length > 0 && (
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
                          className="p-3 bg-white border border-gray-200 rounded-lg hover:border-bentin-blue cursor-pointer transition-colors"
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
                  
                  <p className="text-sm text-gray-500 text-center">
                    💡 Ou prossiga sem cliente específico
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-green-200">
                      <Users className="h-4 w-4 text-green-700" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-900">{clienteVenda.nome}</p>
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
                <Package className="h-5 w-5 text-bentin-green" />
                Produtos da Venda
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* ADICIONAR PRODUTO */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <Label>Produto</Label>
                  <Select value={produtoSelecionado} onValueChange={setProdutoSelecionado}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {produtos.filter(p => p.quantidade > 0).map((produto) => (
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
                    className="w-full bg-bentin-green hover:bg-bentin-green/90 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </div>

              {/* CARRINHO */}
              {carrinho.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      Carrinho de Compras ({carrinho.length} item{carrinho.length !== 1 ? 's' : ''})
                    </h4>
                  </div>
                  
                  <div className="space-y-2">
                    {carrinho.map((item) => (
                      <div key={item.produtoId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div>
                          <p className="font-medium text-gray-900">{item.produto}</p>
                          <p className="text-sm text-gray-600">
                            {item.quantidade}x R$ {item.precoUnitario.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-bentin-green">
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
                  </div>
                  
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total da Venda:</span>
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
                <DollarSign className="h-5 w-5 text-bentin-orange" />
                Pagamento e Finalização
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
              
              <div>
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

        {/* FOOTER */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          
          <div className="flex items-center gap-3">
            {carrinho.length > 0 && (
              <span className="text-sm text-gray-600">
                Total: <span className="font-bold text-green-600">R$ {totalCarrinho.toFixed(2)}</span>
              </span>
            )}
            
            <Button
              onClick={finalizarVenda}
              disabled={isLoading || carrinho.length === 0 || !form.formaPagamento}
              className="bg-bentin-pink hover:bg-bentin-pink/90 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Finalizando...
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Finalizar Venda
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NovaVendaModal;