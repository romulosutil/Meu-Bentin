// =====================================================
// COMPONENTE GERENCIAR CLIENTES - VERSÃO CORRIGIDA COM MÁSCARAS
// =====================================================
// Correção de erros de undefined/null com verificações defensivas
// Implementa máscaras de input de forma segura
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
import { useClientes, Cliente, Filho } from '../hooks/useClientes';
import { useToast } from './ToastProvider';
import { 
  X, Users, UserPlus, Baby, Phone, Mail, User, 
  Edit3, Plus, Search, Filter, UserCheck, Heart,
  Save, CheckCircle2, Loader2, AlertCircle, Calendar,
  MapPin, MessageSquare, Eye, Shirt, ShoppingBag,
  Info, Tag, Cake
} from 'lucide-react';

interface GerenciarClientesFixedMascarasProps {
  open: boolean;
  onCancel: () => void;
}

// Tamanhos padrão (mesmos do FormularioProdutoModerno)
const TAMANHOS_PADRAO = ['RN', '1', '2', '3', '4', '6', '8', '10', '12', '14', '16', 'P', 'M', 'G', 'GG'];

// Função para formatar telefone com máscara
const formatarTelefone = (value: string): string => {
  if (!value) return '';
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, (_, p1, p2, p3) => {
      if (p3) return `(${p1}) ${p2}-${p3}`;
      if (p2) return `(${p1}) ${p2}`;
      if (p1) return `(${p1}`;
      return '';
    });
  } else {
    return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, (_, p1, p2, p3) => {
      if (p3) return `(${p1}) ${p2}-${p3}`;
      if (p2) return `(${p1}) ${p2}`;
      if (p1) return `(${p1}`;
      return '';
    });
  }
};

// Função para formatar data DD/MM/AAAA
const formatarData = (value: string): string => {
  if (!value) return '';
  const numbers = value.replace(/\D/g, '');
  return numbers.replace(/(\d{2})(\d{2})(\d{0,4})/, (_, day, month, year) => {
    if (year) return `${day}/${month}/${year}`;
    if (month) return `${day}/${month}`;
    return day;
  });
};

// Função para formatar Instagram
const formatarInstagram = (value: string): string => {
  if (!value) return '';
  const cleaned = value.replace(/[^a-zA-Z0-9._]/g, '');
  return cleaned.startsWith('@') ? cleaned : '@' + cleaned;
};

// Componente de Formulário de Cliente COM MÁSCARAS SEGURAS
const FormularioClienteFixedMascaras: React.FC<{
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
  const handleTelefoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatarTelefone(e.target.value);
    setFormData(prev => ({ ...prev, telefone: formatted }));
  }, []);

  const handleDataNascimentoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatarData(e.target.value);
    setFormData(prev => ({ ...prev, data_nascimento: formatted }));
  }, []);

  const handleInstagramChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatarInstagram(e.target.value);
    setFormData(prev => ({ ...prev, instagram: formatted }));
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
        // Preparar dados para o banco - converter data se necessário
        const dadosParaEnviar = { ...formData };
        
        // Converter data DD/MM/AAAA para AAAA-MM-DD se necessário
        if (dadosParaEnviar.data_nascimento && dadosParaEnviar.data_nascimento.includes('/')) {
          const [day, month, year] = dadosParaEnviar.data_nascimento.split('/');
          if (day && month && year && year.length === 4) {
            dadosParaEnviar.data_nascimento = `${year}-${month}-${day}`;
          }
        }

        console.log('📤 [FORM] Enviando dados:', dadosParaEnviar);
        await onSubmit(dadosParaEnviar);
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

  // Converter data do banco (AAAA-MM-DD) para display (DD/MM/AAAA)
  const getDataDisplay = (data: string) => {
    if (!data) return '';
    if (data.includes('-')) {
      const [year, month, day] = data.split('-');
      return `${day}/${month}/${year}`;
    }
    return data;
  };

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
                value={getDataDisplay(formData.data_nascimento)}
                onChange={handleDataNascimentoChange}
                placeholder="DD/MM/AAAA"
                maxLength={10}
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
                  onChange={handleTelefoneChange}
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
                  onChange={handleInstagramChange}
                  placeholder="@usuario"
                  maxLength={31}
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

/**
 * Modal de Gerenciamento de Clientes - VERSÃO CORRIGIDA COM MÁSCARAS
 */
const GerenciarClientesFixedMascaras: React.FC<GerenciarClientesFixedMascarasProps> = ({
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

  // Estados de loading individuais
  const [isSubmittingCliente, setIsSubmittingCliente] = useState(false);

  // Refs para conectar com os formulários
  const submitClienteNovoRef = useRef<(() => void) | null>(null);
  const submitClienteEditarRef = useRef<(() => void) | null>(null);

  // Estados de filtros
  const [filtroTexto, setFiltroTexto] = useState('');

  // Filtrar clientes com verificações de segurança
  const clientesFiltrados = useMemo(() => {
    if (!Array.isArray(clientes)) return [];
    
    return clientes.filter(cliente => {
      if (!cliente || !cliente.nome) return false;
      
      const nome = (cliente.nome || '').toLowerCase();
      const email = (cliente.email || '').toLowerCase();
      const telefone = (cliente.telefone || '');
      
      return nome.includes(filtroTexto.toLowerCase()) ||
             email.includes(filtroTexto.toLowerCase()) ||
             telefone.includes(filtroTexto);
    });
  }, [clientes, filtroTexto]);

  // Handlers com verificação de segurança
  const handleCriarCliente = useCallback(async (dadosCliente: Omit<Cliente, 'id'>) => {
    console.log('🔄 [MODAL] Iniciando criação de cliente');
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
          description: `Cliente foi cadastrado com sucesso!`
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
          description: `Cliente foi atualizado com sucesso!`
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
                <p className="text-sm text-gray-600">Cadastre e gerencie seus clientes com máscaras de input</p>
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
                                  <h3 className="font-semibold text-gray-900">{cliente.nome || 'Nome não informado'}</h3>
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
                                {cliente.instagram && (
                                  <div className="flex items-center gap-2">
                                    <MessageSquare className="h-3 w-3" />
                                    <span>{cliente.instagram}</span>
                                  </div>
                                )}
                              </div>
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
              <FormularioClienteFixedMascaras
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
              <FormularioClienteFixedMascaras
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
    </>
  );
};

export default GerenciarClientesFixedMascaras;