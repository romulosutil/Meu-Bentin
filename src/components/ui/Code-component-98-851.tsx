import React, { forwardRef, useCallback, ChangeEvent } from 'react';
import { Input } from './input';
import { cn } from './utils';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

/**
 * Componente de Input Monetário
 * Formata automaticamente valores em Real brasileiro (R$ 0,00)
 */
export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, className, ...props }, ref) => {

    // Formatar número para moeda brasileira
    const formatCurrency = useCallback((num: number): string => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(num);
    }, []);

    // Remover formatação e retornar apenas números
    const parseCurrency = useCallback((str: string): number => {
      // Remove todos os caracteres que não são dígitos ou vírgula
      const cleanStr = str.replace(/[^\d,]/g, '');
      
      // Substitui vírgula por ponto para parsing
      const numberStr = cleanStr.replace(',', '.');
      
      // Converte para número
      const num = parseFloat(numberStr);
      
      // Retorna 0 se não for um número válido
      return isNaN(num) ? 0 : num;
    }, []);

    // Handler para mudanças no input
    const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const numericValue = parseCurrency(inputValue);
      onChange(numericValue);
    }, [onChange, parseCurrency]);

    // Valor formatado para exibição
    const displayValue = value === 0 ? '' : formatCurrency(value);

    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        value={displayValue}
        onChange={handleChange}
        className={cn(className)}
        placeholder="R$ 0,00"
      />
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';