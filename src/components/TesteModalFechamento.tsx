import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { InputMonetario } from './ui/input-monetario';
import { Label } from './ui/label';
import { X, AlertCircle, CheckCircle } from 'lucide-react';

const TesteModalFechamento: React.FC = () => {
  const [modalAberto, setModalAberto] = useState(false);
  const [valor, setValor] = useState(0);
  const [log, setLog] = useState<string[]>([]);

  const adicionarLog = useCallback((mensagem: string) => {
    setLog(prev => [...prev.slice(-5), `${new Date().toLocaleTimeString()}: ${mensagem}`]);
  }, []);

  const handleAbrirModal = useCallback(() => {
    setModalAberto(true);
    adicionarLog('Modal ABERTO');
  }, [adicionarLog]);

  const handleFecharModal = useCallback(() => {
    setModalAberto(false);
    adicionarLog('Modal FECHADO');
  }, [adicionarLog]);

  // Implementação da tecla ESC conforme diretriz técnica
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modalAberto) {
        handleFecharModal();
        adicionarLog('Modal fechado via ESC');
      }
    };
    
    if (modalAberto) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
      adicionarLog('Event listener ESC adicionado');
    }
    
    // Cleanup function para evitar memory leaks
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [modalAberto, handleFecharModal, adicionarLog]);

  if (!modalAberto) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Teste de Correção de Bugs Críticos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">1. Teste Modal com Fechamento Correto</h3>
            <p className="text-sm text-gray-600">
              Clique para testar modal que deve fechar com ESC, overlay e botão cancelar.
            </p>
            <Button onClick={handleAbrirModal} className="bg-red-500 hover:bg-red-600">
              Abrir Modal de Teste
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">2. Teste InputMonetario</h3>
            <p className="text-sm text-gray-600">
              Digite um valor para testar a máscara monetária:
            </p>
            <div className="flex items-center gap-3">
              <Label>Valor:</Label>
              <InputMonetario
                value={valor}
                onUnmaskedChange={(v) => {
                  setValor(v);
                  adicionarLog(`InputMonetario: ${v}`);
                }}
                className="w-40"
              />
              <span className="text-sm font-mono">
                Estado: {valor}
              </span>
            </div>
          </div>

          {log.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Log de Eventos:</h4>
              <div className="bg-gray-50 p-3 rounded text-xs font-mono space-y-1">
                {log.map((entrada, index) => (
                  <div key={index} className="text-gray-700">{entrada}</div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop com onClick que chama handleFecharModal */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={() => {
          handleFecharModal();
          adicionarLog('Modal fechado via OVERLAY');
        }}
      />
      
      {/* Modal Content */}
      <div 
        className="modal-container relative bg-white rounded-xl shadow-xl w-[90vw] max-w-lg flex flex-col border border-gray-200"
        style={{ maxHeight: '90vh', overflow: 'hidden' }}
        onClick={(e) => {
          e.stopPropagation(); // Impede propagação para o overlay
          adicionarLog('Clique no conteúdo (não propaga)');
        }}
      >
        
        {/* Header */}
        <div className="modal-header flex items-center justify-between p-6 border-b" style={{ flexShrink: 0 }}>
          <div>
            <h2 className="text-xl font-semibold">
              <CheckCircle className="inline h-5 w-5 text-green-500 mr-2" />
              Modal de Teste
            </h2>
            <p className="text-sm text-gray-600">
              Teste todas as formas de fechamento
            </p>
          </div>
          
          {/* Botão X que chama handleFecharModal */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              handleFecharModal();
              adicionarLog('Modal fechado via botão X');
            }}
            className="h-9 w-9 p-0 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Conteúdo */}
        <div className="modal-body p-6 space-y-4" style={{ flexGrow: 1, overflowY: 'auto' }}>
          <div className="space-y-3">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800">✅ Testes Implementados:</h4>
              <ul className="text-sm text-green-700 mt-2 space-y-1">
                <li>• ESC fecha modal (com cleanup)</li>
                <li>• Clique no overlay fecha modal</li>
                <li>• Botão X fecha modal</li>
                <li>• Botão Cancelar fecha modal</li>
                <li>• stopPropagation() no conteúdo</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <Label>Teste InputMonetario no Modal:</Label>
              <InputMonetario
                value={valor}
                onUnmaskedChange={(v) => {
                  setValor(v);
                  adicionarLog(`Modal InputMonetario: ${v}`);
                }}
                placeholder="R$ 0,00"
              />
              <p className="text-xs text-gray-600">Valor atual: {valor}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer flex justify-end gap-3 p-6 border-t" style={{ flexShrink: 0 }}>
          <Button
            variant="outline"
            onClick={() => {
              handleFecharModal();
              adicionarLog('Modal fechado via CANCELAR');
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={() => {
              handleFecharModal();
              adicionarLog('Modal fechado via CONCLUIR');
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            Concluir Teste
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TesteModalFechamento;