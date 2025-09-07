import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { CurrencyInput } from './ui/currency-input';
import { Label } from './ui/label';
import { useValidationToasts } from '../hooks/useValidationToasts';
import { useSalesKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { SalesShortcutsHelp } from './ui/keyboard-shortcuts-help';
import { 
  CheckCircle, 
  Zap, 
  Keyboard, 
  DollarSign, 
  AlertTriangle,
  TrendingUp,
  Shield,
  Sparkles
} from 'lucide-react';

const SistemaOtimizado: React.FC = () => {
  const [precoDemo, setPrecoDemo] = useState(0);
  const [custoDemo, setCustoDemo] = useState(0);
  const [descontoDemo, setDescontoDemo] = useState(0);
  const [subtotalDemo] = useState(100); // Valor fixo para demo

  const { validateCurrencyValue, validateProfitMargin, validateDiscount } = useValidationToasts();

  // Atalhos de teclado para demo
  const { getShortcutsList } = useSalesKeyboardShortcuts({
    onNewSale: () => console.log('Nova venda criada via atalho!'),
    onSave: () => console.log('Salvando via atalho!'),
    onCancel: () => console.log('Cancelando via atalho!'),
    onQuickAdd: () => console.log('Adição rápida via atalho!'),
    onSearchProducts: () => console.log('Buscando produtos via atalho!'),
    onToggleCart: () => console.log('Toggled carrinho via atalho!')
  });

  // Calcular margem em tempo real
  const margem = precoDemo > 0 && custoDemo > 0 
    ? ((precoDemo - custoDemo) / custoDemo) * 100 
    : 0;

  const getMargemColor = (margem: number) => {
    if (margem < 15) return 'text-red-600';
    if (margem < 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getMargemStatus = (margem: number) => {
    if (margem < 0) return 'Prejuízo';
    if (margem < 15) return 'Baixa';
    if (margem < 30) return 'Moderada';
    return 'Excelente';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card className="bentin-card border-l-4 border-l-bentin-pink">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-bentin-pink/10">
                  <Sparkles className="h-6 w-6 text-bentin-pink" />
                </div>
                Sistema Otimizado - Meu Bentin
              </CardTitle>
              <CardDescription className="mt-2">
                Demonstração das otimizações implementadas: CurrencyInput aprimorado, validações em tempo real e atalhos de teclado.
              </CardDescription>
            </div>
            <SalesShortcutsHelp shortcuts={getShortcutsList()} />
          </div>
        </CardHeader>
      </Card>

      {/* Otimizações Implementadas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bentin-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5 text-bentin-green" />
              CurrencyInput
            </CardTitle>
            <CardDescription>
              Componente aprimorado com validação automática
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Máscara monetária automática</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Validação de min/max values</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Callbacks de validação</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Integração com toast</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bentin-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-bentin-blue" />
              Validações
            </CardTitle>
            <CardDescription>
              Sistema de validação em tempo real
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Validação de valores monetários</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Cálculo automático de margem</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Alertas de estoque baixo</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Validação de descontos</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bentin-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Keyboard className="h-5 w-5 text-bentin-orange" />
              Atalhos
            </CardTitle>
            <CardDescription>
              Atalhos de teclado para operações rápidas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Ctrl + N: Nova venda</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Ctrl + S: Salvar</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Ctrl + F: Buscar</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">ESC: Cancelar</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demo Interativo */}
      <Card className="bentin-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-bentin-pink" />
            Demonstração Interativa
          </CardTitle>
          <CardDescription>
            Teste as funcionalidades implementadas em tempo real
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Demo de CurrencyInput com validação */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="custo-demo">Custo do Produto</Label>
              <CurrencyInput
                id="custo-demo"
                value={custoDemo}
                onChange={(valor) => {
                  setCustoDemo(valor);
                  validateCurrencyValue(valor, 'Custo', 0);
                }}
                minValue={0}
                validateOnChange={true}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preco-demo">Preço de Venda</Label>
              <CurrencyInput
                id="preco-demo"
                value={precoDemo}
                onChange={(valor) => {
                  setPrecoDemo(valor);
                  validateCurrencyValue(valor, 'Preço', 0.01);
                }}
                minValue={0.01}
                validateOnChange={true}
              />
            </div>

            <div className="space-y-2">
              <Label>Margem de Lucro</Label>
              <div className="h-10 px-3 flex items-center justify-center border rounded-md bg-gray-50">
                <span className={`font-bold ${getMargemColor(margem)}`}>
                  {margem.toFixed(1)}% - {getMargemStatus(margem)}
                </span>
              </div>
            </div>
          </div>

          {/* Demo de validação de desconto */}
          <div className="space-y-4">
            <h4 className="font-medium">Validação de Desconto</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="desconto-demo">Desconto (Subtotal: R$ {subtotalDemo.toFixed(2)})</Label>
                <CurrencyInput
                  id="desconto-demo"
                  value={descontoDemo}
                  onChange={(valor) => {
                    setDescontoDemo(Math.min(valor, subtotalDemo));
                    validateDiscount(valor, subtotalDemo);
                  }}
                  maxValue={subtotalDemo}
                  validateOnChange={true}
                />
              </div>

              <div className="space-y-2">
                <Label>Total Final</Label>
                <div className="h-10 px-3 flex items-center justify-center border rounded-md bg-green-50">
                  <span className="font-bold text-green-700">
                    R$ {(subtotalDemo - descontoDemo).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Alertas informativos */}
          <div className="space-y-3">
            <Alert className="border-blue-200 bg-blue-50">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Cálculos automáticos:</strong> A margem de lucro é calculada automaticamente quando você informa custo e preço.
              </AlertDescription>
            </Alert>

            {margem > 0 && margem < 15 && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <strong>Margem baixa:</strong> Considere revisar os preços para garantir uma margem de pelo menos 15%.
                </AlertDescription>
              </Alert>
            )}

            {descontoDemo > subtotalDemo * 0.5 && (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <strong>Desconto alto:</strong> Desconto acima de 50% pode impactar significativamente a margem de lucro.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Ações de demonstração */}
          <div className="flex flex-wrap gap-3 pt-4 border-t">
            <Button
              onClick={() => {
                setCustoDemo(0);
                setPrecoDemo(0);
                setDescontoDemo(0);
              }}
              variant="outline"
            >
              Limpar Demo
            </Button>
            
            <Button
              onClick={() => {
                setCustoDemo(25);
                setPrecoDemo(50);
                setDescontoDemo(5);
              }}
              className="bg-bentin-green hover:bg-bentin-green/90"
            >
              Exemplo: Margem Boa
            </Button>
            
            <Button
              onClick={() => {
                setCustoDemo(45);
                setPrecoDemo(50);
                setDescontoDemo(10);
              }}
              className="bg-bentin-orange hover:bg-bentin-orange/90"
            >
              Exemplo: Margem Baixa
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resumo das Melhorias */}
      <Card className="bentin-card bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Otimizações Finalizadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                ✅ CurrencyInput Aprimorado
              </Badge>
              <p className="text-sm text-gray-600">
                Componente com validação automática, limites configuráveis e feedback visual.
              </p>
            </div>

            <div className="space-y-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                ✅ Validações em Tempo Real
              </Badge>
              <p className="text-sm text-gray-600">
                Sistema de validação com notificações toast para melhor UX.
              </p>
            </div>

            <div className="space-y-2">
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                ✅ Atalhos de Teclado
              </Badge>
              <p className="text-sm text-gray-600">
                Atalhos configuráveis para operações frequentes no sistema.
              </p>
            </div>

            <div className="space-y-2">
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                ✅ FormularioProduto Otimizado
              </Badge>
              <p className="text-sm text-gray-600">
                Formulário com CurrencyInput aplicado nos campos de preço.
              </p>
            </div>

            <div className="space-y-2">
              <Badge variant="secondary" className="bg-pink-100 text-pink-800">
                ✅ Modal Nova Venda Melhorado
              </Badge>
              <p className="text-sm text-gray-600">
                Validação inteligente de desconto com limite automático.
              </p>
            </div>

            <div className="space-y-2">
              <Badge variant="secondary" className="bg-teal-100 text-teal-800">
                ✅ Indicadores de Ajuda
              </Badge>
              <p className="text-sm text-gray-600">
                Componentes de ajuda para atalhos integrados aos headers.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SistemaOtimizado;