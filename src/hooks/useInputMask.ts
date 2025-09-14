import { useState, useCallback } from 'react';

export type MaskType = 'phone' | 'date' | 'instagram' | 'currency';

interface MaskConfig {
  mask: string;
  placeholder: string;
  maxLength: number;
  formatter: (value: string) => string;
  parser: (value: string) => string;
}

const MASK_CONFIGS: Record<MaskType, MaskConfig> = {
  phone: {
    mask: '(##) #####-####',
    placeholder: '(11) 99999-9999',
    maxLength: 15,
    formatter: (value: string) => {
      const numbers = value.replace(/\D/g, '');
      if (numbers.length <= 10) {
        return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, (_, p1, p2, p3) => {
          if (p3) return `(${p1}) ${p2}-${p3}`;
          if (p2) return `(${p1}) ${p2}`;
          if (p1) return `(${p1}`;
          return '';
        });
      } else {
        return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, (_, p1, p2, p3) => {
          if (p3) return `(${p1}) ${p2}-${p3}`;
          if (p2) return `(${p1}) ${p2}`;
          if (p1) return `(${p1}`;
          return '';
        });
      }
    },
    parser: (value: string) => value.replace(/\D/g, '')
  },
  date: {
    mask: '##/##/####',
    placeholder: 'dd/mm/aaaa',
    maxLength: 10,
    formatter: (value: string) => {
      const numbers = value.replace(/\D/g, '');
      return numbers.replace(/(\d{2})(\d{2})(\d{0,4})/, (_, day, month, year) => {
        if (year) return `${day}/${month}/${year}`;
        if (month) return `${day}/${month}`;
        return day;
      });
    },
    parser: (value: string) => value.replace(/\D/g, '')
  },
  instagram: {
    mask: '@',
    placeholder: '@usuario',
    maxLength: 31, // @ + 30 caracteres máx do Instagram
    formatter: (value: string) => {
      const cleaned = value.replace(/[^a-zA-Z0-9._]/g, '');
      return cleaned.startsWith('@') ? cleaned : '@' + cleaned;
    },
    parser: (value: string) => value.startsWith('@') ? value.slice(1) : value
  },
  currency: {
    mask: 'R$ #.###,##',
    placeholder: 'R$ 0,00',
    maxLength: 20,
    formatter: (value: string) => {
      const numbers = value.replace(/\D/g, '');
      if (!numbers) return '';
      
      const amount = parseInt(numbers) / 100;
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2
      }).format(amount);
    },
    parser: (value: string) => {
      const numbers = value.replace(/\D/g, '');
      if (!numbers) return '0';
      return (parseInt(numbers) / 100).toString();
    }
  }
};

export interface UseInputMaskReturn {
  value: string;
  displayValue: string;
  placeholder: string;
  maxLength: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  setValue: (value: string) => void;
  isValid: boolean;
}

export function useInputMask(
  maskType: MaskType, 
  initialValue: string = '',
  onValueChange?: (value: string) => void
): UseInputMaskReturn {
  const config = MASK_CONFIGS[maskType];
  if (!config) {
    throw new Error(`Tipo de máscara inválido: ${maskType}`);
  }
  
  const [rawValue, setRawValue] = useState(initialValue || '');
  const [displayValue, setDisplayValue] = useState(() => {
    try {
      return initialValue ? config.formatter(initialValue) : '';
    } catch (error) {
      console.warn('Erro ao formatar valor inicial:', error);
      return '';
    }
  });

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value || '';
    let newValue = inputValue;

    try {
      // Aplicar formatação específica baseada no tipo
      switch (maskType) {
        case 'phone':
          // Permitir apenas números e limitar o tamanho
          newValue = inputValue.replace(/\D/g, '').slice(0, 11);
          break;
        case 'date':
          // Permitir apenas números
          newValue = inputValue.replace(/\D/g, '').slice(0, 8);
          break;
        case 'instagram':
          // Garantir que começa com @ e limitar caracteres
          newValue = inputValue.replace(/[^a-zA-Z0-9._@]/g, '');
          if (!newValue.startsWith('@') && newValue.length > 0) {
            newValue = '@' + newValue;
          }
          newValue = newValue.slice(0, config.maxLength);
          break;
        case 'currency':
          // Permitir apenas números
          newValue = inputValue.replace(/\D/g, '');
          break;
      }

      const formatted = config.formatter(newValue);
      const parsed = config.parser(formatted);

      setRawValue(parsed);
      setDisplayValue(formatted);
      
      if (onValueChange) {
        onValueChange(parsed);
      }
    } catch (error) {
      console.warn('Erro ao processar máscara:', error);
    }
  }, [maskType, config, onValueChange]);

  const handleBlur = useCallback(() => {
    // Validações específicas no blur se necessário
    if (maskType === 'date' && rawValue.length === 8) {
      // Validar data básica
      const day = parseInt(rawValue.slice(0, 2));
      const month = parseInt(rawValue.slice(2, 4));
      const year = parseInt(rawValue.slice(4, 8));
      
      if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900) {
        // Data inválida - manter valor mas indicar erro
        console.warn('Data inválida');
      }
    }
  }, [maskType, rawValue]);

  const setValue = useCallback((value: string) => {
    const formatted = config.formatter(value);
    const parsed = config.parser(formatted);
    
    setRawValue(parsed);
    setDisplayValue(formatted);
    
    if (onValueChange) {
      onValueChange(parsed);
    }
  }, [config, onValueChange]);

  const isValid = useCallback(() => {
    switch (maskType) {
      case 'phone':
        return rawValue.length >= 10; // Mínimo 10 dígitos
      case 'date':
        return rawValue.length === 8; // Exatamente 8 dígitos
      case 'instagram':
        return displayValue.length > 1; // Pelo menos @ + 1 caractere
      case 'currency':
        return parseFloat(rawValue) >= 0; // Valor válido
      default:
        return true;
    }
  }, [maskType, rawValue, displayValue])();

  return {
    value: rawValue,
    displayValue,
    placeholder: config.placeholder,
    maxLength: config.maxLength,
    onChange: handleChange,
    onBlur: handleBlur,
    setValue,
    isValid
  };
}

// Hook específico para campos monetários com valor numérico
export function useCurrencyInput(
  initialValue: number = 0,
  onValueChange?: (value: number) => void
) {
  const [value, setValue] = useState(initialValue);
  const [displayValue, setDisplayValue] = useState(
    initialValue > 0 ? new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(initialValue) : ''
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const numbers = inputValue.replace(/\D/g, '');
    
    if (!numbers) {
      setValue(0);
      setDisplayValue('');
      if (onValueChange) onValueChange(0);
      return;
    }

    const numericValue = parseInt(numbers) / 100;
    const formatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(numericValue);

    setValue(numericValue);
    setDisplayValue(formatted);
    
    if (onValueChange) {
      onValueChange(numericValue);
    }
  }, [onValueChange]);

  const setNumericValue = useCallback((newValue: number) => {
    setValue(newValue);
    setDisplayValue(
      newValue > 0 ? new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2
      }).format(newValue) : ''
    );
    if (onValueChange) {
      onValueChange(newValue);
    }
  }, [onValueChange]);

  return {
    value,
    displayValue,
    placeholder: 'R$ 0,00',
    onChange: handleChange,
    setValue: setNumericValue,
    isValid: value >= 0
  };
}