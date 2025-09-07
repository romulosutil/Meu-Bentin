// =====================================================
// COMPONENTE DE SELEÇÃO DE CLIENTE CORRIGIDO
// =====================================================
// Versão corrigida do componente de seleção de cliente
// Com formulários funcionais e logs detalhados
// =====================================================

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { useClientes, type Cliente, type Filho } from '../hooks/useClientes';
import { 
  Users, 
  UserPlus, 
  Search, 
  Phone, 
  Mail, 
  Instagram, 
  Calendar,
  Baby,
  CheckCircle,
  AlertCircle,
  Plus,
  X,
  Settings
} from 'lucide-react';

interface SelecionarClienteCorrigidoProps {
  clienteSelecionado: Cliente | null;
  onClienteSelect: (cliente: Cliente) => void;
  onClienteClear: () => void;
  onNovoCliente: () => void;
  className?: string;
}

interface FormularioNovoClienteCorrigidoProps {
  onSalvar: (cliente: Omit<Cliente, 'id'>) => void;
  onCancelar: () => void;
  isLoading: boolean;
}

interface NovoFilho {
  nome: string;
  data_nascimento: string;
  genero: 'masculino' | 'feminino' | 'unissex';
}

// Componente de Formulário Rápido para Novo Cliente CORRIGIDO
const FormularioNovoClienteCorrigido: React.FC<FormularioNovoClienteCorrigidoProps> = ({ 
  onSalvar, 
  onCancelar, 
  isLoading 
}) => {
  const [formData, setFormData] = useState({
    nome: '',
    data_nascimento: '',
    telefone: '',
    email: '',
    instagram: '',
    observacoes: '',
  });

  const [filhos, setFilhos] = useState<NovoFilho[]>([]);

  const formatarTelefone = (valor: string) => {
    const apenasNumeros = valor.replace(/\D/g, '');
    if (apenasNumeros.length <= 11) {
      return apenasNumeros
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4,5})(\d{4})/, '$1-$2');
    }
    return valor;
  };

  const formatarInstagram = (valor: string) => {
    if (valor && !valor.startsWith('@')) {
      return '@' + valor.replace('@', '');
    }
    return valor;
  };

  const adicionarFilho = () => {
    setFilhos([...filhos, { nome: '', data_nascimento: '', genero: 'unissex' }]);
  };

  const removerFilho = (index: number) => {
    setFilhos(filhos.filter((_, i) => i !== index));
  };

  const atualizarFilho = (index: number, campo: keyof NovoFilho, valor: string) => {
    const novosFilhos = [...filhos];
    novosFilhos[index] = { ...novosFilhos[index], [campo]: valor };
    setFilhos(novosFilhos);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔄 [FORM_SELECIONAR_CORRIGIDO] Submit iniciado');
    console.log('📝 [FORM_SELECIONAR_CORRIGIDO] Dados do formulário:', formData);
    console.log('👶 [FORM_SELECIONAR_CORRIGIDO] Filhos:', filhos);
    
    // Dados do cliente com filhos como propriedade extra
    const clienteCompleto = {
      ...formData,
      filhos: filhos.filter(filho => filho.nome.trim()),
      ativo: true
    };
    
    console.log('📤 [FORM_SELECIONAR_CORRIGIDO] Enviando dados:', clienteCompleto);
    onSalvar(clienteCompleto);
  };

  const calcularIdade = (dataNascimento: string) => {
    if (!dataNascimento) return null;
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    return hoje.getFullYear() - nascimento.getFullYear();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" id="form-novo-cliente-rapido">
      {/* Dados Básicos do Cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-bentin-pink" />
            Dados do Responsável
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Nome do responsável"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_nascimento">Data de Nascimento</Label>
              <Input
                id="data_nascimento"
                type="date"
                value={formData.data_nascimento}
                onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  telefone: formatarTelefone(e.target.value)
                })}
                placeholder="(11) 99999-9999"
                maxLength={15}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemplo.com"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={formData.instagram}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  instagram: formatarInstagram(e.target.value)
                })}
                placeholder="@usuario"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Informações adicionais sobre o cliente"
              rows={2}
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Seção de Filhos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Baby className="h-5 w-5 text-bentin-green" />
              Filhos ({filhos.length})
            </CardTitle>
            <Button
              type="button"
              onClick={adicionarFilho}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Filho
            </Button>
          </div>
          <CardDescription>
            Adicione informações dos filhos para personalizar as vendas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filhos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Baby className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum filho adicionado ainda</p>
              <p className="text-sm">Clique em "Adicionar Filho" para começar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filhos.map((filho, index) => (
                <div key={index} className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Filho {index + 1}</h4>
                    <Button
                      type="button"
                      onClick={() => removerFilho(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label>Nome *</Label>
                      <Input
                        value={filho.nome}
                        onChange={(e) => atualizarFilho(index, 'nome', e.target.value)}
                        placeholder="Nome da criança"
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Data de Nascimento</Label>
                      <Input
                        type="date"
                        value={filho.data_nascimento}
                        onChange={(e) => atualizarFilho(index, 'data_nascimento', e.target.value)}
                        disabled={isLoading}
                      />
                      {filho.data_nascimento && (
                        <p className="text-xs text-gray-500">
                          {calcularIdade(filho.data_nascimento)} anos
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Gênero</Label>
                      <Select 
                        value={filho.genero} 
                        onValueChange={(value) => atualizarFilho(index, 'genero', value)}
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="masculino">Masculino</SelectItem>
                          <SelectItem value="feminino">Feminino</SelectItem>
                          <SelectItem value="unissex">Unissex</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex gap-3 justify-end">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancelar}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading || !formData.nome.trim()}
          className="bentin-button-primary"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full" />
              Salvando...
            </>
          ) : (
            'Salvar Cliente'
          )}
        </Button>
      </div>
    </form>
  );
};

// Componente Principal de Seleção de Cliente CORRIGIDO
export default function SelecionarClienteCorrigido({ 
  clienteSelecionado, 
  onClienteSelect, 
  onClienteClear, 
  onNovoCliente,
  className = ""
}: SelecionarClienteCorrigidoProps) {
  const { clientes, criarCliente, isLoading } = useClientes();
  const [busca, setBusca] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // Filtrar clientes baseado na busca
  const clientesFiltrados = useMemo(() => {
    if (!busca) return clientes.slice(0, 10); // Mostrar apenas 10 primeiros se não há busca
    
    return clientes.filter(cliente => 
      cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
      cliente.email?.toLowerCase().includes(busca.toLowerCase()) ||
      cliente.telefone?.includes(busca) ||
      cliente.instagram?.toLowerCase().includes(busca.toLowerCase())
    );
  }, [clientes, busca]);

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

  const handleNovoCliente = async (dadosCliente: any) => {
    try {
      console.log('🔄 [SELECIONAR_CORRIGIDO] Iniciando criação de cliente:', dadosCliente);
      const resultado = await criarCliente(dadosCliente);
      console.log('📝 [SELECIONAR_CORRIGIDO] Resultado:', resultado);
      
      if (resultado) {
        console.log('✅ [SELECIONAR_CORRIGIDO] Cliente criado com sucesso');
        setMostrarFormulario(false);
        onClienteSelect(resultado);
      } else {
        console.error('❌ [SELECIONAR_CORRIGIDO] Resultado nulo do criarCliente');
        throw new Error('Falha ao criar cliente - resultado nulo');
      }
    } catch (error) {
      console.error('❌ [SELECIONAR_CORRIGIDO] Erro ao criar cliente:', error);
    }
  };

  // Se um cliente está selecionado, mostrar informações
  if (clienteSelecionado) {
    return (
      <Card className={`border-2 border-green-200 bg-green-50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-800">Cliente Selecionado</h3>
              </div>
              
              <div className="space-y-2">
                <p className="font-medium text-lg">{clienteSelecionado.nome}</p>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  {clienteSelecionado.telefone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {clienteSelecionado.telefone}
                    </div>
                  )}
                  {clienteSelecionado.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {clienteSelecionado.email}
                    </div>
                  )}
                  {clienteSelecionado.data_nascimento && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {calcularIdade(clienteSelecionado.data_nascimento)} anos
                    </div>
                  )}
                </div>

                {clienteSelecionado.filhos && clienteSelecionado.filhos.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-1">
                      Filhos ({clienteSelecionado.filhos.length}):
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {clienteSelecionado.filhos.map((filho) => (
                        <Badge key={filho.id} variant="secondary" className="text-xs">
                          {filho.nome}
                          {filho.data_nascimento && (
                            <span className="ml-1">
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
            
            <Button
              onClick={onClienteClear}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Se está mostrando formulário de novo cliente
  if (mostrarFormulario) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-bentin-pink" />
            Cadastrar Novo Cliente
          </CardTitle>
          <CardDescription>
            Complete os dados do cliente para associar à venda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormularioNovoClienteCorrigido
            onSalvar={handleNovoCliente}
            onCancelar={() => setMostrarFormulario(false)}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    );
  }

  // Interface de seleção/busca de clientes
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-bentin-blue" />
          Selecionar Cliente
        </CardTitle>
        <CardDescription>
          Escolha um cliente existente ou cadastre um novo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Botões de Ação */}
        <div className="flex gap-3">
          <Button
            onClick={() => setMostrarFormulario(true)}
            className="bentin-button-primary flex-1"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Adicionar Novo Cliente
          </Button>
          <Button
            onClick={onNovoCliente}
            variant="outline"
            className="flex-1"
          >
            <Settings className="h-4 w-4 mr-2" />
            Gerenciar Clientes
          </Button>
        </div>

        <Separator />

        {/* Busca de Clientes */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome, email ou telefone..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Lista de Clientes */}
          {clientesFiltrados.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              {busca ? (
                <>
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhum cliente encontrado</p>
                  <p className="text-sm">Tente ajustar os termos de busca</p>
                </>
              ) : (
                <>
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhum cliente cadastrado</p>
                  <p className="text-sm">Cadastre o primeiro cliente para começar</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {clientesFiltrados.map((cliente) => (
                <div
                  key={cliente.id}
                  onClick={() => onClienteSelect(cliente)}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{cliente.nome}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        {cliente.telefone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {cliente.telefone}
                          </span>
                        )}
                        {cliente.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {cliente.email}
                          </span>
                        )}
                        {cliente.filhos && cliente.filhos.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Baby className="h-3 w-3" />
                            {cliente.filhos.length} filho{cliente.filhos.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-600 opacity-0 hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}