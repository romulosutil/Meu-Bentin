import React, { useState } from 'react';
import { Button } from './ui/button';
import { ShoppingCart, Users } from 'lucide-react';
import { ModalBase } from './ui/modal-base';

const TesteBotoesVendas = () => {
  const [modalNovaVenda, setModalNovaVenda] = useState(false);
  const [modalGerenciarClientes, setModalGerenciarClientes] = useState(false);

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Teste dos Botões de Vendas</h1>
      
      <div className="flex gap-4">
        <Button 
          onClick={() => {
            console.log('Botão Nova Venda clicado - TESTE');
            setModalNovaVenda(true);
          }}
          className="bentin-button-primary"
          size="lg"
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          Nova Venda (TESTE)
        </Button>
        
        <Button 
          onClick={() => {
            console.log('Botão Gerenciar Clientes clicado - TESTE');
            setModalGerenciarClientes(true);
          }}
          variant="outline"
          className="border-bentin-pink text-bentin-pink hover:bg-bentin-pink hover:text-white"
          size="lg"
        >
          <Users className="h-5 w-5 mr-2" />
          Gerenciar Clientes (TESTE)
        </Button>
      </div>

      <div className="space-y-2">
        <p>Estado modalNovaVenda: {modalNovaVenda.toString()}</p>
        <p>Estado modalGerenciarClientes: {modalGerenciarClientes.toString()}</p>
      </div>

      {/* Modal de Nova Venda */}
      <ModalBase
        open={modalNovaVenda}
        onOpenChange={setModalNovaVenda}
        title="Nova Venda - TESTE"
        description="Modal de teste para nova venda"
        onCancel={() => setModalNovaVenda(false)}
        icon={<ShoppingCart className="h-6 w-6" />}
      >
        <div className="p-4">
          <p>Modal de Nova Venda funcionando!</p>
        </div>
      </ModalBase>

      {/* Modal de Gerenciar Clientes */}
      <ModalBase
        open={modalGerenciarClientes}
        onOpenChange={setModalGerenciarClientes}
        title="Gerenciar Clientes - TESTE"
        description="Modal de teste para gerenciar clientes"
        onCancel={() => setModalGerenciarClientes(false)}
        icon={<Users className="h-6 w-6" />}
      >
        <div className="p-4">
          <p>Modal de Gerenciar Clientes funcionando!</p>
        </div>
      </ModalBase>
    </div>
  );
};

export default TesteBotoesVendas;