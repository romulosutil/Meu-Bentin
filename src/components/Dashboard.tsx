import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useEstoque } from '../utils/EstoqueContextSupabase';
import { 
  DollarSign, 
  ShoppingBag, 
  Package, 
  TrendingUp, 
  AlertTriangle,
  Target,
  Settings,
  Clock,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Calendar
} from 'lucide-react';

interface Meta {
  id: string;
  valor: number;
  mes: string;
  ano: number;
  dataInicio: Date;
  dataFim: Date;
  criada: Date;
}

interface MetricaCard {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  onClick?: () => void;
}

const Dashboard = () => {
  const { state } = useEstoque();
  const { produtos = [], vendas = [] } = state;
  
  const [metas, setMetas] = useState<Meta[]>([]);
  const [novaMeta, setNovaMeta] = useState('');
  const [dialogAberto, setDialogAberto] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Simular carregamento inicial
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Inicializar meta do mês atual
  useEffect(() => {
    const agora = new Date();
    const mesAtual = agora.getMonth();
    const anoAtual = agora.getFullYear();
    
    const metaExistente = metas.find(m => m.mes === getMesNome(mesAtual) && m.ano === anoAtual);
    
    if (!metaExistente) {
      const primeiroDia = new Date(anoAtual, mesAtual, 1);
      const ultimoDia = new Date(anoAtual, mesAtual + 1, 0);
      
      const metaInicial: Meta = {
        id: Date.now().toString(),
        valor: 50000,
        mes: getMesNome(mesAtual),
        ano: anoAtual,
        dataInicio: primeiroDia,
        dataFim: ultimoDia,
        criada: new Date()
      };
      
      setMetas([metaInicial]);
    }
  }, [metas]);

  const getMesNome = useCallback((mes: number): string => {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return meses[mes];
  }, []);

  // Calcular métricas com memoização para performance
  const metricas = useMemo(() => {
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    
    // Vendas do dia
    const vendasHoje = vendas.filter(venda => {
      const dataVenda = new Date(venda.data);
      return dataVenda.toDateString() === hoje.toDateString();
    });
    
    const receitaHoje = vendasHoje.reduce((total, venda) => total + venda.precoTotal, 0);
    
    // Vendas do mês
    const vendasMes = vendas.filter(venda => {
      const dataVenda = new Date(venda.data);
      return dataVenda >= inicioMes;
    });
    
    const receitaMes = vendasMes.reduce((total, venda) => total + venda.precoTotal, 0);
    
    // Produtos em estoque
    const produtosEstoque = produtos.reduce((total, produto) => total + produto.quantidade, 0);
    const produtosBaixoEstoque = produtos.filter(produto => produto.quantidade <= produto.minimo);
    
    // Capital de giro (estimativa baseada no estoque)
    const valorEstoque = produtos.reduce((total, produto) => total + (produto.quantidade * produto.preco), 0);
    const capitalGiro = valorEstoque * 0.7;

    return {
      receitaHoje,
      receitaMes,
      produtosEstoque,
      produtosBaixoEstoque: produtosBaixoEstoque.length,
      capitalGiro,
      crescimentoVendas: 12.5
    };
  }, [produtos, vendas]);
  
  // Produtos mais vendidos com memoização
  const produtosMaisVendidos = useMemo(() => {
    const contadorProdutos: { [key: string]: { nome: string; quantidade: number; receita: number } } = {};
    
    vendas.forEach(venda => {
      if (contadorProdutos[venda.produtoId]) {
        contadorProdutos[venda.produtoId].quantidade += venda.quantidade;
        contadorProdutos[venda.produtoId].receita += venda.precoTotal;
      } else {
        contadorProdutos[venda.produtoId] = {
          nome: venda.nomeProduto,
          quantidade: venda.quantidade,
          receita: venda.precoTotal
        };
      }
    });
    
    return Object.values(contadorProdutos)
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 4);
  }, [vendas]);

  // Alertas de estoque baseados nos dados reais
  const alertasEstoque = useMemo(() => {
    return produtos
      .filter(produto => produto.quantidade <= produto.minimo)
      .map(produto => ({
        produto: produto.nome,
        estoque: produto.quantidade,
        status: produto.quantidade === 0 ? 'critico' : produto.quantidade <= produto.minimo / 2 ? 'critico' : 'baixo'
      }))
      .slice(0, 5);
  }, [produtos]);

  // Meta atual
  const agora = new Date();
  const metaAtual = metas.find(m => m.mes === getMesNome(agora.getMonth()) && m.ano === agora.getFullYear());
  
  // Calcular dias restantes no mês
  const diasRestantes = useCallback(() => {
    const ultimoDiaMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 0).getDate();
    return ultimoDiaMes - agora.getDate();
  }, [agora]);

  const adicionarNovaMeta = useCallback(() => {
    if (!novaMeta || isNaN(Number(novaMeta))) return;
    
    const primeiroDia = new Date(agora.getFullYear(), agora.getMonth(), 1);
    const ultimoDia = new Date(agora.getFullYear(), agora.getMonth() + 1, 0);
    
    const meta: Meta = {
      id: Date.now().toString(),
      valor: Number(novaMeta),
      mes: getMesNome(agora.getMonth()),
      ano: agora.getFullYear(),
      dataInicio: primeiroDia,
      dataFim: ultimoDia,
      criada: new Date()
    };
    
    setMetas(prev => prev.filter(m => !(m.mes === meta.mes && m.ano === meta.ano)).concat(meta));
    setNovaMeta('');
    setDialogAberto(false);
  }, [novaMeta, agora, getMesNome]);

  // Configuração dos cards de métricas
  const metricasCards: MetricaCard[] = [
    {
      title: "Vendas Hoje",
      value: `R$ ${metricas.receitaHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: "+18% em relação a ontem",
      changeType: 'positive',
      icon: ShoppingBag,
      color: 'text-bentin-pink',
      bgColor: 'border-l-bentin-pink bg-bentin-pink/10'
    },
    {
      title: "Receita Mensal",
      value: `R$ ${metricas.receitaMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: `+${metricas.crescimentoVendas}% vs mês anterior`,
      changeType: 'positive',
      icon: DollarSign,
      color: 'text-bentin-blue',
      bgColor: 'border-l-bentin-blue bg-bentin-blue/10'
    },
    {
      title: "Produtos em Estoque",
      value: metricas.produtosEstoque.toString(),
      change: `${metricas.produtosBaixoEstoque} com estoque baixo`,
      changeType: metricas.produtosBaixoEstoque > 0 ? 'negative' : 'neutral',
      icon: Package,
      color: 'text-bentin-green',
      bgColor: 'border-l-bentin-green bg-bentin-green/10'
    },
    {
      title: "Capital de Giro",
      value: `R$ ${metricas.capitalGiro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: "Baseado no valor do estoque",
      changeType: 'neutral',
      icon: Wallet,
      color: 'text-bentin-mint',
      bgColor: 'border-l-bentin-mint bg-bentin-mint/10'
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Métricas Principais - Grid Responsivo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {metricasCards.map((metrica, index) => {
          const IconComponent = metrica.icon;
          const ChangeIcon = metrica.changeType === 'positive' ? ArrowUpRight : 
                            metrica.changeType === 'negative' ? ArrowDownRight : null;
          
          return (
            <Card 
              key={index}
              className={`
                bentin-card border-l-4 ${metrica.bgColor}
                hover:shadow-xl transition-all duration-300 cursor-pointer
                active:scale-[0.98] sm:active:scale-[0.99]
              `}
              onClick={metrica.onClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  metrica.onClick?.();
                }
              }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700 leading-tight">
                  {metrica.title}
                </CardTitle>
                <div className={`bentin-icon-wrapper ${metrica.bgColor}`}>
                  <IconComponent className={`h-4 w-4 sm:h-5 sm:w-5 ${metrica.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-xl sm:text-2xl font-bold ${metrica.color} leading-tight`}>
                  {metrica.value}
                </div>
                <p className={`
                  text-xs flex items-center gap-1 mt-1 font-medium
                  ${metrica.changeType === 'positive' ? 'text-green-600' : 
                    metrica.changeType === 'negative' ? 'text-red-500' : 'text-orange-500'}
                `}>
                  {ChangeIcon && <ChangeIcon className="h-3 w-3 flex-shrink-0" />}
                  <span className="leading-tight">{metrica.change}</span>
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Layout Responsivo para Cards Secundários */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        
        {/* Produtos em Destaque */}
        <Card className="bentin-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <div className="bentin-icon-wrapper bg-bentin-mint/10">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-bentin-mint" />
              </div>
              <span className="leading-tight">Produtos Mais Vendidos</span>
            </CardTitle>
            <CardDescription className="text-sm">
              {produtosMaisVendidos.length > 0 ? 'Top produtos do mês atual' : 'Aguardando vendas'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {produtosMaisVendidos.length > 0 ? (
              produtosMaisVendidos.map((produto, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-white rounded-lg border hover:shadow-sm transition-shadow">
                  <div className="space-y-1 min-w-0 flex-1">
                    <p className="text-sm font-semibold leading-tight truncate">{produto.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {produto.quantidade} unidades vendidas
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-sm font-bold text-bentin-green">
                      R$ {produto.receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 sm:py-8 text-muted-foreground">
                <Package className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma venda registrada ainda</p>
                <p className="text-xs mt-1">Registre vendas para ver os produtos em destaque</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alertas de Estoque */}
        <Card className="bentin-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <div className="bentin-icon-wrapper bg-orange-100">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
              </div>
              <span className="leading-tight">Alertas de Estoque</span>
            </CardTitle>
            <CardDescription className="text-sm">
              {alertasEstoque.length > 0 ? 'Produtos que precisam de reposição urgente' : 'Estoque sob controle'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {alertasEstoque.length > 0 ? (
              alertasEstoque.map((alerta, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-white rounded-lg border hover:shadow-sm transition-shadow">
                  <div className="space-y-1 min-w-0 flex-1">
                    <p className="text-sm font-semibold leading-tight truncate">{alerta.produto}</p>
                    <p className="text-xs text-muted-foreground">
                      {alerta.estoque} unidades restantes
                    </p>
                  </div>
                  <div className="flex-shrink-0 ml-3">
                    <Badge 
                      variant={alerta.status === 'critico' ? 'destructive' : 'secondary'}
                      className={`
                        text-xs font-medium
                        ${alerta.status === 'critico' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}
                      `}
                    >
                      {alerta.status === 'critico' ? 'Crítico' : 'Baixo'}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 sm:py-8 text-muted-foreground">
                <Package className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-50 text-green-500" />
                <p className="text-sm text-green-600 font-medium">Todos os produtos com estoque adequado!</p>
                <p className="text-xs mt-1">Continue monitorando para manter o controle</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Meta de Vendas com Sistema Completo */}
      <Card className="bentin-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="bentin-icon-wrapper bg-gradient-to-r from-bentin-pink to-bentin-blue flex-shrink-0">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-base sm:text-lg leading-tight">
                  Meta de Vendas - {metaAtual?.mes} {metaAtual?.ano}
                </CardTitle>
                <CardDescription className="text-sm">
                  Progresso para a meta de R$ {metaAtual?.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                </CardDescription>
              </div>
            </div>
            
            <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 flex-shrink-0">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Configurar Meta</span>
                  <span className="sm:hidden">Meta</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-md mx-auto">
                <DialogHeader>
                  <DialogTitle>Configurar Meta Mensal</DialogTitle>
                  <DialogDescription>
                    Defina a meta de vendas para {getMesNome(agora.getMonth())} {agora.getFullYear()}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="meta">Valor da Meta (R$)</Label>
                    <Input
                      id="meta"
                      type="number"
                      placeholder="50000.00"
                      value={novaMeta}
                      onChange={(e) => setNovaMeta(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={adicionarNovaMeta} className="flex-1">
                      Salvar Meta
                    </Button>
                    <Button variant="outline" onClick={() => setDialogAberto(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-bentin-blue">R$ {metricas.receitaMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              <span className="text-gray-600">R$ {metaAtual?.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}</span>
            </div>
            <Progress 
              value={metaAtual ? (metricas.receitaMes / metaAtual.valor) * 100 : 0} 
              className="h-3 bg-gray-200"
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-gradient-to-r from-bentin-pink/10 to-bentin-blue/10 p-3 sm:p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-bentin-pink flex-shrink-0" />
                  <span className="text-sm font-semibold">Progresso</span>
                </div>
                <p className="text-lg sm:text-xl font-bold text-bentin-pink">
                  {metaAtual ? Math.round((metricas.receitaMes / metaAtual.valor) * 100) : 0}%
                </p>
                <p className="text-xs text-gray-600">da meta alcançada</p>
              </div>
              
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-3 sm:p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-orange-600 flex-shrink-0" />
                  <span className="text-sm font-semibold">Restante</span>
                </div>
                <p className="text-lg sm:text-xl font-bold text-orange-600">
                  R$ {((metaAtual?.valor || 0) - metricas.receitaMes).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-gray-600">para atingir a meta</p>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 sm:p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm font-semibold">Tempo</span>
                </div>
                <p className="text-lg sm:text-xl font-bold text-green-600">{diasRestantes()}</p>
                <p className="text-xs text-gray-600">dias restantes</p>
              </div>
            </div>

            {/* Alerta de desempenho */}
            {metaAtual && (
              <div className="mt-4 p-3 rounded-lg border-l-4 border-l-bentin-orange bg-orange-50">
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-orange-800 text-sm block">
                      {(metricas.receitaMes / metaAtual.valor) * 100 >= 75 
                        ? '🎉 Excelente! Você está muito próximo da meta!' 
                        : (metricas.receitaMes / metaAtual.valor) * 100 >= 50
                        ? '💪 Bom progresso! Continue assim!'
                        : diasRestantes() <= 7
                        ? '⚡ Última semana! Foco total nas vendas!'
                        : '📈 Acelere as vendas para atingir a meta!'
                      }
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;