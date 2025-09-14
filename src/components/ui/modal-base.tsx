import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './dialog';
import { Button } from './button';
import { X, Loader2 } from 'lucide-react';

interface ModalBaseProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'wide' | 'full';
  onCancel?: () => void;
  onSubmit?: () => void;
  submitText?: string;
  cancelText?: string;
  isLoading?: boolean;
  showFooter?: boolean;
  allowCloseOnOutsideClick?: boolean;
  icon?: React.ReactNode;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
  '2xl': 'max-w-7xl',
  '3xl': 'max-w-[90vw]',
  wide: 'max-w-[95vw]',
  full: 'max-w-[98vw] w-[98vw]'
};

export function ModalBase({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = 'md',
  onCancel,
  onSubmit,
  submitText = 'Salvar',
  cancelText = 'Cancelar',
  isLoading = false,
  showFooter = true,
  allowCloseOnOutsideClick = true,
  icon
}: ModalBaseProps) {
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={allowCloseOnOutsideClick ? onOpenChange : undefined}
    >
      <DialogContent 
        className={`modal-container ${sizeClasses[size]} border border-gray-200`}
        style={{ maxHeight: '90vh', overflow: 'hidden' }}
        onPointerDownOutside={allowCloseOnOutsideClick ? undefined : (e) => e.preventDefault()}
        onEscapeKeyDown={allowCloseOnOutsideClick ? undefined : (e) => e.preventDefault()}
        aria-describedby={description ? undefined : "modal-description"}
      >
        <DialogHeader className="modal-header pb-4 border-b border-border/40 px-6 pt-6" style={{ flexShrink: 0 }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="p-2 rounded-lg bg-bentin-pink/10">
                  {icon}
                </div>
              )}
              <div>
                <DialogTitle className="text-xl font-semibold">
                  {title}
                </DialogTitle>
                <DialogDescription 
                  id="modal-description" 
                  className={description ? "text-base mt-1" : "sr-only"}
                >
                  {description || `Modal: ${title}`}
                </DialogDescription>
              </div>
            </div>
            
            {allowCloseOnOutsideClick && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="h-8 w-8 p-0 hover:bg-gray-100"
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>
        
        <div className="modal-body bentin-scroll py-4 px-6" style={{ flexGrow: 1, overflowY: 'auto' }}>
          {children}
        </div>
        
        {showFooter && (onCancel || onSubmit) && (
          <div className="modal-footer flex flex-col-reverse sm:flex-row gap-2 pt-4 border-t border-border/40 px-6 pb-6" style={{ flexShrink: 0 }}>
            {onCancel && (
              <Button 
                variant="outline" 
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1 sm:flex-none"
              >
                {cancelText}
              </Button>
            )}
            {onSubmit && (
              <Button 
                onClick={onSubmit}
                disabled={isLoading}
                className="flex-1 sm:flex-none bentin-button-primary"
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {submitText}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}