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
  ShoppingBag, Eye, EyeOff, Info, ArrowRight, ChevronDown, ChevronUp,
  Star, Heart, Save, Loader2, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { Produto, supabaseService } from '../utils/supabaseService';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { supabase } from '../utils/supabaseClient';
import { useToast } from './ToastProvider';
import { motion, AnimatePresence } from 'motion/react';

interface FormularioProdutoComMascarasProps {
  produto?: Produto;
  produtoExistente?: Produto;
  onSubmit: (produto: Omit<Produto, 'id' | 'dataAtualizacao'>) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  categorias: string[];
  camposNaoEditaveis?: string[];
}

// Funções de formatação de moeda
const formatarMoeda = (valor: string): string => {
  const numericValue = valor.replace(/\D/g, '');
  if (!numericValue) return '';
  
  const amount = parseInt(numericValue) / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  }).format(amount);
};

const parseMoeda = (valor: string): number => {
  const numbers = valor.replace(/\D/g, '');
  return numbers ? parseInt(numbers) / 100 : 0;
};

const FormularioProdutoComMascaras: React.FC<FormularioProdutoComMascarasProps> = ({
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

  // Estados para inputs de moeda formatados
  const [precoDisplay, setPrecoDisplay] = useState('');
  const [custoDisplay, setCustoDisplay] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [novaCategoria, setNovaCategoria] = useState('');

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

      // Definir valores formatados para os campos de moeda
      if (produtoParaEditar.preco > 0) {
        setPrecoDisplay(formatarMoeda((produtoParaEditar.preco * 100).toString()));
      }
      if (produtoParaEditar.custo > 0) {
        setCustoDisplay(formatarMoeda((produtoParaEditar.custo * 100).toString()));
      }
    }
  }, [produto, produtoExistente]);

  // Calcular margem automaticamente
  useEffect(() => {
    if (formData.preco > 0 && formData.custo > 0) {
      const margem = ((formData.preco - formData.custo) / formData.custo) * 100;
      setFormData(prev => ({ ...prev, margemLucro: Math.round(margem * 100) / 100 }));
    }
  }, [formData.preco, formData.custo]);

  // Handlers para campos com máscara de moeda
  const handlePrecoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatarMoeda(e.target.value);
    const parsed = parseMoeda(formatted);
    setPrecoDisplay(formatted);
    setFormData(prev => ({ ...prev, preco: parsed }));
  }, []);

  const handleCustoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatarMoeda(e.target.value);
    const parsed = parseMoeda(formatted);
    setCustoDisplay(formatted);
    setFormData(prev => ({ ...prev, custo: parsed }));
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

  // Verificar se um campo está bloqueado para edição
  const isCampoNaoEditavel = useCallback((campo: string) => {
    return camposNaoEditaveis.includes(campo);
  }, [camposNaoEditaveis]);

  return (
    <div className="space-y-6 p-6 max-h-[80vh] overflow-y-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Aviso sobre máscaras */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-600" />
            <p className="text-sm text-blue-700">
              <strong>Máscaras implementadas:</strong> Valores monetários com formatação R$ XXX,XX
            </p>
          </div>
        </div>
        
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>

        {/* Preços COM MÁSCARAS MONETÁRIAS */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Preços & Margem
            </CardTitle>
            <CardDescription>
              Preços com formatação automática de moeda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="custo" className="text-sm font-medium">Custo de Aquisição *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="custo"
                    type="text"
                    value={custoDisplay}
                    onChange={handleCustoChange}
                    placeholder="R$ 0,00"
                    className={`pl-10 h-12 ${errors.custo ? 'border-red-500 ring-red-500' : ''}`}
                  />
                </div>
                {errors.custo && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.custo}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="preco" className="text-sm font-medium">Preço de Venda *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="preco"
                    type="text"
                    value={precoDisplay}
                    onChange={handlePrecoChange}
                    placeholder="R$ 0,00"
                    className={`pl-10 h-12 ${errors.preco ? 'border-red-500 ring-red-500' : ''}`}
                  />
                </div>
                {errors.preco && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.preco}</p>}
              </div>
            </div>

            {/* Margem de Lucro Calculada */}
            {formData.preco > 0 && formData.custo > 0 && (
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <Calculator className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Margem de Lucro: <span className="text-lg">{formData.margemLucro.toFixed(1)}%</span>
                    </p>
                    <p className="text-xs text-green-600">
                      Lucro por peça: R$ {(formData.preco - formData.custo).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Estoque */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Controle de Estoque
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantidade" className="text-sm font-medium">Quantidade Atual *</Label>
                <Input
                  id="quantidade"
                  type="number"
                  min="0"
                  value={formData.quantidade}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantidade: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  className={`h-12 ${errors.quantidade ? 'border-red-500 ring-red-500' : ''}`}
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
                  className={`h-12 ${errors.minimo ? 'border-red-500 ring-red-500' : ''}`}
                />
                {errors.minimo && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.minimo}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-3 pt-6 border-t">
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
            className="bg-bentin-green hover:bg-bentin-green/90 min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {produto ? 'Atualizar Produto' : 'Salvar Produto'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FormularioProdutoComMascaras;