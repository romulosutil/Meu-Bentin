/**
 * Componente para indicar quando o sistema está em modo demonstração
 * Design elegante e menos intrusivo
 */

import React, { useState } from 'react';
import { AlertCircle, Database, X, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

interface DemoModeIndicatorProps {
  onShowSetupGuide: () => void;
  demoReason?: 'tables_missing' | 'connection_error';
}

export function DemoModeIndicator({ onShowSetupGuide, demoReason = 'tables_missing' }: DemoModeIndicatorProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  if (isHidden) return null;

  const getMessage = () => {
    switch (demoReason) {
      case 'tables_missing':
        return 'Banco não configurado - usando dados de exemplo';
      case 'connection_error':
        return 'Erro de conexão - modo offline temporário';
      default:
        return 'Modo demonstração ativo';
    }
  };

  const getButtonText = () => {
    switch (demoReason) {
      case 'tables_missing':
        return 'Configurar';
      case 'connection_error':
        return 'Tentar Novamente';
      default:
        return 'Ver Instruções';
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          size="sm"
          variant="outline"
          className="bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100 shadow-lg"
        >
          <Database className="h-4 w-4 mr-2" />
          Demo
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 to-amber-100 border-l-4 border-amber-400 shadow-sm">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <Database className="h-5 w-5 text-amber-600" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span className="font-medium text-amber-900 text-sm">
                  Modo Demonstração
                </span>
                <span className="text-amber-700 text-xs sm:text-sm">
                  {getMessage()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              onClick={onShowSetupGuide}
              size="sm"
              variant="outline"
              className="bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-300 text-xs px-3 py-1.5 h-auto"
            >
              {getButtonText()}
            </Button>
            
            <div className="flex gap-1">
              <Button
                onClick={() => setIsMinimized(true)}
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-amber-600 hover:bg-amber-200"
              >
                <ChevronRight className="h-3 w-3 rotate-180" />
              </Button>
              
              <Button
                onClick={() => setIsHidden(true)}
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-amber-600 hover:bg-amber-200"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}