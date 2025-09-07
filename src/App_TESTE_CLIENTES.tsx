import { useState, useCallback, Suspense, lazy, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { EstoqueProvider } from './utils/EstoqueContextSemVendedor';
import { ToastProvider } from './components/ToastProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useAuth } from './hooks/useAuth';
import Login from './components/Login';
import AuthenticatedHeader from './components/AuthenticatedHeader';
import Dashboard from './components/Dashboard';
import TesteClienteModal from './components/TesteClienteModal';
import { ShoppingBag, Package, DollarSign, TrendingUp, BarChart3, Loader2, TestTube } from 'lucide-react';
import { initializeClipboard } from './utils/clipboard';

// Lazy loading para componentes pesados
const Estoque = lazy(() => import('./components/EstoqueModerno'));
const Vendas = lazy(() => import('./components/VendasSemVendedor'));
const Receita = lazy(() => import('./components/Receita'));
const AnaliseData = lazy(() => import('./components/AnaliseData'));

// Tipos para melhor type safety
type TabValue = 'dashboard' | 'estoque' | 'vendas' | 'receita' | 'analise' | 'teste-clientes';

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
  },
  {
    value: 'teste-clientes',
    label: 'Teste Clientes',
    icon: TestTube,
    activeColor: 'data-[state=active]:bg-purple-600',
    iconBg: 'from-purple-100 to-purple-200',
    iconColor: 'text-purple-600 group-data-[state=active]:text-white',
    component: TesteClienteModal
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
  const [activeTab, setActiveTab] = useState<TabValue>('teste-clientes'); // Iniciar na aba de teste
  const { isAuthenticated, login } = useAuth();

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value as TabValue);
  }, []);

  // Inicializar verificação de clipboard antecipadamente
  useEffect(() => {
    initializeClipboard();
  }, []);

  // Se não estiver autenticado, mostrar tela de login
  if (!isAuthenticated) {
    return (
      <ToastProvider>
        <Login onLogin={login} />
      </ToastProvider>
    );
  }

  // Se estiver autenticado, mostrar o sistema principal
  return (
    <ErrorBoundary>
      <ToastProvider>
        <EstoqueProvider>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
            {/* Container principal com design desktop-first - largura expandida */}
            <div className="container mx-auto max-w-full px-6 py-8 lg:px-8 xl:px-12">
              
              {/* Header com autenticação */}
              <header className="mb-8">
                <div className="mb-6">
                  <AuthenticatedHeader />
                </div>
                
                {/* Subtítulo profissional */}
                <div className="max-w-2xl">
                  <p className="text-muted-foreground bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 border border-border/40 shadow-sm">
                    Sistema completo de gerenciamento para loja infantil - MODO TESTE CLIENTES
                  </p>
                </div>
              </header>

              {/* Navegação por abas com design desktop-first */}
              <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-8">
                
                {/* TabsList com largura otimizada */}
                <TabsList className="inline-flex bg-white rounded-2xl p-2 shadow-lg border border-border/50 h-auto">
                  <div className="flex gap-2 flex-wrap">
                    {TABS_CONFIG.map((tab) => {
                      const IconComponent = tab.icon;
                      return (
                        <TabsTrigger 
                          key={tab.value}
                          value={tab.value} 
                          className={`
                            bentin-tab-trigger 
                            flex items-center gap-3
                            rounded-xl 
                            px-6 py-4
                            h-auto 
                            min-h-[60px] min-w-[120px]
                            text-sm font-medium
                            ${tab.activeColor}
                            data-[state=active]:text-white 
                            transition-all duration-200 
                            data-[state=active]:shadow-lg 
                            group
                            hover:bg-gray-50
                            data-[state=active]:hover:bg-transparent
                          `}
                          aria-label={`Navegar para ${tab.label}`}
                        >
                          <div className={`
                            bentin-tab-icon 
                            p-2 
                            rounded-lg 
                            bg-gradient-to-br 
                            ${tab.iconBg}
                            flex-shrink-0 
                            transition-all duration-200 
                            group-data-[state=active]:from-white/20 
                            group-data-[state=active]:to-white/30
                          `}>
                            <IconComponent className={`h-5 w-5 ${tab.iconColor} transition-colors duration-200`} />
                          </div>
                          <span className="font-semibold">
                            {tab.label}
                          </span>
                        </TabsTrigger>
                      );
                    })}
                  </div>
                </TabsList>

                {/* Conteúdo das abas */}
                {TABS_CONFIG.map((tab) => {
                  const Component = tab.component;
                  return (
                    <TabsContent 
                      key={tab.value} 
                      value={tab.value}
                      className="mt-8 focus:outline-none"
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
    </ErrorBoundary>
  );
}