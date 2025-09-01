import { useState, useMemo } from 'react';
import { useEstoque } from '../utils/EstoqueContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Calendar,
  BarChart3,
  Brain,
  AlertCircle,
  ShoppingBag,
  Package,
  DollarSign,
  Users,
  Activity,
  Zap
} from 'lucide-react';

const AnaliseData = () => {
  const { produtos, vendas, vendedores } = useEstoque();
  const [periodoAnalise, setPeriodoAnalise] = useState('30dias');

  // Cores para gráficos
  const CORES = ['#e91e63', '#2196f3', '#4caf50', '#ff6b35', '#9c27b0', '#00bcd4'];

  // Calcular análises baseadas nos dados reais
  const analises = useMemo(() => {
    const hoje = new Date();
    const dias30 = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
    const dias7 = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Filtrar vendas por período
    const vendasPeriodo = vendas.filter(venda => {
      const dataVenda = new Date(venda.data);
      return dataVenda >= dias30 && venda.status === 'concluida';
    });
    
    const vendasSemana = vendas.filter(venda => {
      const dataVenda = new Date(venda.data);
      return dataVenda >= dias7 && venda.status === 'concluida';
    });

    // Receita total
    const receitaTotal = vendasPeriodo.reduce((total, venda) => total + venda.total, 0);
    const receitaSemana = vendasSemana.reduce((total, venda) => total + venda.total, 0);
    
    // Produtos mais vendidos
    const contadorProdutos: { [key: string]: { 
      nome: string; 
      quantidade: number; 
      receita: number; 
      categoria: string;
    } } = {};
    
    vendasPeriodo.forEach(venda => {
      venda.itens.forEach(item => {
        const produto = produtos.find(p => p.id === item.produtoId);
        if (contadorProdutos[item.produtoId]) {
          contadorProdutos[item.produtoId].quantidade += item.quantidade;
          contadorProdutos[item.produtoId].receita += item.subtotal;
        } else {
          contadorProdutos[item.produtoId] = {
            nome: item.produto,
            quantidade: item.quantidade,
            receita: item.subtotal,
            categoria: produto?.categoria || 'N/A'
          };
        }
      });
    });
    
    const produtosMaisVendidos = Object.values(contadorProdutos)
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5);

    // Análise por categoria
    const vendasPorCategoria: { [key: string]: { vendas: number; receita: number } } = {};
    
    vendasPeriodo.forEach(venda => {
      venda.itens.forEach(item => {
        const produto = produtos.find(p => p.id === item.produtoId);
        const categoria = produto?.categoria || 'Outros';
        
        if (vendasPorCategoria[categoria]) {
          vendasPorCategoria[categoria].vendas += item.quantidade;
          vendasPorCategoria[categoria].receita += item.subtotal;
        } else {
          vendasPorCategoria[categoria] = {
            vendas: item.quantidade,
            receita: item.subtotal
          };
        }
      });
    });

    const categorias = Object.entries(vendasPorCategoria)
      .map(([categoria, dados]) => ({ categoria, ...dados }))
      .sort((a, b) => b.receita - a.receita);

    // Performance de vendedores
    const performanceVendedores = vendedores.map(vendedor => {
      const vendasVendedor = vendasPeriodo.filter(v => v.vendedorId === vendedor.id);
      const receita = vendasVendedor.reduce((total, venda) => total + venda.total, 0);
      const quantidadeVendas = vendasVendedor.length;
      const ticketMedio = quantidadeVendas > 0 ? receita / quantidadeVendas : 0;
      
      return {
        nome: vendedor.nome,
        vendas: quantidadeVendas,
        receita,
        ticketMedio,
        comissao: vendedor.comissao,
        comissaoTotal: receita * (vendedor.comissao / 100)
      };
    }).sort((a, b) => b.receita - a.receita);

    // Tendência semanal
    const ultimasSemanas = Array.from({ length: 4 }, (_, i) => {
      const fimSemana = new Date(hoje.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const inicioSemana = new Date(fimSemana.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const vendasSemana = vendas.filter(venda => {
        const dataVenda = new Date(venda.data);
        return dataVenda >= inicioSemana && dataVenda < fimSemana && venda.status === 'concluida';
      });
      
      return {
        semana: `Sem ${4 - i}`,
        vendas: vendasSemana.length,
        receita: vendasSemana.reduce((total, venda) => total + venda.total, 0)
      };
    }).reverse();

    // Análise de estoque
    const produtosBaixoEstoque = produtos.filter(p => p.quantidade <= p.estoqueMinimo);
    const produtosEsgotados = produtos.filter(p => p.quantidade === 0);
    const valorEstoque = produtos.reduce((total, p) => total + (p.preco * p.quantidade), 0);
    
    return {
      receitaTotal,
      receitaSemana,
      produtosMaisVendidos,
      categorias,
      performanceVendedores,
      ultimasSemanas,
      produtosBaixoEstoque: produtosBaixoEstoque.length,
      produtosEsgotados: produtosEsgotados.length,
      valorEstoque
    };
  }, [produtos, vendas, vendedores]);

  // Gerar insights inteligentes baseados nos dados reais
  const gerarInsights = () => {
    const insights = [];
    
    // Insight sobre crescimento
    if (analises.ultimasSemanas.length >= 2) {
      const ultimaSemana = analises.ultimasSemanas[analises.ultimasSemanas.length - 1];
      const penultimaSemana = analises.ultimasSemanas[analises.ultimasSemanas.length - 2];
      
      if (ultimaSemana.receita > penultimaSemana.receita) {
        const crescimento = ((ultimaSemana.receita - penultimaSemana.receita) / penultimaSemana.receita * 100).toFixed(1);
        insights.push({
          tipo: 'crescimento',
          titulo: 'Tendência de Crescimento',
          descricao: `Suas vendas cresceram ${crescimento}% na última semana comparado à anterior.`,
          impacto: 'positivo',
          recomendacao: 'Continue investindo nos produtos que estão performando bem. Considere aumentar o estoque dos itens mais vendidos.',
          icon: TrendingUp,
          valor: `+${crescimento}%`
        });
      } else if (penultimaSemana.receita > 0) {
        const queda = ((penultimaSemana.receita - ultimaSemana.receita) / penultimaSemana.receita * 100).toFixed(1);
        insights.push({
          tipo: 'alerta',
          titulo: 'Queda nas Vendas',
          descricao: `Houve uma redução de ${queda}% nas vendas da última semana.`,
          impacto: 'negativo',
          recomendacao: 'Analise os fatores que podem ter influenciado a queda. Considere promoções ou campanhas para reativar as vendas.',
          icon: TrendingDown,
          valor: `-${queda}%`
        });
      }
    }

    // Insight sobre estoque
    if (analises.produtosBaixoEstoque > 0) {
      insights.push({
        tipo: 'estoque',
        titulo: 'Atenção ao Estoque',
        descricao: `${analises.produtosBaixoEstoque} produtos estão com estoque baixo ou esgotado.`,
        impacto: 'alerta',
        recomendacao: 'Priorize a reposição destes itens para não perder vendas. Configure alertas automáticos para estoque mínimo.',
        icon: Package,
        valor: analises.produtosBaixoEstoque.toString()
      });
    }

    // Insight sobre produto mais vendido
    if (analises.produtosMaisVendidos.length > 0) {
      const topProduto = analises.produtosMaisVendidos[0];
      insights.push({
        tipo: 'produto',
        titulo: 'Produto Destaque',
        descricao: `"${topProduto.nome}" é seu produto mais vendido com ${topProduto.quantidade} unidades.`,
        impacto: 'oportunidade',
        recomendacao: 'Mantenha este produto sempre em estoque e considere criar variações ou combos para aumentar as vendas.',
        icon: ShoppingBag,
        valor: `${topProduto.quantidade} un`
      });
    }

    // Insight sobre vendedor
    if (analises.performanceVendedores.length > 0) {
      const topVendedor = analises.performanceVendedores[0];
      if (topVendedor.vendas > 0) {
        insights.push({
          tipo: 'vendedor',
          titulo: 'Vendedor Destaque',
          descricao: `${topVendedor.nome} é seu vendedor com melhor performance, gerando R$ ${topVendedor.receita.toLocaleString('pt-BR', {minimumFractionDigits: 2})}.`,
          impacto: 'positivo',
          recomendacao: 'Reconheça o bom trabalho e analise as técnicas usadas para replicar com outros vendedores.',
          icon: Users,
          valor: `R$ ${topVendedor.receita.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`
        });
      }
    }

    // Insight sobre categorias
    if (analises.categorias.length > 1) {
      const topCategoria = analises.categorias[0];
      const percentual = ((topCategoria.receita / analises.receitaTotal) * 100).toFixed(1);
      insights.push({
        tipo: 'categoria',
        titulo: 'Categoria Líder',
        descricao: `"${topCategoria.categoria}" representa ${percentual}% da sua receita total.`,
        impacto: 'insight',
        recomendacao: 'Diversifique seu portfólio para reduzir dependência de uma única categoria, mas mantenha o foco nesta área forte.',
        icon: BarChart3,
        valor: `${percentual}%`
      });
    }

    return insights.slice(0, 6); // Máximo 6 insights
  };

  const insights = gerarInsights();

  const getInsightColor = (impacto: string) => {
    switch (impacto) {
      case 'positivo':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'oportunidade':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'negativo':
      case 'alerta':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'insight':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getInsightIcon = (impacto: string) => {
    switch (impacto) {
      case 'positivo': return '✅';
      case 'oportunidade': return '🚀';
      case 'negativo': return '⚠️';
      case 'alerta': return '🔔';
      case 'insight': return '💡';
      default: return '📊';
    }
  };

  return (
    <div className="space-y-6">
      {/* Insights Inteligentes Gerados Automaticamente */}
      <Card className="bentin-card border-l-4 border-l-bentin-mint">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <div className="bentin-icon-wrapper bg-gradient-to-r from-bentin-pink to-bentin-blue">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                Insights Inteligentes
              </CardTitle>
              <CardDescription>
                Análises automáticas baseadas nos seus dados de vendas e estoque
                <Badge className="ml-2 bg-green-100 text-green-800">
                  <Activity className="h-3 w-3 mr-1" />
                  Atualizado automaticamente
                </Badge>
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Período de análise</p>
              <Select value={periodoAnalise} onValueChange={setPeriodoAnalise}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7dias">7 dias</SelectItem>
                  <SelectItem value="30dias">30 dias</SelectItem>
                  <SelectItem value="90dias">90 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {insights.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {insights.map((insight, index) => (
                <div key={index} className="p-4 border border-border/50 rounded-2xl space-y-3 bg-gradient-to-br from-white to-slate-50 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <insight.icon className="h-4 w-4 text-bentin-blue" />
                      <h4 className="font-semibold text-gray-800">{insight.titulo}</h4>
                    </div>
                    <div className="text-xl font-bold text-bentin-pink">
                      {insight.valor}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{insight.descricao}</p>
                  <div className="space-y-2">
                    <Badge className={`${getInsightColor(insight.impacto)} rounded-lg font-medium`}>
                      {getInsightIcon(insight.impacto)} {insight.impacto === 'positivo' ? 'Positivo' : 
                       insight.impacto === 'oportunidade' ? 'Oportunidade' : 
                       insight.impacto === 'negativo' ? 'Atenção' :
                       insight.impacto === 'alerta' ? 'Alerta' : 'Insight'}
                    </Badge>
                    <div className="bg-slate-50 p-3 rounded-lg border">
                      <p className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        Recomendação:
                      </p>
                      <p className="text-xs text-gray-600">{insight.recomendacao}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">Coletando dados para análise...</p>
              <p className="text-sm">Complete algumas vendas para ver insights personalizados</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendência de Vendas Semanal */}
        <Card className="bentin-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="bentin-icon-wrapper bg-bentin-blue/10">
                <TrendingUp className="h-5 w-5 text-bentin-blue" />
              </div>
              Tendência de Vendas
            </CardTitle>
            <CardDescription>Performance das últimas 4 semanas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analises.ultimasSemanas}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="semana" 
                  tick={{ fontSize: 12 }}
                  stroke="#666"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#666"
                />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    name === 'receita' ? `R$ ${value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : value,
                    name === 'receita' ? 'Receita' : 'Vendas'
                  ]}
                  labelStyle={{ color: '#333' }}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="receita" 
                  stroke="#e91e63" 
                  strokeWidth={3}
                  dot={{ fill: '#e91e63', strokeWidth: 2, r: 5 }}
                  name="receita"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Vendas por Categoria */}
        <Card className="bentin-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="bentin-icon-wrapper bg-bentin-green/10">
                <BarChart3 className="h-5 w-5 text-bentin-green" />
              </div>
              Vendas por Categoria
            </CardTitle>
            <CardDescription>Distribuição da receita por categoria</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analises.categorias}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ categoria, receita }) => `${categoria}: R$ ${receita.toFixed(0)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="receita"
                >
                  {analises.categorias.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [`R$ ${value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, 'Receita']}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Produtos Mais Vendidos */}
        <Card className="bentin-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="bentin-icon-wrapper bg-bentin-orange/10">
                <ShoppingBag className="h-5 w-5 text-bentin-orange" />
              </div>
              Top 5 Produtos
            </CardTitle>
            <CardDescription>Produtos mais vendidos nos últimos 30 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analises.produtosMaisVendidos.length > 0 ? (
                analises.produtosMaisVendidos.map((produto, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-white rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="bg-bentin-pink text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold">{produto.nome}</p>
                        <p className="text-sm text-muted-foreground">{produto.categoria}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-bentin-green">
                        R$ {produto.receita.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {produto.quantidade} unidades
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingBag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma venda registrada ainda</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Performance de Vendedores */}
        <Card className="bentin-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="bentin-icon-wrapper bg-bentin-mint/10">
                <Users className="h-5 w-5 text-bentin-mint" />
              </div>
              Performance de Vendedores
            </CardTitle>
            <CardDescription>Análise de receita por vendedor</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analises.performanceVendedores.map((vendedor, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{vendedor.nome}</span>
                    <div className="text-right">
                      <p className="font-bold text-bentin-blue">
                        R$ {vendedor.receita.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {vendedor.vendas} vendas • Ticket: R$ {vendedor.ticketMedio.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                      </p>
                    </div>
                  </div>
                  <Progress 
                    value={vendedor.receita > 0 ? (vendedor.receita / Math.max(...analises.performanceVendedores.map(v => v.receita))) * 100 : 0}
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Comissão: {vendedor.comissao}%</span>
                    <span>R$ {vendedor.comissaoTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo Executivo */}
      <Card className="bentin-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="bentin-icon-wrapper bg-gradient-to-r from-bentin-orange to-bentin-pink">
              <Target className="h-5 w-5 text-white" />
            </div>
            Resumo Executivo
          </CardTitle>
          <CardDescription>Visão geral do negócio nos últimos 30 dias</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
              <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-green-700 font-medium">Receita Total</p>
              <p className="text-2xl font-bold text-green-800">
                R$ {analises.receitaTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
              </p>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
              <ShoppingBag className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-blue-700 font-medium">Total de Vendas</p>
              <p className="text-2xl font-bold text-blue-800">
                {vendas.filter(v => v.status === 'concluida').length}
              </p>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
              <Package className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-purple-700 font-medium">Valor em Estoque</p>
              <p className="text-2xl font-bold text-purple-800">
                R$ {analises.valorEstoque.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
              </p>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
              <AlertCircle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="text-sm text-orange-700 font-medium">Produtos em Alerta</p>
              <p className="text-2xl font-bold text-orange-800">
                {analises.produtosBaixoEstoque + analises.produtosEsgotados}
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Como são gerados os insights?
            </h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Nossos insights são gerados automaticamente através da análise dos seus dados reais de vendas, estoque e performance. 
              O sistema monitora tendências de crescimento/queda, identifica produtos em destaque, analisa performance de vendedores, 
              alerta sobre estoque baixo e fornece recomendações baseadas em padrões identificados nos dados. 
              Todos os insights são atualizados em tempo real conforme novas vendas são registradas.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnaliseData;