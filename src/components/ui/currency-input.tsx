import React, { forwardRef, useCallback, ChangeEvent } from 'react';
import { Input } from './input';
import { cn } from './utils';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  minValue?: number;
  maxValue?: number;
  onValidationChange?: (isValid: boolean, message?: string) => void;
  validateOnChange?: boolean;
}

/**
 * Componente de Input Monetário
 * Formata automaticamente valores em Real brasileiro (R$ 0,00)
 */
export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, className, minValue = 0, maxValue, onValidationChange, validateOnChange = false, ...props }, ref) => {

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

    // Validação em tempo real
    const validateValue = useCallback((numValue: number) => {
      if (minValue !== undefined && numValue < minValue) {
        onValidationChange?.(false, `Valor mínimo: R$ ${minValue.toFixed(2)}`);
        return false;
      }
      if (maxValue !== undefined && numValue > maxValue) {
        onValidationChange?.(false, `Valor máximo: R$ ${maxValue.toFixed(2)}`);
        return false;
      }
      onValidationChange?.(true);
      return true;
    }, [minValue, maxValue, onValidationChange]);

    // Handler para mudanças no input
    const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      let numericValue = parseCurrency(inputValue);
      
      // Validar se habilitado
      if (validateOnChange) {
        validateValue(numericValue);
      }
      
      // Aplicar correções automáticas apenas se não estiver em modo validação
      if (!validateOnChange) {
        if (minValue !== undefined && numericValue < minValue) {
          numericValue = minValue;
        }
        if (maxValue !== undefined && numericValue > maxValue) {
          numericValue = maxValue;
        }
      }
      
      onChange(numericValue);
    }, [onChange, parseCurrency, minValue, maxValue, validateOnChange, validateValue]);

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