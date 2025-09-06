import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Switch } from './ui/switch';
import { FormSection, FormField, FormGrid } from './ui/form-section';
import { ModalBase } from './ui/modal-base';
import { 
  X, Plus, Upload, Calculator, Tag, Palette, Shirt, Package, ImageIcon, 
  Check, AlertCircle, Camera, DollarSign, Ruler, Eye, EyeOff, 
  Save, Loader2, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { Produto, supabaseService } from '../utils/supabaseServiceSemVendedor';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { useToast } from './ToastProvider';

interface FormularioProdutoProps {
  open: boolean;
  produto?: Produto;
  onSubmit: (produto: Omit<Produto, 'id' | 'dataAtualizacao'>) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  categorias: string[];
  camposNaoEditaveis?: string[];
}

interface ConfiguracoesProdutos {
  tamanhosPadrao: string[];
  coresPadrao: string[];
  generosPadrao: string[];
  tecidosPadrao: string[];
}

/**
 * Formulário de produto consolidado e limpo
 * Suporta criação e edição de produtos com upload de imagens,
 * validação dinâmica e interface responsiva
 */
const FormularioProduto: React.FC<FormularioProdutoProps> = ({
  open,
  produto,
  onSubmit,
  onCancel,
  isSubmitting,
  categorias,
  camposNaoEditaveis = []
}) => {
  const { addToast } = useToast();
  
  // Estados do formulário
  const [formData, setFormData] = useState<Omit<Produto, 'id' | 'dataAtualizacao'>>({
    nome: '',
    categoria: '',
    preco: 0,
    custo: 0,
    quantidade: 0,
    minimo: 0,
    vendedor: 'Naila',
    cor: '',
    tamanho: '',
    imageUrl: '',
    tamanhos: [],
    genero: 'unissex',
    cores: [],
    tipoTecido: '',
    sku: '',
    fornecedorNome: '',
    margemLucro: 0,
    marca: 'Meu Bentin',
    descricao: '',
    ativo: true
  } as Omit<Produto, 'id' | 'dataAtualizacao'>);

  const [configuracoes] = useState<ConfiguracoesProdutos>({
    tamanhosPadrao: ['4', '6', '8', '10', '12', 'P', 'M', 'G'],
    coresPadrao: ['Rosa', 'Azul', 'Verde', 'Amarelo', 'Roxo', 'Branco', 'Preto'],
    generosPadrao: ['masculino', 'feminino', 'unissex'],
    tecidosPadrao: ['Algodão', 'Poliéster', 'Viscose', 'Malha', 'Moletom']
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<string[]>([]);
  const [novaCategoria, setNovaCategoria] = useState('');
  
  // Estados para upload de imagem
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estados para interface
  const [isDragOver, setIsDragOver] = useState(false);

  // Preencher formulário se editando produto
  useEffect(() => {
    if (produto) {
      setFormData({
        nome: produto.nome,
        categoria: produto.categoria,
        preco: produto.preco,
        custo: produto.custo,
        quantidade: produto.quantidade,
        minimo: produto.minimo,
        vendedor: produto.vendedor,
        cor: produto.cor || '',
        tamanho: produto.tamanho || '',
        imageUrl: produto.imageUrl || '',
        tamanhos: produto.tamanhos || [],
        genero: produto.genero || 'unissex',
        cores: produto.cores || [],
        tipoTecido: produto.tipoTecido || '',
        sku: produto.sku || '',
        fornecedorNome: produto.fornecedorNome || '',
        margemLucro: produto.margemLucro || 0,
        marca: produto.marca || 'Meu Bentin',
        descricao: produto.descricao || '',
        ativo: produto.ativo
      });
    }
  }, [produto]);

  // Calcular margem automaticamente
  useEffect(() => {
    if (formData.preco > 0 && formData.custo > 0) {
      const margem = ((formData.preco - formData.custo) / formData.custo) * 100;
      setFormData(prev => ({ ...prev, margemLucro: Math.round(margem * 100) / 100 }));
    }
  }, [formData.preco, formData.custo]);

  // Validação dinâmica com warnings
  useEffect(() => {
    const newWarnings: string[] = [];
    
    if (formData.margemLucro !== undefined && formData.margemLucro < 15) {
      newWarnings.push('Margem de lucro baixa (recomendado: acima de 15%)');
    }
    
    if (formData.quantidade > 0 && formData.quantidade <= formData.minimo) {
      newWarnings.push('Quantidade está próxima do estoque mínimo');
    }
    
    if (!formData.imageUrl) {
      newWarnings.push('Produto sem imagem pode ter menor visibilidade');
    }
    
    setWarnings(newWarnings);
  }, [formData]);

  // Função para upload com drag & drop
  const handleImageUpload = useCallback(async (file: File) => {
    if (!file) return;

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Tipo de arquivo não suportado. Use: JPG, PNG ou WebP');
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Arquivo muito grande. Tamanho máximo: 5MB');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    try {
      // Progresso animado
      const progressAnimation = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // Upload de imagens temporariamente desabilitado - requer configuração do Supabase Storage
      clearInterval(progressAnimation);
      setUploadProgress(100);
      
      // Usar URL placeholder para demonstração
      const placeholderUrl = `https://via.placeholder.com/400x400/e91e63/FFFFFF?text=${encodeURIComponent(fileName)}`;
      setFormData(prev => ({ ...prev, imageUrl: placeholderUrl }));
      
      addToast({
        type: 'info',
        title: '📸 Imagem simulada',
        description: 'Upload real requer configuração do Supabase Storage'
      });

    } catch (error: any) {
      console.error('Erro no upload:', error);
      setUploadError('Erro no upload da imagem');
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  }, [addToast]);

  // Gerar SKU automaticamente
  const gerarSKU = useCallback(async () => {
    if (formData.nome) {
      try {
        const nomeSimplificado = formData.nome
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, '')
          .substring(0, 6);
        const timestamp = Date.now().toString().slice(-3);
        const sku = `${nomeSimplificado}${timestamp}`;
        
        setFormData(prev => ({ ...prev, sku }));
        
        addToast({
          type: 'success',
          title: '🏷️ SKU gerado',
          description: `Código ${sku} criado automaticamente`
        });
      } catch (error) {
        console.error('Erro ao gerar SKU:', error);
        addToast({
          type: 'error',
          title: 'Erro ao gerar SKU',
          description: 'Tente novamente'
        });
      }
    }
  }, [formData.nome, addToast]);

  // Adicionar tamanho
  const adicionarTamanho = useCallback((tamanho: string) => {
    if (tamanho && !formData.tamanhos?.includes(tamanho)) {
      setFormData(prev => ({
        ...prev,
        tamanhos: [...(prev.tamanhos || []), tamanho]
      }));
    }
  }, [formData.tamanhos]);

  // Remover tamanho
  const removerTamanho = useCallback((tamanho: string) => {
    setFormData(prev => ({
      ...prev,
      tamanhos: prev.tamanhos?.filter(t => t !== tamanho) || []
    }));
  }, []);

  // Adicionar cor
  const adicionarCor = useCallback((cor: string) => {
    if (cor && !formData.cores?.includes(cor)) {
      const corCapitalizada = cor.charAt(0).toUpperCase() + cor.slice(1).toLowerCase();
      
      setFormData(prev => ({
        ...prev,
        cores: [...(prev.cores || []), corCapitalizada]
      }));
    }
  }, [formData.cores]);

  // Remover cor
  const removerCor = useCallback((cor: string) => {
    setFormData(prev => ({
      ...prev,
      cores: prev.cores?.filter(c => c !== cor) || []
    }));
  }, []);

  // Função para formatar moeda
  const formatCurrency = useCallback((value: string) => {
    const numericValue = value.replace(/\D/g, '');
    const numberValue = parseInt(numericValue) / 100;
    
    return numberValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }, []);

  // Função para converter moeda formatada para número
  const parseCurrency = useCallback((value: string): number => {
    return parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0;
  }, []);

  // Validação do formulário
  const validarFormulario = useCallback((): boolean => {
    const novosErrors: Record<string, string> = {};

    // Validações obrigatórias
    if (!formData.nome.trim()) {
      novosErrors.nome = 'Nome é obrigatório';
    }
    if (!formData.categoria.trim() && !novaCategoria.trim()) {
      novosErrors.categoria = 'Selecione ou crie uma categoria';
    }
    if (formData.preco <= 0) {
      novosErrors.preco = 'Preço deve ser maior que zero';
    }
    if (formData.custo < 0) {
      novosErrors.custo = 'Custo não pode ser negativo';
    }
    
    if (!produto && formData.quantidade < 0) {
      novosErrors.quantidade = 'Quantidade não pode ser negativa';
    }
    
    if (formData.minimo < 0) {
      novosErrors.minimo = 'Estoque mínimo não pode ser negativo';
    }

    if (formData.sku && formData.sku.length < 3) {
      novosErrors.sku = 'SKU deve ter pelo menos 3 caracteres';
    }

    setErrors(novosErrors);
    return Object.keys(novosErrors).length === 0;
  }, [formData, novaCategoria, produto]);

  // Submit do formulário
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (validarFormulario()) {
      try {
        const dadosFinais = {
          ...formData,
          categoria: novaCategoria.trim() || formData.categoria,
          // Manter compatibilidade com sistema antigo
          cor: formData.cores?.join(', ') || formData.cor,
          tamanho: formData.tamanhos?.join(', ') || formData.tamanho
        };
        
        await onSubmit(dadosFinais);
      } catch (error) {
        console.error('Erro ao salvar produto:', error);
      }
    }
  }, [validarFormulario, formData, novaCategoria, onSubmit]);

  // Determinar cor da margem
  const getMargemColor = useCallback((margem: number) => {
    if (margem < 15) return 'text-red-600 bg-red-50 border-red-200';
    if (margem < 30) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  }, []);

  // Verificar se um campo está bloqueado para edição
  const isCampoNaoEditavel = useCallback((campo: string) => {
    return camposNaoEditaveis.includes(campo);
  }, [camposNaoEditaveis]);

  // Drag & Drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleImageUpload(files[0]);
    }
  }, [handleImageUpload]);

  // ModalBase já gerencia ESC e overflow do body automaticamente

  if (!open) return null;

  return (
    <ModalBase
      open={open}
      onOpenChange={onCancel}
      title={produto ? 'Editar Produto' : 'Novo Produto'}
      description={produto ? 'Atualize as informações do produto' : 'Cadastre um novo produto no estoque'}
      size="3xl"
      onCancel={onCancel}
      onSubmit={(e) => {
        e?.preventDefault();
        const form = document.getElementById('form-produto') as HTMLFormElement;
        if (form) form.requestSubmit();
      }}
      submitText={produto ? 'Atualizar Produto' : 'Criar Produto'}
      isLoading={isSubmitting}
      icon={<Package className="h-6 w-6" />}
    >
      <div className="space-y-6">

          {/* Alertas */}
          {camposNaoEditaveis.length > 0 && (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-700">
                Alguns campos não podem ser editados: {camposNaoEditaveis.join(', ')}.
              </AlertDescription>
            </Alert>
          )}

          {warnings.length > 0 && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-700">
                <ul className="list-disc list-inside space-y-1">
                  {warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <form id="form-produto" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Coluna 1 - Informações Básicas */}
              <div className="space-y-6">
                
                <FormSection 
                  title="Informações do Produto" 
                  icon={<Package className="h-4 w-4" />}
                >
                  <div className="space-y-4">
                    <FormField 
                      label="Nome do Produto" 
                      required 
                      error={errors.nome}
                      disabled={isCampoNaoEditavel('nome')}
                    >
                      <Input
                        value={formData.nome}
                        onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                        placeholder="Ex: Vestido Princesa Rosa"
                        disabled={isCampoNaoEditavel('nome')}
                        className="h-10"
                      />
                    </FormField>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField label="Marca">
                        <Input
                          value={formData.marca}
                          onChange={(e) => setFormData(prev => ({ ...prev, marca: e.target.value }))}
                          placeholder="Meu Bentin"
                          className="h-10"
                        />
                      </FormField>

                      <FormField label="SKU (Código)" error={errors.sku}>
                        <div className="flex gap-2">
                          <Input
                            value={formData.sku}
                            onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value.toUpperCase() }))}
                            placeholder="Ex: VPR001"
                            className="h-10"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={gerarSKU}
                            disabled={!formData.nome}
                            title="Gerar SKU automaticamente"
                            className="h-10 px-3"
                          >
                            <Calculator className="h-4 w-4" />
                          </Button>
                        </div>
                      </FormField>
                    </div>

                    <FormField label="Categoria" required error={errors.categoria}>
                      <div className="grid grid-cols-2 gap-3">
                        <Select 
                          value={formData.categoria} 
                          onValueChange={(value) => {
                            setFormData(prev => ({ ...prev, categoria: value }));
                            setNovaCategoria('');
                          }}
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            {categorias.map((categoria) => (
                              <SelectItem key={categoria} value={categoria}>
                                {categoria}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Nova categoria"
                          value={novaCategoria}
                          onChange={(e) => {
                            setNovaCategoria(e.target.value);
                            if (e.target.value) setFormData(prev => ({ ...prev, categoria: '' }));
                          }}
                          className="h-10"
                        />
                      </div>
                    </FormField>

                    <FormField label="Descrição">
                      <Textarea
                        value={formData.descricao}
                        onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                        placeholder="Descrição detalhada do produto..."
                        rows={3}
                        className="resize-none"
                      />
                    </FormField>
                  </div>
                </FormSection>

                {/* Preços e Estoque */}
                <FormSection 
                  title="Preços e Estoque" 
                  icon={<DollarSign className="h-4 w-4" />}
                >
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField label="Preço de Venda" required error={errors.preco}>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">R$</span>
                          <Input
                            type="text"
                            value={formData.preco > 0 ? formatCurrency(formData.preco.toString().replace('.', '')) : ''}
                            onChange={(e) => {
                              const valor = parseCurrency(e.target.value);
                              setFormData(prev => ({ ...prev, preco: valor }));
                            }}
                            placeholder="0,00"
                            className="pl-10 h-10"
                          />
                        </div>
                      </FormField>

                      <FormField label="Custo do Produto" error={errors.custo}>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">R$</span>
                          <Input
                            type="text"
                            value={formData.custo > 0 ? formatCurrency(formData.custo.toString().replace('.', '')) : ''}
                            onChange={(e) => {
                              const valor = parseCurrency(e.target.value);
                              setFormData(prev => ({ ...prev, custo: valor }));
                            }}
                            placeholder="0,00"
                            className="pl-10 h-10"
                          />
                        </div>
                      </FormField>
                    </div>

                    {/* Margem de Lucro */}
                    {formData.preco > 0 && formData.custo > 0 && (
                      <div className={`p-3 rounded-lg border ${getMargemColor(formData.margemLucro)}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Margem de Lucro</span>
                          <span className="font-semibold">{formData.margemLucro.toFixed(1)}%</span>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <FormField label="Quantidade em Estoque" error={errors.quantidade}>
                        <Input
                          type="number"
                          value={formData.quantidade}
                          onChange={(e) => setFormData(prev => ({ ...prev, quantidade: parseInt(e.target.value) || 0 }))}
                          min="0"
                          className="h-10"
                        />
                      </FormField>

                      <FormField label="Estoque Mínimo" error={errors.minimo}>
                        <Input
                          type="number"
                          value={formData.minimo}
                          onChange={(e) => setFormData(prev => ({ ...prev, minimo: parseInt(e.target.value) || 0 }))}
                          min="0"
                          className="h-10"
                        />
                      </FormField>
                    </div>

                    <FormField label="Fornecedor">
                      <Input
                        value={formData.fornecedorNome}
                        onChange={(e) => setFormData(prev => ({ ...prev, fornecedorNome: e.target.value }))}
                        placeholder="Nome do fornecedor"
                        className="h-10"
                      />
                    </FormField>
                  </div>
                </FormSection>
              </div>

              {/* Coluna 2 - Imagem e Atributos */}
              <div className="space-y-6">
                
                {/* Upload de Imagem */}
                <FormSection 
                  title="Imagem do Produto" 
                  description="Arraste & solte ou clique para selecionar (até 5MB)"
                  icon={<Camera className="h-4 w-4" />}
                >
                  <div className="space-y-4">
                    {formData.imageUrl ? (
                      <div className="relative group">
                        <ImageWithFallback
                          src={formData.imageUrl}
                          alt="Produto"
                          className="w-full h-48 object-cover rounded-lg border"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Upload className="h-4 w-4 mr-1" />
                            Alterar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className={`relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 cursor-pointer ${
                          isDragOver 
                            ? 'border-bentin-pink bg-bentin-pink/5' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <div className="text-center">
                          <ImageIcon className={`h-12 w-12 mx-auto mb-3 ${isDragOver ? 'text-bentin-pink' : 'text-gray-400'}`} />
                          <p className="text-gray-600 mb-1">
                            {isDragOver ? 'Solte a imagem aqui' : 'Arraste uma imagem ou clique para selecionar'}
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG ou WebP até 5MB</p>
                        </div>
                        
                        {isUploading && (
                          <div className="absolute inset-0 bg-white/90 flex items-center justify-center rounded-lg">
                            <div className="text-center">
                              <Loader2 className="h-8 w-8 animate-spin text-bentin-pink mx-auto mb-2" />
                              <p className="text-sm text-gray-600">Enviando... {uploadProgress}%</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {uploadError && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-700">
                          {uploadError}
                        </AlertDescription>
                      </Alert>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                      className="hidden"
                    />
                  </div>
                </FormSection>

                {/* Atributos do Produto */}
                <FormSection 
                  title="Atributos do Produto" 
                  icon={<Tag className="h-4 w-4" />}
                >
                  <div className="space-y-4">
                    
                    {/* Gênero */}
                    <FormField label="Gênero">
                      <RadioGroup 
                        value={formData.genero} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, genero: value }))}
                        className="flex gap-6"
                      >
                        {configuracoes.generosPadrao.map((genero) => (
                          <div key={genero} className="flex items-center space-x-2">
                            <RadioGroupItem value={genero} id={genero} />
                            <Label htmlFor={genero} className="capitalize">
                              {genero}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormField>

                    {/* Tamanhos */}
                    <FormField label="Tamanhos Disponíveis">
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {configuracoes.tamanhosPadrao.map((tamanho) => (
                            <Button
                              key={tamanho}
                              type="button"
                              variant={formData.tamanhos?.includes(tamanho) ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                if (formData.tamanhos?.includes(tamanho)) {
                                  removerTamanho(tamanho);
                                } else {
                                  adicionarTamanho(tamanho);
                                }
                              }}
                              className="h-8 px-3"
                            >
                              {tamanho}
                            </Button>
                          ))}
                        </div>
                        
                        {formData.tamanhos && formData.tamanhos.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            <span className="text-sm text-gray-500">Selecionados:</span>
                            {formData.tamanhos.map(tamanho => (
                              <Badge 
                                key={tamanho} 
                                variant="outline"
                                className="text-xs"
                              >
                                {tamanho}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removerTamanho(tamanho)}
                                  className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </FormField>

                    {/* Cores */}
                    <FormField label="Cores Disponíveis">
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {configuracoes.coresPadrao.map((cor) => (
                            <Button
                              key={cor}
                              type="button"
                              variant={formData.cores?.includes(cor) ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                if (formData.cores?.includes(cor)) {
                                  removerCor(cor);
                                } else {
                                  adicionarCor(cor);
                                }
                              }}
                              className="h-8 px-3"
                            >
                              {cor}
                            </Button>
                          ))}
                        </div>
                        
                        {formData.cores && formData.cores.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            <span className="text-sm text-gray-500">Selecionadas:</span>
                            {formData.cores.map(cor => (
                              <Badge 
                                key={cor} 
                                variant="outline"
                                className="text-xs"
                              >
                                {cor}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removerCor(cor)}
                                  className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </FormField>

                    {/* Tipo de Tecido */}
                    <FormField label="Tipo de Tecido">
                      <Select 
                        value={formData.tipoTecido} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, tipoTecido: value }))}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Selecione o tipo de tecido" />
                        </SelectTrigger>
                        <SelectContent>
                          {configuracoes.tecidosPadrao.map((tecido) => (
                            <SelectItem key={tecido} value={tecido}>
                              {tecido}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>

                    {/* Status Ativo/Inativo */}
                    <FormField label="Status do Produto">
                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">
                            {formData.ativo ? 'Produto Ativo' : 'Produto Inativo'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formData.ativo ? 'Visível para vendas' : 'Oculto do catálogo'}
                          </p>
                        </div>
                        <Switch
                          checked={formData.ativo}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ativo: checked }))}
                        />
                      </div>
                    </FormField>
                  </div>
                </FormSection>
              </div>
            </div>
          </form>
      </div>
    </ModalBase>
  );
};

export default FormularioProduto;