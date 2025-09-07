import { useState, useMemo, useCallback, useEffect } from 'react';
import TesteCapitalGiro from './TesteCapitalGiro';
import { useEstoque } from '../utils/EstoqueContextSemVendedor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { StatsCard } from './ui/stats-card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { CurrencyInput } from './ui/currency-input';
import { InputMonetario } from './ui/input-monetario';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useToast } from './ToastProvider';
import { validateMeta } from '../utils/validation';
import { 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Wallet,
  PiggyBank,
  Calculator,
  Settings,
  AlertCircle,
  CheckCircle,
  X,
  Loader2
} from 'lucide-react';

interface CapitalGiro {
  id?: string;
  valorInicial: number;
  dataConfiguracao: Date;
  historico: {
    data: Date;
    valor: number;
    tipo: 'inicial' | 'retirada' | 'aporte';
    descricao: string;
  }[];
}

const Receita = () => {
  const { vendas, produtos } = useEstoque();
  const { addToast } = useToast();
  
  const [periodo, setPeriodo] = useState('30dias');
  const [modalCapitalGiro, setModalCapitalGiro] = useState(false);
  const [valorCapitalGiro, setValorCapitalGiro] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [erroTabela, setErroTabela] = useState(false);
  
  // Estado do capital de giro
  const [capitalGiro, setCapitalGiro] = useState<CapitalGiro | null>(null);

  // Carregar capital de giro do Supabase
  useEffect(() => {
    const carregarCapitalGiro = async () => {
      try {
        const { supabaseService } = await import('../utils/supabaseServiceSemVendedor');
        const capital = await supabaseService.getCapitalGiro();
        setCapitalGiro(capital);
      } catch (error: any) {
        console.error('Erro ao carregar capital de giro:', error);
        
        // Verificar se é erro de tabela não encontrada
        if (error.message && error.message.includes('capital_giro')) {
          setErroTabela(true);
        }
        
        // Fallback para localStorage se houver erro
        const stored = localStorage.getItem('meuBentin-capitalGiro');
        if (stored) {
          setCapitalGiro(JSON.parse(stored));
        }
      }
    };
    
    carregarCapitalGiro();
  }, []);

  // Calcular período de dados
  const dadosPeriodo = useMemo(() => {
    const hoje = new Date();
    let dataInicio: Date;

    switch (periodo) {
      case '7dias':
        dataInicio = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30dias':
        dataInicio = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90dias':
        dataInicio = new Date(hoje.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'mesatual':
        dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        break;
      case 'mespassado':
        dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
        break;
      default:
        dataInicio = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return vendas.filter(venda => {
      const dataVenda = new Date(venda.data);
      return dataVenda >= dataInicio;
    });
  }, [vendas, periodo]);

  // Calcular métricas financeiras
  const metricas = useMemo(() => {
    const receitaTotal = dadosPeriodo.reduce((total, venda) => total + venda.precoTotal, 0);
    const numeroVendas = dadosPeriodo.length;
    const ticketMedio = numeroVendas > 0 ? receitaTotal / numeroVendas : 0;
    
    // Valor total do estoque atual
    const valorEstoque = produtos.reduce((total, produto) => {
      const preco = (produto as any).emPromocao && (produto as any).precoPromocional 
        ? (produto as any).precoPromocional 
        : produto.preco;
      return total + (preco * produto.quantidade);
    }, 0);

    // Capital de giro atual (estimativa ou valor configurado)
    const capitalAtual = capitalGiro ? capitalGiro.valorInicial : valorEstoque * 0.7;
    
    // Giro de estoque (receita / valor médio do estoque)
    const giroEstoque = valorEstoque > 0 ? receitaTotal / valorEstoque : 0;

    // Análise de crescimento (período atual vs período anterior)
    const hoje = new Date();
    let inicioComparacao: Date;
    let fimComparacao: Date;

    switch (periodo) {
      case '7dias':
        inicioComparacao = new Date(hoje.getTime() - 14 * 24 * 60 * 60 * 1000);
        fimComparacao = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30dias':
        inicioComparacao = new Date(hoje.getTime() - 60 * 24 * 60 * 60 * 1000);
        fimComparacao = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90dias':
        inicioComparacao = new Date(hoje.getTime() - 180 * 24 * 60 * 60 * 1000);
        fimComparacao = new Date(hoje.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        inicioComparacao = new Date(hoje.getTime() - 60 * 24 * 60 * 60 * 1000);
        fimComparacao = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    const vendasComparacao = vendas.filter(venda => {
      const dataVenda = new Date(venda.data);
      return dataVenda >= inicioComparacao && dataVenda < fimComparacao;
    });
    
    const receitaComparacao = vendasComparacao.reduce((total, venda) => total + venda.precoTotal, 0);
    const crescimento = receitaComparacao > 0 ? ((receitaTotal - receitaComparacao) / receitaComparacao) * 100 : 0;

    return {
      receitaTotal,
      numeroVendas,
      ticketMedio,
      valorEstoque,
      capitalAtual,
      giroEstoque,
      crescimento
    };
  }, [dadosPeriodo, produtos, capitalGiro, vendas, periodo]);

  // Dados para gráficos
  const dadosGraficos = useMemo(() => {
    if (dadosPeriodo.length === 0) return { evolucao: [], formasPagamento: [], categorias: [] };

    // Agrupar vendas por dia para evolução
    const vendasPorDia = dadosPeriodo.reduce((acc, venda) => {
      const dataVenda = new Date(venda.data);
      const dia = dataVenda.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      
      if (!acc[dia]) {
        acc[dia] = { dia, receita: 0, vendas: 0 };
      }
      
      acc[dia].receita += venda.precoTotal;
      acc[dia].vendas += 1;
      
      return acc;
    }, {} as Record<string, { dia: string; receita: number; vendas: number }>);

    const evolucao = Object.values(vendasPorDia).sort((a, b) => {
      const [diaA, mesA] = a.dia.split('/').map(Number);
      const [diaB, mesB] = b.dia.split('/').map(Number);
      return mesA - mesB || diaA - diaB;
    }).slice(-10); // Últimos 10 dias

    // Agrupar por formas de pagamento
    const formasPagamento = dadosPeriodo.reduce((acc, venda) => {
      const forma = venda.formaPagamento || 'Não informado';
      if (!acc[forma]) {
        acc[forma] = { nome: forma, valor: 0 };
      }
      acc[forma].valor += venda.precoTotal;
      return acc;
    }, {} as Record<string, { nome: string; valor: number }>);

    // Agrupar por categorias
    const categorias = dadosPeriodo.reduce((acc, venda) => {
      const produto = produtos.find(p => p.id === venda.produtoId);
      const categoria = venda.categoria || produto?.categoria || 'Outros';
      
      if (!acc[categoria]) {
        acc[categoria] = { categoria, receita: 0 };
      }
      acc[categoria].receita += venda.precoTotal;
      return acc;
    }, {} as Record<string, { categoria: string; receita: number }>);

    return {
      evolucao,
      formasPagamento: Object.values(formasPagamento),
      categorias: Object.values(categorias).sort((a, b) => b.receita - a.receita)
    };
  }, [dadosPeriodo, produtos]);

  // Função para abrir modal e resetar estados
  const abrirModalCapitalGiro = useCallback(() => {
    setValorCapitalGiro(0);
    setModalCapitalGiro(true);
  }, []);

  // Configurar capital de giro inicial
  const configurarCapitalGiro = useCallback(async () => {
    const validation = validateMeta(valorCapitalGiro.toString());
    if (!validation.isValid) {
      addToast({
        type: 'error',
        title: 'Valor inválido',
        description: validation.errors.join(', ')
      });
      return;
    }

    setIsLoading(true);
    try {
      const valor = valorCapitalGiro;
      const novoCapital: CapitalGiro = {
        valorInicial: valor,
        dataConfiguracao: new Date(),
        historico: [{
          data: new Date(),
          valor,
          tipo: 'inicial',
          descricao: 'Configuração inicial do capital de giro'
        }]
      };

      // Salvar no Supabase
      const { supabaseService } = await import('../utils/supabaseServiceSemVendedor');
      const capitalSalvo = await supabaseService.saveCapitalGiro(novoCapital);
      
      setCapitalGiro(capitalSalvo);
      addToast({
        type: 'success',
        title: 'Capital de giro configurado',
        description: `R$ ${valor.toLocaleString('pt-BR', {minimumFractionDigits: 2})} definido como capital inicial`
      });
      setValorCapitalGiro(0);
      setModalCapitalGiro(false);
    } catch (err) {
      console.error('Erro ao configurar capital:', err);
      addToast({
        type: 'error',
        title: 'Erro ao configurar capital',
        description: 'Tente novamente.'
      });
    } finally {
      setIsLoading(false);
    }
  }, [valorCapitalGiro, addToast]);

  const getPeriodoLabel = useCallback((periodo: string) => {
    switch (periodo) {
      case '7dias': return 'Últimos 7 dias';
      case '30dias': return 'Últimos 30 dias';
      case '90dias': return 'Últimos 90 dias';
      case 'mesatual': return 'Mês atual';
      case 'mespassado': return 'Mês passado';
      default: return 'Últimos 30 dias';
    }
  }, []);

  // Cores para gráficos
  const CORES = ['#e91e63', '#2196f3', '#4caf50', '#ff6b35', '#9c27b0'];

  // ====================================================================
  // MODAL CAPITAL DE GIRO - RECONSTRUÍDO DO ZERO
  // ====================================================================
  // Seguindo rigorosamente o padrão visual dos modais "Nova Venda" e 
  // "Novo Produto": layout estruturado, seções organizadas, footer fixo
  // ====================================================================
  const ModalCapitalGiro = () => {
    const [localValorCapital, setLocalValorCapital] = useState(valorCapitalGiro);
    const [validationError, setValidationError] = useState('');

    const handleClose = useCallback(() => {
      setModalCapitalGiro(false);
      setLocalValorCapital(valorCapitalGiro);
      setValidationError('');
    }, [valorCapitalGiro]);

    const handleSave = useCallback(async () => {
      // Validação
      if (localValorCapital <= 0) {
        setValidationError('O valor do capital de giro deve ser maior que zero.');
        return;
      }
      
      setValidationError('');
      setValorCapitalGiro(localValorCapital);
      await configurarCapitalGiro();
    }, [localValorCapital, configurarCapitalGiro]);

    const formatarMoeda = useCallback((valor: number) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(valor);
    }, []);

    if (!modalCapitalGiro) return null;

    return (
      <div 
        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
        onClick={handleClose}
      >
        <div 
          className="modal-container relative bg-white rounded-xl shadow-xl w-[90vw] max-w-2xl flex flex-col border border-gray-200"
          style={{ maxHeight: '90vh', overflow: 'hidden' }}
          onClick={(e) => e.stopPropagation()}
        >
          
          {/* Header Padronizado */}
          <div className="modal-header flex items-center justify-between p-6 border-b border-border/40 bg-white" style={{ flexShrink: 0 }}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-bentin-orange/10 border border-bentin-orange/20">
                <PiggyBank className="h-5 w-5 text-bentin-orange" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Capital de Giro
                </h2>
                <p className="text-sm text-gray-600">
                  {capitalGiro 
                    ? 'Ajuste o valor do seu capital de giro para controle financeiro'
                    : 'Defina o valor inicial do seu capital de giro'
                  }
                </p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-9 w-9 p-0 hover:bg-gray-100 rounded-lg"
              disabled={isLoading}
              aria-label="Fechar modal"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Conteúdo Scrollável */}
          <div className="modal-body bentin-scroll p-6 space-y-6" style={{ flexGrow: 1, overflowY: 'auto' }}>
            
            {/* Alerta de validação */}
            {validationError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {validationError}
                </AlertDescription>
              </Alert>
            )}

            {/* SEÇÃO: CONFIGURAÇÃO DE VALOR */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="h-5 w-5 text-bentin-orange" />
                <h3 className="text-lg font-semibold text-gray-900">Configuração do Capital</h3>
                <Separator className="flex-1" />
              </div>

              {/* Input do valor */}
              <div className="space-y-3">
                <Label htmlFor="capital-giro-input" className="text-sm font-medium text-gray-700">
                  Valor do Capital de Giro (R$)
                </Label>
                <InputMonetario
                  id="capital-giro-input"
                  value={localValorCapital}
                  onUnmaskedChange={(value) => {
                    setLocalValorCapital(Number(value));
                    if (validationError) setValidationError('');
                  }}
                  placeholder="R$ 0,00"
                  className="h-12 text-lg font-semibold"
                />
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Inclua o valor investido em estoque, reservas e capital operacional
                </p>
              </div>

              {/* Resumo atual */}
              {capitalGiro > 0 && (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Capital Atual:</span>
                    <span className="text-lg font-bold text-bentin-orange">
                      {formatarMoeda(capitalGiro)}
                    </span>
                  </div>
                  {localValorCapital !== capitalGiro && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Novo Valor:</span>
                        <span className="text-lg font-bold text-green-600">
                          {formatarMoeda(localValorCapital)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SEÇÃO: INFORMAÇÃO EDUCATIVA */}
            {!capitalGiro && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Entenda o Capital de Giro</h3>
                  <Separator className="flex-1" />
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200/50">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Wallet className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-base font-semibold text-blue-900 mb-2">
                          💡 O que é Capital de Giro?
                        </h4>
                        <p className="text-sm text-blue-700 leading-relaxed mb-3">
                          É o dinheiro disponível para as operações do dia a dia da loja, como compra de mercadorias, pagamento de fornecedores e despesas operacionais. É fundamental para manter o negócio funcionando.
                        </p>
                        
                        <div className="space-y-2">
                          <h5 className="text-sm font-semibold text-blue-800">Inclua neste valor:</h5>
                          <ul className="text-sm text-blue-700 space-y-1">
                            <li className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              Valor investido em estoque
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              Reserva para emergências
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              Capital para reposição de mercadorias
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Fixo */}
          <div className="modal-footer flex justify-end gap-3 p-6 border-t border-border/40 bg-gray-50/50" style={{ flexShrink: 0 }}>
            <Button 
              variant="outline" 
              onClick={handleClose} 
              disabled={isLoading}
              className="px-6"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isLoading || localValorCapital <= 0}
              className="bentin-button-primary px-6 min-w-[120px]"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Configurar
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Se há erro de tabela, mostrar componente de teste
  if (erroTabela) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <TesteCapitalGiro />
      </div>
    );
  }

  // Estado sem dados ou capital de giro
  if (vendas.length === 0 || !capitalGiro) {
    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Cards de resumo vazios com novo design vibrante */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatsCard
            title="Receita Total"
            value="R$ 0,00"
            description="sem vendas ainda"
            icon={<DollarSign />}
            color="success"
          />

          <StatsCard
            title="Ticket Médio"
            value="R$ 0,00"
            description="por venda"
            icon={<Calculator />}
            color="info"
          />

          <StatsCard
            title="Capital de Giro"
            value={capitalGiro ? `R$ ${capitalGiro.valorInicial.toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : 'Não configurado'}
            description="capital disponível"
            icon={<Wallet />}
            color="warning"
          />

          <StatsCard
            title="Crescimento"
            value="0%"
            description="vs período anterior"
            icon={<TrendingUp />}
            color="primary"
          />
        </div>

        {/* Estado de configuração inicial */}
        <Card className="bentin-card">
          <CardContent className="text-center py-12 sm:py-16">
            <div className="max-w-md mx-auto space-y-6">
              {/* Ícone principal */}
              <div className="flex justify-center">
                <div className="p-6 bg-gradient-to-br from-bentin-orange/10 to-bentin-orange/20 rounded-full border border-bentin-orange/20">
                  <PiggyBank className="h-16 w-16 sm:h-20 sm:w-20 text-bentin-orange" />
                </div>
              </div>

              {/* Título e descrição */}
              <div className="space-y-3">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                  {!capitalGiro ? 'Configure seu Capital de Giro' : 'Aguardando Vendas'}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {!capitalGiro 
                    ? 'Defina o valor inicial do seu capital de giro para começar a acompanhar a saúde financeira da sua loja e ter controle total sobre receitas e gastos.'
                    : 'Registre vendas para visualizar gráficos detalhados e relatórios completos de receita.'
                  }
                </p>
              </div>
              
              {/* Botão de ação - sempre visível para debug */}
              <div className="pt-4">
                {!capitalGiro ? (
                  <Button 
                    className="bentin-button-primary px-8 py-3 text-base font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    onClick={() => {
                      console.log('🔥 BOTÃO CONFIGURAR CAPITAL CLICADO!');
                      console.log('Capital atual:', capitalGiro);
                      abrirModalCapitalGiro();
                    }}
                  >
                    <Wallet className="h-5 w-5 mr-3" />
                    Configurar Capital de Giro
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-500">
                      Capital atual: <span className="font-semibold text-bentin-orange">
                        R$ {capitalGiro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </p>
                    <Button 
                      variant="outline"
                      className="border-bentin-orange text-bentin-orange hover:bg-bentin-orange/5"
                      onClick={() => {
                        console.log('🔧 BOTÃO AJUSTAR CAPITAL CLICADO!');
                        abrirModalCapitalGiro();
                      }}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Ajustar Capital
                    </Button>
                  </div>
                )}
              </div>

              {/* Indicação de status para debug */}
              <div className="mt-6 p-3 bg-gray-50 rounded-lg text-xs text-gray-500 border border-gray-200">
                <strong>Debug:</strong> Capital = {capitalGiro ? `R$ ${capitalGiro}` : 'Não configurado'} | 
                Botão = {!capitalGiro ? 'Configurar' : 'Ajustar'}
              </div>
            </div>
          </CardContent>
        </Card>

        <ModalCapitalGiro />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Métricas Principais com Novo Design Vibrante */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard
          title="Receita Total"
          value={`R$ ${metricas.receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          description={getPeriodoLabel(periodo).toLowerCase()}
          icon={<DollarSign />}
          color="success"
        />

        <StatsCard
          title="Ticket Médio"
          value={`R$ ${metricas.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          description="por venda"
          icon={<Calculator />}
          color="info"
        />

        <StatsCard
          title="Capital de Giro"
          value={`R$ ${metricas.capitalAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          description="capital disponível"
          icon={<Wallet />}
          color="warning"
        />

        <StatsCard
          title="Crescimento"
          value={`${Math.abs(metricas.crescimento).toFixed(1)}%`}
          description="vs período anterior"
          icon={metricas.crescimento >= 0 ? <TrendingUp /> : <TrendingDown />}
          color={metricas.crescimento >= 0 ? "success" : "danger"}
          trend={{
            value: Math.abs(metricas.crescimento),
            isPositive: metricas.crescimento >= 0,
            label: "crescimento"
          }}
        />
      </div>

      {/* Controles de Período */}
      <Card className="bentin-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <div className="bentin-icon-wrapper bg-bentin-blue/10">
                  <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-bentin-blue" />
                </div>
                Análise Financeira - {getPeriodoLabel(periodo)}
              </CardTitle>
              <CardDescription className="text-sm">
                {metricas.numeroVendas} vendas • R$ {metricas.receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} de receita
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={periodo} onValueChange={setPeriodo}>
                <SelectTrigger className="w-40">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7dias">7 dias</SelectItem>
                  <SelectItem value="30dias">30 dias</SelectItem>
                  <SelectItem value="90dias">90 dias</SelectItem>
                  <SelectItem value="mesatual">Mês atual</SelectItem>
                  <SelectItem value="mespassado">Mês passado</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  console.log('Botão Capital de Giro clicado!');
                  abrirModalCapitalGiro();
                }}
                className="flex items-center gap-2 bg-white border-2 border-bentin-orange/30 hover:bg-bentin-orange/5 hover:border-bentin-orange/50 transition-all duration-200 shadow-sm"
              >
                <Settings className="h-4 w-4 text-bentin-orange" />
                <span className="text-bentin-orange font-semibold">Capital</span>
              </Button>
              
              <ModalCapitalGiro />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Evolução da Receita */}
        <Card className="bentin-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="bentin-icon-wrapper bg-bentin-blue/10">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-bentin-blue" />
              </div>
              Evolução da Receita
            </CardTitle>
            <CardDescription>Acompanhe o crescimento ao longo do tempo</CardDescription>
          </CardHeader>
          <CardContent>
            {dadosGraficos.evolucao.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dadosGraficos.evolucao}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="dia" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, 'Receita']}
                    labelStyle={{ color: '#333' }}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="receita" 
                    stroke="#e91e63" 
                    fill="#e91e63" 
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Dados insuficientes para gráfico</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Formas de Pagamento */}
        <Card className="bentin-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="bentin-icon-wrapper bg-bentin-pink/10">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-bentin-pink" />
              </div>
              Formas de Pagamento
            </CardTitle>
            <CardDescription>Distribuição da receita por método</CardDescription>
          </CardHeader>
          <CardContent>
            {dadosGraficos.formasPagamento.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dadosGraficos.formasPagamento}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="valor"
                    label={({ nome, valor }) => {
                      const total = dadosGraficos.formasPagamento.reduce((t, fp) => t + fp.valor, 0);
                      const percentual = ((valor / total) * 100).toFixed(1);
                      return `${nome}: ${percentual}%`;
                    }}
                  >
                    {dadosGraficos.formasPagamento.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma forma de pagamento registrada</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Receita por Categoria e Indicadores Financeiros */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Receita por Categoria */}
        <Card className="bentin-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="bentin-icon-wrapper bg-bentin-green/10">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-bentin-green" />
              </div>
              Receita por Categoria
            </CardTitle>
            <CardDescription>Performance de vendas por tipo de produto</CardDescription>
          </CardHeader>
          <CardContent>
            {dadosGraficos.categorias.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosGraficos.categorias}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="categoria" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, 'Receita']}
                    labelStyle={{ color: '#333' }}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
                  />
                  <Bar dataKey="receita" fill="#4caf50" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma categoria com vendas</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Indicadores Financeiros */}
        <Card className="bentin-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="bentin-icon-wrapper bg-bentin-orange/10">
                <Calculator className="h-4 w-4 sm:h-5 sm:w-5 text-bentin-orange" />
              </div>
              Indicadores Financeiros
            </CardTitle>
            <CardDescription>Análise detalhada da performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-800">Valor do Estoque</span>
                </div>
                <p className="text-lg font-bold text-blue-600">
                  R$ {metricas.valorEstoque.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-blue-700">Investimento atual em produtos</p>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-800">Giro do Estoque</span>
                </div>
                <p className="text-lg font-bold text-green-600">
                  {metricas.giroEstoque.toFixed(2)}x
                </p>
                <p className="text-xs text-green-700">Velocidade de rotação</p>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-semibold text-purple-800">ROI do Período</span>
                </div>
                <p className="text-lg font-bold text-purple-600">
                  {metricas.capitalAtual > 0 ? ((metricas.receitaTotal / metricas.capitalAtual) * 100).toFixed(1) : '0'}%
                </p>
                <p className="text-xs text-purple-700">Retorno sobre investimento</p>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-semibold text-orange-800">Margem Bruta Est.</span>
                </div>
                <p className="text-lg font-bold text-orange-600">
                  40%
                </p>
                <p className="text-xs text-orange-700">Estimativa baseada no preço</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border-l-4 border-l-bentin-blue">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-bentin-blue" />
                <span className="text-sm font-semibold text-gray-800">Resumo do Período</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-gray-600">Vendas: </span>
                  <span className="font-semibold">{metricas.numeroVendas}</span>
                </div>
                <div>
                  <span className="text-gray-600">Ticket médio: </span>
                  <span className="font-semibold">R$ {metricas.ticketMedio.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Crescimento: </span>
                  <span className={`font-semibold ${metricas.crescimento >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {metricas.crescimento >= 0 ? '+' : ''}{metricas.crescimento.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Receita;