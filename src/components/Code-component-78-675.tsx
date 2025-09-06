import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { X, Plus, Upload, Calculator, Tag, Palette, Shirt, Package, ImageIcon, Check, AlertCircle } from 'lucide-react';
import { Produto, supabaseService } from '../utils/supabaseService';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { supabase } from '../utils/supabaseClient';

interface FormularioProdutoAprimoradoProps {
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

const FormularioProdutoAprimorado: React.FC<FormularioProdutoAprimoradoProps> = ({
  produto,
  produtoExistente,
  onSubmit,
  onCancel,
  isSubmitting,
  categorias,
  camposNaoEditaveis = []
}) => {
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
  const [customTamanho, setCustomTamanho] = useState('');
  const [customCor, setCustomCor] = useState('');
  const [novaCategoria, setNovaCategoria] = useState('');
  
  // Estados para upload de imagem
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estados para autocomplete de tecido
  const [tecidoInput, setTecidoInput] = useState('');
  const [tecidosSugeridos, setTecidosSugeridos] = useState<string[]>([]);
  const [showTecidoSuggestions, setShowTecidoSuggestions] = useState(false);
  
  // Usar cliente Supabase existente
  // Importar o cliente singleton para evitar múltiplas instâncias

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
      setTecidoInput(produtoParaEditar.tipoTecido || '');
    }
  }, [produto, produtoExistente]);

  // Carregar tecidos para autocomplete
  useEffect(() => {
    if (tecidoInput.length > 0) {
      const tecidosFiltrados = configuracoes.tecidosPadrao.filter(tecido =>
        tecido.toLowerCase().includes(tecidoInput.toLowerCase())
      );
      setTecidosSugeridos(tecidosFiltrados);
      setShowTecidoSuggestions(tecidosFiltrados.length > 0 && tecidoInput !== formData.tipoTecido);
    } else {
      setShowTecidoSuggestions(false);
    }
  }, [tecidoInput, configuracoes.tecidosPadrao, formData.tipoTecido]);

  // Calcular margem automaticamente
  useEffect(() => {
    if (formData.preco > 0 && formData.custo > 0) {
      const margem = ((formData.preco - formData.custo) / formData.custo) * 100;
      setFormData(prev => ({ ...prev, margemLucro: Math.round(margem * 100) / 100 }));
    }
  }, [formData.preco, formData.custo]);

  // Função para upload de imagem no Supabase Storage
  const handleImageUpload = async (file: File) => {
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
      // Simular progresso de upload
      setUploadProgress(25);

      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `produtos/${fileName}`;

      setUploadProgress(50);

      // Verificar se bucket existe
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === 'produtos-images');
      
      if (!bucketExists) {
        setUploadError('Bucket de imagens não encontrado. Por favor, crie o bucket "produtos-images" no painel do Supabase primeiro.');
        return;
      }

      setUploadProgress(75);

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
        setFormData(prev => ({ ...prev, imageUrl: urlData.publicUrl }));
        setUploadProgress(100);
      }

    } catch (error: any) {
      console.error('Erro no upload:', error);
      let errorMessage = 'Erro no upload da imagem';
      
      if (error.message?.includes('bucket')) {
        errorMessage = 'Bucket "produtos-images" não encontrado. Crie-o no painel do Supabase primeiro.';
      } else if (error.message?.includes('policy')) {
        errorMessage = 'Erro de permissão. Verifique as políticas RLS do bucket no Supabase.';
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      setUploadError(errorMessage);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  // Função para formatar valor de moeda
  const formatCurrency = (value: string) => {
    // Remove tudo que não é dígito
    const numericValue = value.replace(/\D/g, '');
    
    // Converte para número e divide por 100
    const numberValue = parseInt(numericValue) / 100;
    
    // Formata como moeda brasileira
    return numberValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Função para converter moeda formatada para número
  const parseCurrency = (value: string): number => {
    return parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0;
  };

  // Gerar SKU automaticamente
  const gerarSKU = async () => {
    if (formData.nome) {
      try {
        const sku = await supabaseService.gerarSKU(formData.nome);
        setFormData(prev => ({ ...prev, sku }));
      } catch (error) {
        console.error('Erro ao gerar SKU:', error);
      }
    }
  };

  // Adicionar tamanho
  const adicionarTamanho = async (tamanho: string) => {
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
  };

  // Remover tamanho
  const removerTamanho = (tamanho: string) => {
    setFormData(prev => ({
      ...prev,
      tamanhos: prev.tamanhos?.filter(t => t !== tamanho) || []
    }));
  };

  // Adicionar cor
  const adicionarCor = async (cor: string) => {
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
  };

  // Remover cor
  const removerCor = (cor: string) => {
    setFormData(prev => ({
      ...prev,
      cores: prev.cores?.filter(c => c !== cor) || []
    }));
  };

  // Validação do formulário
  const validarFormulario = (): boolean => {
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
    
    // Validação de quantidade apenas para novos produtos
    if (!produto && formData.quantidade < 0) {
      novosErrors.quantidade = 'Quantidade não pode ser negativa';
    }
    
    if (formData.minimo < 0) {
      novosErrors.minimo = 'Estoque mínimo não pode ser negativo';
    }

    // Validações específicas do sistema aprimorado
    if (formData.tamanhos && formData.tamanhos.length === 0) {
      console.warn('Produto sem tamanhos selecionados');
    }
    
    if (formData.cores && formData.cores.length === 0) {
      console.warn('Produto sem cores selecionadas');
    }

    // Validação de SKU (se informado, deve ser único)
    if (formData.sku && formData.sku.length < 3) {
      novosErrors.sku = 'SKU deve ter pelo menos 3 caracteres';
    }

    // Validação de margem de lucro muito baixa
    if (formData.margemLucro !== undefined && formData.margemLucro < 5) {
      console.warn('Margem de lucro muito baixa detectada');
    }

    setErrors(novosErrors);
    return Object.keys(novosErrors).length === 0;
  };

  // Submit do formulário
  const handleSubmit = async (e: React.FormEvent) => {
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
  };

  // Determinar cor da margem
  const getMargemColor = (margem: number) => {
    if (margem < 15) return 'text-red-600 bg-red-50 border-red-200';
    if (margem < 30) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  // Verificar se um campo está bloqueado para edição
  const isCampoNaoEditavel = (campo: string) => {
    return camposNaoEditaveis.includes(campo);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="border-0 shadow-none sm:border sm:shadow-sm">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Package className="h-5 w-5 text-bentin-blue" />
            {produto ? 'Editar Produto' : 'Novo Produto'}
          </CardTitle>
          <CardDescription className="text-sm">
            {produto ? 'Atualize as informações do produto' : 'Cadastre um novo produto com informações completas'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-4 sm:px-6">
          {/* Alerta sobre campos não editáveis */}
          {camposNaoEditaveis.length > 0 && (
            <Alert className="mb-4 border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-700">
                Alguns campos não podem ser editados por questões de segurança e integridade dos dados.
                Campos bloqueados: {camposNaoEditaveis.join(', ')}.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            
            {/* Informações Básicas */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="flex items-center gap-2 font-semibold text-bentin-pink text-sm sm:text-base">
                <Package className="h-4 w-4" />
                Informações Básicas
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome" className="text-sm">
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
                    className={`h-10 ${errors.nome ? 'border-red-500' : ''} ${isCampoNaoEditavel('nome') ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                    disabled={isCampoNaoEditavel('nome')}
                  />
                  {errors.nome && <p className="text-xs text-red-600">{errors.nome}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria" className="text-sm">Categoria *</Label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Select 
                      value={formData.categoria} 
                      onValueChange={(value) => {
                        setFormData(prev => ({ ...prev, categoria: value }));
                        setNovaCategoria('');
                      }}
                    >
                      <SelectTrigger className={`flex-1 h-10 ${errors.categoria ? 'border-red-500' : ''}`}>
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
                      className="flex-1 h-10"
                    />
                  </div>
                  {errors.categoria && <p className="text-xs text-red-600">{errors.categoria}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao" className="text-sm">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Descrição detalhada do produto..."
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>

            {/* Preços e SKU */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="flex items-center gap-2 font-semibold text-bentin-green text-sm sm:text-base">
                <Calculator className="h-4 w-4" />
                Preços e Identificação
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="custo" className="text-sm">Custo da Mercadoria *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">R$</span>
                    <Input
                      id="custo"
                      value={formData.custo > 0 ? formatCurrency(formData.custo.toString().replace('.', '')) : ''}
                      onChange={(e) => {
                        const valor = parseCurrency(e.target.value);
                        setFormData(prev => ({ ...prev, custo: valor }));
                      }}
                      placeholder="0,00"
                      className={`h-10 pl-10 ${errors.custo ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.custo && <p className="text-xs text-red-600">{errors.custo}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preco" className="text-sm">Preço de Venda *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">R$</span>
                    <Input
                      id="preco"
                      value={formData.preco > 0 ? formatCurrency(formData.preco.toString().replace('.', '')) : ''}
                      onChange={(e) => {
                        const valor = parseCurrency(e.target.value);
                        setFormData(prev => ({ ...prev, preco: valor }));
                      }}
                      placeholder="0,00"
                      className={`h-10 pl-10 ${errors.preco ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.preco && <p className="text-xs text-red-600">{errors.preco}</p>}
                </div>

                <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                  <Label className="text-sm">Margem de Lucro</Label>
                  <div className={`p-3 rounded-lg border-2 h-10 flex items-center ${getMargemColor(formData.margemLucro || 0)}`}>
                    <div className="flex items-center gap-2">
                      <Calculator className="h-4 w-4" />
                      <span className="font-semibold text-sm">
                        {formData.margemLucro?.toFixed(1) || '0.0'}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku" className="text-sm">
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
                      className={`h-10 ${isCampoNaoEditavel('sku') ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                      disabled={isCampoNaoEditavel('sku')}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={gerarSKU} 
                      className="h-10 px-3"
                      disabled={isCampoNaoEditavel('sku')}
                    >
                      <Tag className="h-4 w-4" />
                    </Button>
                  </div>
                  {isCampoNaoEditavel('sku') && formData.sku && (
                    <p className="text-xs text-muted-foreground">
                      O SKU não pode ser alterado após a criação do produto
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fornecedor" className="text-sm">Fornecedor</Label>
                  <Input
                    id="fornecedor"
                    value={formData.fornecedorNome}
                    onChange={(e) => setFormData(prev => ({ ...prev, fornecedorNome: e.target.value }))}
                    placeholder="Nome do fornecedor"
                    className="h-10"
                  />
                </div>
              </div>
            </div>

            {/* Características do Produto */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="flex items-center gap-2 font-semibold text-bentin-orange text-sm sm:text-base">
                <Shirt className="h-4 w-4" />
                Características
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Gênero *</Label>
                  <RadioGroup 
                    value={formData.genero} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, genero: value as any }))}
                    className="flex flex-col sm:flex-row gap-3 sm:gap-4"
                  >
                    {configuracoes.generosPadrao.map((genero) => (
                      <div key={genero} className="flex items-center space-x-2">
                        <RadioGroupItem value={genero} id={genero} />
                        <Label htmlFor={genero} className="capitalize text-sm cursor-pointer">
                          {genero}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Tipo de Tecido</Label>
                  <div className="relative">
                    <Input
                      value={tecidoInput}
                      onChange={(e) => {
                        setTecidoInput(e.target.value);
                        setFormData(prev => ({ ...prev, tipoTecido: e.target.value }));
                      }}
                      onFocus={() => setShowTecidoSuggestions(tecidosSugeridos.length > 0)}
                      onBlur={() => setTimeout(() => setShowTecidoSuggestions(false), 200)}
                      placeholder="Digite ou selecione o tipo de tecido"
                      className="h-10"
                    />
                    
                    {/* Sugestões de autocomplete */}
                    {showTecidoSuggestions && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
                        {tecidosSugeridos.map((tecido) => (
                          <div
                            key={tecido}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setTecidoInput(tecido);
                              setFormData(prev => ({ ...prev, tipoTecido: tecido }));
                              setShowTecidoSuggestions(false);
                            }}
                          >
                            {tecido}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Botão para mostrar todas as opções */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 px-2"
                      onClick={() => {
                        setTecidosSugeridos(configuracoes.tecidosPadrao);
                        setShowTecidoSuggestions(true);
                      }}
                    >
                      ↓
                    </Button>
                  </div>
                </div>
              </div>

              {/* Tamanhos */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm">
                  <Shirt className="h-4 w-4" />
                  Tamanho (Seleção Múltipla)
                </Label>
                
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {configuracoes.tamanhosPadrao.map((tamanho) => (
                    <Badge
                      key={tamanho}
                      variant={formData.tamanhos?.includes(tamanho) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-bentin-blue hover:text-white text-xs sm:text-sm min-h-[32px] px-2 sm:px-3 transition-colors"
                      onClick={() => {
                        if (formData.tamanhos?.includes(tamanho)) {
                          removerTamanho(tamanho);
                        } else {
                          adicionarTamanho(tamanho);
                        }
                      }}
                    >
                      {tamanho}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Adicionar novo tamanho"
                    value={customTamanho}
                    onChange={(e) => setCustomTamanho(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        if (customTamanho.trim()) {
                          adicionarTamanho(customTamanho.trim());
                          setCustomTamanho('');
                        }
                      }
                    }}
                    className="h-10"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (customTamanho.trim()) {
                        adicionarTamanho(customTamanho.trim());
                        setCustomTamanho('');
                      }
                    }}
                    className="h-10 px-3"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {formData.tamanhos && formData.tamanhos.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {formData.tamanhos.map((tamanho) => (
                      <Badge key={tamanho} className="bg-bentin-blue text-xs sm:text-sm min-h-[32px] px-2 sm:px-3">
                        {tamanho}
                        <button
                          type="button"
                          onClick={() => removerTamanho(tamanho)}
                          className="ml-1 sm:ml-2 hover:text-red-300 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Cores */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm">
                  <Palette className="h-4 w-4" />
                  Cor (Input de Tags)
                </Label>
                
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
                  {configuracoes.coresPadrao.map((cor) => (
                    <Badge
                      key={cor}
                      variant={formData.cores?.includes(cor) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-bentin-pink hover:text-white text-xs sm:text-sm min-h-[32px] px-2 sm:px-3 transition-colors"
                      onClick={() => {
                        if (formData.cores?.includes(cor)) {
                          removerCor(cor);
                        } else {
                          adicionarCor(cor);
                        }
                      }}
                    >
                      {cor}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Digite uma cor e pressione Enter ou Espaço"
                    value={customCor}
                    onChange={(e) => setCustomCor(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        if (customCor.trim()) {
                          adicionarCor(customCor.trim());
                          setCustomCor('');
                        }
                      }
                    }}
                    className="h-10"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (customCor.trim()) {
                        adicionarCor(customCor.trim());
                        setCustomCor('');
                      }
                    }}
                    className="h-10 px-3"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {formData.cores && formData.cores.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {formData.cores.map((cor) => (
                      <Badge key={cor} className="bg-bentin-pink text-xs sm:text-sm min-h-[32px] px-2 sm:px-3">
                        {cor}
                        <button
                          type="button"
                          onClick={() => removerCor(cor)}
                          className="ml-1 sm:ml-2 hover:text-red-300 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Estoque */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="flex items-center gap-2 font-semibold text-bentin-mint text-sm sm:text-base">
                <Package className="h-4 w-4" />
                Controle de Estoque
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantidade" className="text-sm">
                    Quantidade *
                    {produto && (
                      <span className="text-xs text-orange-600 ml-2">
                        ⚠️ Não editável após criação
                      </span>
                    )}
                  </Label>
                  <Input
                    id="quantidade"
                    type="number"
                    value={formData.quantidade}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantidade: parseInt(e.target.value) || 0 }))}
                    className={`h-10 ${errors.quantidade ? 'border-red-500' : ''} ${produto ? 'bg-gray-50' : ''}`}
                    disabled={!!produto} // Desabilita se estiver editando
                    placeholder={produto ? 'Use ações de estoque para alterar' : '0'}
                  />
                  {errors.quantidade && <p className="text-xs text-red-600">{errors.quantidade}</p>}
                  {produto && (
                    <p className="text-xs text-gray-500">
                      Para alterar quantidade, use as opções "Adicionar ao Estoque" ou "Registrar Perda" na listagem.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minimo" className="text-sm">Estoque Mínimo</Label>
                  <Input
                    id="minimo"
                    type="number"
                    value={formData.minimo}
                    onChange={(e) => setFormData(prev => ({ ...prev, minimo: parseInt(e.target.value) || 0 }))}
                    className="h-10"
                    placeholder="5"
                  />
                  <p className="text-xs text-gray-500">
                    Quando atingir essa quantidade, o sistema alertará para repor estoque.
                  </p>
                </div>
              </div>
            </div>

            {/* Imagem */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="flex items-center gap-2 font-semibold text-bentin-lime text-sm sm:text-base">
                <ImageIcon className="h-4 w-4" />
                Imagem do Produto
              </h3>
              
              <div className="space-y-3">
                {/* Upload de arquivo */}
                <div className="space-y-2">
                  <Label className="text-sm">Upload de Imagem</Label>
                  <div className="flex items-center gap-3">
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
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="h-10"
                    >
                      {isUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-bentin-blue border-t-transparent mr-2" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Escolher Arquivo
                        </>
                      )}
                    </Button>
                    <span className="text-xs text-gray-500">
                      JPG, PNG ou WebP até 5MB
                    </span>
                  </div>
                  
                  {/* Barra de progresso */}
                  {isUploading && (
                    <div className="space-y-1">
                      <Progress value={uploadProgress} className="h-2" />
                      <p className="text-xs text-gray-500">Fazendo upload... {uploadProgress}%</p>
                    </div>
                  )}
                  
                  {/* Erro de upload */}
                  {uploadError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        {uploadError}
                        {uploadError.includes('Bucket') && (
                          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-blue-700">
                            <p className="font-semibold">📋 Como resolver:</p>
                            <ol className="mt-1 space-y-1 text-xs">
                              <li>1. Acesse o painel do Supabase</li>
                              <li>2. Vá em Storage → New bucket</li>
                              <li>3. Nome: <code>produtos-images</code></li>
                              <li>4. Marque como público</li>
                              <li>5. Configure políticas RLS</li>
                            </ol>
                            <p className="mt-2 text-xs">
                              📖 Veja o arquivo <code>CONFIGURAÇÃO_BUCKET_IMAGENS.md</code> para instruções detalhadas.
                            </p>
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {/* Sucesso */}
                  {uploadProgress === 100 && !isUploading && formData.imageUrl && (
                    <Alert>
                      <Check className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        Imagem enviada com sucesso!
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Ou inserir URL manualmente */}
                <div className="space-y-2">
                  <Label htmlFor="imageUrl" className="text-sm">Ou inserir URL da imagem</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://exemplo.com/imagem.jpg"
                    className="h-10"
                  />
                </div>

                {/* Preview da imagem */}
                {formData.imageUrl && (
                  <div className="flex justify-center">
                    <div className="relative">
                      <ImageWithFallback 
                        src={formData.imageUrl} 
                        alt={formData.nome || 'Preview do produto'}
                        className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status de margem */}
            {formData.margemLucro !== undefined && formData.margemLucro < 15 && (
              <Alert>
                <AlertDescription>
                  ⚠️ Margem de lucro baixa ({formData.margemLucro.toFixed(1)}%). 
                  Considere ajustar o preço de venda ou negociar melhor preço com o fornecedor.
                </AlertDescription>
              </Alert>
            )}

            {/* Botões */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 sm:pt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bentin-button-primary w-full sm:w-auto order-1 sm:order-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Salvando...' : (produto ? 'Atualizar' : 'Cadastrar')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FormularioProdutoAprimorado;