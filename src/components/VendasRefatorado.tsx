// ====================================================================
// COMPONENTE DE VENDAS REFATORADO - VERSÃO LIMPA E FUNCIONAL
// ====================================================================
// Refatoração completa com foco na funcionalidade e performance
// Estrutura modular e bem organizada
// ====================================================================

import React, { useState, useMemo, useCallback } from 'react';
import { useEstoque, type Venda } from '../utils/EstoqueContextSemVendedor';
import { useClientes } from '../hooks/useClientes';
import { useSalesKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useValidationToasts } from '../hooks/useValidationToasts';
import GerenciarClientes from './GerenciarClientes';
import NovaVendaModal from './NovaVendaModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { StatsCard } from './ui/stats-card';
import { LoadingState } from './ui/loading-state';
import { ModalBase } from './ui/modal-base';
import { useToast } from './ToastProvider';
import { 
  ShoppingCart, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Package,
  TrendingUp,
  Eye
} from 'lucide-react';
import { SalesShortcutsHelp } from './ui/keyboard-shortcuts-help';

// ====================================================================
// TIPOS E INTERFACES
// ====================================================================
interface MetricasVendas {
  vendasHoje: number;
  receitaHoje: number;
  totalVendas: number;
  receitaTotal: number;
}

// ====================================================================
// COMPONENTE PRINCIPAL
// ====================================================================
const VendasRefatorado = () => {
  // ====================================================================
  // HOOKS E ESTADO
  // ====================================================================
  const { vendas, produtos, loading } = useEstoque();
  const { clientes } = useClientes();
  const { addToast } = useToast();
  const { validateDiscount, validateRequiredField } = useValidationToasts();

  // Estados dos modais
  const [modalNovaVenda, setModalNovaVenda] = useState(false);
  const [modalGerenciarClientes, setModalGerenciarClientes] = useState(false);
  const [modalDetalhesVenda, setModalDetalhesVenda] = useState(false);
  const [vendaSelecionada, setVendaSelecionada] = useState<Venda | null>(null);

  // Atalhos de teclado
  const { getShortcutsList } = useSalesKeyboardShortcuts({
    onNewSale: () => setModalNovaVenda(true),
    onCancel: () => {
      setModalNovaVenda(false);
      setModalGerenciarClientes(false);
      setModalDetalhesVenda(false);
    },
    onSearchProducts: () => {
      // Focar no campo de busca se existir
      const searchInput = document.querySelector('input[placeholder*="buscar"], input[placeholder*="pesquisar"]') as HTMLInputElement;
      searchInput?.focus();
    }
  });

  // ====================================================================
  // CÁLCULOS E MÉTRICAS
  // ====================================================================
  const metricas = useMemo((): MetricasVendas => {
    const hoje = new Date();
    const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const vendasHoje = vendas.filter(v => new Date(v.data) >= inicioHoje);

    return {
      vendasHoje: vendasHoje.length,
      receitaHoje: vendasHoje.reduce((total, v) => total + v.precoTotal, 0),
      totalVendas: vendas.length,
      receitaTotal: vendas.reduce((total, v) => total + v.precoTotal, 0)
    };
  }, [vendas]);

  // ====================================================================
  // FUNÇÕES DE MANIPULAÇÃO (SIMPLIFICADAS)
  // ====================================================================

  // ====================================================================
  // RENDER CONDITIONS
  // ====================================================================
  if (loading) {
    return <LoadingState message="Carregando sistema de vendas..." />;
  }

  // ====================================================================
  // RENDER PRINCIPAL
  // ====================================================================
  return (
    <div className="space-y-8">
      
      {/* CARDS DE MÉTRICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Vendas Hoje"
          value={metricas.vendasHoje}
          description="vendas realizadas"
          icon={<ShoppingCart />}
          color="primary"
        />
        
        <StatsCard
          title="Receita Hoje"
          value={`R$ ${metricas.receitaHoje.toFixed(2)}`}
          description="faturamento do dia"
          icon={<DollarSign />}
          color="success"
        />
        
        <StatsCard
          title="Total de Vendas"
          value={metricas.totalVendas}
          description="vendas registradas"
          icon={<TrendingUp />}
          color="info"
        />
        
        <StatsCard
          title="Receita Total"
          value={`R$ ${metricas.receitaTotal.toFixed(2)}`}
          description="faturamento geral"
          icon={<DollarSign />}
          color="warning"
        />
      </div>

      {/* BOTÕES DE AÇÃO PRINCIPAIS */}
      <Card className="bentin-card">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-3">
                <ShoppingCart className="h-6 w-6 text-bentin-pink" />
                Sistema de Vendas
              </CardTitle>
              <CardDescription>
                Registre vendas e gerencie clientes de forma simples e eficiente
              </CardDescription>
            </div>
            <SalesShortcutsHelp shortcuts={getShortcutsList()} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              onClick={() => {
                console.log('🔥 Nova Venda - Botão clicado!');
                setModalNovaVenda(true);
                addToast({
                  type: 'success',
                  title: '🚀 Nova Venda',
                  description: 'Sistema de vendas aberto!'
                });
              }}
              className="bentin-button-primary text-lg px-8 py-4 h-auto min-w-[250px]"
            >
              <ShoppingCart className="h-6 w-6 mr-3" />
              <div className="text-left">
                <div className="font-bold">Nova Venda</div>
                <div className="text-sm opacity-90">Registrar nova venda</div>
              </div>
            </Button>
            
            <Button 
              onClick={() => {
                console.log('🔥 Gerenciar Clientes - Botão clicado!');
                setModalGerenciarClientes(true);
                addToast({
                  type: 'info',
                  title: '👥 Clientes',
                  description: 'Sistema de clientes aberto!'
                });
              }}
              variant="outline"
              className="border-2 border-bentin-blue text-bentin-blue hover:bg-bentin-blue hover:text-white text-lg px-8 py-4 h-auto min-w-[250px]"
            >
              <Users className="h-6 w-6 mr-3" />
              <div className="text-left">
                <div className="font-bold">Gerenciar Clientes</div>
                <div className="text-sm opacity-75">Cadastros e edição</div>
              </div>
            </Button>
          </div>

          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-6 text-sm text-gray-600 bg-gray-50 px-6 py-3 rounded-xl">
              <span className="flex items-center gap-2">
                <Users className="h-5 w-5 text-bentin-pink" />
                <span className="font-semibold">{clientes.length}</span> 
                <span>cliente{clientes.length !== 1 ? 's' : ''}</span>
              </span>
              <span className="w-px h-5 bg-gray-300"></span>
              <span className="flex items-center gap-2">
                <Package className="h-5 w-5 text-bentin-green" />
                <span className="font-semibold">{produtos.length}</span> 
                <span>produto{produtos.length !== 1 ? 's' : ''}</span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* HISTÓRICO DE VENDAS */}
      {vendas.length > 0 && (
        <Card className="bentin-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <ShoppingBag className="h-6 w-6 text-bentin-green" />
              Últimas Vendas
            </CardTitle>
            <CardDescription>
              {vendas.length} venda{vendas.length !== 1 ? 's' : ''} registrada{vendas.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {vendas.slice(-10).reverse().map((venda, index) => (
                <div 
                  key={`${venda.id}-${index}`}
                  className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                  onClick={() => {
                    setVendaSelecionada(venda);
                    setModalDetalhesVenda(true);
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-bentin-green/20">
                      <ShoppingBag className="h-4 w-4 text-bentin-green" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{venda.nomeProduto}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(venda.data).toLocaleDateString('pt-BR')} • {venda.cliente || 'Cliente não informado'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-bold text-bentin-green">R$ {venda.precoTotal.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">{venda.quantidade}x</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* MODAL NOVA VENDA - COMPONENTE INDEPENDENTE */}
      <NovaVendaModal 
        open={modalNovaVenda}
        onOpenChange={setModalNovaVenda}
      />

      {/* MODAL DETALHES VENDA */}
      <ModalBase
        open={modalDetalhesVenda}
        onOpenChange={setModalDetalhesVenda}
        title="Detalhes da Venda"
        description="Informações completas da venda"
        showFooter={false}
        icon={<Eye className="h-6 w-6" />}
      >
        {vendaSelecionada && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data</Label>
                <p className="font-medium">{new Date(vendaSelecionada.data).toLocaleString('pt-BR')}</p>
              </div>
              <div>
                <Label>Produto</Label>
                <p className="font-medium">{vendaSelecionada.nomeProduto}</p>
              </div>
              <div>
                <Label>Cliente</Label>
                <p className="font-medium">{vendaSelecionada.cliente || 'Não informado'}</p>
              </div>
              <div>
                <Label>Quantidade</Label>
                <p className="font-medium">{vendaSelecionada.quantidade}</p>
              </div>
              <div>
                <Label>Valor Unitário</Label>
                <p className="font-medium">R$ {vendaSelecionada.precoUnitario.toFixed(2)}</p>
              </div>
              <div>
                <Label>Total</Label>
                <p className="font-bold text-lg text-green-600">
                  R$ {vendaSelecionada.precoTotal.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}
      </ModalBase>

      {/* MODAL GERENCIAR CLIENTES - VERSÃO CORRIGIDA COM FILHOS */}
      <GerenciarClientes 
        open={modalGerenciarClientes}
        onCancel={() => setModalGerenciarClientes(false)}
      />
    </div>
  );
};

export default VendasRefatorado;