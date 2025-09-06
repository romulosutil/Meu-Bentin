/**
 * Componente reutilizável para botão de cópia com fallbacks robustos
 */

import React, { useState } from 'react';
import { Copy, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { copyToClipboard, selectTextForManualCopy } from '../utils/clipboard';

interface CopyButtonProps {
  text: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'outline' | 'ghost' | 'default';
  className?: string;
  successMessage?: string;
  errorMessage?: string;
  showTooltip?: boolean;
}

export function CopyButton({
  text,
  size = 'sm',
  variant = 'outline',
  className = '',
  successMessage = 'Copiado!',
  errorMessage = 'Clique para selecionar texto',
  showTooltip = true
}: CopyButtonProps) {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleCopy = async () => {
    try {
      const result = await copyToClipboard(text);
      
      if (result.success) {
        setStatus('success');
        setTimeout(() => setStatus('idle'), 2000);
      } else {
        setStatus('error');
        // Mostrar interface manual de cópia
        selectTextForManualCopy(text);
        setTimeout(() => setStatus('idle'), 4000);
      }
    } catch (err) {
      // Não logar erros de clipboard - são esperados em muitos contextos
      setStatus('error');
      selectTextForManualCopy(text);
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default:
        return <Copy className="h-4 w-4" />;
    }
  };

  const getTooltipText = () => {
    switch (status) {
      case 'success':
        return successMessage;
      case 'error':
        return errorMessage;
      default:
        return 'Copiar texto';
    }
  };

  const button = (
    <Button
      size={size}
      variant={variant}
      className={`${className} transition-all duration-200 ${
        status === 'success' 
          ? 'border-green-500 bg-green-50 hover:bg-green-100' 
          : status === 'error' 
            ? 'border-orange-500 bg-orange-50 hover:bg-orange-100' 
            : 'hover:bg-muted'
      }`}
      onClick={handleCopy}
      disabled={status === 'success'}
    >
      {getIcon()}
    </Button>
  );

  if (!showTooltip) {
    return button;
  }

  return (
    <TooltipProvider>
      <Tooltip open={status !== 'idle'}>
        <TooltipTrigger asChild>
          {button}
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{getTooltipText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Versão simplificada para casos básicos
export function SimpleCopyButton({ text, className = '' }: { text: string; className?: string }) {
  return <CopyButton text={text} className={className} showTooltip={false} />;
}

// Hook para usar funcionalidade de cópia em outros componentes
export function useCopyToClipboard() {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const copy = async (text: string) => {
    try {
      const result = await copyToClipboard(text);
      
      if (result.success) {
        setStatus('success');
        setError(null);
        setTimeout(() => setStatus('idle'), 2000);
        return true;
      } else {
        setStatus('error');
        setError(result.error || 'Texto selecionado para cópia manual');
        selectTextForManualCopy(text);
        setTimeout(() => {
          setStatus('idle');
          setError(null);
        }, 4000);
        return false;
      }
    } catch (err) {
      setStatus('error');
      setError('Texto selecionado para cópia manual');
      selectTextForManualCopy(text);
      setTimeout(() => {
        setStatus('idle');
        setError(null);
      }, 4000);
      return false;
    }
  };

  return {
    copy,
    status,
    error,
    isLoading: status === 'idle',
    isSuccess: status === 'success',
    isError: status === 'error'
  };
}