// =====================================================
// COMPONENTE GERENCIAR CLIENTES - VERSÃO CORRIGIDA
// =====================================================
// Modal completamente funcional para gerenciar clientes e filhos
// Corrige todos os problemas de formulários não funcionando
// =====================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Card, CardContent } from './ui/card';
import { StatsCard } from './ui/stats-card';
import { FormSection, FormField } from './ui/form-section';
import { LoadingState } from './ui/loading-state';
import { EmptyState } from './ui/empty-state';
import { useClientes, Cliente, Filho } from '../hooks/useClientes';
import { useToast } from './ToastProvider';
import { 
  X, Users, UserPlus, Baby, Phone, Mail, User, 
  Edit3, Plus, Search, Filter, UserCheck, Heart,
  Save, CheckCircle2, Loader2, AlertCircle
} from 'lucide-react';

interface GerenciarClientesCorrigidoProps {
  open: boolean;
  onCancel: () => void;
}

// Componente de Formulário de Cliente CORRIGIDO
const FormularioClienteCorrigido: React.FC<{
  cliente?: Cliente;
  onSubmit: (cliente: Omit<Cliente, 'id'>) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  formId: string;
  onSubmitRef?: React.MutableRefObject<(() => void) | null>;
}> = ({ cliente, onSubmit, onCancel, isSubmitting, formId, onSubmitRef }) => {
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
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    console.log('🔄 [FORM] Submit do formulário de cliente iniciado');
    console.log('📝 [FORM] Dados atuais do formulário:', formData);
    
    if (validarFormulario()) {
      try {
        console.log('📤 [FORM] Enviando dados:', formData);
        await onSubmit(formData);
        console.log('✅ [FORM] Cliente salvo com sucesso');
      } catch (error) {
        console.error('❌ [FORM] Erro ao salvar cliente:', error);
        addToast({
          type: 'error',
          title: 'Erro ao salvar',
          description: 'Não foi possível salvar o cliente. Tente novamente.'
        });
      }
    } else {
      console.log('⚠️ [FORM] Validação falhou:', errors);
      addToast({
        type: 'error',
        title: 'Dados inválidos',
        description: 'Por favor, preencha o nome do cliente.'
      });
    }
  }, [validarFormulario, formData, onSubmit, addToast, errors]);

  // Expor a função de submit via ref
  useEffect(() => {
    if (onSubmitRef) {
      onSubmitRef.current = () => handleSubmit();
    }
  }, [handleSubmit, onSubmitRef]);

  if (isSubmitting) {
    return <LoadingState message="Salvando cliente..." />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" id={formId}>
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
          icon={<Phone className="h-4 w-4" />}
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
          icon={<User className="h-4 w-4" />}
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

// Componente de Formulário de Filho CORRIGIDO
const FormularioFilhoCorrigido: React.FC<{
  clienteId: string;
  filho?: Filho;
  onSubmit: (filho: Omit<Filho, 'id' | 'cliente_id'>) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  formId: string;
  onSubmitRef?: React.MutableRefObject<(() => void) | null>;
}> = ({ clienteId, filho, onSubmit, onCancel, isSubmitting, formId, onSubmitRef }) => {
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
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    console.log('🔄 [FORM] Submit do formulário de filho iniciado');
    console.log('📝 [FORM] Dados atuais do formulário:', formData);
    
    if (validarFormulario()) {
      try {
        console.log('📤 [FORM] Enviando dados do filho:', formData);
        await onSubmit(formData);
        console.log('✅ [FORM] Filho salvo com sucesso');
      } catch (error) {
        console.error('❌ [FORM] Erro ao salvar filho:', error);
        addToast({
          type: 'error',
          title: 'Erro ao salvar',
          description: 'Não foi possível salvar o filho. Tente novamente.'
        });
      }
    } else {
      console.log('⚠️ [FORM] Validação falhou:', errors);
      addToast({
        type: 'error',
        title: 'Dados inválidos',
        description: 'Por favor, preencha o nome da criança.'
      });
    }
  }, [validarFormulario, formData, onSubmit, addToast, errors]);

  // Expor a função de submit via ref
  useEffect(() => {
    if (onSubmitRef) {
      onSubmitRef.current = () => handleSubmit();
    }
  }, [handleSubmit, onSubmitRef]);

  if (isSubmitting) {
    return <LoadingState message="Salvando filho..." />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" id={formId}>
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
          icon={<Baby className="h-4 w-4" />}
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
          icon={<User className="h-4 w-4" />}
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
 * Modal de Gerenciamento de Clientes CORRIGIDO
 */
const GerenciarClientesCorrigido: React.FC<GerenciarClientesCorrigidoProps> = ({
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
    debugAdicionarFilho,
    limparErro,
    selecionarCliente,
  } = useClientes();

  const { addToast } = useToast();

  // Estados dos submodais
  const [modalNovoCliente, setModalNovoCliente] = useState(false);
  const [modalEditarCliente, setModalEditarCliente] = useState(false);
  const [modalNovoFilho, setModalNovoFilho] = useState(false);
  const [clienteParaFilho, setClienteParaFilho] = useState<string>('');

  // Estados de loading individuais
  const [isSubmittingCliente, setIsSubmittingCliente] = useState(false);
  const [isSubmittingFilho, setIsSubmittingFilho] = useState(false);

  // Refs para conectar com os formulários
  const submitFilhoRef = useRef<(() => void) | null>(null);
  const submitClienteNovoRef = useRef<(() => void) | null>(null);
  const submitClienteEditarRef = useRef<(() => void) | null>(null);

  // Estados de filtros
  const [filtroTexto, setFiltroTexto] = useState('');

  // Filtrar clientes
  const clientesFiltrados = clientes.filter(cliente => {
    return cliente.nome.toLowerCase().includes(filtroTexto.toLowerCase()) ||
           cliente.email?.toLowerCase().includes(filtroTexto.toLowerCase()) ||
           cliente.telefone?.includes(filtroTexto);
  });

  // Handlers CORRIGIDOS
  const handleCriarCliente = useCallback(async (dadosCliente: Omit<Cliente, 'id'>) => {
    console.log('🔄 [MODAL] Iniciando criação de cliente');
    setIsSubmittingCliente(true);
    try {
      const resultado = await criarCliente(dadosCliente);
      if (resultado) {
        console.log('✅ [MODAL] Cliente criado com sucesso');
        setModalNovoCliente(false);
        addToast({
          type: 'success',
          title: '✅ Cliente cadastrado',
          description: `${dadosCliente.nome} foi cadastrado com sucesso!`
        });
      } else {
        throw new Error('Falha ao criar cliente - resultado nulo');
      }
    } catch (error) {
      console.error('❌ [MODAL] Erro ao criar cliente:', error);
      addToast({
        type: 'error',
        title: 'Erro ao cadastrar',
        description: error instanceof Error ? error.message : 'Não foi possível cadastrar o cliente.'
      });
    } finally {
      setIsSubmittingCliente(false);
    }
  }, [criarCliente, addToast]);

  const handleEditarCliente = useCallback(async (dadosCliente: Omit<Cliente, 'id'>) => {
    if (!clienteSelecionado?.id) return;
    
    console.log('🔄 [MODAL] Iniciando edição de cliente');
    setIsSubmittingCliente(true);
    try {
      const resultado = await atualizarCliente(clienteSelecionado.id, dadosCliente);
      if (resultado) {
        console.log('✅ [MODAL] Cliente atualizado com sucesso');
        setModalEditarCliente(false);
        selecionarCliente(null);
        addToast({
          type: 'success',
          title: '✅ Cliente atualizado',
          description: `${dadosCliente.nome} foi atualizado com sucesso!`
        });
      } else {
        throw new Error('Falha ao atualizar cliente - resultado nulo');
      }
    } catch (error) {
      console.error('❌ [MODAL] Erro ao atualizar cliente:', error);
      addToast({
        type: 'error',
        title: 'Erro ao atualizar',
        description: error instanceof Error ? error.message : 'Não foi possível atualizar o cliente.'
      });
    } finally {
      setIsSubmittingCliente(false);
    }
  }, [clienteSelecionado, atualizarCliente, selecionarCliente, addToast]);

  const handleAdicionarFilho = useCallback(async (dadosFilho: Omit<Filho, 'id' | 'cliente_id'>) => {
    console.log('🔄 [MODAL] Iniciando adição de filho');
    console.log('📝 [MODAL] Cliente ID:', clienteParaFilho);
    console.log('📝 [MODAL] Dados do filho:', dadosFilho);
    
    setIsSubmittingFilho(true);
    try {
      if (!clienteParaFilho || !clienteParaFilho.trim()) {
        throw new Error('ID do cliente não foi fornecido');
      }

      if (!dadosFilho.nome || !dadosFilho.nome.trim()) {
        throw new Error('Nome do filho é obrigatório');
      }

      // Primeiro: tentar o endpoint de debug para identificar o problema
      console.log('🧪 [MODAL] Primeiro teste com debug...');
      const debugResult = await debugAdicionarFilho(clienteParaFilho, dadosFilho);
      console.log('📝 [MODAL] Resultado do debug:', debugResult);

      if (!debugResult.success) {
        console.error('❌ [MODAL] Debug falhou, o problema é:', debugResult);
        throw new Error(`Erro identificado: ${debugResult.error} (etapa: ${debugResult.step})`);
      }

      console.log('✅ [MODAL] Debug funcionou! Agora tentando método normal...');
      console.log('📤 [MODAL] Chamando adicionarFilho...');
      const resultado = await adicionarFilho(clienteParaFilho, dadosFilho);
      console.log('📝 [MODAL] Resultado do adicionarFilho:', resultado);
      
      if (resultado) {
        console.log('✅ [MODAL] Filho adicionado com sucesso');
        setModalNovoFilho(false);
        setClienteParaFilho('');
        addToast({
          type: 'success',
          title: '✅ Filho adicionado',
          description: `${dadosFilho.nome} foi adicionado com sucesso!`
        });
      } else {
        console.error('❌ [MODAL] Resultado nulo do adicionarFilho');
        throw new Error('Falha ao adicionar filho - verifique se os dados estão corretos');
      }
    } catch (error) {
      console.error('❌ [MODAL] Erro ao adicionar filho:', error);
      const errorMessage = error instanceof Error ? error.message : 'Não foi possível adicionar o filho.';
      addToast({
        type: 'error',
        title: 'Erro ao adicionar filho',
        description: errorMessage
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

  // Função para submeter formulário via botão externo
  const submitFormulario = useCallback((formId: string) => {
    const form = document.getElementById(formId) as HTMLFormElement;
    if (form) {
      console.log('🔄 [MODAL] Submetendo formulário via botão externo:', formId);
      form.requestSubmit();
    } else {
      console.error('❌ [MODAL] Formulário não encontrado:', formId);
    }
  }, []);

  // Handler para ESC
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
      {/* Modal Principal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/20 backdrop-blur-sm" 
          onClick={onCancel}
        />
        
        {/* Modal */}
        <div className="modal-container relative bg-white rounded-xl shadow-xl w-[90vw] max-w-6xl flex flex-col border border-gray-200" style={{ maxHeight: '90vh', overflow: 'hidden' }}>
          
          {/* Header */}
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

          {/* Conteúdo scrollável */}
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
                                    <p className="text-xs text-gray-600">
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

      {/* Submodal: Novo Cliente */}
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
              <FormularioClienteCorrigido
                onSubmit={handleCriarCliente}
                onCancel={() => setModalNovoCliente(false)}
                isSubmitting={isSubmittingCliente}
                formId="form-cliente-novo"
                onSubmitRef={submitClienteNovoRef}
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
                type="button"
                onClick={() => {
                  console.log('🔄 [MODAL] Botão criar cliente clicado...');
                  if (submitClienteNovoRef.current) {
                    submitClienteNovoRef.current();
                  } else {
                    console.error('❌ [MODAL] submitClienteNovoRef.current é null');
                  }
                }}
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

      {/* Submodal: Editar Cliente */}
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
              <FormularioClienteCorrigido
                cliente={clienteSelecionado || undefined}
                onSubmit={handleEditarCliente}
                onCancel={() => {
                  setModalEditarCliente(false);
                  selecionarCliente(null);
                }}
                isSubmitting={isSubmittingCliente}
                formId="form-cliente-editar"
                onSubmitRef={submitClienteEditarRef}
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
                type="button"
                onClick={() => {
                  console.log('🔄 [MODAL] Botão editar cliente clicado...');
                  if (submitClienteEditarRef.current) {
                    submitClienteEditarRef.current();
                  } else {
                    console.error('❌ [MODAL] submitClienteEditarRef.current é null');
                  }
                }}
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

      {/* Submodal: Novo Filho */}
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
              <FormularioFilhoCorrigido
                clienteId={clienteParaFilho}
                onSubmit={handleAdicionarFilho}
                onCancel={() => {
                  setModalNovoFilho(false);
                  setClienteParaFilho('');
                }}
                isSubmitting={isSubmittingFilho}
                formId="form-filho-novo"
                onSubmitRef={submitFilhoRef}
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
                type="button"
                onClick={() => {
                  console.log('🔄 [MODAL] Botão clicado, chamando submitFilhoRef...');
                  if (submitFilhoRef.current) {
                    submitFilhoRef.current();
                  } else {
                    console.error('❌ [MODAL] submitFilhoRef.current é null');
                  }
                }}
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

export default GerenciarClientesCorrigido;