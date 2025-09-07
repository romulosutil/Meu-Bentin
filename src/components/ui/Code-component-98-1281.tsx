import React, { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { Button } from './button';

interface ModalBaseCorrigidoProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
  preventCloseOnOverlay?: boolean;
  preventCloseOnEsc?: boolean;
  isLoading?: boolean;
}

export const ModalBaseCorrigido: React.FC<ModalBaseCorrigidoProps> = ({
  open,
  onClose,
  title,
  subtitle,
  icon,
  children,
  footer,
  maxWidth = "max-w-6xl",
  preventCloseOnOverlay = false,
  preventCloseOnEsc = false,
  isLoading = false
}) => {
  
  // Implementação da tecla ESC conforme diretriz técnica
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open && !preventCloseOnEsc && !isLoading) {
        onClose();
      }
    };
    
    if (open) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden'; // Previne scroll do body
    }
    
    // Cleanup function para evitar memory leaks
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [open, onClose, preventCloseOnEsc, isLoading]);

  // Handler para clique no overlay
  const handleOverlayClick = useCallback(() => {
    if (!preventCloseOnOverlay && !isLoading) {
      onClose();
    }
  }, [onClose, preventCloseOnOverlay, isLoading]);

  // Handler para clique no conteúdo do modal (impede propagação)
  const handleContentClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop com onClick que chama onClose */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm" 
        onClick={handleOverlayClick}
      />
      
      {/* Modal Content - Layout Wide Padrão */}
      <div 
        className={`modal-container relative bg-white rounded-xl shadow-xl w-[90vw] ${maxWidth} flex flex-col border border-gray-200`}
        style={{ maxHeight: '90vh', overflow: 'hidden' }}
        onClick={handleContentClick} // Impede propagação para o overlay
      >
        
        {/* Header Padronizado */}
        <div className="modal-header flex items-center justify-between p-6 border-b border-border/40 bg-white" style={{ flexShrink: 0 }}>
          <div className="flex items-center gap-3">
            {icon && (
              <div className="p-2 rounded-lg bg-bentin-pink/10 border border-bentin-pink/20">
                {icon}
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {title}
              </h2>
              {subtitle && (
                <p className="text-sm text-gray-600">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          
          {/* Botão X que chama onClose */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-9 w-9 p-0 hover:bg-gray-100 rounded-lg"
            disabled={isLoading}
            aria-label="Fechar modal"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Conteúdo Scrollável */}
        <div 
          className="modal-body bentin-scroll p-6" 
          style={{ flexGrow: 1, overflowY: 'auto' }}
        >
          {children}
        </div>

        {/* Footer (se fornecido) */}
        {footer && (
          <div className="modal-footer flex items-center justify-end gap-3 p-6 border-t border-border/40 bg-white" style={{ flexShrink: 0 }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// Hook para facilitar o uso do modal
export const useModalCorrigido = (initialOpen: boolean = false) => {
  const [open, setOpen] = React.useState(initialOpen);
  
  const openModal = useCallback(() => setOpen(true), []);
  const closeModal = useCallback(() => setOpen(false), []);
  const toggleModal = useCallback(() => setOpen(prev => !prev), []);
  
  return {
    open,
    openModal,
    closeModal,
    toggleModal,
    setOpen
  };
};