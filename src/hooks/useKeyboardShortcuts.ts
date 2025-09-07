import { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  callback: () => void;
  description: string;
  preventDefault?: boolean;
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  showToasts?: boolean;
}

export const useKeyboardShortcuts = (
  shortcuts: KeyboardShortcut[], 
  options: UseKeyboardShortcutsOptions = {}
) => {
  const { enabled = true, showToasts = false } = options;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Ignorar atalhos quando estiver digitando em inputs
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      return;
    }

    const matchingShortcut = shortcuts.find(shortcut => {
      const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase();
      const ctrlMatch = Boolean(shortcut.ctrlKey) === event.ctrlKey;
      const altMatch = Boolean(shortcut.altKey) === event.altKey;
      const shiftMatch = Boolean(shortcut.shiftKey) === event.shiftKey;

      return keyMatch && ctrlMatch && altMatch && shiftMatch;
    });

    if (matchingShortcut) {
      if (matchingShortcut.preventDefault !== false) {
        event.preventDefault();
      }
      matchingShortcut.callback();
    }
  }, [shortcuts, enabled]);

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, enabled]);

  // Retorna a lista de atalhos para documentação
  const getShortcutsList = useCallback(() => {
    return shortcuts.map(shortcut => {
      const keys = [];
      if (shortcut.ctrlKey) keys.push('Ctrl');
      if (shortcut.altKey) keys.push('Alt');
      if (shortcut.shiftKey) keys.push('Shift');
      keys.push(shortcut.key.toUpperCase());
      
      return {
        combination: keys.join(' + '),
        description: shortcut.description
      };
    });
  }, [shortcuts]);

  return {
    getShortcutsList
  };
};

// Hook específico para atalhos do sistema de vendas
export const useSalesKeyboardShortcuts = (handlers: {
  onNewSale?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  onQuickAdd?: () => void;
  onSearchProducts?: () => void;
  onToggleCart?: () => void;
}) => {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'n',
      ctrlKey: true,
      callback: () => handlers.onNewSale?.(),
      description: 'Nova venda'
    },
    {
      key: 's',
      ctrlKey: true,
      callback: () => handlers.onSave?.(),
      description: 'Salvar'
    },
    {
      key: 'Escape',
      callback: () => handlers.onCancel?.(),
      description: 'Cancelar/Fechar modal'
    },
    {
      key: 'q',
      ctrlKey: true,
      callback: () => handlers.onQuickAdd?.(),
      description: 'Adição rápida de produto'
    },
    {
      key: 'f',
      ctrlKey: true,
      callback: () => handlers.onSearchProducts?.(),
      description: 'Buscar produtos'
    },
    {
      key: 'c',
      ctrlKey: true,
      shiftKey: true,
      callback: () => handlers.onToggleCart?.(),
      description: 'Mostrar/Ocultar carrinho'
    }
  ];

  return useKeyboardShortcuts(shortcuts);
};

// Hook para atalhos do sistema de estoque
export const useInventoryKeyboardShortcuts = (handlers: {
  onNewProduct?: () => void;
  onQuickEdit?: () => void;
  onSearch?: () => void;
  onRefresh?: () => void;
  onExport?: () => void;
}) => {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'n',
      ctrlKey: true,
      callback: () => handlers.onNewProduct?.(),
      description: 'Novo produto'
    },
    {
      key: 'e',
      ctrlKey: true,
      callback: () => handlers.onQuickEdit?.(),
      description: 'Edição rápida'
    },
    {
      key: 'f',
      ctrlKey: true,
      callback: () => handlers.onSearch?.(),
      description: 'Buscar produtos'
    },
    {
      key: 'r',
      ctrlKey: true,
      callback: () => handlers.onRefresh?.(),
      description: 'Atualizar lista'
    },
    {
      key: 'e',
      ctrlKey: true,
      shiftKey: true,
      callback: () => handlers.onExport?.(),
      description: 'Exportar dados'
    }
  ];

  return useKeyboardShortcuts(shortcuts);
};