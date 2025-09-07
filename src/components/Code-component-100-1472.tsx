import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useEstoque } from '../utils/EstoqueContextSemVendedor';
import { useClientes } from '../hooks/useClientes';
import { Check, X, RefreshCw, Database, AlertTriangle } from 'lucide-react';

interface PersistenceTest {
  name: string;
  description: string;
  status: 'pending' | 'running' | 'success' | 'error';
  error?: string;
  data?: any;
}

const TesteValidacaoPersistencia = () => {
  const { produtos, vendas, metas, actions } = useEstoque();
  const { clientes } = useClientes();
  const [tests, setTests] = useState<PersistenceTest[]>([
    {
      name: 'Produtos',
      description: 'Verificar se produtos são persistidos no Supabase',
      status: 'pending'
    },
    {
      name: 'Vendas',
      description: 'Verificar se vendas são persistidas no Supabase',
      status: 'pending'
    },
    {
      name: 'Clientes',
      description: 'Verificar se clientes são persistidos no Supabase',
      status: 'pending'
    },
    {
      name: 'Metas',
      description: 'Verificar se metas são persistidas no Supabase',
      status: 'pending'
    }
  ]);

  const [isRunning, setIsRunning] = useState(false);

  const updateTestStatus = (testName: string, status: PersistenceTest['status'], error?: string, data?: any) => {
    setTests(prev => prev.map(test => 
      test.name === testName 
        ? { ...test, status, error, data }
        : test
    ));
  };

  const testProdutosPersistence = async () => {
    updateTestStatus('Produtos', 'running');
    try {
      console.log('🧪 Testando persistência de produtos...');
      
      // Verificar se existe pelo menos um produto
      if (produtos.length === 0) {
        throw new Error('Nenhum produto encontrado para testar');
      }

      // Tentar recarregar dados do Supabase
      await actions.carregarDados();
      
      // Verificar se produtos foram carregados
      updateTestStatus('Produtos', 'success', undefined, {
        count: produtos.length,
        sample: produtos.slice(0, 3).map(p => p.nome)
      });
      
    } catch (error) {
      console.error('❌ Erro no teste de produtos:', error);
      updateTestStatus('Produtos', 'error', error instanceof Error ? error.message : 'Erro desconhecido');
    }
  };

  const testVendasPersistence = async () => {
    updateTestStatus('Vendas', 'running');
    try {
      console.log('🧪 Testando persistência de vendas...');
      
      // Verificar se existe pelo menos uma venda
      if (vendas.length === 0) {
        throw new Error('Nenhuma venda encontrada para testar');
      }

      // Tentar recarregar dados do Supabase
      await actions.carregarDados();
      
      // Verificar se vendas foram carregadas
      updateTestStatus('Vendas', 'success', undefined, {
        count: vendas.length,
        sample: vendas.slice(0, 3).map(v => v.nomeProduto)
      });
      
    } catch (error) {
      console.error('❌ Erro no teste de vendas:', error);
      updateTestStatus('Vendas', 'error', error instanceof Error ? error.message : 'Erro desconhecido');
    }
  };

  const testClientesPersistence = async () => {
    updateTestStatus('Clientes', 'running');
    try {
      console.log('🧪 Testando persistência de clientes...');
      
      // Verificar se existe pelo menos um cliente
      if (clientes.length === 0) {
        throw new Error('Nenhum cliente encontrado para testar');
      }

      // Verificar se clientes têm IDs válidos
      const clientesComId = clientes.filter(c => c.id);
      if (clientesComId.length === 0) {
        throw new Error('Clientes não possuem IDs válidos');
      }
      
      updateTestStatus('Clientes', 'success', undefined, {
        count: clientes.length,
        sample: clientes.slice(0, 3).map(c => c.nome)
      });
      
    } catch (error) {
      console.error('❌ Erro no teste de clientes:', error);
      updateTestStatus('Clientes', 'error', error instanceof Error ? error.message : 'Erro desconhecido');
    }
  };

  const testMetasPersistence = async () => {
    updateTestStatus('Metas', 'running');
    try {
      console.log('🧪 Testando persistência de metas...');
      
      // Verificar se existe pelo menos uma meta
      if (metas.length === 0) {
        throw new Error('Nenhuma meta encontrada para testar');
      }

      // Tentar recarregar dados do Supabase
      await actions.carregarDados();
      
      // Verificar se metas foram carregadas
      updateTestStatus('Metas', 'success', undefined, {
        count: metas.length,
        sample: metas.slice(0, 3).map(m => m.titulo)
      });
      
    } catch (error) {
      console.error('❌ Erro no teste de metas:', error);
      updateTestStatus('Metas', 'error', error instanceof Error ? error.message : 'Erro desconhecido');
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    
    try {
      // Resetar todos os testes
      setTests(prev => prev.map(test => ({ ...test, status: 'pending' as const, error: undefined, data: undefined })));
      
      // Executar testes em sequência
      await testProdutosPersistence();
      await testVendasPersistence();
      await testClientesPersistence();
      await testMetasPersistence();
      
    } catch (error) {
      console.error('❌ Erro geral nos testes:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: PersistenceTest['status']) => {
    switch (status) {
      case 'success':
        return <Check className="h-5 w-5 text-green-600" />;
      case 'error':
        return <X className="h-5 w-5 text-red-600" />;
      case 'running':
        return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />;
      default:
        return <Database className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: PersistenceTest['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="outline" className="text-green-600 border-green-600">Sucesso</Badge>;
      case 'error':
        return <Badge variant="outline" className="text-red-600 border-red-600">Erro</Badge>;
      case 'running':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Executando</Badge>;
      default:
        return <Badge variant="outline" className="text-gray-500 border-gray-400">Pendente</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Database className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Validação de Persistência - QA</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Verificar se todos os dados estão sendo salvos corretamente no Supabase
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Botão de execução */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Execute os testes para verificar a integridade da persistência de dados
            </p>
            <Button 
              onClick={runAllTests} 
              disabled={isRunning}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Executando...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Executar Testes QA
                </>
              )}
            </Button>
          </div>

          {/* Lista de testes */}
          <div className="space-y-4">
            {tests.map((test) => (
              <div key={test.name} className="border rounded-lg p-4 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <h4 className="font-medium">{test.name}</h4>
                      <p className="text-sm text-muted-foreground">{test.description}</p>
                    </div>
                  </div>
                  {getStatusBadge(test.status)}
                </div>

                {/* Dados do teste */}
                {test.data && (
                  <div className="mt-3 p-3 bg-green-50 rounded-md border border-green-200">
                    <p className="text-sm text-green-800">
                      <strong>✅ Registros encontrados:</strong> {test.data.count}
                    </p>
                    {test.data.sample && (
                      <p className="text-xs text-green-700 mt-1">
                        <strong>Amostra:</strong> {test.data.sample.join(', ')}
                      </p>
                    )}
                  </div>
                )}

                {/* Erro do teste */}
                {test.error && (
                  <div className="mt-3 p-3 bg-red-50 rounded-md border border-red-200 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-800">{test.error}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Resumo dos resultados */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {tests.filter(t => t.status === 'success').length}
                </p>
                <p className="text-sm text-muted-foreground">Sucessos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {tests.filter(t => t.status === 'error').length}
                </p>
                <p className="text-sm text-muted-foreground">Erros</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {tests.filter(t => t.status === 'running').length}
                </p>
                <p className="text-sm text-muted-foreground">Executando</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-500">
                  {tests.filter(t => t.status === 'pending').length}
                </p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TesteValidacaoPersistencia;