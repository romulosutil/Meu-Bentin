import { useCallback } from 'react';
import { useToast } from '../components/ToastProvider';

interface ValidationOptions {
  showSuccessToasts?: boolean;
  debounceMs?: number;
}

export const useValidationToasts = (options: ValidationOptions = {}) => {
  const { addToast } = useToast();
  const { showSuccessToasts = false, debounceMs = 500 } = options;

  // Validação de valores monetários
  const validateCurrencyValue = useCallback((
    value: number, 
    fieldName: string, 
    minValue: number = 0,
    maxValue?: number
  ) => {
    if (value < minValue) {
      addToast({
        type: 'warning',
        title: '⚠️ Valor inválido',
        description: `${fieldName} deve ser pelo menos R$ ${minValue.toFixed(2)}`
      });
      return false;
    }

    if (maxValue !== undefined && value > maxValue) {
      addToast({
        type: 'warning',
        title: '⚠️ Valor muito alto',
        description: `${fieldName} não pode exceder R$ ${maxValue.toFixed(2)}`
      });
      return false;
    }

    if (showSuccessToasts && value >= minValue) {
      addToast({
        type: 'success',
        title: '✅ Valor válido',
        description: `${fieldName} definido como R$ ${value.toFixed(2)}`
      });
    }

    return true;
  }, [addToast, showSuccessToasts]);

  // Validação de margem de lucro
  const validateProfitMargin = useCallback((margin: number) => {
    if (margin < 0) {
      addToast({
        type: 'error',
        title: '❌ Margem negativa',
        description: 'O preço de venda está menor que o custo!'
      });
      return false;
    }

    if (margin < 15) {
      addToast({
        type: 'warning',
        title: '⚠️ Margem baixa',
        description: `Margem de ${margin.toFixed(1)}% está abaixo do recomendado (15%)`
      });
      return true; // Válido, mas com aviso
    }

    if (margin > 100) {
      addToast({
        type: 'info',
        title: '🚀 Margem excelente',
        description: `Margem de ${margin.toFixed(1)}% está ótima para o negócio!`
      });
    }

    return true;
  }, [addToast]);

  // Validação de estoque
  const validateStock = useCallback((quantity: number, minStock: number, productName?: string) => {
    const product = productName ? ` do produto ${productName}` : '';
    
    if (quantity <= 0) {
      addToast({
        type: 'error',
        title: '❌ Produto esgotado',
        description: `Estoque${product} está zerado`
      });
      return false;
    }

    if (quantity <= minStock) {
      addToast({
        type: 'warning',
        title: '⚠️ Estoque baixo',
        description: `Apenas ${quantity} unidades restantes${product}. Reabastecer urgente!`
      });
      return true; // Válido, mas com aviso
    }

    return true;
  }, [addToast]);

  // Validação de desconto
  const validateDiscount = useCallback((discount: number, subtotal: number) => {
    if (discount < 0) {
      addToast({
        type: 'error',
        title: '❌ Desconto inválido',
        description: 'O desconto não pode ser negativo'
      });
      return false;
    }

    if (discount > subtotal) {
      addToast({
        type: 'error',
        title: '❌ Desconto muito alto',
        description: 'O desconto não pode ser maior que o valor da compra'
      });
      return false;
    }

    const discountPercentage = (discount / subtotal) * 100;
    if (discountPercentage > 50) {
      addToast({
        type: 'warning',
        title: '⚠️ Desconto alto',
        description: `Desconto de ${discountPercentage.toFixed(1)}% é muito generoso!`
      });
    }

    return true;
  }, [addToast]);

  // Validação de campos obrigatórios
  const validateRequiredField = useCallback((value: string | number, fieldName: string) => {
    const isEmpty = typeof value === 'string' ? !value.trim() : value <= 0;
    
    if (isEmpty) {
      addToast({
        type: 'error',
        title: '❌ Campo obrigatório',
        description: `${fieldName} deve ser preenchido`
      });
      return false;
    }

    return true;
  }, [addToast]);

  return {
    validateCurrencyValue,
    validateProfitMargin,
    validateStock,
    validateDiscount,
    validateRequiredField
  };
};