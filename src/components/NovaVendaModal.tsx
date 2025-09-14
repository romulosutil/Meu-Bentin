// ====================================================================
// MODAL DE NOVA VENDA - PADRÃO UNIFICADO
// ====================================================================
// Seguindo rigorosamente o padrão visual dos modais "Novo Produto" e 
// "Gerenciar Clientes": layout wide, seções organizadas, footer fixo
// ====================================================================

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useEstoque } from '../utils/EstoqueContextSemVendedor';
import { useClientes, Cliente } from '../hooks/useClientes';
import { useValidationToasts } from '../hooks/useValidationToasts';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';  
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { CurrencyInput } from './ui/currency-input';
import { InputMonetario } from './ui/input-monetario';
import { useToast } from './ToastProvider';
import { 
  ShoppingCart, 
  Users, 
  Package,
  Plus,
  X,
  Trash2,
  Search,
  Loader2,
  UserPlus,
  CreditCard,
  Calculator,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

// ====================================================================
// TIPOS E INTERFACES
// ====================================================================
interface NovaVendaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ItemCarrinho {
  produtoId: string;
  produto: string;
  quantidade: number;
  preco: number;
  subtotal: number;
}

interface FormVenda {
  clienteSelecionado: Cliente | null;
  formaPagamento: string;
  observacoes: string;
  desconto: number;
}

// ====================================================================
// CONFIGURAÇÕES ESTÁTICAS
// ====================================================================
const FORMAS_PAGAMENTO = [
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'pix', label: 'PIX' },
  { value: 'cartao_debito', label: 'Cartão de Débito' },
  { value: 'cartao_credito', label: 'Cartão de Crédito' },
  { value: 'parcelado', label: 'Parcelado' }
];

export default function NovaVendaModal({ open, onOpenChange }: NovaVendaModalProps) {
  // ====================================================================
  // HOOKS E CONTEXTOS
  // ====================================================================
  const { actions, produtos } = useEstoque();
  const { clientes, carregarClientes, criarCliente, isLoading: carregandoClientes, error: erroClientes } = useClientes();
  const { addToast } = useToast();
  const { validateDiscount, validateRequiredField } = useValidationToasts();

  // ====================================================================
  // ESTADOS DO COMPONENTE
  // ====================================================================
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [form, setForm] = useState<FormVenda>({
    clienteSelecionado: null,
    formaPagamento: '',
    observacoes: '',
    desconto: 0
  });
  
  // Estados de busca e filtros
  const [searchCliente, setSearchCliente] = useState('');
  const [searchProduto, setSearchProduto] = useState('');
  const [showClienteForm, setShowClienteForm] = useState(false);
  const [novoCliente, setNovoCliente] = useState({
    nome: '',
    telefone: '',
    email: ''
  });

  // Estados de loading e UI
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ====================================================================
  // VALORES COMPUTADOS
  // ====================================================================
  const totalCarrinho = useMemo(() => 
    carrinho.reduce((total, item) => total + item.subtotal, 0), [carrinho]
  );
  
  const desconto = useMemo(() => form.desconto || 0, [form.desconto]);
  const totalFinal = useMemo(() => Math.max(0, totalCarrinho - desconto), [totalCarrinho, desconto]);

  const clientesFiltrados = useMemo(() => {
    if (!searchCliente.trim()) return clientes;
    return clientes.filter(cliente => 
      cliente.nome.toLowerCase().includes(searchCliente.toLowerCase()) ||
      cliente.telefone?.includes(searchCliente) ||
      cliente.email?.toLowerCase().includes(searchCliente.toLowerCase())
    );
  }, [clientes, searchCliente]);

  const produtosFiltrados = useMemo(() => {
    if (!searchProduto.trim()) return produtos;
    return produtos.filter(produto => 
      produto.nome.toLowerCase().includes(searchProduto.toLowerCase()) ||
      produto.categoria?.toLowerCase().includes(searchProduto.toLowerCase())
    );
  }, [produtos, searchProduto]);

  // ====================================================================
  // FUNÇÕES DE MANIPULAÇÃO DO CARRINHO
  // ====================================================================
  const adicionarAoCarrinho = useCallback((produtoId: string) => {
    const produto = produtos.find(p => p.id === produtoId);
    if (!produto) return;

    const itemExistente = carrinho.find(item => item.produtoId === produtoId);
    
    if (itemExistente) {
      if (itemExistente.quantidade >= produto.quantidade) {
        addToast({ type: 'error', title: 'Quantidade indisponível em estoque' });
        return;
      }
      
      setCarrinho(prev => prev.map(item =>
        item.produtoId === produtoId
          ? { ...item, quantidade: item.quantidade + 1, subtotal: (item.quantidade + 1) * item.preco }
          : item
      ));
    } else {
      const novoItem: ItemCarrinho = {
        produtoId,
        produto: produto.nome,
        quantidade: 1,
        preco: produto.preco,
        subtotal: produto.preco
      };
      setCarrinho(prev => [...prev, novoItem]);
    }
  }, [produtos, carrinho, addToast]);

  const removerDoCarrinho = useCallback((produtoId: string) => {
    setCarrinho(prev => prev.filter(item => item.produtoId !== produtoId));
  }, []);

  const atualizarQuantidadeCarrinho = useCallback((produtoId: string, novaQuantidade: number) => {
    if (novaQuantidade <= 0) {
      removerDoCarrinho(produtoId);
      return;
    }

    const produto = produtos.find(p => p.id === produtoId);
    if (!produto || novaQuantidade > produto.quantidade) {
      addToast({ type: 'error', title: 'Quantidade indisponível em estoque' });
      return;
    }

    setCarrinho(prev => prev.map(item =>
      item.produtoId === produtoId
        ? { ...item, quantidade: novaQuantidade, subtotal: novaQuantidade * item.preco }
        : item
    ));
  }, [produtos, addToast, removerDoCarrinho]);

  // ====================================================================
  // FUNÇÕES DE GERENCIAMENTO DE CLIENTES
  // ====================================================================
  const criarNovoCliente = useCallback(async () => {
    if (!novoCliente.nome.trim()) {
      addToast({ type: 'error', title: 'Nome do cliente é obrigatório' });
      return;
    }

    setIsCreatingClient(true);
    try {
      const clienteCriado = await criarCliente({
        nome: novoCliente.nome.trim(),
        telefone: novoCliente.telefone.trim() || undefined,
        email: novoCliente.email.trim() || undefined,
      });

      if (clienteCriado) {
        setForm(prev => ({ ...prev, clienteSelecionado: clienteCriado }));
        setShowClienteForm(false);
        setNovoCliente({ nome: '', telefone: '', email: '' });
        addToast({ type: 'success', title: 'Cliente criado com sucesso!' });
      } else {
        addToast({ type: 'error', title: 'Erro ao criar cliente' });
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Erro ao criar cliente' });
    } finally {
      setIsCreatingClient(false);
    }
  }, [novoCliente, addToast, criarCliente]);

  // ====================================================================
  // VALIDAÇÃO E FINALIZAÇÃO
  // ====================================================================
  const validarFormulario = useCallback(() => {
    const novosErrors: Record<string, string> = {};
    
    if (!form.clienteSelecionado) {
      novosErrors.cliente = 'Selecione um cliente';
    }
    
    if (carrinho.length === 0) {
      novosErrors.produtos = 'Adicione pelo menos um produto';
    }
    
    if (!form.formaPagamento) {
      novosErrors.pagamento = 'Selecione uma forma de pagamento';
    }
    
    setErrors(novosErrors);
    return Object.keys(novosErrors).length === 0;
  }, [form.clienteSelecionado, carrinho, form.formaPagamento]);

  const finalizarVenda = useCallback(async () => {
    if (!validarFormulario()) {
      addToast({ type: 'error', title: 'Preencha todos os campos obrigatórios' });
      return;
    }

    setIsLoading(true);
    try {
      // Para cada item no carrinho, criar uma venda separada
      // Isso mantém compatibilidade com o sistema existente
      for (const item of carrinho) {
        const produto = produtos.find(p => p.id === item.produtoId);
        if (!produto) continue;

        const vendaData = {
          produtoId: item.produtoId,
          nomeProduto: item.produto,
          quantidade: item.quantidade,
          precoUnitario: item.preco,
          precoTotal: item.subtotal,
          vendedor: 'Venda Direta',
          categoria: produto.categoria || 'Produto',
          formaPagamento: form.formaPagamento as any,
          desconto: 0, // Desconto pode ser aplicado por item no futuro
          data: new Date().toISOString(),
          observacoes: form.observacoes || undefined,
          cliente: form.clienteSelecionado!.nome,
          cliente_id: form.clienteSelecionado!.id
        };

        await actions.adicionarVenda(vendaData);
      }
      
      addToast({ type: 'success', title: 'Venda registrada com sucesso!' });
      
      // Resetar formulário
      setForm({
        clienteSelecionado: null,
        formaPagamento: '',
        observacoes: '',
        desconto: 0
      });
      setCarrinho([]);
      setSearchCliente('');
      setSearchProduto('');
      setShowClienteForm(false);
      setNovoCliente({ nome: '', telefone: '', email: '' });
      setErrors({});
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao finalizar venda:', error);
      addToast({ type: 'error', title: 'Erro ao registrar venda' });
    } finally {
      setIsLoading(false);
    }
  }, [validarFormulario, form, carrinho, produtos, actions, addToast, setForm, setCarrinho, setSearchCliente, setSearchProduto, setShowClienteForm, setNovoCliente, setErrors, onOpenChange]);

  // ====================================================================
  // FUNÇÕES DE CONTROLE DO MODAL
  // ====================================================================
  const handleClose = useCallback(() => {
    setForm({
      clienteSelecionado: null,
      formaPagamento: '',
      observacoes: '',
      desconto: 0
    });
    setCarrinho([]);
    setSearchCliente('');
    setSearchProduto('');
    setShowClienteForm(false);
    setNovoCliente({ nome: '', telefone: '', email: '' });
    setErrors({});
    onOpenChange(false);
  }, [onOpenChange]);

  // ====================================================================
  // INICIALIZAÇÃO
  // ====================================================================
  useEffect(() => {
    if (open) {
      carregarClientes();
    }
  }, [open, carregarClientes]);

  // Handler para ESC - Versão robusta
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      console.log('ESC detectado:', e.key, 'Modal aberto:', open, 'Loading:', isLoading);
      if (e.key === 'Escape' && open && !isLoading) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Fechando modal via ESC');
        handleClose();
      }
    };
    
    if (open) {
      document.addEventListener('keydown', handleEsc, true); // Use capture phase
      document.body.style.overflow = 'hidden';
      console.log('Event listener ESC adicionado');
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc, true);
      document.body.style.overflow = '';
      console.log('Event listener ESC removido');
    };
  }, [open, handleClose, isLoading]);

  // ====================================================================
  // RENDER PRINCIPAL - PADRÃO UNIFICADO
  // ====================================================================
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm" 
        onClick={(e) => {
          console.log('Clique no overlay detectado');
          if (!isLoading) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Fechando modal via overlay');
            handleClose();
          }
        }}
      />
      
      {/* Modal - Layout Wide Padrão */}
      <div 
        className="modal-container relative bg-white rounded-xl shadow-xl w-[90vw] max-w-6xl flex flex-col border border-gray-200" 
        style={{ maxHeight: '90vh', overflow: 'hidden' }}
        onClick={(e) => {
          console.log('Clique no conteúdo do modal - não propagando');
          e.stopPropagation();
        }}
      >
        
        {/* Header Padronizado */}
        <div className="modal-header flex items-center justify-between p-6 border-b border-border/40 bg-white" style={{ flexShrink: 0 }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-bentin-pink/10 border border-bentin-pink/20">
              <ShoppingCart className="h-5 w-5 text-bentin-pink" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Nova Venda
              </h2>
              <p className="text-sm text-gray-600">
                Registre os produtos, cliente e pagamento para concluir a transação
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              console.log('Clique no botão X detectado');
              e.preventDefault();
              e.stopPropagation();
              console.log('Fechando modal via botão X');
              handleClose();
            }}
            className="h-9 w-9 p-0 hover:bg-gray-100 rounded-lg"
            disabled={isLoading}
            aria-label="Fechar modal"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Conteúdo Scrollável */}
        <div className="modal-body bentin-scroll p-6 space-y-6" style={{ flexGrow: 1, overflowY: 'auto' }}>
          
          {/* Alertas de erro */}
          {Object.keys(errors).length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {Object.values(errors).map((error, index) => (
                    <li key={index} className="text-sm">{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* SEÇÃO 1: CLIENTE */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-bentin-blue" />
              <h3 className="text-lg font-semibold text-gray-900">Cliente</h3>
              <Separator className="flex-1" />
            </div>

            {/* Cliente selecionado */}
            {form.clienteSelecionado ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <h4 className="font-medium text-green-900">{form.clienteSelecionado.nome}</h4>
                      <p className="text-sm text-green-700">
                        {form.clienteSelecionado.telefone && `Tel: ${form.clienteSelecionado.telefone}`}
                        {form.clienteSelecionado.telefone && form.clienteSelecionado.email && ' • '}
                        {form.clienteSelecionado.email && form.clienteSelecionado.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setForm(prev => ({ ...prev, clienteSelecionado: null }))}
                    className="text-green-700 hover:text-green-900"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 p-4 border border-gray-200 rounded-xl">
                {/* Busca de clientes */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar cliente por nome, telefone ou email..."
                    value={searchCliente}
                    onChange={(e) => setSearchCliente(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Lista de clientes */}
                <div className="max-h-40 overflow-y-auto space-y-2 bentin-scroll">
                  {clientesFiltrados.map(cliente => (
                    <div
                      key={cliente.id}
                      onClick={() => setForm(prev => ({ ...prev, clienteSelecionado: cliente }))}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{cliente.nome}</h4>
                          <p className="text-sm text-gray-600">
                            {cliente.telefone && `Tel: ${cliente.telefone}`}
                            {cliente.telefone && cliente.email && ' • '}
                            {cliente.email && cliente.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Botão novo cliente */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowClienteForm(!showClienteForm)}
                  className="w-full"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {showClienteForm ? 'Cancelar' : 'Cadastrar Novo Cliente'}
                </Button>

                {/* Formulário novo cliente */}
                {showClienteForm && (
                  <div className="p-4 bg-gray-50 rounded-xl space-y-4">
                    <h4 className="font-medium text-gray-900">Dados do Novo Cliente</h4>
                    
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <Label htmlFor="nome-cliente">Nome *</Label>
                        <Input
                          id="nome-cliente"
                          value={novoCliente.nome}
                          onChange={(e) => setNovoCliente(prev => ({ ...prev, nome: e.target.value }))}
                          placeholder="Nome completo"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="telefone-cliente">Telefone</Label>
                          <Input
                            id="telefone-cliente"
                            value={novoCliente.telefone}
                            onChange={(e) => setNovoCliente(prev => ({ ...prev, telefone: e.target.value }))}
                            placeholder="(00) 00000-0000"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email-cliente">Email</Label>
                          <Input
                            id="email-cliente"
                            type="email"
                            value={novoCliente.email}
                            onChange={(e) => setNovoCliente(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="email@exemplo.com"
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        onClick={criarNovoCliente}
                        disabled={isCreatingClient}
                        className="bg-bentin-green hover:bg-bentin-green/90"
                      >
                        {isCreatingClient ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <UserPlus className="h-4 w-4 mr-2" />
                        )}
                        Criar Cliente
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SEÇÃO 2: PRODUTOS DA VENDA */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Package className="h-5 w-5 text-bentin-green" />
              <h3 className="text-lg font-semibold text-gray-900">Produtos da Venda</h3>
              <Separator className="flex-1" />
            </div>

            {/* Produtos no carrinho */}
            {carrinho.length > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <h4 className="font-medium text-blue-900 mb-3">Produtos Adicionados ({carrinho.length})</h4>
                <div className="space-y-3">
                  {carrinho.map(item => (
                    <div key={item.produtoId} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex-1">
                        <h5 className="font-medium">{item.produto}</h5>
                        <p className="text-sm text-gray-600">R$ {item.preco.toFixed(2)} cada</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => atualizarQuantidadeCarrinho(item.produtoId, item.quantidade - 1)}
                            className="h-8 w-8 p-0"
                          >
                            -
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantidade}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => atualizarQuantidadeCarrinho(item.produtoId, item.quantidade + 1)}
                            className="h-8 w-8 p-0"
                          >
                            +
                          </Button>
                        </div>
                        <span className="w-20 text-right font-semibold">R$ {item.subtotal.toFixed(2)}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removerDoCarrinho(item.produtoId)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-blue-200">
                  <div className="flex justify-between font-semibold text-blue-900">
                    <span>Subtotal:</span>
                    <span>R$ {totalCarrinho.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Buscar e adicionar produtos */}
            <div className="p-4 border border-gray-200 rounded-xl space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar produto por nome ou categoria..."
                  value={searchProduto}
                  onChange={(e) => setSearchProduto(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="max-h-40 overflow-y-auto space-y-2 bentin-scroll">
                {produtosFiltrados.map(produto => (
                  <div
                    key={produto.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{produto.nome}</h4>
                      <p className="text-sm text-gray-600">
                        R$ {produto.preco.toFixed(2)} • Estoque: {produto.quantidade}
                        {produto.categoria && ` • ${produto.categoria}`}
                      </p>
                    </div>
                    <Button
                      onClick={() => adicionarAoCarrinho(produto.id)}
                      disabled={produto.quantidade === 0}
                      size="sm"
                      className="bg-bentin-blue hover:bg-bentin-blue/90"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SEÇÃO 3: RESUMO E PAGAMENTO */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5 text-bentin-orange" />
              <h3 className="text-lg font-semibold text-gray-900">Resumo e Pagamento</h3>
              <Separator className="flex-1" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Resumo financeiro */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Resumo Financeiro
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Cliente:</span>
                    <span className="font-medium">{form.clienteSelecionado?.nome || 'Não selecionado'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Produtos:</span>
                    <span>{carrinho.length} itens</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>R$ {totalCarrinho.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Desconto:</span>
                    <span>- R$ {desconto.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg text-green-600">
                    <span>Total:</span>
                    <span>R$ {totalFinal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Opções de pagamento */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="forma-pagamento">Forma de Pagamento *</Label>
                  <Select value={form.formaPagamento} onValueChange={(value) => setForm(prev => ({ ...prev, formaPagamento: value }))}>
                    <SelectTrigger id="forma-pagamento">
                      <SelectValue placeholder="Selecione a forma de pagamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {FORMAS_PAGAMENTO.map(forma => (
                        <SelectItem key={forma.value} value={forma.value}>
                          {forma.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="desconto">Desconto (R$)</Label>
                  <InputMonetario
                    id="desconto"
                    value={form.desconto}
                    onUnmaskedChange={(value) => {
                      // Validação em tempo real do limite
                      if (value > totalCarrinho) {
                        validateDiscount(value, totalCarrinho);
                        return; // Não atualiza se for inválido
                      }
                      
                      setForm(prev => ({ ...prev, desconto: value }));
                    }}
                    placeholder="R$ 0,00"
                  />
                  {form.desconto > 0 && (
                    <p className="text-xs text-gray-600 mt-1">
                      Desconto aplicado: {((form.desconto / totalCarrinho) * 100).toFixed(1)}%
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={form.observacoes}
                    onChange={(e) => setForm(prev => ({ ...prev, observacoes: e.target.value }))}
                    placeholder="Observações sobre a venda..."
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Fixo - Padrão Unificado */}
        <div className="modal-footer flex items-center justify-end gap-3 p-6 border-t border-border/40 bg-white" style={{ flexShrink: 0 }}>
          <Button
            type="button"
            variant="ghost"
            onClick={(e) => {
              console.log('Clique no botão Cancelar detectado');
              e.preventDefault();
              e.stopPropagation();
              console.log('Fechando modal via Cancelar');
              handleClose();
            }}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          
          <Button
            type="button"
            onClick={finalizarVenda}
            disabled={isLoading || !form.clienteSelecionado || carrinho.length === 0 || !form.formaPagamento}
            className="bg-bentin-green hover:bg-bentin-green/90 flex items-center gap-2 text-white"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShoppingCart className="h-4 w-4" />
            )}
            Finalizar Venda
          </Button>
        </div>
      </div>
    </div>
  );
}