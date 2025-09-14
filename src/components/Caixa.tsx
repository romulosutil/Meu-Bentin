import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { useToast } from '../hooks/useToast';
import { supabaseService } from '../utils/supabaseServiceSemVendedor';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Wallet, 
  PiggyBank, 
  AlertTriangle,
  Plus,
  Info,
  Calendar,
  Target,
  Lightbulb
} from 'lucide-react';

interface MovimentacaoCaixa {
  id: string;
  tipo: 'investimento' | 'retirada' | 'perda' | 'venda';
  descricao: string | null;
  valor: number;
  venda_id: string | null;
  criado_em: string;
}

interface DashboardData {
  balancoAtual: number;
  lucroPrejuizo: number;
  projecaoLucro: number;
  totalInvestimentos: number;
  totalRetiradas: number;
  totalPerdas: number;
  totalVendas: number;
}

const Caixa = () => {
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoCaixa[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    balancoAtual: 0,
    lucroPrejuizo: 0,
    projecaoLucro: 0,
    totalInvestimentos: 0,
    totalRetiradas: 0,
    totalPerdas: 0,
    totalVendas: 0
  });
  const [loading, setLoading] = useState(true);
  const [submittingForm, setSubmittingForm] = useState(false);
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    tipo: '',
    valor: '',
    descricao: ''
  });

  const { toast } = useToast();

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // Carregar movimentações
      const movimentacoesResult = await supabaseService.buscarMovimentacoesCaixa();
      if (movimentacoesResult.sucesso && movimentacoesResult.dados) {
        setMovimentacoes(movimentacoesResult.dados);
      }

      // Carregar dados do dashboard
      const dashboardResult = await supabaseService.calcularDashboardCaixa();
      if (dashboardResult.sucesso && dashboardResult.dados) {
        setDashboardData(dashboardResult.dados);
      }
      
    } catch (error) {
      console.error('Erro ao carregar dados do caixa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do caixa.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.tipo || !formData.valor) {
      toast({
        title: "Erro",
        description: "Tipo e valor são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmittingForm(true);
      
      const valorNumerico = parseFloat(formData.valor.replace(/[^\d,]/g, '').replace(',', '.'));
      
      if (valorNumerico <= 0) {
        toast({
          title: "Erro",
          description: "O valor deve ser maior que zero.",
          variant: "destructive"
        });
        return;
      }

      const novaMovimentacao = {
        tipo: formData.tipo as 'investimento' | 'retirada' | 'perda',
        valor: valorNumerico,
        descricao: formData.descricao || null
      };

      const resultado = await supabaseService.adicionarMovimentacaoCaixa(novaMovimentacao);
      
      if (resultado.sucesso) {
        toast({
          title: "Sucesso",
          description: "Movimentação registrada com sucesso!",
          variant: "default"
        });
        
        // Limpar formulário
        setFormData({ tipo: '', valor: '', descricao: '' });
        
        // Recarregar dados
        await carregarDados();
      } else {
        throw new Error(resultado.erro || 'Erro ao registrar movimentação');
      }
      
    } catch (error) {
      console.error('Erro ao registrar movimentação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível registrar a movimentação.",
        variant: "destructive"
      });
    } finally {
      setSubmittingForm(false);
    }
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTipoConfig = (tipo: string) => {
    switch (tipo) {
      case 'investimento':
        return { label: 'Investimento', color: 'bg-metrics-success text-white', icon: PiggyBank };
      case 'retirada':
        return { label: 'Retirada', color: 'bg-metrics-warning text-white', icon: TrendingDown };
      case 'perda':
        return { label: 'Perda', color: 'bg-metrics-danger text-white', icon: AlertTriangle };
      case 'venda':
        return { label: 'Venda', color: 'bg-metrics-info text-white', icon: DollarSign };
      default:
        return { label: tipo, color: 'bg-gray-500 text-white', icon: DollarSign };
    }
  };

  const gerarDicaFinanceira = () => {
    const { balancoAtual, projecaoLucro } = dashboardData;
    
    if (balancoAtual > 0 && projecaoLucro > balancoAtual * 0.5) {
      return {
        tipo: 'sucesso',
        texto: 'Seu balanço está positivo e sua projeção de lucro é alta. Considere reinvestir parte do lucro para expandir o estoque.',
        icon: TrendingUp,
        cor: 'text-metrics-success'
      };
    } else if (balancoAtual < 0) {
      return {
        tipo: 'alerta',
        texto: 'Atenção: o balanço está negativo. Analise suas retiradas e perdas para otimizar a saúde financeira.',
        icon: AlertTriangle,
        cor: 'text-metrics-danger'
      };
    } else if (projecaoLucro > 0) {
      return {
        tipo: 'neutro',
        texto: 'Sua projeção de lucro é positiva. Continue monitorando o fluxo de caixa para manter a estabilidade financeira.',
        icon: Target,
        cor: 'text-metrics-info'
      };
    } else {
      return {
        tipo: 'cuidado',
        texto: 'Revise sua estratégia de precificação e custos. A projeção atual indica necessidade de ajustes.',
        icon: Lightbulb,
        cor: 'text-metrics-warning'
      };
    }
  };

  const dicaFinanceira = gerarDicaFinanceira();

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bentin-pink mx-auto"></div>
          <p className="text-muted-foreground mt-4">Carregando dados do caixa...</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Caixa</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie o fluxo de caixa e acompanhe a saúde financeira da loja
            </p>
          </div>
        </div>

        {/* Dashboard Financeiro */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Balanço Atual */}
          <Card className="metrics-card metrics-card-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="metrics-title">Balanço Atual</CardTitle>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Soma de todos os investimentos e vendas, menos retiradas e perdas</p>
                </TooltipContent>
              </Tooltip>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="metrics-icon-container metrics-icon-primary">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <div className="metrics-value metrics-value-primary">
                    {formatarMoeda(dashboardData.balancoAtual)}
                  </div>
                  <p className="metrics-description">
                    {dashboardData.balancoAtual >= 0 ? 'Positivo' : 'Negativo'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lucro/Prejuízo */}
          <Card className={`metrics-card ${dashboardData.lucroPrejuizo >= 0 ? 'metrics-card-success' : 'metrics-card-danger'}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="metrics-title">Lucro/Prejuízo</CardTitle>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Resultado líquido de todas as operações financeiras</p>
                </TooltipContent>
              </Tooltip>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className={`metrics-icon-container ${dashboardData.lucroPrejuizo >= 0 ? 'metrics-icon-success' : 'metrics-icon-danger'}`}>
                  {dashboardData.lucroPrejuizo >= 0 ? 
                    <TrendingUp className="h-5 w-5" /> : 
                    <TrendingDown className="h-5 w-5" />
                  }
                </div>
                <div>
                  <div className={`metrics-value ${dashboardData.lucroPrejuizo >= 0 ? 'metrics-value-success' : 'metrics-value-danger'}`}>
                    {formatarMoeda(Math.abs(dashboardData.lucroPrejuizo))}
                  </div>
                  <p className="metrics-description">
                    {dashboardData.lucroPrejuizo >= 0 ? 'Lucro' : 'Prejuízo'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Projeção de Lucro */}
          <Card className="metrics-card metrics-card-info">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="metrics-title">Projeção de Lucro</CardTitle>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Valor total de venda do estoque menos o custo total dos produtos</p>
                </TooltipContent>
              </Tooltip>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="metrics-icon-container metrics-icon-info">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <div className="metrics-value metrics-value-info">
                    {formatarMoeda(dashboardData.projecaoLucro)}
                  </div>
                  <p className="metrics-description">Potencial do estoque</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total de Vendas */}
          <Card className="metrics-card metrics-card-success">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="metrics-title">Total de Vendas</CardTitle>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Soma de todas as vendas realizadas</p>
                </TooltipContent>
              </Tooltip>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="metrics-icon-container metrics-icon-success">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <div className="metrics-value metrics-value-success">
                    {formatarMoeda(dashboardData.totalVendas)}
                  </div>
                  <p className="metrics-description">Receita bruta</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dica Financeira */}
        <Card className="border-2 border-dashed border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <dicaFinanceira.icon className={`h-5 w-5 ${dicaFinanceira.cor}`} />
              Dica Financeira
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{dicaFinanceira.texto}</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulário de Nova Movimentação */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Nova Movimentação
              </CardTitle>
              <CardDescription>
                Registre investimentos, retiradas ou perdas no caixa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Movimentação</Label>
                  <Select 
                    value={formData.tipo} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="investimento">Investimento</SelectItem>
                      <SelectItem value="retirada">Retirada</SelectItem>
                      <SelectItem value="perda">Perda</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valor">Valor</Label>
                  <Input
                    id="valor"
                    type="text"
                    placeholder="R$ 0,00"
                    value={formData.valor}
                    onChange={(e) => {
                      const valor = e.target.value.replace(/\D/g, '');
                      const valorFormatado = (parseFloat(valor) / 100).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      });
                      setFormData(prev => ({ ...prev, valor: valor ? valorFormatado : '' }));
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição (opcional)</Label>
                  <Textarea
                    id="descricao"
                    placeholder="Descrição da movimentação..."
                    value={formData.descricao}
                    onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                    rows={3}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={submittingForm}
                >
                  {submittingForm ? 'Registrando...' : 'Registrar Movimentação'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Histórico de Movimentações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Histórico de Movimentações
              </CardTitle>
              <CardDescription>
                Últimas movimentações registradas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {movimentacoes.length === 0 ? (
                  <p className="text-muted-foreground text-center py-6">
                    Nenhuma movimentação registrada ainda.
                  </p>
                ) : (
                  movimentacoes.slice(0, 10).map((mov) => {
                    const config = getTipoConfig(mov.tipo);
                    return (
                      <div
                        key={mov.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <Badge className={config.color}>
                            <config.icon className="h-3 w-3 mr-1" />
                            {config.label}
                          </Badge>
                          <div>
                            <p className="font-medium">{formatarMoeda(mov.valor)}</p>
                            {mov.descricao && (
                              <p className="text-sm text-muted-foreground">{mov.descricao}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            {formatarData(mov.criado_em)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Caixa;