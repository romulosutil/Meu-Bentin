// =====================================================
// COMPONENTE GERENCIAR CLIENTES - VERSÃO SEGURA COM MÁSCARAS
// =====================================================
// Correção do erro .toString() com verificações de null/undefined
// Mantém todas as máscaras de input implementadas
// =====================================================

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { StatsCard } from './ui/stats-card';
import { FormSection, FormField } from './ui/form-section';
import { LoadingState } from './ui/loading-state';
import { EmptyState } from './ui/empty-state';
import { PhoneInput, DateInput, InstagramInput } from './ui/masked-input';
import { useClientes, Cliente, Filho } from '../hooks/useClientes';
import { useToast } from './ToastProvider';
import { 
  X, Users, UserPlus, Baby, Phone, Mail, User, 
  Edit3, Plus, Search, Filter, UserCheck, Heart,
  Save, CheckCircle2, Loader2, AlertCircle, Calendar,
  MapPin, MessageSquare, Eye, Shirt, ShoppingBag,
  Info, Tag, Cake
} from 'lucide-react';

interface GerenciarClientesSeguroProps {
  open: boolean;
  onCancel: () => void;
}

// Tamanhos padrão (mesmos do FormularioProdutoModerno)
const TAMANHOS_PADRAO = ['RN', '1', '2', '3', '4', '6', '8', '10', '12', '14', '16', 'P', 'M', 'G', 'GG'];

// Componente de Formulário de Cliente COM MÁSCARAS
const FormularioClienteComMascaras: React.FC<{
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
        nome: cliente.nome || '',
        data_nascimento: cliente.data_nascimento || '',
        telefone: cliente.telefone || '',
        email: cliente.email || '',
        instagram: cliente.instagram || '',
        endereco: cliente.endereco || '',
        observacoes: cliente.observacoes || '',
        ativo: cliente.ativo ?? true
      });
    }
  }, [cliente]);

  // Handlers para campos com máscara
  const handleTelefoneChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, telefone: value }));
  }, []);

  const handleDataNascimentoChange = useCallback((value: string) => {
    // Converter de DD/MM/AAAA para AAAA-MM-DD (formato do banco)
    if (value && value.length === 8) {
      const day = value.slice(0, 2);
      const month = value.slice(2, 4);
      const year = value.slice(4, 8);
      const dateFormatted = `${year}-${month}-${day}`;
      setFormData(prev => ({ ...prev, data_nascimento: dateFormatted }));
    } else {
      setFormData(prev => ({ ...prev, data_nascimento: '' }));
    }
  }, []);

  const handleInstagramChange = useCallback((value: string) => {
    // Garantir que o valor salvo no banco tenha o @
    const instagramValue = value.startsWith('@') ? value : `@${value}`;
    setFormData(prev => ({ ...prev, instagram: instagramValue }));
  }, []);

  // Converter data do banco (AAAA-MM-DD) para formato da máscara (DDMMAAAA)
  const getDataParaMascara = useCallback((data: string) => {
    if (!data) return '';
    try {
      const [year, month, day] = data.split('-');
      return day && month && year ? `${day}${month}${year}` : '';
    } catch (error) {
      console.warn('Erro ao converter data:', data, error);
      return '';
    }
  }, []);

  // Converter Instagram do banco para a máscara (remover @ se existir)
  const getInstagramParaMascara = useCallback((instagram: string) => {
    if (!instagram) return '';
    return instagram.startsWith('@') ? instagram.slice(1) : instagram;
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
              <DateInput
                id="data_nascimento"
                initialValue={getDataParaMascara(formData.data_nascimento)}
                onValueChange={handleDataNascimentoChange}
                disabled={isSubmitting}
                className="h-10"
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
                <PhoneInput
                  id="telefone"
                  initialValue={formData.telefone}
                  onValueChange={handleTelefoneChange}
                  disabled={isSubmitting}
                  className="h-10"
                  error={errors.telefone}
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
                <InstagramInput
                  id="instagram"
                  initialValue={getInstagramParaMascara(formData.instagram)}
                  onValueChange={handleInstagramChange}
                  disabled={isSubmitting}
                  className="h-10"
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
          icon={<MessageSquare className="h-4 w-4" />}
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

// Componente de Formulário de Filho COM MÁSCARA DE DATA
const FormularioFilhoComMascaras: React.FC<{
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
        nome: filho.nome || '',
        data_nascimento: filho.data_nascimento || '',
        genero: filho.genero || '',
        tamanho_preferido: filho.tamanho_preferido || '',
        observacoes: filho.observacoes || ''
      });
    }
  }, [filho]);

  // Handler para data de nascimento
  const handleDataNascimentoChange = useCallback((value: string) => {
    // Converter de DD/MM/AAAA para AAAA-MM-DD (formato do banco)
    if (value && value.length === 8) {
      const day = value.slice(0, 2);
      const month = value.slice(2, 4);
      const year = value.slice(4, 8);
      const dateFormatted = `${year}-${month}-${day}`;
      setFormData(prev => ({ ...prev, data_nascimento: dateFormatted }));
    } else {
      setFormData(prev => ({ ...prev, data_nascimento: '' }));
    }
  }, []);

  // Converter data do banco (AAAA-MM-DD) para formato da máscara (DDMMAAAA)
  const getDataParaMascara = useCallback((data: string) => {
    if (!data) return '';
    try {
      const [year, month, day] = data.split('-');
      return day && month && year ? `${day}${month}${year}` : '';
    } catch (error) {
      console.warn('Erro ao converter data:', data, error);
      return '';
    }
  }, []);

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
              <DateInput
                id="data_nascimento_filho"
                initialValue={getDataParaMascara(formData.data_nascimento)}
                onValueChange={handleDataNascimentoChange}
                disabled={isSubmitting}
                className="h-10"
              />
            </FormField>
          </div>
        </FormSection>

        {/* Características */}
        <FormSection 
          title="Características" 
          description="Gênero e preferências de tamanho"
          icon={<Shirt className="h-4 w-4" />}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Gênero">
                <Select 
                  value={formData.genero} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, genero: value }))}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="h-10 z-50">
                    <SelectValue placeholder="Selecione o gênero" />
                  </SelectTrigger>
                  <SelectContent className="z-[60]" side="bottom" align="start">
                    <SelectItem value="masculino">👦 Masculino</SelectItem>
                    <SelectItem value="feminino">👧 Feminino</SelectItem>
                    <SelectItem value="unissex">🧒 Unissex</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Tamanho Preferido">
                <Select
                  value={formData.tamanho_preferido}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, tamanho_preferido: value }))}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="h-10 z-50">
                    <SelectValue placeholder="Selecione o tamanho" />
                  </SelectTrigger>
                  <SelectContent className="z-[60]" side="bottom" align="start">
                    {TAMANHOS_PADRAO.map((tamanho) => (
                      <SelectItem key={tamanho} value={tamanho}>
                        {tamanho}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          </div>
        </FormSection>

        {/* Observações */}
        <FormSection 
          title="Observações" 
          description="Preferências, alergias ou informações especiais"
          icon={<MessageSquare className="h-4 w-4" />}
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

// Componente de Visualização de Filho
const VisualizacaoFilho: React.FC<{
  filho: Filho;
  onEdit?: () => void;
  onDelete?: () => void;
}> = ({ filho, onEdit, onDelete }) => {
  
  const calcularIdade = useCallback((dataNascimento: string) => {
    try {
      const hoje = new Date();
      const nascimento = new Date(dataNascimento);
      const idade = hoje.getFullYear() - nascimento.getFullYear();
      const mesAtual = hoje.getMonth();
      const mesNascimento = nascimento.getMonth();
      
      if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())) {
        return idade - 1;
      }
      return idade;
    } catch (error) {
      console.warn('Erro ao calcular idade:', error);
      return 0;
    }
  }, []);

  const getGeneroIcon = (genero: string) => {
    switch (genero) {
      case 'feminino': return '👧';
      case 'masculino': return '👦';
      default: return '🧒';
    }
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-pink-50 border border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{getGeneroIcon(filho.genero || '')}</div>
            <div>
              <h4 className="font-semibold text-gray-900">{filho.nome}</h4>
              {filho.data_nascimento && (
                <p className="text-sm text-gray-600">
                  {calcularIdade(filho.data_nascimento)} anos
                </p>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            {onEdit && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onEdit}
                className="h-8 w-8 p-0 hover:bg-white/60"
              >
                <Edit3 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          {filho.data_nascimento && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-white/60">
              <Cake className="h-3 w-3 text-bentin-orange" />
              <span className="text-gray-700">
                {new Date(filho.data_nascimento).toLocaleDateString('pt-BR')}
              </span>
            </div>
          )}
          
          {filho.genero && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-white/60">
              <User className="h-3 w-3 text-bentin-blue" />
              <span className="text-gray-700 capitalize">{filho.genero}</span>
            </div>
          )}
          
          {filho.tamanho_preferido && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-white/60">
              <Shirt className="h-3 w-3 text-bentin-green" />
              <span className="text-gray-700">Tamanho {filho.tamanho_preferido}</span>
            </div>
          )}
        </div>

        {filho.observacoes && (
          <div className="mt-3 p-2 rounded-lg bg-white/60">
            <div className="flex items-start gap-2">
              <MessageSquare className="h-3 w-3 text-bentin-mint mt-0.5" />
              <p className="text-sm text-gray-700">{filho.observacoes}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Modal de Gerenciamento de Clientes VERSÃO SEGURA COM MÁSCARAS
 */
const GerenciarClientesSeguro: React.FC<GerenciarClientesSeguroProps> = ({
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
    limparErro,
    selecionarCliente,
    recarregarClientes
  } = useClientes();

  const { addToast } = useToast();

  // Estados dos submodals
  const [modalNovoCliente, setModalNovoCliente] = useState(false);
  const [modalEditarCliente, setModalEditarCliente] = useState(false);
  const [modalNovoFilho, setModalNovoFilho] = useState(false);
  const [modalVisualizarCliente, setModalVisualizarCliente] = useState(false);
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

  // Filtrar clientes com deduplicação - COM VERIFICAÇÃO DE SEGURANÇA
  const clientesFiltrados = useMemo(() => {
    if (!Array.isArray(clientes)) return [];
    
    // Primeiro, deduplica por ID
    const clientesUnicos = clientes.reduce((acc, cliente) => {
      if (!cliente || !cliente.id) return acc;
      const existe = acc.find(c => c.id === cliente.id);
      if (!existe) {
        acc.push(cliente);
      }
      return acc;
    }, [] as Cliente[]);

    // Depois filtra pelo texto
    return clientesUnicos.filter(cliente => {
      if (!cliente) return false;
      
      const nome = cliente.nome || '';
      const email = cliente.email || '';
      const telefone = cliente.telefone || '';
      
      return nome.toLowerCase().includes(filtroTexto.toLowerCase()) ||
             email.toLowerCase().includes(filtroTexto.toLowerCase()) ||
             telefone.includes(filtroTexto);
    });
  }, [clientes, filtroTexto]);

  // Handlers COM VERIFICAÇÃO DE SEGURANÇA
  const handleCriarCliente = useCallback(async (dadosCliente: Omit<Cliente, 'id'>) => {
    console.log('🔄 [MODAL] Iniciando criação de cliente');
    console.log('📝 [MODAL] Dados com máscaras aplicadas:', dadosCliente);
    setIsSubmittingCliente(true);
    try {
      const resultado = await criarCliente(dadosCliente);
      if (resultado) {
        console.log('✅ [MODAL] Cliente criado com sucesso');
        setModalNovoCliente(false);
        await recarregarClientes();
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
  }, [criarCliente, recarregarClientes, addToast]);

  const handleEditarCliente = useCallback(async (dadosCliente: Omit<Cliente, 'id'>) => {
    if (!clienteSelecionado?.id) return;
    
    console.log('🔄 [MODAL] Iniciando edição de cliente');
    console.log('📝 [MODAL] Dados com máscaras aplicadas:', dadosCliente);
    setIsSubmittingCliente(true);
    try {
      const resultado = await atualizarCliente(clienteSelecionado.id, dadosCliente);
      if (resultado) {
        console.log('✅ [MODAL] Cliente atualizado com sucesso');
        setModalEditarCliente(false);
        selecionarCliente(null);
        await recarregarClientes();
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
  }, [clienteSelecionado, atualizarCliente, selecionarCliente, recarregarClientes, addToast]);

  const handleAdicionarFilho = useCallback(async (dadosFilho: Omit<Filho, 'id' | 'cliente_id'>) => {
    console.log('🔄 [MODAL] Iniciando adição de filho');
    console.log('📝 [MODAL] Cliente ID:', clienteParaFilho);
    console.log('📝 [MODAL] Dados do filho com máscaras:', dadosFilho);
    
    setIsSubmittingFilho(true);
    try {
      if (!clienteParaFilho || !clienteParaFilho.trim()) {
        throw new Error('ID do cliente não foi fornecido');
      }

      if (!dadosFilho.nome || !dadosFilho.nome.trim()) {
        throw new Error('Nome do filho é obrigatório');
      }

      console.log('📤 [MODAL] Chamando adicionarFilho...');
      const resultado = await adicionarFilho(clienteParaFilho, dadosFilho);
      console.log('📝 [MODAL] Resultado do adicionarFilho:', resultado);
      
      if (resultado) {
        console.log('✅ [MODAL] Filho adicionado com sucesso');
        setModalNovoFilho(false);
        setClienteParaFilho('');
        await recarregarClientes();
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
  }, [clienteParaFilho, adicionarFilho, recarregarClientes, addToast]);

  const calcularIdade = useCallback((dataNascimento: string) => {
    try {
      const hoje = new Date();
      const nascimento = new Date(dataNascimento);
      const idade = hoje.getFullYear() - nascimento.getFullYear();
      const mesAtual = hoje.getMonth();
      const mesNascimento = nascimento.getMonth();
      
      if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())) {
        return idade - 1;
      }
      return idade;
    } catch (error) {
      console.warn('Erro ao calcular idade:', error);
      return 0;
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
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-100 to-green-100">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Gerenciar Clientes</h2>
                <p className="text-sm text-gray-600">Cadastre e gerencie seus clientes e dependentes</p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Aviso sobre Máscaras */}
          <div className="p-4 bg-blue-50 border-b border-blue-200">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-600" />
              <p className="text-sm text-blue-700">
                <strong>Máscaras implementadas:</strong> Telefone (XX) XXXXX-XXXX • Data DD/MM/AAAA • Instagram @usuario
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="modal-body flex-1 overflow-y-auto p-6" style={{ flexGrow: 1 }}>
            {isLoading ? (
              <LoadingState message="Carregando clientes..." />
            ) : error ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error}
                  <Button 
                    onClick={limparErro} 
                    variant="link" 
                    className="p-0 h-auto ml-2"
                  >
                    Tentar novamente
                  </Button>
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-6">
                
                {/* Estatísticas - COM VERIFICAÇÃO DE SEGURANÇA */}
                {stats && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <StatsCard
                      title="Total de Clientes"
                      value={(stats.totalClientes || 0).toString()}
                      icon={<Users className="h-4 w-4" />}
                      trend={(stats.totalClientes || 0) > 0 ? 'up' : 'neutral'}
                      description="Clientes cadastrados"
                    />
                    <StatsCard
                      title="Clientes Ativos"
                      value={(stats.clientesAtivos || 0).toString()}
                      icon={<UserCheck className="h-4 w-4" />}
                      trend={(stats.clientesAtivos || 0) > 0 ? 'up' : 'neutral'}
                      description="Com compras recentes"
                    />
                    <StatsCard
                      title="Total de Filhos"
                      value={(stats.totalFilhos || 0).toString()}
                      icon={<Baby className="h-4 w-4" />}
                      trend={(stats.totalFilhos || 0) > 0 ? 'up' : 'neutral'}
                      description="Dependentes cadastrados"
                    />
                    <StatsCard
                      title="Média de Filhos"
                      value={(stats.mediaFilhosPorCliente || 0).toFixed(1)}
                      icon={<Heart className="h-4 w-4" />}
                      trend="neutral"
                      description="Por cliente"
                    />
                  </div>
                )}

                {/* Ações e Filtros */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setModalNovoCliente(true)}
                      className="bg-bentin-blue hover:bg-bentin-blue/90 text-white"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Novo Cliente
                    </Button>
                  </div>

                  <div className="flex gap-2 items-center">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Buscar clientes..."
                        value={filtroTexto}
                        onChange={(e) => setFiltroTexto(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                  </div>
                </div>

                {/* Lista de Clientes */}
                {clientesFiltrados.length === 0 ? (
                  <EmptyState
                    icon={<Users className="h-8 w-8" />}
                    title="Nenhum cliente encontrado"
                    description={filtroTexto ? "Nenhum cliente corresponde ao filtro aplicado." : "Comece cadastrando seu primeiro cliente."}
                    action={
                      !filtroTexto ? (
                        <Button onClick={() => setModalNovoCliente(true)}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Cadastrar Primeiro Cliente
                        </Button>
                      ) : undefined
                    }
                  />
                ) : (
                  <div className="grid gap-4">
                    {clientesFiltrados.map((cliente) => (
                      <Card key={cliente.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-gray-500" />
                                  <h3 className="font-semibold text-gray-900">{cliente.nome}</h3>
                                  {!cliente.ativo && (
                                    <Badge variant="secondary" className="text-xs">
                                      Inativo
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                {cliente.telefone && (
                                  <div className="flex items-center gap-2">
                                    <Phone className="h-3 w-3" />
                                    <span>{cliente.telefone}</span>
                                  </div>
                                )}
                                {cliente.email && (
                                  <div className="flex items-center gap-2">
                                    <Mail className="h-3 w-3" />
                                    <span>{cliente.email}</span>
                                  </div>
                                )}
                                {cliente.data_nascimento && (
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-3 w-3" />
                                    <span>{calcularIdade(cliente.data_nascimento)} anos</span>
                                  </div>
                                )}
                              </div>

                              {/* Filhos do Cliente */}
                              {cliente.filhos && cliente.filhos.length > 0 && (
                                <div className="mt-3">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Baby className="h-3 w-3 text-gray-500" />
                                    <span className="text-sm font-medium text-gray-700">
                                      Filhos ({cliente.filhos.length})
                                    </span>
                                  </div>
                                  <div className="grid gap-2">
                                    {cliente.filhos.map((filho) => (
                                      <VisualizacaoFilho 
                                        key={filho.id} 
                                        filho={filho}
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col gap-2 ml-4">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  selecionarCliente(cliente);
                                  setModalEditarCliente(true);
                                }}
                              >
                                <Edit3 className="h-3 w-3 mr-1" />
                                Editar
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setClienteParaFilho(cliente.id);
                                  setModalNovoFilho(true);
                                }}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Filho
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer flex justify-end p-4 border-t border-border/40 bg-gray-50" style={{ flexShrink: 0 }}>
            <Button onClick={onCancel} variant="outline">
              Fechar
            </Button>
          </div>
        </div>
      </div>

      {/* Sub-modais */}
      
      {/* Modal Novo Cliente */}
      {modalNovoCliente && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setModalNovoCliente(false)} />
          <div className="modal-container relative bg-white rounded-xl shadow-xl w-[90vw] max-w-2xl">
            <div className="modal-header flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">Novo Cliente</h3>
              <Button variant="ghost" size="sm" onClick={() => setModalNovoCliente(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="modal-body p-6 max-h-[70vh] overflow-y-auto">
              <FormularioClienteComMascaras
                onSubmit={handleCriarCliente}
                onCancel={() => setModalNovoCliente(false)}
                isSubmitting={isSubmittingCliente}
                formId="form-novo-cliente"
                onSubmitRef={submitClienteNovoRef}
              />
            </div>
            <div className="modal-footer flex justify-end gap-2 p-6 border-t">
              <Button variant="outline" onClick={() => setModalNovoCliente(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={() => submitClienteNovoRef.current?.()}
                disabled={isSubmittingCliente}
                className="bg-bentin-blue hover:bg-bentin-blue/90"
              >
                {isSubmittingCliente ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Cliente
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Cliente */}
      {modalEditarCliente && clienteSelecionado && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setModalEditarCliente(false)} />
          <div className="modal-container relative bg-white rounded-xl shadow-xl w-[90vw] max-w-2xl">
            <div className="modal-header flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">Editar Cliente</h3>
              <Button variant="ghost" size="sm" onClick={() => setModalEditarCliente(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="modal-body p-6 max-h-[70vh] overflow-y-auto">
              <FormularioClienteComMascaras
                cliente={clienteSelecionado}
                onSubmit={handleEditarCliente}
                onCancel={() => setModalEditarCliente(false)}
                isSubmitting={isSubmittingCliente}
                formId="form-editar-cliente"
                onSubmitRef={submitClienteEditarRef}
              />
            </div>
            <div className="modal-footer flex justify-end gap-2 p-6 border-t">
              <Button variant="outline" onClick={() => setModalEditarCliente(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={() => submitClienteEditarRef.current?.()}
                disabled={isSubmittingCliente}
                className="bg-bentin-green hover:bg-bentin-green/90"
              >
                {isSubmittingCliente ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Novo Filho */}
      {modalNovoFilho && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setModalNovoFilho(false)} />
          <div className="modal-container relative bg-white rounded-xl shadow-xl w-[90vw] max-w-2xl">
            <div className="modal-header flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">Adicionar Filho</h3>
              <Button variant="ghost" size="sm" onClick={() => setModalNovoFilho(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="modal-body p-6 max-h-[70vh] overflow-y-auto">
              <FormularioFilhoComMascaras
                clienteId={clienteParaFilho}
                onSubmit={handleAdicionarFilho}
                onCancel={() => setModalNovoFilho(false)}
                isSubmitting={isSubmittingFilho}
                formId="form-novo-filho"
                onSubmitRef={submitFilhoRef}
              />
            </div>
            <div className="modal-footer flex justify-end gap-2 p-6 border-t">
              <Button variant="outline" onClick={() => setModalNovoFilho(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={() => submitFilhoRef.current?.()}
                disabled={isSubmittingFilho}
                className="bg-bentin-pink hover:bg-bentin-pink/90"
              >
                {isSubmittingFilho ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
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

export default GerenciarClientesSeguro;