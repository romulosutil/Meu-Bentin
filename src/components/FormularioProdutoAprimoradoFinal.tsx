import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { CurrencyInput } from './ui/currency-input';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { Switch } from './ui/switch';
import { useValidationToasts } from '../hooks/useValidationToasts';
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

interface FormularioProdutoAprimoradoFinalProps {
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

const FormularioProdutoAprimoradoFinal: React.FC<FormularioProdutoAprimoradoFinalProps> = ({
  produto,
  produtoExistente,
  onSubmit,
  onCancel,
  isSubmitting,
  categorias,
  camposNaoEditaveis = []
}) => {
  const { addToast } = useToast();
  const { validateCurrencyValue, validateProfitMargin } = useValidationToasts();
  
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

  // Calcular margem automaticamente com validação
  useEffect(() => {
    if (formData.preco > 0 && formData.custo > 0) {
      const margem = ((formData.preco - formData.custo) / formData.custo) * 100;
      const margemCalculada = Math.round(margem * 100) / 100;
      setFormData(prev => ({ ...prev, margemLucro: margemCalculada }));
      
      // Validar margem em tempo real
      validateProfitMargin(margemCalculada);
    }
  }, [formData.preco, formData.custo, validateProfitMargin]);

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
            {/* SEÇÃO 1: INFORMAÇÕES BÁSICAS */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Package className="h-5 w-5 text-bentin-pink" />
                <h3 className="text-lg font-semibold text-gray-900">Informações Básicas</h3>
                <Separator className="flex-1" />
              </div>

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
            </div>

            {/* SEÇÃO 2: PREÇOS E MARGEM - COM CURRENCYINPUT APRIMORADO */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="h-5 w-5 text-bentin-green" />
                <h3 className="text-lg font-semibold text-gray-900">Preços e Margem</h3>
                <Separator className="flex-1" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="custo" className="text-sm font-medium">Custo da Mercadoria *</Label>
                  <CurrencyInput
                    id="custo"
                    value={formData.custo}
                    onChange={(valor) => {
                      setFormData(prev => ({ ...prev, custo: valor }));
                      validateCurrencyValue(valor, 'Custo', 0);
                    }}
                    className={`h-12 text-lg font-mono ${errors.custo ? 'border-red-500' : ''}`}
                    minValue={0}
                    validateOnChange={true}
                  />
                  {errors.custo && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.custo}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preco" className="text-sm font-medium">Preço de Venda *</Label>
                  <CurrencyInput
                    id="preco"
                    value={formData.preco}
                    onChange={(valor) => {
                      setFormData(prev => ({ ...prev, preco: valor }));
                      validateCurrencyValue(valor, 'Preço', 0.01);
                    }}
                    className={`h-12 text-lg font-mono ${errors.preco ? 'border-red-500' : ''}`}
                    minValue={0.01}
                    validateOnChange={true}
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
            </div>
            
            {/* SEÇÃO 3: UPLOAD DE IMAGEM */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Camera className="h-5 w-5 text-bentin-blue" />
                <h3 className="text-lg font-semibold text-gray-900">Foto do Produto</h3>
                <Separator className="flex-1" />
              </div>

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
            </div>

            {/* SEÇÃO 4: ESTOQUE E SKU */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingBag className="h-5 w-5 text-bentin-mint" />
                <h3 className="text-lg font-semibold text-gray-900">Controle de Estoque</h3>
                <Separator className="flex-1" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
            </div>

            {/* Footer Fixo - Padrão Unificado */}
            <div className="modal-footer flex items-center justify-end gap-3 p-6 border-t border-border/40 bg-white" style={{ flexShrink: 0 }}>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="min-w-[100px]"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bentin-button-primary min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {produto ? 'Atualizar' : 'Salvar'} Produto
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FormularioProdutoAprimoradoFinal;