import { useState, useCallback, Suspense, lazy } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { EstoqueProvider } from './utils/EstoqueContext';
import { AuthProvider, useAuth } from './utils/AuthContext';
import { ToastProvider } from './components/ToastProvider';
import { ShoppingBag, Package, DollarSign, TrendingUp, BarChart3, Loader2 } from 'lucide-react';

// Lazy loading dos componentes principais
const LoginForm = lazy(() => import('./components/LoginForm'));
const UserHeader = lazy(() => import('./components/UserHeader'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const Estoque = lazy(() => import('./components/Estoque'));
const Vendas = lazy(() => import('./components/Vendas'));
const Receita = lazy(() => import('./components/Receita'));
const AnaliseData = lazy(() => import('./components/AnaliseData'));

// Configuração das abas
const TABS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: BarChart3,
    color: 'bentin-pink',
    component: Dashboard
  },
  {
    id: 'estoque',
    label: 'Estoque', 
    icon: Package,
    color: 'bentin-blue',
    component: Estoque
  },
  {
    id: 'vendas',
    label: 'Vendas',
    icon: ShoppingBag,
    color: 'bentin-green', 
    component: Vendas
  },
  {
    id: 'receita',
    label: 'Receita',
    icon: DollarSign,
    color: 'bentin-orange',
    component: Receita
  },
  {
    id: 'analise',
    label: 'Análise',
    icon: TrendingUp,
    color: 'bentin-mint',
    component: AnaliseData
  }
] as const;

// Loading component otimizado
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm">
        <Loader2 className="h-6 w-6 animate-spin text-bentin-pink" />
        <p className="text-muted-foreground font-medium">Carregando...</p>
      </div>
    </div>
  );
}

// Componente principal da aplicação
function MainApp() {
  const { isAuthenticated, login, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
  }, []);

  // Tela de login
  if (!isAuthenticated) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <LoginForm onLogin={login} isLoading={isLoading} />
      </Suspense>
    );
  }

  // Aplicação principal
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="w-full max-w-7xl mx-auto p-4 lg:p-6">
        
        {/* Header */}
        <header className="mb-8">
          <Suspense fallback={<div className="h-20 bg-white/50 rounded-2xl animate-pulse" />}>
            <UserHeader />
          </Suspense>
          <p className="mt-2 text-muted-foreground bg-white/70 rounded-xl px-4 py-2 border border-border/30 inline-block">
            Sistema completo de gerenciamento para loja infantil
          </p>
        </header>

        {/* Navegação por abas */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          
          {/* Lista de abas */}
          <TabsList className="w-full bg-white rounded-2xl p-3 shadow-sm border border-border/50 h-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 w-full">
              {TABS.map(({ id, label, icon: Icon, color }) => (
                <TabsTrigger 
                  key={id}
                  value={id}
                  className={`
                    flex flex-col sm:flex-row items-center gap-2 
                    rounded-xl px-4 py-3 h-auto min-h-[60px]
                    data-[state=active]:bg-${color}
                    data-[state=active]:text-white
                    transition-all duration-200
                    hover:bg-slate-50
                  `}
                >
                  <div className="p-2 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 group-data-[state=active]:bg-white/20">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-semibold text-sm">{label}</span>
                </TabsTrigger>
              ))}
            </div>
          </TabsList>

          {/* Conteúdo das abas */}
          {TABS.map(({ id, component: Component }) => (
            <TabsContent key={id} value={id} className="mt-6">
              {activeTab === id && (
                <div className="animate-in fade-in duration-300">
                  <Suspense fallback={<LoadingSpinner />}>
                    <Component />
                  </Suspense>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

// App raiz com providers
export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <EstoqueProvider>
          <MainApp />
        </EstoqueProvider>
      </AuthProvider>
    </ToastProvider>
  );
}