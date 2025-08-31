import { useState, useMemo, useCallback, useEffect } from 'react';
import { useEstoque } from '../utils/EstoqueContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useToastContext } from './ToastProvider';
import { validateMeta } from '../utils/validation';
import { 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Download, 
  BarChart3, 
  Wallet,
  PiggyBank,
  Calculator,
  Settings,
  AlertCircle
} from 'lucide-react';

interface CapitalGiro {
  valorInicial: number;
  dataConfiguracao: Date;
  historico: {
    data: Date;
    valor: number;
    tipo: 'inicial' | 'ajuste' | 'automatico';
    descricao: string;
  }[];
}

const Receita = () => {
  const { vendas, produtos } = useEstoque();
  const { success, error } = useToastContext();
  
  const [periodo, setPeriodo] = useState('30dias');
  const [modalCapitalGiro, setModalCapitalGiro] = useState(false);
  const [valorCapitalGiro, setValorCapitalGiro] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Estado do capital de giro
  const [capitalGiro, setCapitalGiro] = useState<CapitalGiro | null>(() => {
    const stored = localStorage.getItem('capitalGiro');
    return stored ? JSON.parse(stored) : null;
  });

  // Salvar capital de giro no localStorage
  useEffect(() => {
    if (capitalGiro) {
      localStorage.setItem('capitalGiro', JSON.stringify(capitalGiro));
    }
  }, [capitalGiro]);

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
      return dataVenda >= dataInicio && venda.status === 'concluida';
    });
  }, [vendas, periodo]);

  // Calcular métricas financeiras
  const metricas = useMemo(() => {
    const receitaTotal = dadosPeriodo.reduce((total, venda) => total + venda.total, 0);
    const numeroVendas = dadosPeriodo.length;
    const ticketMedio = numeroVendas > 0 ? receitaTotal / numeroVendas : 0;
    
    // Valor total do estoque atual
    const valorEstoque = produtos.reduce((total, produto) => {
      const preco = produto.emPromocao && produto.precoPromocional 
        ? produto.precoPromocional 
        : produto.preco;
      return total + (preco * produto.quantidade);
    }, 0);

    // Capital de giro atual (estimativa)
    const capitalAtual = capitalGiro ? capitalGiro.valorInicial : valorEstoque * 0.7;
    
    // Giro de estoque (receita / valor médio do estoque)
    const giroEstoque = valorEstoque > 0 ? receitaTotal / valorEstoque : 0;

    // Análise de crescimento (últimos 30 vs 30 dias anteriores)
    const hoje = new Date();
    const inicio30DiasPrev = new Date(hoje.getTime() - 60 * 24 * 60 * 60 * 1000);
    const fim30DiasPrev = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const vendas30DiasPrev = vendas.filter(venda => {
      const dataVenda = new Date(venda.data);
      return dataVenda >= inicio30DiasPrev && dataVenda < fim30DiasPrev && venda.status === 'concluida';
    });
    
    const receita30DiasPrev = vendas30DiasPrev.reduce((total, venda) => total + venda.total, 0);
    const crescimento = receita30DiasPrev > 0 ? ((receitaTotal - receita30DiasPrev) / receita30DiasPrev) * 100 : 0;

    return {
      receitaTotal,
      numeroVendas,
      ticketMedio,
      valorEstoque,
      capitalAtual,
      giroEstoque,
      crescimento
    };
  }, [dadosPeriodo, produtos, capitalGiro, vendas]);

  // Dados para gráficos
  const dadosGraficos = useMemo(() => {
    if (dadosPeriodo.length === 0) return { evolucao: [], formasPagamento: [], categorias: [] };

    // Agrupar vendas por semana para evolução
    const vendasPorSemana = dadosPeriodo.reduce((acc, venda) => {
      const dataVenda = new Date(venda.data);
      const semana = `${dataVenda.getDate()}/${dataVenda.getMonth() + 1}`;
      
      if (!acc[semana]) {
        acc[semana] = { semana, receita: 0, vendas: 0 };
      }
      
      acc[semana].receita += venda.total;
      acc[semana].vendas += 1;
      
      return acc;
    }, {} as Record<string, { semana: string; receita: number; vendas: number }>);

    const evolucao = Object.values(vendasPorSemana).slice(-8); // Últimas 8 semanas

    // Agrupar por formas de pagamento
    const formasPagamento = dadosPeriodo.reduce((acc, venda) => {
      const forma = venda.formaPagamento;
      if (!acc[forma]) {
        acc[forma] = { nome: forma, valor: 0 };
      }
      acc[forma].valor += venda.total;
      return acc;
    }, {} as Record<string, { nome: string; valor: number }>);

    // Agrupar por categorias
    const categorias = dadosPeriodo.reduce((acc, venda) => {
      venda.itens.forEach(item => {
        const produto = produtos.find(p => p.id === item.produtoId);
        const categoria = produto?.categoria || 'Outros';
        
        if (!acc[categoria]) {
          acc[categoria] = { categoria, receita: 0 };
        }
        acc[categoria].receita += item.subtotal;
      });
      return acc;
    }, {} as Record<string, { categoria: string; receita: number }>);

    return {
      evolucao,
      formasPagamento: Object.values(formasPagamento),
      categorias: Object.values(categorias)
    };
  }, [dadosPeriodo, produtos]);

  // Configurar capital de giro inicial
  const configurarCapitalGiro = useCallback(async () => {
    const validation = validateMeta(valorCapitalGiro);
    if (!validation.isValid) {
      error('Valor inválido', validation.errors.join(', '));
      return;
    }

    setIsLoading(true);
    try {
      const valor = parseFloat(valorCapitalGiro);
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

      setCapitalGiro(novoCapital);
      success('Capital de giro configurado', `R$ ${valor.toLocaleString('pt-BR', {minimumFractionDigits: 2})} definido como capital inicial`);
      setValorCapitalGiro('');
      setModalCapitalGiro(false);
    } catch (err) {
      error('Erro ao configurar capital', 'Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, [valorCapitalGiro, success, error]);

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

  // Estado sem dados ou capital de giro
  if (vendas.length === 0 || !capitalGiro) {
    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Cards de resumo vazios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="bentin-card border-l-4 border-l-bentin-blue">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Receita Total</CardTitle>
              <div className="bentin-icon-wrapper bg-bentin-blue/10">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-bentin-blue" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-bentin-blue">R$ 0,00</div>
              <p className="text-xs text-gray-600 font-medium">📊 sem vendas ainda</p>
            </CardContent>
          </Card>

          <Card className="bentin-card border-l-4 border-l-bentin-green">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Ticket Médio</CardTitle>
              <div className="bentin-icon-wrapper bg-bentin-green/10">
                <Calculator className="h-4 w-4 sm:h-5 sm:w-5 text-bentin-green" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-bentin-green">R$ 0,00</div>
              <p className="text-xs text-gray-600 font-medium">🎯 por venda</p>
            </CardContent>
          </Card>

          <Card className="bentin-card border-l-4 border-l-bentin-orange">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Capital de Giro</CardTitle>
              <div className="bentin-icon-wrapper bg-bentin-orange/10">
                <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-bentin-orange" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-bentin-orange">
                {capitalGiro ? `R$ ${capitalGiro.valorInicial.toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : 'Não configurado'}
              </div>
              <p className="text-xs text-gray-600 font-medium">💰 capital disponível</p>
            </CardContent>
          </Card>

          <Card className="bentin-card border-l-4 border-l-bentin-mint">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Crescimento</CardTitle>
              <div className="bentin-icon-wrapper bg-bentin-mint/10">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-bentin-mint" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-bentin-mint">0%</div>
              <p className="text-xs text-gray-600 font-medium">📈 vs período anterior</p>
            </CardContent>
          </Card>
        </div>

        {/* Estado de configuração inicial */}
        <Card className="bentin-card">
          <CardContent className="text-center py-12 sm:py-16">
            <PiggyBank className="h-16 w-16 sm:h-20 sm:w-20 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
              {!capitalGiro ? 'Configure seu Capital de Giro' : 'Aguardando Vendas'}
            </h3>
            <p className="text-sm sm:text-base text-gray-500 mb-6 max-w-md mx-auto">
              {!capitalGiro 
                ? 'Defina o valor inicial do seu capital de giro para acompanhar a saúde financeira da loja.'
                : 'Registre vendas para visualizar gráficos e relatórios de receita.'
              }
            </p>
            
            {!capitalGiro && (
              <Dialog open={modalCapitalGiro} onOpenChange={setModalCapitalGiro}>
                <DialogTrigger asChild>
                  <Button className="bentin-button-primary">
                    <Wallet className="h-4 w-4 mr-2" />
                    Configurar Capital de Giro
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-md mx-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <PiggyBank className="h-5 w-5 text-bentin-orange" />
                      Capital de Giro Inicial
                    </DialogTitle>
                    <DialogDescription>
                      Defina o valor que você tem disponível para investir na loja. Este será usado para calcular indicadores financeiros.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="capitalInicial">Valor do Capital de Giro (R$)</Label>
                      <Input 
                        id="capitalInicial" 
                        type="number"
                        step="0.01"
                        min="1000"
                        value={valorCapitalGiro}
                        onChange={(e) => setValorCapitalGiro(e.target.value)}
                        placeholder="Ex: 50000.00"
                        className="text-lg"
                      />
                      <p className="text-xs text-muted-foreground">
                        💡 Inclua o valor investido em estoque, reservas e capital operacional
                      </p>
                    </div>
                    
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-blue-800">O que é Capital de Giro?</p>
                          <p className="text-xs text-blue-700 mt-1">
                            É o dinheiro disponível para as operações do dia a dia da loja, como compra de mercadorias, pagamento de fornecedores e despesas operacionais.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setModalCapitalGiro(false)} disabled={isLoading}>
                      Cancelar
                    </Button>
                    <Button 
                      onClick={configurarCapitalGiro} 
                      className="bentin-button-primary"
                      disabled={isLoading || !valorCapitalGiro}
                    >
                      {isLoading ? 'Configurando...' : 'Configurar'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="bentin-card border-l-4 border-l-bentin-blue">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Receita Total</CardTitle>
            <div className="bentin-icon-wrapper bg-bentin-blue/10">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-bentin-blue" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-bentin-blue">
              R$ {metricas.receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-600 font-medium">
              📊 {getPeriodoLabel(periodo).toLowerCase()}
            </p>
          </CardContent>
        </Card>

        <Card className="bentin-card border-l-4 border-l-bentin-green">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Ticket Médio</CardTitle>
            <div className="bentin-icon-wrapper bg-bentin-green/10">
              <Calculator className="h-4 w-4 sm:h-5 sm:w-5 text-bentin-green" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-bentin-green">
              R$ {metricas.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-600 font-medium">🎯 por venda</p>
          </CardContent>
        </Card>

        <Card className="bentin-card border-l-4 border-l-bentin-orange">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Capital de Giro</CardTitle>
            <div className="bentin-icon-wrapper bg-bentin-orange/10">
              <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-bentin-orange" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-bentin-orange">
              R$ {metricas.capitalAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-600 font-medium">💰 capital disponível</p>
          </CardContent>
        </Card>

        <Card className={`bentin-card border-l-4 ${metricas.crescimento >= 0 ? 'border-l-green-500' : 'border-l-red-500'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Crescimento</CardTitle>
            <div className={`bentin-icon-wrapper ${metricas.crescimento >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              {metricas.crescimento >= 0 ? 
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" /> : 
                <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
              }
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-xl sm:text-2xl font-bold ${metricas.crescimento >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {metricas.crescimento >= 0 ? '📈 +' : '📉 '}{Math.abs(metricas.crescimento).toFixed(1)}%
            </div>
            <p className="text-xs text-gray-600 font-medium">vs período anterior</p>
          </CardContent>
        </Card>
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
            
            <div className="flex gap-2">
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

              <Dialog open={modalCapitalGiro} onOpenChange={setModalCapitalGiro}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Capital
                  </Button>
                </DialogTrigger>
                {/* Reutilizar o modal de configuração acima */}
              </Dialog>
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
                  <XAxis dataKey="semana" tick={{ fontSize: 12 }} />
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

      {/* Receita por Categoria e Resumo Financeiro */}
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

        {/* Resumo Financeiro */}
        <Card className="bentin-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="bentin-icon-wrapper bg-bentin-orange/10">
                <Calculator className="h-4 w-4 sm:h-5 sm:w-5 text-bentin-orange" />
              </div>
              Resumo Financeiro
            </CardTitle>
            <CardDescription>Análise do período selecionado</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gradient-to-r from-bentin-blue/10 to-bentin-pink/10 p-4 rounded-xl">
              <h4 className="font-medium mb-3 text-gray-800">💰 Indicadores</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">💵 Receita Bruta:</span>
                  <span className="font-medium text-bentin-blue">
                    R$ {metricas.receitaTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">📦 Valor do Estoque:</span>
                  <span className="font-medium text-bentin-orange">
                    R$ {metricas.valorEstoque.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">🔄 Giro do Estoque:</span>
                  <span className="font-medium text-gray-600">
                    {metricas.giroEstoque.toFixed(2)}x
                  </span>
                </div>
                <div className="flex justify-between font-medium border-t border-border/50 pt-2">
                  <span className="text-gray-800">🏦 Capital de Giro:</span>
                  <span className="text-bentin-green font-bold">
                    R$ {metricas.capitalAtual.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button className="w-full justify-start rounded-xl border-bentin-blue text-bentin-blue hover:bg-bentin-blue/10" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                📊 Relatório de Receita
              </Button>
              <Button className="w-full justify-start rounded-xl border-bentin-pink text-bentin-pink hover:bg-bentin-pink/10" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                💳 Relatório de Pagamentos
              </Button>
              <Button className="w-full justify-start rounded-xl border-bentin-green text-bentin-green hover:bg-bentin-green/10" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                🏷️ Relatório por Categoria
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Receita;