// =====================================================
// COMPONENTE DE GERENCIAMENTO DE CLIENTES MODERNO
// =====================================================
// Interface completa para gerenciar clientes e filhos
// com design system consistente e UX aprimorada
// =====================================================

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { StatsCard } from './ui/stats-card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ModalBase } from './ui/modal-base';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { FormSection, FormField, FormGrid } from './ui/form-section';
import { LoadingState } from './ui/loading-state';
import { useClientes, Cliente, Filho } from '../hooks/useClientes';
import { EmptyState } from './ui/empty-state';
import { 
  Users, 
  UserPlus, 
  Baby, 
  Phone, 
  Mail, 
  Instagram, 
  MapPin, 
  Calendar,
  Edit3,
  Trash2,
  Search,
  Filter,
  Plus,
  Heart,
  UserCheck,
  AlertCircle,
  User,
  ContactRound,
  UserCog,
  Cake,
  ShirtIcon,
  Loader2
} from 'lucide-react';

interface FormularioClienteProps {
  cliente?: Cliente;
  onSalvar: (cliente: Omit<Cliente, 'id'>) => void;
  onCancelar: () => void;
  isLoading: boolean;
}

interface FormularioFilhoProps {
  clienteId: string;
  filho?: Filho;
  onSalvar: (filho: Omit<Filho, 'id' | 'cliente_id'>) => void;
  onCancelar: () => void;
  isLoading: boolean;
}

// Componente do Formulário de Cliente - Versão Moderna
const FormularioCliente: React.FC<FormularioClienteProps> = ({ 
  cliente, 
  onSalvar, 
  onCancelar, 
  isLoading 
}) => {
  const [formData, setFormData] = useState({
    nome: cliente?.nome || '',
    data_nascimento: cliente?.data_nascimento || '',
    telefone: cliente?.telefone || '',
    email: cliente?.email || '',
    instagram: cliente?.instagram || '',
    endereco: cliente?.endereco || '',
    observacoes: cliente?.observacoes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSalvar(formData);
  };

  const formatarTelefone = (valor: string) => {
    const apenasNumeros = valor.replace(/\D/g, '');
    if (apenasNumeros.length <= 11) {
      return apenasNumeros
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4,5})(\d{4})/, '$1-$2');
    }
    return valor;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingState message="Processando dados do cliente..." />
      </div>
    );
  }

  return (
    <form 
      id={cliente ? "form-cliente-edit" : "form-cliente"} 
      onSubmit={handleSubmit} 
      className="space-y-8"
    >
      {/* Informações Básicas */}
      <FormSection
        title="Informações Básicas"
        description="Dados principais do responsável"
        icon={<User className="h-5 w-5 text-bentin-pink" />}
      >
        <FormGrid cols={2}>
          <FormField label="Nome Completo" required>
            <Input
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Nome do responsável"
              className="bg-input-background"
              required
            />
          </FormField>

          <FormField label="Data de Nascimento">
            <Input
              type="date"
              value={formData.data_nascimento}
              onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
              className="bg-input-background"
            />
          </FormField>
        </FormGrid>
      </FormSection>

      {/* Contato */}
      <FormSection
        title="Informações de Contato"
        description="Como podemos entrar em contato"
        icon={<ContactRound className="h-5 w-5 text-bentin-blue" />}
      >
        <FormGrid cols={2}>
          <FormField label="Telefone">
            <Input
              value={formData.telefone}
              onChange={(e) => setFormData({ 
                ...formData, 
                telefone: formatarTelefone(e.target.value)
              })}
              placeholder="(11) 99999-9999"
              maxLength={15}
              className="bg-input-background"
            />
          </FormField>

          <FormField label="Email">
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@exemplo.com"
              className="bg-input-background"
            />
          </FormField>

          <FormField label="Instagram">
            <Input
              value={formData.instagram}
              onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
              placeholder="@usuario"
              className="bg-input-background"
            />
          </FormField>

          <FormField label="Endereço">
            <Input
              value={formData.endereco}
              onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
              placeholder="Rua, número, bairro"
              className="bg-input-background"
            />
          </FormField>
        </FormGrid>
      </FormSection>

      {/* Observações */}
      <FormSection
        title="Observações Adicionais"
        description="Informações extras sobre o cliente"
        icon={<UserCog className="h-5 w-5 text-bentin-green" />}
      >
        <FormField label="Observações">
          <Textarea
            value={formData.observacoes}
            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            placeholder="Informações adicionais sobre o cliente"
            rows={3}
            className="bg-input-background resize-none"
          />
        </FormField>
      </FormSection>


    </form>
  );
};

// Componente do Formulário de Filho - Versão Moderna
const FormularioFilho: React.FC<FormularioFilhoProps> = ({ 
  clienteId,
  filho, 
  onSalvar, 
  onCancelar, 
  isLoading 
}) => {
  const [formData, setFormData] = useState({
    nome: filho?.nome || '',
    data_nascimento: filho?.data_nascimento || '',
    genero: filho?.genero || '',
    tamanho_preferido: filho?.tamanho_preferido || '',
    observacoes: filho?.observacoes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSalvar(formData);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingState message="Processando dados do filho..." />
      </div>
    );
  }

  return (
    <form 
      id="form-filho" 
      onSubmit={handleSubmit} 
      className="space-y-8"
    >
      {/* Informações da Criança */}
      <FormSection
        title="Informações da Criança"
        description="Dados básicos do filho/dependente"
        icon={<Baby className="h-5 w-5 text-bentin-pink" />}
      >
        <FormGrid cols={2}>
          <FormField label="Nome" required>
            <Input
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Nome da criança"
              className="bg-input-background"
              required
            />
          </FormField>

          <FormField label="Data de Nascimento">
            <Input
              type="date"
              value={formData.data_nascimento}
              onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
              className="bg-input-background"
            />
          </FormField>
        </FormGrid>
      </FormSection>

      {/* Características */}
      <FormSection
        title="Características"
        description="Gênero e preferências de tamanho"
        icon={<ShirtIcon className="h-5 w-5 text-bentin-blue" />}
      >
        <FormGrid cols={2}>
          <FormField label="Gênero">
            <Select 
              value={formData.genero} 
              onValueChange={(value) => setFormData({ ...formData, genero: value })}
            >
              <SelectTrigger className="bg-input-background">
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
              onChange={(e) => setFormData({ ...formData, tamanho_preferido: e.target.value })}
              placeholder="Ex: 4 anos, P, M, G"
              className="bg-input-background"
            />
          </FormField>
        </FormGrid>
      </FormSection>

      {/* Observações */}
      <FormSection
        title="Observações"
        description="Preferências, alergias ou informações especiais"
        icon={<UserCog className="h-5 w-5 text-bentin-green" />}
      >
        <FormField label="Observações">
          <Textarea
            value={formData.observacoes}
            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            placeholder="Preferências, alergias, tamanhos específicos, etc."
            rows={3}
            className="bg-input-background resize-none"
          />
        </FormField>
      </FormSection>


    </form>
  );
};

// Componente Principal
export default function GerenciarClientes() {
  const {
    clientes,
    clienteSelecionado,
    stats,
    isLoading,
    error,
    carregarClientes,
    buscarCliente,
    criarCliente,
    atualizarCliente,
    desativarCliente,
    adicionarFilho,
    atualizarFilho,
    removerFilho,
    limparErro,
    selecionarCliente,
  } = useClientes();

  // Estados locais
  const [modalNovoCliente, setModalNovoCliente] = useState(false);
  const [modalEditarCliente, setModalEditarCliente] = useState(false);
  const [modalNovoFilho, setModalNovoFilho] = useState(false);
  const [clienteParaFilho, setClienteParaFilho] = useState<string>('');
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

  // Handlers
  const handleCriarCliente = async (dadosCliente: Omit<Cliente, 'id'>) => {
    const resultado = await criarCliente(dadosCliente);
    if (resultado) {
      setModalNovoCliente(false);
    }
  };

  const handleEditarCliente = async (dadosCliente: Omit<Cliente, 'id'>) => {
    if (!clienteSelecionado?.id) return;
    
    const resultado = await atualizarCliente(clienteSelecionado.id, dadosCliente);
    if (resultado) {
      setModalEditarCliente(false);
      selecionarCliente(null);
    }
  };

  const handleAdicionarFilho = async (dadosFilho: Omit<Filho, 'id' | 'cliente_id'>) => {
    const resultado = await adicionarFilho(clienteParaFilho, dadosFilho);
    if (resultado) {
      setModalNovoFilho(false);
      setClienteParaFilho('');
    }
  };

  const calcularIdade = (dataNascimento: string) => {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    const idade = hoje.getFullYear() - nascimento.getFullYear();
    const mesAtual = hoje.getMonth();
    const mesNascimento = nascimento.getMonth();
    
    if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())) {
      return idade - 1;
    }
    return idade;
  };

  return (
    <div className="space-y-6">
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

      {/* Controles Principais */}
      <Card className="bentin-card">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-3">
                <Users className="h-6 w-6 text-bentin-pink" />
                Gerenciar Clientes
              </CardTitle>
              <CardDescription className="mt-2">
                Cadastre clientes, gerencie filhos e vincule vendas
              </CardDescription>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => setModalNovoCliente(true)}
                className="bentin-button-primary"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Novo Cliente
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nome, email ou telefone..."
                  value={filtroTexto}
                  onChange={(e) => setFiltroTexto(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filtroGenero} onValueChange={setFiltroGenero}>
              <SelectTrigger className="w-full sm:w-48">
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

          {/* Lista de Clientes */}
          {isLoading ? (
            <div className="space-y-4">
              <LoadingState message="Carregando clientes..." />
            </div>
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
            <div className="space-y-4 max-h-[600px] overflow-y-auto bentin-scroll pr-2">
              {clientesFiltrados.map((cliente) => (
                <Card key={cliente.id} className="bentin-card hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-bentin-pink/10 to-bentin-pink/20">
                              <User className="h-5 w-5 text-bentin-pink" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg text-gray-900">
                                {cliente.nome}
                              </h3>
                              {(cliente.filhos?.length || 0) > 0 && (
                                <p className="text-sm text-muted-foreground">
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
                              className="hover:bg-bentin-green/10 hover:border-bentin-green hover:text-bentin-green"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Filho
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                selecionarCliente(cliente);
                                setModalEditarCliente(true);
                              }}
                              className="hover:bg-bentin-blue/10 hover:border-bentin-blue hover:text-bentin-blue"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-gray-600">
                          {cliente.telefone && (
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                              <Phone className="h-4 w-4 text-bentin-green" />
                              {cliente.telefone}
                            </div>
                          )}
                          {cliente.email && (
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                              <Mail className="h-4 w-4 text-bentin-blue" />
                              <span className="truncate">{cliente.email}</span>
                            </div>
                          )}
                          {cliente.instagram && (
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                              <Instagram className="h-4 w-4 text-bentin-pink" />
                              {cliente.instagram}
                            </div>
                          )}
                          {cliente.data_nascimento && (
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                              <Cake className="h-4 w-4 text-bentin-orange" />
                              {calcularIdade(cliente.data_nascimento)} anos
                            </div>
                          )}
                        </div>

                        {cliente.endereco && (
                          <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4 text-bentin-mint" />
                            <span className="text-gray-600">{cliente.endereco}</span>
                          </div>
                        )}

                        {cliente.filhos && cliente.filhos.length > 0 && (
                          <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-pink-50 border border-blue-100">
                            <div className="flex items-center gap-2 mb-2">
                              <Baby className="h-4 w-4 text-bentin-blue" />
                              <h4 className="font-medium text-gray-700">
                                Filhos ({cliente.filhos.length})
                              </h4>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {cliente.filhos.map((filho) => (
                                <Badge 
                                  key={filho.id} 
                                  className="bg-white/80 text-gray-700 hover:bg-white border-0 shadow-sm"
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
        </CardContent>
      </Card>

      {/* Modal Novo Cliente */}
      <ModalBase
        open={modalNovoCliente}
        onOpenChange={setModalNovoCliente}
        title="Novo Cliente"
        description="Cadastre um novo cliente responsável no sistema"
        size="3xl"
        onCancel={() => setModalNovoCliente(false)}
        onSubmit={(e) => {
          e?.preventDefault();
          const form = document.getElementById('form-cliente') as HTMLFormElement;
          if (form) form.requestSubmit();
        }}
        submitText="Criar Cliente"
        isLoading={isLoading}
        icon={<UserPlus className="h-6 w-6" />}
      >
        <FormularioCliente
          onSalvar={handleCriarCliente}
          onCancelar={() => setModalNovoCliente(false)}
          isLoading={isLoading}
        />
      </ModalBase>

      {/* Modal Editar Cliente */}
      <ModalBase
        open={modalEditarCliente}
        onOpenChange={setModalEditarCliente}
        title="Editar Cliente"
        description="Atualize as informações do cliente selecionado"
        size="3xl"
        onCancel={() => {
          setModalEditarCliente(false);
          selecionarCliente(null);
        }}
        onSubmit={(e) => {
          e?.preventDefault();
          const form = document.getElementById('form-cliente-edit') as HTMLFormElement;
          if (form) form.requestSubmit();
        }}
        submitText="Atualizar Cliente"
        isLoading={isLoading}
        icon={<Edit3 className="h-6 w-6" />}
      >
        <FormularioCliente
          cliente={clienteSelecionado || undefined}
          onSalvar={handleEditarCliente}
          onCancelar={() => {
            setModalEditarCliente(false);
            selecionarCliente(null);
          }}
          isLoading={isLoading}
        />
      </ModalBase>

      {/* Modal Novo Filho */}
      <ModalBase
        open={modalNovoFilho}
        onOpenChange={setModalNovoFilho}
        title="Adicionar Filho"
        description="Cadastre um novo filho ou dependente para o cliente"
        size="2xl"
        onCancel={() => {
          setModalNovoFilho(false);
          setClienteParaFilho('');
        }}
        onSubmit={(e) => {
          e?.preventDefault();
          const form = document.getElementById('form-filho') as HTMLFormElement;
          if (form) form.requestSubmit();
        }}
        submitText="Adicionar Filho"
        isLoading={isLoading}
        icon={<Baby className="h-6 w-6" />}
      >
        <FormularioFilho
          clienteId={clienteParaFilho}
          onSalvar={handleAdicionarFilho}
          onCancelar={() => {
            setModalNovoFilho(false);
            setClienteParaFilho('');
          }}
          isLoading={isLoading}
        />
      </ModalBase>
    </div>
  );
}