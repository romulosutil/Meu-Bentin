import { useState, useCallback, Suspense, lazy } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { EstoqueProvider } from './utils/EstoqueContext';
import { ToastProvider } from './components/ToastProvider';
import Dashboard from './components/Dashboard';
import { ShoppingBag, Package, DollarSign, TrendingUp, BarChart3, Loader2 } from 'lucide-react';

// Lazy loading para componentes pesados
const Estoque = lazy(() => import('./components/Estoque'));
const Vendas = lazy(() => import('./components/Vendas'));
const Receita = lazy(() => import('./components/Receita'));
const AnaliseData = lazy(() => import('./components/AnaliseData'));

// Tipos para melhor type safety
type TabValue = 'dashboard' | 'estoque' | 'vendas' | 'receita' | 'analise';

interface TabConfig {
  value: TabValue;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  activeColor: string;
  iconBg: string;
  iconColor: string;
  component: React.ComponentType;
}

const TABS_CONFIG: TabConfig[] = [
  {
    value: 'dashboard',
    label: 'Dashboard',
    icon: BarChart3,
    activeColor: 'data-[state=active]:bg-bentin-pink',
    iconBg: 'from-orange-100 to-orange-200',
    iconColor: 'text-orange-600 group-data-[state=active]:text-white',
    component: Dashboard
  },
  {
    value: 'estoque',
    label: 'Estoque',
    icon: Package,
    activeColor: 'data-[state=active]:bg-bentin-blue',
    iconBg: 'from-emerald-100 to-emerald-200',
    iconColor: 'text-emerald-600 group-data-[state=active]:text-white',
    component: Estoque
  },
  {
    value: 'vendas',
    label: 'Vendas',
    icon: ShoppingBag,
    activeColor: 'data-[state=active]:bg-bentin-green',
    iconBg: 'from-pink-100 to-pink-200',
    iconColor: 'text-pink-600 group-data-[state=active]:text-white',
    component: Vendas
  },
  {
    value: 'receita',
    label: 'Receita',
    icon: DollarSign,
    activeColor: 'data-[state=active]:bg-bentin-orange',
    iconBg: 'from-blue-100 to-blue-200',
    iconColor: 'text-blue-600 group-data-[state=active]:text-white',
    component: Receita
  },
  {
    value: 'analise',
    label: 'Análise',
    icon: TrendingUp,
    activeColor: 'data-[state=active]:bg-bentin-mint',
    iconBg: 'from-green-100 to-green-200',
    iconColor: 'text-green-600 group-data-[state=active]:text-white',
    component: AnaliseData
  }
];

// Componente de Loading
const LoadingComponent = () => (
  <div className="flex items-center justify-center py-12">
    <div className="flex items-center gap-3">
      <Loader2 className="h-6 w-6 animate-spin text-bentin-pink" />
      <p className="text-muted-foreground">Carregando...</p>
    </div>
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState<TabValue>('dashboard');

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value as TabValue);
  }, []);

  return (
    <ToastProvider>
      <EstoqueProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        {/* Container principal otimizado para mobile */}
        <div className="w-full max-w-7xl mx-auto p-3 sm:p-4 lg:p-6">
          
          {/* Header otimizado */}
          <header className="mb-6 sm:mb-8">
            <div className="mb-4 sm:mb-6">
              {/* Título responsivo */}
              <div className="text-center sm:text-left">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-bentin-pink via-bentin-blue to-bentin-green bg-clip-text text-transparent leading-tight">
                  Sistema de Gestão
                </h1>
                <p className="text-xl sm:text-2xl text-slate-600 font-semibold mt-2 sm:mt-3">
                  Meu Bentin
                </p>
              </div>
            </div>
            
            {/* Subtítulo otimizado */}
            <div className="inline-block">
              <p className="text-sm sm:text-base text-muted-foreground bg-white/70 backdrop-blur-sm rounded-xl px-3 sm:px-4 py-2 border border-border/30">
                Sistema completo de gerenciamento para loja infantil
              </p>
            </div>
          </header>

          {/* Navegação por abas otimizada */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4 sm:space-y-6">
            
            {/* TabsList responsivo */}
            <TabsList className="w-full bg-white rounded-2xl p-2 sm:p-3 shadow-sm border border-border/50 h-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1 sm:gap-2 w-full">
                {TABS_CONFIG.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <TabsTrigger 
                      key={tab.value}
                      value={tab.value} 
                      className={`
                        bentin-tab-trigger 
                        flex flex-col sm:flex-row 
                        items-center justify-center 
                        gap-1 sm:gap-2 
                        rounded-xl 
                        px-2 sm:px-4 
                        py-2 sm:py-3 
                        h-auto 
                        min-h-[50px] sm:min-h-[60px]
                        text-xs sm:text-sm
                        ${tab.activeColor}
                        data-[state=active]:text-white 
                        transition-all duration-200 
                        data-[state=active]:shadow-md 
                        group
                        ${tab.value === 'analise' ? 'col-span-2 sm:col-span-1' : ''}
                      `}
                      aria-label={`Navegar para ${tab.label}`}
                    >
                      <div className={`
                        bentin-tab-icon 
                        p-1.5 sm:p-2 
                        rounded-lg 
                        bg-gradient-to-br 
                        ${tab.iconBg}
                        flex-shrink-0 
                        transition-all duration-200 
                        group-data-[state=active]:from-white/20 
                        group-data-[state=active]:to-white/30
                      `}>
                        <IconComponent className={`h-4 w-4 sm:h-5 sm:w-5 ${tab.iconColor} transition-colors duration-200`} />
                      </div>
                      <span className="font-semibold whitespace-nowrap leading-tight">
                        {tab.label}
                      </span>
                    </TabsTrigger>
                  );
                })}
              </div>
            </TabsList>

            {/* Conteúdo das abas com lazy loading */}
            {TABS_CONFIG.map((tab) => {
              const Component = tab.component;
              return (
                <TabsContent 
                  key={tab.value} 
                  value={tab.value}
                  className="mt-4 sm:mt-6 focus:outline-none"
                  tabIndex={-1}
                >
                  {/* Renderização condicional para performance */}
                  {activeTab === tab.value && (
                    <div className="animate-in fade-in duration-300">
                      <Suspense fallback={<LoadingComponent />}>
                        <Component />
                      </Suspense>
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      </div>
      </EstoqueProvider>
    </ToastProvider>
  );
}