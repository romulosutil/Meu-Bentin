/**
 * Provider de Toast para Sistema Meu Bentin
 * Implementação simples baseada em estado local
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { X } from 'lucide-react';

interface Toast {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString();
    const newToast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto-remover após duração especificada (padrão: 5s)
    setTimeout(() => {
      removeToast(id);
    }, toast.duration || 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const getToastStyles = (type: Toast['type']) => {
    const baseStyles = 'fixed top-4 right-4 z-50 max-w-sm w-full bg-white rounded-xl shadow-lg border p-4 transition-all duration-300';
    
    switch (type) {
      case 'success':
        return `${baseStyles} border-l-4 border-l-green-500 bg-green-50`;
      case 'error':
        return `${baseStyles} border-l-4 border-l-red-500 bg-red-50`;
      case 'warning':
        return `${baseStyles} border-l-4 border-l-yellow-500 bg-yellow-50`;
      case 'info':
        return `${baseStyles} border-l-4 border-l-blue-500 bg-blue-50`;
      default:
        return baseStyles;
    }
  };

  const getIconColor = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      case 'info':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      
      {/* Container de Toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={getToastStyles(toast.type)}
            role="alert"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h4 className={`font-semibold text-sm ${getIconColor(toast.type)}`}>
                  {toast.title}
                </h4>
                {toast.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {toast.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-3 flex-shrink-0 p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Fechar notificação"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// Hook para usar o contexto de toast
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser usado dentro de ToastProvider');
  }
  return context;
}

// Função auxiliar para criar toasts rapidamente
export const toast = {
  success: (title: string, description?: string) => {
    const context = useContext(ToastContext);
    context?.addToast({ type: 'success', title, description });
  },
  error: (title: string, description?: string) => {
    const context = useContext(ToastContext);
    context?.addToast({ type: 'error', title, description });
  },
  warning: (title: string, description?: string) => {
    const context = useContext(ToastContext);
    context?.addToast({ type: 'warning', title, description });
  },
  info: (title: string, description?: string) => {
    const context = useContext(ToastContext);
    context?.addToast({ type: 'info', title, description });
  },
};

export default ToastProvider;