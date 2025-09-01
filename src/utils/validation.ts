// Utilitários de validação para formulários

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ProdutoFormData {
  nome: string;
  categoria: string;
  novaCategoria?: string;
  preco: string;
  emPromocao: boolean;
  precoPromocional?: string;
  quantidade: string;
  estoqueMinimo: string;
}

export interface VendaFormData {
  cliente: string;
  vendedorId: string;
  formaPagamento: string;
  desconto?: string;
  observacoes?: string;
}

// Validação para produto
export const validateProduto = (data: ProdutoFormData): ValidationResult => {
  const errors: string[] = [];

  // Nome obrigatório
  if (!data.nome.trim()) {
    errors.push('Nome do produto é obrigatório');
  } else if (data.nome.trim().length < 2) {
    errors.push('Nome deve ter pelo menos 2 caracteres');
  }

  // Categoria obrigatória
  if (!data.categoria && !data.novaCategoria?.trim()) {
    errors.push('Selecione uma categoria ou crie uma nova');
  }

  // Preço obrigatório e válido
  if (!data.preco) {
    errors.push('Preço é obrigatório');
  } else {
    const preco = parseFloat(data.preco);
    if (isNaN(preco) || preco <= 0) {
      errors.push('Preço deve ser um valor positivo');
    }
  }

  // Preço promocional (se em promoção)
  if (data.emPromocao) {
    if (!data.precoPromocional) {
      errors.push('Preço promocional é obrigatório quando produto está em promoção');
    } else {
      const precoPromocional = parseFloat(data.precoPromocional);
      const precoNormal = parseFloat(data.preco);
      
      if (isNaN(precoPromocional) || precoPromocional <= 0) {
        errors.push('Preço promocional deve ser um valor positivo');
      } else if (precoPromocional >= precoNormal) {
        errors.push('Preço promocional deve ser menor que o preço normal');
      }
    }
  }

  // Quantidade obrigatória e válida
  if (!data.quantidade) {
    errors.push('Quantidade inicial é obrigatória');
  } else {
    const quantidade = parseInt(data.quantidade);
    if (isNaN(quantidade) || quantidade < 0) {
      errors.push('Quantidade deve ser um número válido maior ou igual a zero');
    }
  }

  // Estoque mínimo obrigatório e válido
  if (!data.estoqueMinimo) {
    errors.push('Estoque mínimo é obrigatório');
  } else {
    const estoqueMinimo = parseInt(data.estoqueMinimo);
    if (isNaN(estoqueMinimo) || estoqueMinimo < 0) {
      errors.push('Estoque mínimo deve ser um número válido maior ou igual a zero');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validação para venda
export const validateVenda = (data: VendaFormData): ValidationResult => {
  const errors: string[] = [];

  // Cliente obrigatório
  if (!data.cliente.trim()) {
    errors.push('Nome do cliente é obrigatório');
  } else if (data.cliente.trim().length < 2) {
    errors.push('Nome do cliente deve ter pelo menos 2 caracteres');
  }

  // Vendedor obrigatório
  if (!data.vendedorId) {
    errors.push('Selecione um vendedor');
  }

  // Forma de pagamento obrigatória
  if (!data.formaPagamento) {
    errors.push('Selecione uma forma de pagamento');
  }

  // Desconto (se informado)
  if (data.desconto) {
    const desconto = parseFloat(data.desconto);
    if (isNaN(desconto) || desconto < 0) {
      errors.push('Desconto deve ser um valor válido maior ou igual a zero');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validação para quantidade de estoque
export const validateQuantidade = (quantidade: string, max?: number): ValidationResult => {
  const errors: string[] = [];

  if (!quantidade) {
    errors.push('Quantidade é obrigatória');
  } else {
    const qty = parseInt(quantidade);
    if (isNaN(qty) || qty <= 0) {
      errors.push('Quantidade deve ser um número positivo');
    } else if (max && qty > max) {
      errors.push(`Quantidade não pode ser maior que ${max}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validação para meta
export const validateMeta = (valor: string): ValidationResult => {
  const errors: string[] = [];

  if (!valor) {
    errors.push('Valor da meta é obrigatório');
  } else {
    const meta = parseFloat(valor);
    if (isNaN(meta) || meta <= 0) {
      errors.push('Meta deve ser um valor positivo');
    } else if (meta < 1000) {
      errors.push('Meta deve ser de pelo menos R$ 1.000');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Utilitário para sanitizar strings
export const sanitizeString = (str: string): string => {
  return str.trim().replace(/\s+/g, ' ');
};

// Utilitário para formatar preço
export const formatPrice = (price: number): string => {
  return price.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// Utilitário para formatar telefone
export const formatPhone = (phone: string): string => {
  const numbers = phone.replace(/\D/g, '');
  if (numbers.length === 11) {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (numbers.length === 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return phone;
};

// Utilitário para validar email
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};