import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
import { Button } from './button';
import { Badge } from './badge';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Keyboard, Command } from 'lucide-react';

interface ShortcutInfo {
  combination: string;
  description: string;
}

interface KeyboardShortcutsHelpProps {
  shortcuts: ShortcutInfo[];
  title?: string;
  children?: React.ReactNode;
}

export const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({
  shortcuts,
  title = 'Atalhos de Teclado',
  children
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="gap-2">
            <Keyboard className="h-4 w-4" />
            Atalhos
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Command className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <span className="text-sm text-gray-700">{shortcut.description}</span>
              <Badge variant="secondary" className="font-mono text-xs">
                {shortcut.combination}
              </Badge>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-800">
            💡 <strong>Dica:</strong> Os atalhos não funcionam quando você estiver digitando em campos de texto.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Componente específico para sistema de vendas
export const SalesShortcutsHelp: React.FC<{ shortcuts: ShortcutInfo[] }> = ({ shortcuts }) => {
  return (
    <KeyboardShortcutsHelp
      shortcuts={shortcuts}
      title="Atalhos - Sistema de Vendas"
    />
  );
};

// Componente específico para sistema de estoque
export const InventoryShortcutsHelp: React.FC<{ shortcuts: ShortcutInfo[] }> = ({ shortcuts }) => {
  return (
    <KeyboardShortcutsHelp
      shortcuts={shortcuts}
      title="Atalhos - Sistema de Estoque"
    />
  );
};