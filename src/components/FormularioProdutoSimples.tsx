import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { Switch } from './ui/switch';
import { 
  X, Plus, Upload, Calculator, Tag, Palette, Shirt, Package, ImageIcon, 
  Check, AlertCircle, Camera, Sparkles, Zap, DollarSign, Ruler, 
  ShoppingBag, Eye, EyeOff, Info, ArrowRight, Save, Loader2, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { Produto, supabaseService } from '../utils/supabaseService';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { supabase } from '../utils/supabaseClient';
import { useToast } from './ToastProvider';

interface FormularioProdutoSimplesProps {
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

const FormularioProdutoSimples: React.FC<FormularioProdutoSimplesProps> = ({
  produto,
  produtoExistente,
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
  
  // Estados para interface
  const [showPreview, setShowPreview] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Auto-save draft (localStorage)
  const draftKey = `produto-draft-${produto?.id || 'novo'}`;

  // Carregar configurações
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
  const adicionarCor = useCallback(async (cor: string) => {
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
    <div className="w-full max-w-6xl mx-auto">
      <Card className="border-0 shadow-none sm:border sm:shadow-lg">
        <CardHeader className="px-6 sm:px-8 pb-6">
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
              {!produto && (
                <div className="flex items-center gap-2">
                  <Switch
                    id="autosave"
                    checked={autoSaveEnabled}
                    onCheckedChange={setAutoSaveEnabled}
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
        
        <CardContent className="px-6 sm:px-8 space-y-8">
          {/* Alertas Globais */}
          {camposNaoEditaveis.length > 0 && (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-700">
                Alguns campos não podem ser editados: {camposNaoEditaveis.join(', ')}.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Layout de Duas Colunas */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              
              {/* Coluna Esquerda - Informações Básicas */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-bentin-pink/10">
                    <Package className="h-5 w-5 text-bentin-pink" />
                  </div>
                  <h3 className="text-lg font-semibold">Informações Básicas</h3>
                </div>
                
                <div className="space-y-5">
                  {/* Nome e Marca */}
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
                        className={`h-11 ${errors.nome ? 'border-red-500' : ''} ${isCampoNaoEditavel('nome') ? 'bg-gray-50 cursor-not-allowed' : ''}`}
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
                        className="h-11"
                      />
                    </div>
                  </div>

                  {/* Categoria */}
                  <div className="space-y-2">
                    <Label htmlFor="categoria" className="text-sm font-medium">Categoria *</Label>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                      <Select 
                        value={formData.categoria} 
                        onValueChange={(value) => {
                          setFormData(prev => ({ ...prev, categoria: value }));
                          setNovaCategoria('');
                        }}
                      >
                        <SelectTrigger className={`h-11 ${errors.categoria ? 'border-red-500' : ''}`}>
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
                        className="h-11"
                      />
                    </div>
                    {errors.categoria && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.categoria}</p>}
                  </div>

                  {/* Descrição */}
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

                  {/* Preços em Grid */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-bentin-green/10">
                        <DollarSign className="h-4 w-4 text-bentin-green" />
                      </div>
                      <h4 className="text-base font-semibold">Preços & Margem</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="preco" className="text-sm font-medium">Preço de Venda *</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">R$</span>
                          <Input
                            id="preco"
                            type="text"
                            value={formData.preco > 0 ? formatCurrency(formData.preco.toString().replace('.', '')) : ''}
                            onChange={(e) => {
                              const valor = parseCurrency(e.target.value);
                              setFormData(prev => ({ ...prev, preco: valor }));
                            }}
                            placeholder="0,00"
                            className={`h-11 pl-10 ${errors.preco ? 'border-red-500' : ''}`}
                          />
                        </div>
                        {errors.preco && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.preco}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="custo" className="text-sm font-medium">Custo do Produto</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">R$</span>
                          <Input
                            id="custo"
                            type="text"
                            value={formData.custo > 0 ? formatCurrency(formData.custo.toString().replace('.', '')) : ''}
                            onChange={(e) => {
                              const valor = parseCurrency(e.target.value);
                              setFormData(prev => ({ ...prev, custo: valor }));
                            }}
                            placeholder="0,00"
                            className={`h-11 pl-10 ${errors.custo ? 'border-red-500' : ''}`}
                          />
                        </div>
                        {errors.custo && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.custo}</p>}
                      </div>
                    </div>

                    {/* Margem de Lucro */}
                    {formData.preco > 0 && formData.custo > 0 && (
                      <div className={`p-3 rounded-lg border ${getMargemColor(formData.margemLucro)}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Margem de Lucro:</span>
                          <span className="text-lg font-bold">{formData.margemLucro.toFixed(1)}%</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Estoque */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-bentin-blue/10">
                        <Package className="h-4 w-4 text-bentin-blue" />
                      </div>
                      <h4 className="text-base font-semibold">Controle de Estoque</h4>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="quantidade" className="text-sm font-medium">Quantidade em Estoque</Label>
                        <Input
                          id="quantidade"
                          type="number"
                          value={formData.quantidade}
                          onChange={(e) => setFormData(prev => ({ ...prev, quantidade: parseInt(e.target.value) || 0 }))}
                          min="0"
                          className={`h-11 ${errors.quantidade ? 'border-red-500' : ''}`}
                        />
                        {errors.quantidade && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.quantidade}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="minimo" className="text-sm font-medium">Estoque Mínimo</Label>
                        <Input
                          id="minimo"
                          type="number"
                          value={formData.minimo}
                          onChange={(e) => setFormData(prev => ({ ...prev, minimo: parseInt(e.target.value) || 0 }))}
                          min="0"
                          className={`h-11 ${errors.minimo ? 'border-red-500' : ''}`}
                        />
                        {errors.minimo && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.minimo}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coluna Direita - Imagem e Informações Adicionais */}
              <div className="space-y-6">
                
                {/* Upload de Imagem */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-bentin-blue/10">
                      <Camera className="h-5 w-5 text-bentin-blue" />
                    </div>
                    <h3 className="text-lg font-semibold">Foto do Produto</h3>
                  </div>
                  
                  <div 
                    className={`
                      relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300
                      ${isDragOver ? 'border-bentin-blue bg-blue-50' : 'border-gray-300 hover:border-bentin-blue hover:bg-gray-50'}
                      ${formData.imageUrl ? 'border-green-300 bg-green-50' : ''}
                    `}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {formData.imageUrl ? (
                      <div className="space-y-3">
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
                            className="absolute top-1 right-1 h-6 w-6 p-0 bg-white shadow-md"
                            onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-green-600">
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="text-sm font-medium">Imagem carregada!</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {isUploading ? (
                          <div className="space-y-3">
                            <Loader2 className="h-10 w-10 animate-spin mx-auto text-bentin-blue" />
                            <Progress value={uploadProgress} className="w-full" />
                            <p className="text-sm text-gray-600">Enviando... {uploadProgress}%</p>
                          </div>
                        ) : (
                          <div>
                            <Camera className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                            <h4 className="font-semibold text-gray-700 mb-2">
                              Adicionar foto
                            </h4>
                            <p className="text-sm text-gray-500 mb-3">
                              Arraste uma imagem ou clique para selecionar
                            </p>
                            <div className="flex flex-wrap gap-1 justify-center">
                              <Badge variant="outline" className="text-xs">JPG</Badge>
                              <Badge variant="outline" className="text-xs">PNG</Badge>
                              <Badge variant="outline" className="text-xs">WebP</Badge>
                              <Badge variant="outline" className="text-xs">Máx: 5MB</Badge>
                            </div>
                          </div>
                        )}
                        
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
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

                {/* Box de Avisos/Warnings */}
                {warnings.length > 0 && (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <Info className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-700">
                      <div className="space-y-1">
                        <p className="font-medium mb-2">Dicas importantes:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {warnings.map((warning, index) => (
                            <li key={index}>{warning}</li>
                          ))}
                        </ul>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Informações Adicionais */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-bentin-orange/10">
                      <Tag className="h-4 w-4 text-bentin-orange" />
                    </div>
                    <h4 className="text-base font-semibold">Informações Adicionais</h4>
                  </div>

                  <div className="space-y-4">
                    {/* SKU e Fornecedor */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sku" className="text-sm font-medium">SKU (Código)</Label>
                        <div className="flex gap-2">
                          <Input
                            id="sku"
                            value={formData.sku}
                            onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                            placeholder="Código do produto"
                            className={`h-11 ${errors.sku ? 'border-red-500' : ''}`}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={gerarSKU}
                            disabled={!formData.nome}
                          >
                            <Zap className="h-4 w-4" />
                          </Button>
                        </div>
                        {errors.sku && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.sku}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fornecedor" className="text-sm font-medium">Fornecedor</Label>
                        <Input
                          id="fornecedor"
                          value={formData.fornecedorNome}
                          onChange={(e) => setFormData(prev => ({ ...prev, fornecedorNome: e.target.value }))}
                          placeholder="Nome do fornecedor"
                          className="h-11"
                        />
                      </div>
                    </div>

                    {/* Gênero e Tecido */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Gênero</Label>
                        <RadioGroup
                          value={formData.genero}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, genero: value }))}
                          className="flex gap-4"
                        >
                          {configuracoes.generosPadrao.map((genero) => (
                            <div key={genero} className="flex items-center space-x-2">
                              <RadioGroupItem value={genero} id={genero} />
                              <Label htmlFor={genero} className="text-sm capitalize">
                                {genero}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tecido" className="text-sm font-medium">Tipo de Tecido</Label>
                        <Select 
                          value={formData.tipoTecido} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, tipoTecido: value }))}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Selecione o tecido" />
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
                    </div>

                    {/* Tamanhos */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Tamanhos Disponíveis</Label>
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
                        <div className="flex flex-wrap gap-1">
                          {formData.tamanhos.map((tamanho) => (
                            <Badge key={tamanho} variant="secondary" className="text-xs">
                              {tamanho}
                              <button
                                type="button"
                                onClick={() => removerTamanho(tamanho)}
                                className="ml-1 hover:text-red-600"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Cores */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Cores Disponíveis</Label>
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
                        <div className="flex flex-wrap gap-1">
                          {formData.cores.map((cor) => (
                            <Badge key={cor} variant="secondary" className="text-xs">
                              {cor}
                              <button
                                type="button"
                                onClick={() => removerCor(cor)}
                                className="ml-1 hover:text-red-600"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <Separator />
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bentin-button-primary"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {produto ? 'Atualizar Produto' : 'Cadastrar Produto'}
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

export default FormularioProdutoSimples;