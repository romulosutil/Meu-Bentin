import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  color?: 'success' | 'info' | 'warning' | 'danger' | 'primary';
  className?: string;
}

/**
 * StatsCard Redesenhado - Sistema Vibrante e Limpo
 * 
 * Features:
 * - Paleta de cores vibrante e rica
 * - Gradientes sutis integrados
 * - Tipografia aprimorada com hierarquia clara
 * - Ícones com gradientes e sombras
 * - Sombras suaves e dinâmicas
 * - Responsividade completa
 * - Consistência global garantida
 */
export function StatsCard({ 
  title, 
  value, 
  description, 
  icon, 
  trend, 
  color = 'info',
  className = ''
}: StatsCardProps) {
  
  // Formatação inteligente de valores numéricos
  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      }
      if (val >= 1000) {
        return val.toLocaleString('pt-BR');
      }
      return val.toString();
    }
    return val;
  };

  return (
    <div className={`
      metrics-card 
      metrics-card-${color} 
      p-6 
      ${className}
    `}>
      {/* Header com título e ícone */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="metrics-title">
            {title}
          </h3>
          {description && (
            <p className="metrics-description">
              {description}
            </p>
          )}
        </div>
        
        {/* Container do ícone aprimorado */}
        <div className={`
          metrics-icon-container 
          metrics-icon-${color}
          flex-shrink-0
          ml-4
        `}>
          <div className="h-6 w-6">
            {icon}
          </div>
        </div>
      </div>

      {/* Valor principal com tipografia aprimorada */}
      <div className="mb-3">
        <div className={`
          metrics-value 
          metrics-value-${color}
        `}>
          {formatValue(value)}
        </div>
      </div>

      {/* Trend indicator aprimorado */}
      {trend && (
        <div className="flex items-center">
          <div className={`
            flex items-center gap-1 text-sm font-semibold rounded-full px-2.5 py-1
            ${trend.isPositive 
              ? 'text-green-700 bg-green-100 border border-green-200' 
              : 'text-red-700 bg-red-100 border border-red-200'
            }
          `}>
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>
              {Math.abs(trend.value)}%
            </span>
          </div>
          
          <span className="ml-2 text-xs font-medium text-gray-500">
            {trend.label}
          </span>
        </div>
      )}
    </div>
  );
}