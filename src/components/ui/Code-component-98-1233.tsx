import React, { forwardRef } from 'react';
import { IMaskInput } from 'react-imask';
import { cn } from './utils';

interface InputMonetarioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number;
  onUnmaskedChange: (value: number) => void;
  className?: string;
  placeholder?: string;
}

export const InputMonetario = forwardRef<HTMLInputElement, InputMonetarioProps>(
  ({ value, onUnmaskedChange, className, placeholder = "R$ 0,00", ...props }, ref) => {
    
    return (
      <IMaskInput
        {...props}
        ref={ref}
        mask={Number}
        radix=","
        thousandsSeparator="."
        scale={2}
        padFractionalZeros={true}
        normalizeZeros={true}
        value={String(value)} // A máscara sempre trabalha com string
        onAccept={(unmaskedValue) => {
          // Converte o valor para número ou 0 se inválido
          const numericValue = parseFloat(unmaskedValue) || 0;
          onUnmaskedChange(numericValue);
        }}
        placeholder={placeholder}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      />
    );
  }
);

InputMonetario.displayName = "InputMonetario";