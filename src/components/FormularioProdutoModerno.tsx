import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { CurrencyInput } from './ui/currency-input';
import { InputMonetario } from './ui/input-monetario';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { Switch } from './ui/switch';
import { 
  X, Plus, Upload, Calculator, Tag, Palette, Shirt, Package, ImageIcon, 
  Check, AlertCircle, Camera, Sparkles, Zap, DollarSign, Ruler, 
  ShoppingBag, Eye, EyeOff, Info, ArrowRight, ChevronDown, ChevronUp,
  Star, Heart, Save, Loader2, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { Produto, supabaseService } from '../utils/supabaseService';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { supabase } from '../utils/supabaseClient';
import { useToast } from './ToastProvider';
import { motion, AnimatePresence } from 'motion/react';

interface FormularioProdutoModernoProps {
  produto?: Produto;
  produtoExistente?: Produto;
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

interface StepConfig {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  required?: boolean;
}

const STEPS_CONFIG: StepConfig[] = [
  {
    id: 'basicas',
    title: 'Informações Básicas',
    subtitle: 'Nome, categoria e descrição',
    icon: Package,
    color: 'text-bentin-pink',
    required: true
  },
  {
    id: 'imagem',
    title: 'Foto do Produto',
    subtitle: 'Imagem principal',
    icon: Camera,
    color: 'text-bentin-blue'
  },
  {
    id: 'precos',
    title: 'Preços & Margem',
    subtitle: 'Custo, preço e lucro',
    icon: DollarSign,
    color: 'text-bentin-green',
    required: true
  },
  {
    id: 'caracteristicas',
    title: 'Características',
    subtitle: 'Tamanhos, cores e tecido',
    icon: Palette,
    color: 'text-bentin-orange'
  },
  {
    id: 'estoque',
    title: 'Controle de Estoque',
    subtitle: 'Quantidade e fornecedor',
    icon: ShoppingBag,
    color: 'text-bentin-mint'
  }
];

const FormularioProdutoModerno: React.FC<FormularioProdutoModernoProps> = ({
  produto,
  produtoExistente,
  onSubmit,
  onCancel,
  isSubmitting,
  categorias,
  camposNaoEditaveis = []
}) => {
  const { addToast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isExpanded, setIsExpanded] = useState(false);
  
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
  });

  const [configuracoes, setConfiguracoes] = useState<ConfiguracoesProdutos>({
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
  
  // Estados para interface avançada
  const [showPreview, setShowPreview] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Auto-save draft (localStorage)
  const draftKey = `produto-draft-${produto?.id || 'novo'}`;

  // Carregar configurações e dados existentes
  useEffect(() => {
    const carregarDados = async () => {
      try {
        const configs = await supabaseService.getConfiguracoesProductos();
        setConfiguracoes(configs);
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      }
    };

    carregarDados();
  }, []);

  // Preencher formulário se editando produto
  useEffect(() => {
    const produtoParaEditar = produtoExistente || produto;
    if (produtoParaEditar) {
      setFormData({
        nome: produtoParaEditar.nome,
        categoria: produtoParaEditar.categoria,
        preco: produtoParaEditar.preco,
        custo: produtoParaEditar.custo,
        quantidade: produtoParaEditar.quantidade,
        minimo: produtoParaEditar.minimo,
        vendedor: produtoParaEditar.vendedor,
        cor: produtoParaEditar.cor || '',
        tamanho: produtoParaEditar.tamanho || '',
        imageUrl: produtoParaEditar.imageUrl || '',
        tamanhos: produtoParaEditar.tamanhos || [],
        genero: produtoParaEditar.genero || 'unissex',
        cores: produtoParaEditar.cores || [],
        tipoTecido: produtoParaEditar.tipoTecido || '',
        sku: produtoParaEditar.sku || '',
        fornecedorNome: produtoParaEditar.fornecedorNome || '',
        margemLucro: produtoParaEditar.margemLucro || 0,
        marca: produtoParaEditar.marca || 'Meu Bentin',
        descricao: produtoParaEditar.descricao || '',
        ativo: produtoParaEditar.ativo
      });
    } else {
      // Carregar draft do localStorage
      const draft = localStorage.getItem(draftKey);
      if (draft && autoSaveEnabled) {
        try {
          const parsedDraft = JSON.parse(draft);
          setFormData(prev => ({ ...prev, ...parsedDraft }));
          addToast({
            type: 'info',
            title: '📝 Rascunho carregado',
            description: 'Seus dados foram restaurados automaticamente'
          });
        } catch (error) {
          console.error('Erro ao carregar draft:', error);
        }
      }
    }
  }, [produto, produtoExistente, draftKey, autoSaveEnabled, addToast]);

  // Auto-save no localStorage
  useEffect(() => {
    if (autoSaveEnabled && !produto) {
      const timeoutId = setTimeout(() => {
        localStorage.setItem(draftKey, JSON.stringify(formData));
      }, 2000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [formData, autoSaveEnabled, produto, draftKey]);

  // Calcular margem automaticamente
  useEffect(() => {
    if (formData.preco > 0 && formData.custo > 0) {
      const margem = ((formData.preco - formData.custo) / formData.custo) * 100;
      setFormData(prev => ({ ...prev, margemLucro: Math.round(margem * 100) / 100 }));
    }
  }, [formData.preco, formData.custo]);

  // Verificar etapas completas
  useEffect(() => {
    const newCompletedSteps = new Set<number>();
    
    // Etapa 0: Básicas
    if (formData.nome && formData.categoria) {
      newCompletedSteps.add(0);
    }
    
    // Etapa 1: Imagem (opcional)
    if (formData.imageUrl) {
      newCompletedSteps.add(1);
    }
    
    // Etapa 2: Preços
    if (formData.preco > 0 && formData.custo >= 0) {
      newCompletedSteps.add(2);
    }
    
    // Etapa 3: Características (opcional)
    if (formData.genero || formData.cores?.length || formData.tamanhos?.length) {
      newCompletedSteps.add(3);
    }
    
    // Etapa 4: Estoque
    if (formData.quantidade >= 0 && formData.minimo >= 0) {
      newCompletedSteps.add(4);
    }
    
    setCompletedSteps(newCompletedSteps);
  }, [formData]);

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
    
    if (!formData.tamanhos?.length && !formData.cores?.length) {
      newWarnings.push('Considere adicionar tamanhos e cores para melhor controle');
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
      const filePath = `produtos/${fileName}`;

      // Verificar se bucket existe
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === 'produtos-images');
      
      if (!bucketExists) {
        setUploadError('Bucket de imagens não encontrado. Configure o Supabase Storage primeiro.');
        return;
      }

      // Fazer upload
      const { data, error } = await supabase.storage
        .from('produtos-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('produtos-images')
        .getPublicUrl(filePath);

      if (urlData?.publicUrl) {
        clearInterval(progressAnimation);
        setUploadProgress(100);
        setFormData(prev => ({ ...prev, imageUrl: urlData.publicUrl }));
        
        addToast({
          type: 'success',
          title: '📸 Imagem enviada!',
          description: 'Foto do produto adicionada com sucesso'
        });
      }

    } catch (error: any) {
      console.error('Erro no upload:', error);
      let errorMessage = 'Erro no upload da imagem';
      
      if (error.message?.includes('bucket')) {
        errorMessage = 'Bucket "produtos-images" não encontrado. Configure no Supabase primeiro.';
      } else if (error.message?.includes('policy')) {
        errorMessage = 'Erro de permissão. Verifique as políticas RLS do Supabase.';
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      setUploadError(errorMessage);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  }, [addToast]);

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

  // Gerar SKU automaticamente
  const gerarSKU = useCallback(async () => {
    if (formData.nome) {
      try {
        const sku = await supabaseService.gerarSKU(formData.nome);
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
  const adicionarTamanho = useCallback(async (tamanho: string) => {
    if (tamanho && !formData.tamanhos?.includes(tamanho)) {
      setFormData(prev => ({
        ...prev,
        tamanhos: [...(prev.tamanhos || []), tamanho]
      }));
      
      // Se é um tamanho personalizado, adicionar às configurações
      if (!configuracoes.tamanhosPadrao.includes(tamanho)) {
        try {
          await supabaseService.adicionarTamanhoPersonalizado(tamanho);
          const novosConfigs = await supabaseService.getConfiguracoesProductos();
          setConfiguracoes(novosConfigs);
        } catch (error) {
          console.error('Erro ao adicionar tamanho personalizado:', error);
        }
      }
    }
  }, [formData.tamanhos, configuracoes.tamanhosPadrao]);

  // Remover tamanho
  const removerTamanho = useCallback((tamanho: string) => {
    setFormData(prev => ({
      ...prev,
      tamanhos: prev.tamanhos?.filter(t => t !== tamanho) || []
    }));
  }, []);

  // Adicionar cor
  const adicionarCor = useCallback(async (cor: string) => {
    if (cor && !formData.cores?.includes(cor)) {
      const corCapitalizada = cor.charAt(0).toUpperCase() + cor.slice(1).toLowerCase();
      
      setFormData(prev => ({
        ...prev,
        cores: [...(prev.cores || []), corCapitalizada]
      }));
      
      // Se é uma cor personalizada, adicionar às configurações
      if (!configuracoes.coresPadrao.includes(corCapitalizada)) {
        try {
          await supabaseService.adicionarCorPersonalizada(corCapitalizada);
          const novosConfigs = await supabaseService.getConfiguracoesProductos();
          setConfiguracoes(novosConfigs);
        } catch (error) {
          console.error('Erro ao adicionar cor personalizada:', error);
        }
      }
    }
  }, [formData.cores, configuracoes.coresPadrao]);

  // Remover cor
  const removerCor = useCallback((cor: string) => {
    setFormData(prev => ({
      ...prev,
      cores: prev.cores?.filter(c => c !== cor) || []
    }));
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
        
        // Limpar draft após sucesso
        if (!produto) {
          localStorage.removeItem(draftKey);
        }
      } catch (error) {
        console.error('Erro ao salvar produto:', error);
      }
    }
  }, [validarFormulario, formData, novaCategoria, onSubmit, produto, draftKey]);

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

  // Navegar entre etapas
  const goToStep = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < STEPS_CONFIG.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Renderizar etapas
  const renderStepContent = () => {
    const step = STEPS_CONFIG[currentStep];
    
    switch (step.id) {
      case 'basicas':
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-sm font-medium">
                  Nome do Produto *
                  {isCampoNaoEditavel('nome') && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Não editável
                    </Badge>
                  )}
                </Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Ex: Vestido Princesa Rosa"
                  className={`h-12 ${errors.nome ? 'border-red-500 ring-red-500' : ''} ${isCampoNaoEditavel('nome') ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                  disabled={isCampoNaoEditavel('nome')}
                />
                {errors.nome && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.nome}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="marca" className="text-sm font-medium">Marca</Label>
                <Input
                  id="marca"
                  value={formData.marca}
                  onChange={(e) => setFormData(prev => ({ ...prev, marca: e.target.value }))}
                  placeholder="Meu Bentin"
                  className="h-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria" className="text-sm font-medium">Categoria *</Label>
              <div className="flex gap-2">
                <Select 
                  value={formData.categoria} 
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, categoria: value }));
                    setNovaCategoria('');
                  }}
                >
                  <SelectTrigger className={`flex-1 h-12 ${errors.categoria ? 'border-red-500' : ''}`}>
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
                  className="flex-1 h-12"
                />
              </div>
              {errors.categoria && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.categoria}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao" className="text-sm font-medium">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descrição detalhada do produto..."
                rows={4}
                className="resize-none"
              />
            </div>
          </motion.div>
        );

      case 'imagem':
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Upload de imagem com drag & drop */}
            <div 
              className={`
                relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
                ${isDragOver ? 'border-bentin-blue bg-blue-50' : 'border-gray-300 hover:border-bentin-blue hover:bg-gray-50'}
                ${formData.imageUrl ? 'border-green-300 bg-green-50' : ''}
              `}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {formData.imageUrl ? (
                <div className="space-y-4">
                  <div className="relative mx-auto w-32 h-32 rounded-lg overflow-hidden shadow-lg">
                    <ImageWithFallback 
                      src={formData.imageUrl} 
                      alt={formData.nome || 'Produto'}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="absolute top-2 right-2 h-6 w-6 p-0 bg-white shadow-md"
                      onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="text-sm font-medium">Imagem carregada com sucesso!</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {isUploading ? (
                    <div className="space-y-3">
                      <Loader2 className="h-12 w-12 animate-spin mx-auto text-bentin-blue" />
                      <Progress value={uploadProgress} className="w-full" />
                      <p className="text-sm text-gray-600">Enviando imagem... {uploadProgress}%</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Camera className="h-12 w-12 mx-auto text-gray-400" />
                        <h3 className="text-lg font-semibold text-gray-700">
                          Adicionar foto do produto
                        </h3>
                        <p className="text-sm text-gray-500 max-w-sm mx-auto">
                          Arraste e solte uma imagem aqui ou clique para selecionar
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 justify-center">
                        <Badge variant="outline" className="text-xs">JPG</Badge>
                        <Badge variant="outline" className="text-xs">PNG</Badge>
                        <Badge variant="outline" className="text-xs">WebP</Badge>
                        <Badge variant="outline" className="text-xs">Máx: 5MB</Badge>
                      </div>
                    </>
                  )}
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="mt-4"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Selecionar Imagem
                  </Button>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
                className="hidden"
              />
            </div>

            {uploadError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">{uploadError}</AlertDescription>
              </Alert>
            )}
          </motion.div>
        );

      case 'precos':
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="custo" className="text-sm font-medium">Custo da Mercadoria *</Label>
                <InputMonetario
                  id="custo"
                  value={formData.custo}
                  onUnmaskedChange={(valor) => setFormData(prev => ({ ...prev, custo: valor }))}
                  placeholder="R$ 0,00"
                  className={errors.custo ? 'aria-invalid' : ''}
                />
                {errors.custo && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.custo}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="preco" className="text-sm font-medium">Preço de Venda *</Label>
                <InputMonetario
                  id="preco"
                  value={formData.preco}
                  onUnmaskedChange={(valor) => setFormData(prev => ({ ...prev, preco: valor }))}
                  placeholder="R$ 0,00"
                  className={errors.preco ? 'aria-invalid' : ''}
                />
                {errors.preco && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.preco}</p>}
              </div>

              <div className="space-y-2 md:col-span-2 lg:col-span-1">
                <Label className="text-sm font-medium">Margem de Lucro</Label>
                <div className={`p-4 rounded-lg border-2 h-12 flex items-center justify-center ${getMargemColor(formData.margemLucro || 0)}`}>
                  <div className="flex items-center gap-3">
                    <Calculator className="h-5 w-5" />
                    <span className="text-xl font-bold">
                      {formData.margemLucro?.toFixed(1) || '0.0'}%
                    </span>
                    {(formData.margemLucro || 0) >= 30 && <Sparkles className="h-4 w-4" />}
                  </div>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  {(formData.margemLucro || 0) < 15 ? 'Margem baixa' : 
                   (formData.margemLucro || 0) < 30 ? 'Margem moderada' : 'Excelente margem!'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku" className="text-sm font-medium">
                  SKU / Código de Barras
                  {isCampoNaoEditavel('sku') && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Não editável
                    </Badge>
                  )}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    placeholder="Ex: VES001"
                    className={`h-12 ${isCampoNaoEditavel('sku') ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                    disabled={isCampoNaoEditavel('sku')}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={gerarSKU} 
                    className="h-12 px-4"
                    disabled={isCampoNaoEditavel('sku')}
                  >
                    <Zap className="h-4 w-4" />
                  </Button>
                </div>
                {isCampoNaoEditavel('sku') && formData.sku && (
                  <p className="text-xs text-muted-foreground">
                    O SKU não pode ser alterado após a criação do produto
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fornecedor" className="text-sm font-medium">Fornecedor</Label>
                <Input
                  id="fornecedor"
                  value={formData.fornecedorNome}
                  onChange={(e) => setFormData(prev => ({ ...prev, fornecedorNome: e.target.value }))}
                  placeholder="Nome do fornecedor"
                  className="h-12"
                />
              </div>
            </div>
          </motion.div>
        );

      case 'caracteristicas':
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Gênero */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Gênero</Label>
              <RadioGroup 
                value={formData.genero} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, genero: value as any }))}
                className="flex flex-wrap gap-4"
              >
                {configuracoes.generosPadrao.map((genero) => (
                  <div key={genero} className="flex items-center space-x-2">
                    <RadioGroupItem value={genero} id={genero} />
                    <Label htmlFor={genero} className="capitalize text-sm cursor-pointer font-medium">
                      {genero}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Tamanhos */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                Tamanhos Disponíveis
              </Label>
              
              <div className="flex flex-wrap gap-2">
                {configuracoes.tamanhosPadrao.map((tamanho) => {
                  const isSelected = formData.tamanhos?.includes(tamanho);
                  return (
                    <Button
                      key={tamanho}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => isSelected ? removerTamanho(tamanho) : adicionarTamanho(tamanho)}
                      className={`h-10 min-w-10 ${isSelected ? 'bg-bentin-blue hover:bg-bentin-blue/90' : ''}`}
                    >
                      {tamanho}
                      {isSelected && <Check className="h-3 w-3 ml-1" />}
                    </Button>
                  );
                })}
              </div>

              {/* Tamanhos selecionados */}
              {formData.tamanhos && formData.tamanhos.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-blue-700">Selecionados:</span>
                  {formData.tamanhos.map((tamanho) => (
                    <Badge 
                      key={tamanho} 
                      variant="secondary" 
                      className="bg-blue-100 text-blue-800 cursor-pointer hover:bg-red-100 hover:text-red-800"
                      onClick={() => removerTamanho(tamanho)}
                    >
                      {tamanho} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Cores */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Cores Disponíveis
              </Label>
              
              <div className="flex flex-wrap gap-2">
                {configuracoes.coresPadrao.map((cor) => {
                  const isSelected = formData.cores?.includes(cor);
                  return (
                    <Button
                      key={cor}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => isSelected ? removerCor(cor) : adicionarCor(cor)}
                      className={`${isSelected ? 'bg-bentin-pink hover:bg-bentin-pink/90' : ''}`}
                    >
                      {cor}
                      {isSelected && <Check className="h-3 w-3 ml-1" />}
                    </Button>
                  );
                })}
              </div>

              {/* Cores selecionadas */}
              {formData.cores && formData.cores.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-pink-50 rounded-lg">
                  <span className="text-sm font-medium text-pink-700">Selecionadas:</span>
                  {formData.cores.map((cor) => (
                    <Badge 
                      key={cor} 
                      variant="secondary" 
                      className="bg-pink-100 text-pink-800 cursor-pointer hover:bg-red-100 hover:text-red-800"
                      onClick={() => removerCor(cor)}
                    >
                      {cor} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Tipo de Tecido */}
            <div className="space-y-2">
              <Label htmlFor="tecido" className="text-sm font-medium">Tipo de Tecido</Label>
              <Select 
                value={formData.tipoTecido} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, tipoTecido: value }))}
              >
                <SelectTrigger className="h-12">
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
            </div>
          </motion.div>
        );

      case 'estoque':
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="quantidade" className="text-sm font-medium">Quantidade em Estoque *</Label>
                <Input
                  id="quantidade"
                  type="number"
                  min="0"
                  value={formData.quantidade}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantidade: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  className={`h-12 text-lg ${errors.quantidade ? 'border-red-500' : ''}`}
                />
                {errors.quantidade && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.quantidade}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="minimo" className="text-sm font-medium">Estoque Mínimo *</Label>
                <Input
                  id="minimo"
                  type="number"
                  min="0"
                  value={formData.minimo}
                  onChange={(e) => setFormData(prev => ({ ...prev, minimo: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  className={`h-12 text-lg ${errors.minimo ? 'border-red-500' : ''}`}
                />
                {errors.minimo && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.minimo}</p>}
              </div>
            </div>

            {/* Status do estoque */}
            {formData.quantidade >= 0 && formData.minimo >= 0 && (
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Status do Estoque</h4>
                    <p className="text-sm text-muted-foreground">
                      {formData.quantidade === 0 ? 'Produto esgotado' :
                       formData.quantidade <= formData.minimo ? 'Estoque baixo - repor urgente' :
                       'Estoque adequado'}
                    </p>
                  </div>
                  <div className={`
                    px-3 py-2 rounded-full text-sm font-medium
                    ${formData.quantidade === 0 ? 'bg-red-100 text-red-800' :
                      formData.quantidade <= formData.minimo ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'}
                  `}>
                    {formData.quantidade === 0 ? 'Esgotado' :
                     formData.quantidade <= formData.minimo ? 'Baixo' :
                     'Normal'}
                  </div>
                </div>
              </Card>
            )}

            <div className="space-y-2">
              <Label htmlFor="vendedor" className="text-sm font-medium">Vendedor Responsável</Label>
              <Select 
                value={formData.vendedor} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, vendedor: value }))}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Selecione o vendedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Naila">Naila</SelectItem>
                  <SelectItem value="Outro">Outro Vendedor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="ativo"
                checked={formData.ativo}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ativo: checked }))}
              />
              <Label htmlFor="ativo" className="text-sm font-medium">
                Produto ativo (disponível para venda)
              </Label>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <Card className="border-0 shadow-none sm:border sm:shadow-lg">
        <CardHeader className="px-4 sm:px-8 pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-bentin-pink/10">
                  <Package className="h-6 w-6 text-bentin-pink" />
                </div>
                {produto ? 'Editar Produto' : 'Novo Produto'}
              </CardTitle>
              <CardDescription className="text-base">
                {produto ? 'Atualize as informações do produto' : 'Cadastre um novo produto com informações completas'}
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Auto-save toggle */}
              {!produto && (
                <div className="flex items-center gap-2">
                  <Switch
                    id="autosave"
                    checked={autoSaveEnabled}
                    onCheckedChange={setAutoSaveEnabled}
                    size="sm"
                  />
                  <Label htmlFor="autosave" className="text-xs text-muted-foreground">
                    Auto-save
                  </Label>
                </div>
              )}
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="px-4 sm:px-8">
          {/* Alerta sobre campos não editáveis */}
          {camposNaoEditaveis.length > 0 && (
            <Alert className="mb-6 border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-700">
                Alguns campos não podem ser editados por questões de segurança e integridade dos dados.
                Campos bloqueados: {camposNaoEditaveis.join(', ')}.
              </AlertDescription>
            </Alert>
          )}

          {/* Warnings dinâmicos */}
          {warnings.length > 0 && (
            <Alert className="mb-6 border-yellow-200 bg-yellow-50">
              <Info className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-700">
                <ul className="list-disc list-inside space-y-1">
                  {warnings.map((warning, index) => (
                    <li key={index} className="text-sm">{warning}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Progress Steps */}
            <div className="space-y-4">
              {/* Steps Navigator */}
              <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-xl">
                {STEPS_CONFIG.map((step, index) => {
                  const IconComponent = step.icon;
                  const isActive = currentStep === index;
                  const isCompleted = completedSteps.has(index);
                  const isRequired = step.required;
                  
                  return (
                    <Button
                      key={step.id}
                      type="button"
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      onClick={() => goToStep(index)}
                      className={`
                        flex items-center gap-2 h-auto py-2 px-3 rounded-lg transition-all duration-200
                        ${isActive ? 'bg-bentin-pink shadow-sm text-white' : 
                          isCompleted ? 'bg-green-100 text-green-700 hover:bg-green-200' : 
                          'hover:bg-gray-200'}
                      `}
                    >
                      <div className={`
                        flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold
                        ${isActive ? 'bg-white/20' : 
                          isCompleted ? 'bg-green-200' : 
                          'bg-gray-200'}
                      `}>
                        {isCompleted ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <span className={isActive ? 'text-white' : 'text-gray-600'}>
                            {index + 1}
                          </span>
                        )}
                      </div>
                      
                      <div className="text-left">
                        <div className={`text-sm font-medium ${step.color} ${isActive ? 'text-white' : ''}`}>
                          {step.title}
                          {isRequired && <span className="text-red-500 ml-1">*</span>}
                        </div>
                        <div className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                          {step.subtitle}
                        </div>
                      </div>
                      
                      {isRequired && !isCompleted && !isActive && (
                        <Star className="h-3 w-3 text-red-500" />
                      )}
                    </Button>
                  );
                })}
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-bentin-pink to-bentin-blue h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(completedSteps.size / STEPS_CONFIG.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Current Step Content */}
            <div className="min-h-[400px]">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg bg-opacity-10 ${STEPS_CONFIG[currentStep].color.replace('text-', 'bg-')}`}>
                    <STEPS_CONFIG[currentStep].icon className={`h-6 w-6 ${STEPS_CONFIG[currentStep].color}`} />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{STEPS_CONFIG[currentStep].title}</h2>
                    <p className="text-sm text-muted-foreground">{STEPS_CONFIG[currentStep].subtitle}</p>
                  </div>
                </div>
                <Separator />
              </div>
              
              {renderStepContent()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center gap-2"
              >
                <ArrowRight className="h-4 w-4 rotate-180" />
                Anterior
              </Button>
              
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onCancel}
                >
                  Cancelar
                </Button>
                
                {currentStep < STEPS_CONFIG.length - 1 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="bg-bentin-blue hover:bg-bentin-blue/90 flex items-center gap-2"
                  >
                    Próximo
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting || Object.keys(errors).length > 0}
                    className="bg-bentin-green hover:bg-bentin-green/90 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {produto ? 'Atualizar Produto' : 'Cadastrar Produto'}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Prévia do Produto</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                {formData.imageUrl && (
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <ImageWithFallback
                      src={formData.imageUrl}
                      alt={formData.nome}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-lg">{formData.nome || 'Nome do produto'}</h4>
                  <p className="text-sm text-gray-600">{formData.categoria || 'Categoria'}</p>
                  
                  {formData.descricao && (
                    <p className="text-sm">{formData.descricao}</p>
                  )}
                  
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      {formData.preco > 0 && (
                        <span className="text-xl font-bold text-green-600">
                          R$ {formData.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      )}
                    </div>
                    
                    {formData.margemLucro > 0 && (
                      <Badge className={getMargemColor(formData.margemLucro).includes('red') ? 'bg-red-100 text-red-800' :
                                      getMargemColor(formData.margemLucro).includes('yellow') ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-green-100 text-green-800'}>
                        {formData.margemLucro.toFixed(1)}% lucro
                      </Badge>
                    )}
                  </div>
                  
                  {(formData.cores?.length || formData.tamanhos?.length) && (
                    <div className="flex flex-wrap gap-1 pt-2">
                      {formData.cores?.map(cor => (
                        <Badge key={cor} variant="secondary" className="text-xs">{cor}</Badge>
                      ))}
                      {formData.tamanhos?.map(tamanho => (
                        <Badge key={tamanho} variant="outline" className="text-xs">{tamanho}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FormularioProdutoModerno;