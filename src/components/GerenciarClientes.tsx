// =====================================================
// MODAL GERENCIAR CLIENTES - PADRÃO "NOVO PRODUTO"
// =====================================================
// Modal reconstruído seguindo exatamente os padrões
// do FormularioProduto com estrutura manual consistente
// =====================================================

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { StatsCard } from './ui/stats-card';
import { FormSection, FormField, FormGrid } from './ui/form-section';
import { LoadingState } from './ui/loading-state';
import { EmptyState } from './ui/empty-state';
import { useClientes, Cliente, Filho } from '../hooks/useClientes';
import { useToast } from './ToastProvider';
import { 
  X, Users, UserPlus, Baby, Phone, Mail, Instagram, MapPin, 
  Edit3, Plus, Search, Filter, User, ContactRound, UserCog, 
  Cake, ShirtIcon, AlertCircle, Heart, UserCheck, Loader2,
  Save, CheckCircle2
} from 'lucide-react';

interface GerenciarClientesProps {
  open: boolean;
  onCancel: () => void;
}

interface FormularioClienteProps {
  cliente?: Cliente;
  onSubmit: (cliente: Omit<Cliente, 'id'>) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

interface FormularioFilhoProps {
  clienteId: string;
  filho?: Filho;
  onSubmit: (filho: Omit<Filho, 'id' | 'cliente_id'>) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

// Componente de Formulário de Cliente seguindo padrão FormularioProduto
const FormularioCliente: React.FC<FormularioClienteProps> = ({
  cliente,
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState({
    nome: cliente?.nome || '',
    data_nascimento: cliente?.data_nascimento || '',
    telefone: cliente?.telefone || '',
    email: cliente?.email || '',
    instagram: cliente?.instagram || '',
    endereco: cliente?.endereco || '',
    observacoes: cliente?.observacoes || '',
    ativo: cliente?.ativo ?? true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Preencher formulário se editando cliente
  useEffect(() => {
    if (cliente) {
      setFormData({
        nome: cliente.nome,
        data_nascimento: cliente.data_nascimento || '',
        telefone: cliente.telefone || '',
        email: cliente.email || '',
        instagram: cliente.instagram || '',
        endereco: cliente.endereco || '',
        observacoes: cliente.observacoes || '',
        ativo: cliente.ativo
      });
    }
  }, [cliente]);

  // Formatação de telefone
  const formatarTelefone = useCallback((valor: string) => {
    const apenasNumeros = valor.replace(/\D/g, '');
    if (apenasNumeros.length <= 11) {
      return apenasNumeros
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4,5})(\d{4})/, '$1-$2');
    }
    return valor;
  }, []);

  // Validação do formulário
  const validarFormulario = useCallback((): boolean => {
    const novosErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      novosErrors.nome = 'Nome é obrigatório';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      novosErrors.email = 'E-mail inválido';
    }

    if (formData.telefone && formData.telefone.replace(/\D/g, '').length < 10) {
      novosErrors.telefone = 'Telefone deve ter pelo menos 10 dígitos';
    }

    setErrors(novosErrors);
    return Object.keys(novosErrors).length === 0;
  }, [formData]);

  // Submit do formulário
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (validarFormulario()) {
      try {
        await onSubmit(formData);
      } catch (error) {
        console.error('Erro ao salvar cliente:', error);
        addToast({
          type: 'error',
          title: 'Erro ao salvar',
          description: 'Não foi possível salvar o cliente. Tente novamente.'
        });
      }
    }
  }, [validarFormulario, formData, onSubmit, addToast]);

  if (isSubmitting) {
    return <LoadingState message="Salvando cliente..." />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6">
        
        {/* Informações Básicas */}
        <FormSection 
          title="Informações Básicas" 
          description="Dados principais do responsável"
          icon={<User className="h-4 w-4" />}
        >
          <div className="space-y-4">
            <FormField label="Nome Completo" required error={errors.nome}>
              <Input
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Nome do responsável"
                className="h-10"
                disabled={isSubmitting}
              />
            </FormField>

            <FormField label="Data de Nascimento">
              <Input
                type="date"
                value={formData.data_nascimento}
                onChange={(e) => setFormData(prev => ({ ...prev, data_nascimento: e.target.value }))}
                className="h-10"
                disabled={isSubmitting}
              />
            </FormField>
          </div>
        </FormSection>

        {/* Contato */}
        <FormSection 
          title="Informações de Contato" 
          description="Como podemos entrar em contato"
          icon={<ContactRound className="h-4 w-4" />}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Telefone" error={errors.telefone}>
                <Input
                  value={formData.telefone}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    telefone: formatarTelefone(e.target.value)
                  }))}
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                  className="h-10"
                  disabled={isSubmitting}
                />
              </FormField>

              <FormField label="E-mail" error={errors.email}>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@exemplo.com"
                  className="h-10"
                  disabled={isSubmitting}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Instagram">
                <Input
                  value={formData.instagram}
                  onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
                  placeholder="@usuario"
                  className="h-10"
                  disabled={isSubmitting}
                />
              </FormField>

              <FormField label="Endereço">
                <Input
                  value={formData.endereco}
                  onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
                  placeholder="Rua, número, bairro"
                  className="h-10"
                  disabled={isSubmitting}
                />
              </FormField>
            </div>
          </div>
        </FormSection>

        {/* Observações */}
        <FormSection 
          title="Observações Adicionais" 
          description="Informações extras sobre o cliente"
          icon={<UserCog className="h-4 w-4" />}
        >
          <FormField label="Observações">
            <Textarea
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              placeholder="Informações adicionais sobre o cliente"
              rows={3}
              className="resize-none"
              disabled={isSubmitting}
            />
          </FormField>
        </FormSection>

      </div>
    </form>
  );
};

// Componente de Formulário de Filho seguindo padrão FormularioProduto
const FormularioFilho: React.FC<FormularioFilhoProps> = ({
  clienteId,
  filho,
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState({
    nome: filho?.nome || '',
    data_nascimento: filho?.data_nascimento || '',
    genero: filho?.genero || '',
    tamanho_preferido: filho?.tamanho_preferido || '',
    observacoes: filho?.observacoes || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Preencher formulário se editando filho
  useEffect(() => {
    if (filho) {
      setFormData({
        nome: filho.nome,
        data_nascimento: filho.data_nascimento || '',
        genero: filho.genero || '',
        tamanho_preferido: filho.tamanho_preferido || '',
        observacoes: filho.observacoes || ''
      });
    }
  }, [filho]);

  // Validação do formulário
  const validarFormulario = useCallback((): boolean => {
    const novosErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      novosErrors.nome = 'Nome é obrigatório';
    }

    setErrors(novosErrors);
    return Object.keys(novosErrors).length === 0;
  }, [formData]);

  // Submit do formulário
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (validarFormulario()) {
      try {
        await onSubmit(formData);
      } catch (error) {
        console.error('Erro ao salvar filho:', error);
        addToast({
          type: 'error',
          title: 'Erro ao salvar',
          description: 'Não foi possível salvar o filho. Tente novamente.'
        });
      }
    }
  }, [validarFormulario, formData, onSubmit, addToast]);

  if (isSubmitting) {
    return <LoadingState message="Salvando filho..." />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6">
        
        {/* Informações da Criança */}
        <FormSection 
          title="Informações da Criança" 
          description="Dados básicos do filho/dependente"
          icon={<Baby className="h-4 w-4" />}
        >
          <div className="space-y-4">
            <FormField label="Nome" required error={errors.nome}>
              <Input
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Nome da criança"
                className="h-10"
                disabled={isSubmitting}
              />
            </FormField>

            <FormField label="Data de Nascimento">
              <Input
                type="date"
                value={formData.data_nascimento}
                onChange={(e) => setFormData(prev => ({ ...prev, data_nascimento: e.target.value }))}
                className="h-10"
                disabled={isSubmitting}
              />
            </FormField>
          </div>
        </FormSection>

        {/* Características */}
        <FormSection 
          title="Características" 
          description="Gênero e preferências de tamanho"
          icon={<ShirtIcon className="h-4 w-4" />}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Gênero">
                <Select 
                  value={formData.genero} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, genero: value }))}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Selecione o gênero" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">👦 Masculino</SelectItem>
                    <SelectItem value="feminino">👧 Feminino</SelectItem>
                    <SelectItem value="unissex">🧒 Unissex</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Tamanho Preferido">
                <Input
                  value={formData.tamanho_preferido}
                  onChange={(e) => setFormData(prev => ({ ...prev, tamanho_preferido: e.target.value }))}
                  placeholder="Ex: 4 anos, P, M, G"
                  className="h-10"
                  disabled={isSubmitting}
                />
              </FormField>
            </div>
          </div>
        </FormSection>

        {/* Observações */}
        <FormSection 
          title="Observações" 
          description="Preferências, alergias ou informações especiais"
          icon={<UserCog className="h-4 w-4" />}
        >
          <FormField label="Observações">
            <Textarea
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              placeholder="Preferências, alergias, tamanhos específicos, etc."
              rows={3}
              className="resize-none"
              disabled={isSubmitting}
            />
          </FormField>
        </FormSection>

      </div>
    </form>
  );
};

/**
 * Modal de Gerenciamento de Clientes seguindo EXATAMENTE
 * os padrões do FormularioProduto com estrutura manual
 */
const GerenciarClientes: React.FC<GerenciarClientesProps> = ({
  open,
  onCancel
}) => {
  const {
    clientes,
    clienteSelecionado,
    stats,
    isLoading,
    error,
    criarCliente,
    atualizarCliente,
    adicionarFilho,
    atualizarFilho,
    limparErro,
    selecionarCliente,
  } = useClientes();

  const { addToast } = useToast();

  // Estados dos submodais
  const [modalNovoCliente, setModalNovoCliente] = useState(false);
  const [modalEditarCliente, setModalEditarCliente] = useState(false);
  const [modalNovoFilho, setModalNovoFilho] = useState(false);
  const [clienteParaFilho, setClienteParaFilho] = useState<string>('');
  const [filhoParaEditar, setFilhoParaEditar] = useState<Filho | undefined>();

  // Estados de loading individuais
  const [isSubmittingCliente, setIsSubmittingCliente] = useState(false);
  const [isSubmittingFilho, setIsSubmittingFilho] = useState(false);

  // Estados de filtros
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroGenero, setFiltroGenero] = useState('todos');

  // Filtrar clientes
  const clientesFiltrados = clientes.filter(cliente => {
    const matchTexto = cliente.nome.toLowerCase().includes(filtroTexto.toLowerCase()) ||
                      cliente.email?.toLowerCase().includes(filtroTexto.toLowerCase()) ||
                      cliente.telefone?.includes(filtroTexto);
    
    if (filtroGenero === 'todos') return matchTexto;
    
    const temFilhoDoGenero = cliente.filhos?.some(filho => filho.genero === filtroGenero);
    return matchTexto && temFilhoDoGenero;
  });

  // Handlers seguindo padrão do FormularioProduto
  const handleCriarCliente = useCallback(async (dadosCliente: Omit<Cliente, 'id'>) => {
    setIsSubmittingCliente(true);
    try {
      const resultado = await criarCliente(dadosCliente);
      if (resultado) {
        setModalNovoCliente(false);
        addToast({
          type: 'success',
          title: '✅ Cliente cadastrado',
          description: `${dadosCliente.nome} foi cadastrado com sucesso!`
        });
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erro ao cadastrar',
        description: 'Não foi possível cadastrar o cliente. Tente novamente.'
      });
    } finally {
      setIsSubmittingCliente(false);
    }
  }, [criarCliente, addToast]);

  const handleEditarCliente = useCallback(async (dadosCliente: Omit<Cliente, 'id'>) => {
    if (!clienteSelecionado?.id) return;
    
    setIsSubmittingCliente(true);
    try {
      const resultado = await atualizarCliente(clienteSelecionado.id, dadosCliente);
      if (resultado) {
        setModalEditarCliente(false);
        selecionarCliente(null);
        addToast({
          type: 'success',
          title: '✅ Cliente atualizado',
          description: `${dadosCliente.nome} foi atualizado com sucesso!`
        });
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erro ao atualizar',
        description: 'Não foi possível atualizar o cliente. Tente novamente.'
      });
    } finally {
      setIsSubmittingCliente(false);
    }
  }, [clienteSelecionado, atualizarCliente, selecionarCliente, addToast]);

  const handleAdicionarFilho = useCallback(async (dadosFilho: Omit<Filho, 'id' | 'cliente_id'>) => {
    setIsSubmittingFilho(true);
    try {
      const resultado = await adicionarFilho(clienteParaFilho, dadosFilho);
      if (resultado) {
        setModalNovoFilho(false);
        setClienteParaFilho('');
        addToast({
          type: 'success',
          title: '✅ Filho adicionado',
          description: `${dadosFilho.nome} foi adicionado com sucesso!`
        });
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erro ao adicionar filho',
        description: 'Não foi possível adicionar o filho. Tente novamente.'
      });
    } finally {
      setIsSubmittingFilho(false);
    }
  }, [clienteParaFilho, adicionarFilho, addToast]);

  const calcularIdade = useCallback((dataNascimento: string) => {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    const idade = hoje.getFullYear() - nascimento.getFullYear();
    const mesAtual = hoje.getMonth();
    const mesNascimento = nascimento.getMonth();
    
    if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())) {
      return idade - 1;
    }
    return idade;
  }, []);

  // Handler para ESC (seguindo padrão FormularioProduto)
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onCancel();
      }
    };
    
    if (open) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <>
      {/* Modal Principal - EXATAMENTE como FormularioProduto */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/20 backdrop-blur-sm" 
          onClick={onCancel}
        />
        
        {/* Modal */}
        <div className="modal-container relative bg-white rounded-xl shadow-xl w-[90vw] max-w-6xl flex flex-col border border-gray-200" style={{ maxHeight: '90vh', overflow: 'hidden' }}>
          
          {/* Header - EXATAMENTE como FormularioProduto */}
          <div className="modal-header flex items-center justify-between p-6 border-b border-border/40 bg-white" style={{ flexShrink: 0 }}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-bentin-pink/10 border border-bentin-pink/20">
                <Users className="h-5 w-5 text-bentin-pink" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Gerenciar Clientes
                </h2>
                <p className="text-sm text-gray-600">
                  Cadastre clientes, gerencie filhos e vincule vendas
                </p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="h-9 w-9 p-0 hover:bg-gray-100 rounded-lg"
              disabled={isSubmittingCliente || isSubmittingFilho}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Conteúdo scrollável - EXATAMENTE como FormularioProduto */}
          <div className="modal-body bentin-scroll p-6 space-y-6" style={{ flexGrow: 1, overflowY: 'auto' }}>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  {error}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={limparErro}
                    className="h-auto p-1 ml-2"
                  >
                    ×
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                title="Total de Clientes"
                value={stats?.totalClientes || 0}
                description="clientes ativos"
                icon={<Users />}
                color="primary"
              />
              
              <StatsCard
                title="Total de Filhos"
                value={stats?.totalFilhos || 0}
                description="crianças cadastradas"
                icon={<Baby />}
                color="success"
              />
              
              <StatsCard
                title="Vendas Vinculadas"
                value={stats?.vendasComCliente || 0}
                description="vendas com cliente"
                icon={<UserCheck />}
                color="info"
              />
              
              <StatsCard
                title="Média de Filhos"
                value={stats?.mediaFilhosPorCliente?.toFixed(1) || '0.0'}
                description="filhos por cliente"
                icon={<Heart />}
                color="warning"
              />
            </div>

            {/* Controles e Ações */}
            <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">Ações Rápidas</h3>
                <p className="text-sm text-gray-600">Gerencie clientes e filhos de forma eficiente</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setModalNovoCliente(true)}
                  className="bentin-button-primary"
                  disabled={isSubmittingCliente || isSubmittingFilho}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Novo Cliente
                </Button>
              </div>
            </div>

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-4 p-4 border border-border/40 rounded-lg">
              <div className="flex-1">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Buscar Cliente</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por nome, email ou telefone..."
                    value={filtroTexto}
                    onChange={(e) => setFiltroTexto(e.target.value)}
                    className="pl-10 h-10"
                  />
                </div>
              </div>
              
              <div className="w-full sm:w-48">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Filtrar por Gênero</Label>
                <Select value={filtroGenero} onValueChange={setFiltroGenero}>
                  <SelectTrigger className="h-10">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os gêneros</SelectItem>
                    <SelectItem value="masculino">Filhos meninos</SelectItem>
                    <SelectItem value="feminino">Filhas meninas</SelectItem>
                    <SelectItem value="unissex">Unissex</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Lista de Clientes */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-bentin-pink" />
                Clientes Cadastrados ({clientesFiltrados.length})
              </h3>
              
              {isLoading ? (
                <LoadingState message="Carregando clientes..." />
              ) : clientesFiltrados.length === 0 ? (
                <EmptyState
                  icon={<Users className="h-full w-full" />}
                  title="Nenhum cliente encontrado"
                  description="Cadastre o primeiro cliente ou ajuste os filtros de busca"
                  action={
                    <Button 
                      onClick={() => setModalNovoCliente(true)}
                      className="bentin-button-primary"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Cadastrar Cliente
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-4 max-h-[400px] overflow-y-auto bentin-scroll pr-2">
                  {clientesFiltrados.map((cliente) => (
                    <Card key={cliente.id} className="bentin-card hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-bentin-pink/10 to-bentin-pink/20">
                                  <User className="h-4 w-4 text-bentin-pink" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">
                                    {cliente.nome}
                                  </h4>
                                  {(cliente.filhos?.length || 0) > 0 && (
                                    <p className="text-xs text-muted-foreground">
                                      {cliente.filhos?.length} {cliente.filhos?.length === 1 ? 'filho' : 'filhos'} cadastrado{cliente.filhos?.length === 1 ? '' : 's'}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setClienteParaFilho(cliente.id!);
                                    setModalNovoFilho(true);
                                  }}
                                  className="h-8 px-3 text-xs hover:bg-bentin-green/10 hover:border-bentin-green hover:text-bentin-green"
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Filho
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    selecionarCliente(cliente);
                                    setModalEditarCliente(true);
                                  }}
                                  className="h-8 px-3 text-xs hover:bg-bentin-blue/10 hover:border-bentin-blue hover:text-bentin-blue"
                                >
                                  <Edit3 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
                              {cliente.telefone && (
                                <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                                  <Phone className="h-3 w-3 text-bentin-green" />
                                  {cliente.telefone}
                                </div>
                              )}
                              {cliente.email && (
                                <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                                  <Mail className="h-3 w-3 text-bentin-blue" />
                                  <span className="truncate">{cliente.email}</span>
                                </div>
                              )}
                            </div>

                            {cliente.filhos && cliente.filhos.length > 0 && (
                              <div className="mt-3 p-2 rounded-lg bg-gradient-to-r from-blue-50 to-pink-50 border border-blue-100">
                                <div className="flex items-center gap-2 mb-1">
                                  <Baby className="h-3 w-3 text-bentin-blue" />
                                  <span className="text-xs font-medium text-gray-700">
                                    Filhos ({cliente.filhos.length})
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {cliente.filhos.map((filho) => (
                                    <Badge 
                                      key={filho.id} 
                                      className="text-xs bg-white/80 text-gray-700 hover:bg-white border-0 shadow-sm"
                                    >
                                      <span className="mr-1">
                                        {filho.genero === 'feminino' ? '👧' : filho.genero === 'masculino' ? '👦' : '🧒'}
                                      </span>
                                      {filho.nome}
                                      {filho.data_nascimento && (
                                        <span className="ml-1 text-gray-500">
                                          ({calcularIdade(filho.data_nascimento)}a)
                                        </span>
                                      )}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Submodal: Novo Cliente - Seguindo padrão FormularioProduto */}
      {modalNovoCliente && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            onClick={() => setModalNovoCliente(false)}
          />
          <div className="modal-container relative bg-white rounded-xl shadow-xl w-[90vw] max-w-3xl flex flex-col border border-gray-200" style={{ maxHeight: '90vh', overflow: 'hidden' }}>
            
            <div className="modal-header flex items-center justify-between p-6 border-b border-border/40 bg-white" style={{ flexShrink: 0 }}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-bentin-green/10 border border-bentin-green/20">
                  <UserPlus className="h-5 w-5 text-bentin-green" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Novo Cliente</h2>
                  <p className="text-sm text-gray-600">Cadastre um novo cliente responsável no sistema</p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setModalNovoCliente(false)}
                className="h-9 w-9 p-0 hover:bg-gray-100 rounded-lg"
                disabled={isSubmittingCliente}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="modal-body bentin-scroll p-6" style={{ flexGrow: 1, overflowY: 'auto' }}>
              <FormularioCliente
                onSubmit={handleCriarCliente}
                onCancel={() => setModalNovoCliente(false)}
                isSubmitting={isSubmittingCliente}
              />
            </div>

            <div className="modal-footer flex items-center justify-end gap-3 p-6 border-t border-border/40 bg-gray-50/50" style={{ flexShrink: 0 }}>
              <Button
                variant="outline"
                onClick={() => setModalNovoCliente(false)}
                disabled={isSubmittingCliente}
                className="px-6"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                form="form-cliente"
                disabled={isSubmittingCliente}
                className="bentin-button-primary px-6"
              >
                {isSubmittingCliente ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Criar Cliente
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Submodal: Editar Cliente - Seguindo padrão FormularioProduto */}
      {modalEditarCliente && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            onClick={() => {
              setModalEditarCliente(false);
              selecionarCliente(null);
            }}
          />
          <div className="modal-container relative bg-white rounded-xl shadow-xl w-[90vw] max-w-3xl flex flex-col border border-gray-200" style={{ maxHeight: '90vh', overflow: 'hidden' }}>
            
            <div className="modal-header flex items-center justify-between p-6 border-b border-border/40 bg-white" style={{ flexShrink: 0 }}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-bentin-blue/10 border border-bentin-blue/20">
                  <Edit3 className="h-5 w-5 text-bentin-blue" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Editar Cliente</h2>
                  <p className="text-sm text-gray-600">Atualize as informações do cliente selecionado</p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setModalEditarCliente(false);
                  selecionarCliente(null);
                }}
                className="h-9 w-9 p-0 hover:bg-gray-100 rounded-lg"
                disabled={isSubmittingCliente}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="modal-body bentin-scroll p-6" style={{ flexGrow: 1, overflowY: 'auto' }}>
              <FormularioCliente
                cliente={clienteSelecionado || undefined}
                onSubmit={handleEditarCliente}
                onCancel={() => {
                  setModalEditarCliente(false);
                  selecionarCliente(null);
                }}
                isSubmitting={isSubmittingCliente}
              />
            </div>

            <div className="modal-footer flex items-center justify-end gap-3 p-6 border-t border-border/40 bg-gray-50/50" style={{ flexShrink: 0 }}>
              <Button
                variant="outline"
                onClick={() => {
                  setModalEditarCliente(false);
                  selecionarCliente(null);
                }}
                disabled={isSubmittingCliente}
                className="px-6"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                form="form-cliente-edit"
                disabled={isSubmittingCliente}
                className="bentin-button-primary px-6"
              >
                {isSubmittingCliente ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Atualizar Cliente
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Submodal: Novo Filho - Seguindo padrão FormularioProduto */}
      {modalNovoFilho && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            onClick={() => {
              setModalNovoFilho(false);
              setClienteParaFilho('');
            }}
          />
          <div className="modal-container relative bg-white rounded-xl shadow-xl w-[90vw] max-w-2xl flex flex-col border border-gray-200" style={{ maxHeight: '90vh', overflow: 'hidden' }}>
            
            <div className="modal-header flex items-center justify-between p-6 border-b border-border/40 bg-white" style={{ flexShrink: 0 }}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-bentin-orange/10 border border-bentin-orange/20">
                  <Baby className="h-5 w-5 text-bentin-orange" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Adicionar Filho</h2>
                  <p className="text-sm text-gray-600">Cadastre um novo filho ou dependente para o cliente</p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setModalNovoFilho(false);
                  setClienteParaFilho('');
                }}
                className="h-9 w-9 p-0 hover:bg-gray-100 rounded-lg"
                disabled={isSubmittingFilho}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="modal-body bentin-scroll p-6" style={{ flexGrow: 1, overflowY: 'auto' }}>
              <FormularioFilho
                clienteId={clienteParaFilho}
                onSubmit={handleAdicionarFilho}
                onCancel={() => {
                  setModalNovoFilho(false);
                  setClienteParaFilho('');
                }}
                isSubmitting={isSubmittingFilho}
              />
            </div>

            <div className="modal-footer flex items-center justify-end gap-3 p-6 border-t border-border/40 bg-gray-50/50" style={{ flexShrink: 0 }}>
              <Button
                variant="outline"
                onClick={() => {
                  setModalNovoFilho(false);
                  setClienteParaFilho('');
                }}
                disabled={isSubmittingFilho}
                className="px-6"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                form="form-filho"
                disabled={isSubmittingFilho}
                className="bentin-button-primary px-6"
              >
                {isSubmittingFilho ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Filho
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GerenciarClientes;