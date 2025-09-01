import { 
  BarChart3, 
  Package, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp,
  Star,
  Heart,
  Settings,
  User,
  Bell,
  Home,
  Search
} from 'lucide-react';

/**
 * Componente de demonstração do sistema de ícones melhorado
 * usando Lucide React com as cores otimizadas do Meu Bentin
 */
export default function IconShowcase() {
  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg border border-border">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Sistema de Ícones - Lucide React
      </h3>
      
      <div className="space-y-6">
        {/* Ícones principais do sistema */}
        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-3">Ícones Principais</h4>
          <div className="flex flex-wrap gap-4">
            <div className="icon-wrapper bg-gradient-to-br from-orange-100 to-orange-200">
              <BarChart3 className="icon-size-md text-orange-600 icon-glow" />
            </div>
            <div className="icon-wrapper bg-gradient-to-br from-emerald-100 to-emerald-200">
              <Package className="icon-size-md text-emerald-600 icon-glow" />
            </div>
            <div className="icon-wrapper bg-gradient-to-br from-pink-100 to-pink-200">
              <ShoppingBag className="icon-size-md text-pink-600 icon-glow" />
            </div>
            <div className="icon-wrapper bg-gradient-to-br from-blue-100 to-blue-200">
              <DollarSign className="icon-size-md text-blue-600 icon-glow" />
            </div>
            <div className="icon-wrapper bg-gradient-to-br from-green-100 to-green-200">
              <TrendingUp className="icon-size-md text-green-600 icon-glow" />
            </div>
          </div>
        </div>

        {/* Ícones utilitários */}
        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-3">Ícones Utilitários</h4>
          <div className="flex flex-wrap gap-4">
            <div className="icon-wrapper bg-gradient-to-br from-yellow-100 to-yellow-200">
              <Star className="icon-size-md text-yellow-600 icon-bounce" />
            </div>
            <div className="icon-wrapper bg-gradient-to-br from-red-100 to-red-200">
              <Heart className="icon-size-md text-red-600 icon-bounce" />
            </div>
            <div className="icon-wrapper bg-gradient-to-br from-gray-100 to-gray-200">
              <Settings className="icon-size-md text-gray-600 icon-bounce" />
            </div>
            <div className="icon-wrapper bg-gradient-to-br from-purple-100 to-purple-200">
              <User className="icon-size-md text-purple-600 icon-bounce" />
            </div>
            <div className="icon-wrapper bg-gradient-to-br from-indigo-100 to-indigo-200">
              <Bell className="icon-size-md text-indigo-600 icon-bounce" />
            </div>
          </div>
        </div>

        {/* Diferentes tamanhos */}
        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-3">Tamanhos Disponíveis</h4>
          <div className="flex items-center gap-4">
            <div className="icon-wrapper bg-gradient-to-br from-teal-100 to-teal-200">
              <Home className="icon-size-sm text-teal-600" />
            </div>
            <div className="icon-wrapper bg-gradient-to-br from-teal-100 to-teal-200">
              <Home className="icon-size-md text-teal-600" />
            </div>
            <div className="icon-wrapper bg-gradient-to-br from-teal-100 to-teal-200">
              <Home className="icon-size-lg text-teal-600" />
            </div>
            <div className="icon-wrapper bg-gradient-to-br from-teal-100 to-teal-200">
              <Home className="icon-size-xl text-teal-600" />
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500 mt-4 p-3 bg-gray-50 rounded-lg">
          <strong>Biblioteca:</strong> Lucide React - Excelente compatibilidade com React 18+, TypeScript, SSR, e otimizada para performance. 
          Inclui mais de 1.000 ícones SVG consistentes e acessíveis.
        </div>
      </div>
    </div>
  );
}