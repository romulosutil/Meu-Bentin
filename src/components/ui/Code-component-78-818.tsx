import React from 'react';
import { Card, CardContent } from './card';
import { Button } from './button';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { Toast as ToastType } from '../../hooks/useToast';

interface ToastProps {
  toast: ToastType;
  onRemove: (id: string) => void;
}

const toastVariants = {
  default: {
    icon: Info,
    className: 'border-gray-200 bg-white text-gray-900',
    iconClassName: 'text-gray-600'
  },
  success: {
    icon: CheckCircle,
    className: 'border-green-200 bg-green-50 text-green-900',
    iconClassName: 'text-green-600'
  },
  error: {
    icon: AlertCircle,
    className: 'border-red-200 bg-red-50 text-red-900',
    iconClassName: 'text-red-600'
  },
  warning: {
    icon: AlertTriangle,
    className: 'border-orange-200 bg-orange-50 text-orange-900',
    iconClassName: 'text-orange-600'
  },
  info: {
    icon: Info,
    className: 'border-blue-200 bg-blue-50 text-blue-900',
    iconClassName: 'text-blue-600'
  }
};

export const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const variant = toastVariants[toast.variant];
  const IconComponent = variant.icon;

  return (
    <Card className={`${variant.className} shadow-lg border-l-4 animate-in slide-in-from-right duration-300`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <IconComponent className={`h-5 w-5 ${variant.iconClassName} flex-shrink-0 mt-0.5`} />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm leading-tight">{toast.title}</p>
            {toast.description && (
              <p className="text-sm opacity-90 mt-1 leading-tight">{toast.description}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(toast.id)}
            className="h-6 w-6 p-0 hover:bg-black/10 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

interface ToastContainerProps {
  toasts: ToastType[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 w-full max-w-sm space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} onRemove={onRemove} />
        </div>
      ))}
    </div>
  );
};