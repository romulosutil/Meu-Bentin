import React from 'react';
import { cn } from './utils';

interface InputMonetarioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number;
  onUnmaskedChange: (value: number) => void;
  className?: string;
  placeholder?: string;
}

export const InputMonetario = React.forwardRef<HTMLInputElement, InputMonetarioProps>(
  ({ value, onUnmaskedChange, className, placeholder = "R$ 0,00", ...props }, ref) => {
    
    // Formatar valor para exibição
    const formatCurrency = (num: number): string => {
      if (num === 0) return '';
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(num);
    };

    // Valor formatado para exibição
    const displayValue = formatCurrency(value);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      
      // Remove tudo exceto dígitos
      const digits = inputValue.replace(/[^\d]/g, '');
      
      if (digits === '') {
        onUnmaskedChange(0);
        return;
      }

      // Converte para centavos e depois para reais
      const numericValue = parseFloat(digits) / 100;
      onUnmaskedChange(numericValue);
    };

    return (
      <input
        {...props}
        ref={ref}
        type="text"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base bg-input-background transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className
        )}
      />
    );
  }
);

InputMonetario.displayName = "InputMonetario";