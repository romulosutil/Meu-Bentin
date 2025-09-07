import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Check, X, Database, AlertTriangle, DollarSign, RefreshCw } from 'lucide-react';

const TesteCapitalGiro = () => {
  const [status, setStatus] = useState<'pending' | 'testing' | 'success' | 'error'>('pending');
  const [erro, setErro] = useState<string | null>(null);
  const [capitalGiro, setCapitalGiro] = useState<any>(null);

  const testarCapitalGiro = async () => {
    setStatus('testing');
    setErro(null);
    
    try {
      console.log('🧪 Testando capital de giro...');
      
      const { supabaseService } = await import('../utils/supabaseServiceSemVendedor');
      
      // Tentar buscar capital de giro
      const capital = await supabaseService.getCapitalGiro();
      
      setCapitalGiro(capital);
      setStatus('success');
      
      console.log('✅ Capital de giro testado com sucesso:', capital);
      
    } catch (error: any) {
      console.error('❌ Erro no teste de capital de giro:', error);
      setErro(error.message || 'Erro desconhecido');
      setStatus('error');
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'error':
        return <X className="h-4 w-4 text-red-600" />;
      case 'testing':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <Database className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600 border-green-200 bg-green-50';
      case 'error':
        return 'text-red-600 border-red-200 bg-red-50';
      case 'testing':
        return 'text-blue-600 border-blue-200 bg-blue-50';
      default:
        return 'text-gray-500 border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-orange-200 bg-orange-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-orange-600" />
            🚨 Teste Capital de Giro - Correção Erro PGRST205
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Teste para verificar se a tabela capital_giro foi criada no Supabase
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Status do teste */}
          <div className={`p-4 rounded-lg border ${getStatusColor()}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                <span className="font-semibold">Status da Tabela capital_giro</span>
              </div>
              <Badge className={getStatusColor()}>
                {status === 'testing' ? 'Testando...' : status}
              </Badge>
            </div>
            
            {status === 'error' && erro && (
              <div className="mt-3 p-3 bg-red-100 rounded-lg">
                <p className="text-sm font-medium text-red-800">Erro encontrado:</p>
                <p className="text-sm text-red-700 mt-1 font-mono">{erro}</p>
              </div>
            )}

            {status === 'success' && (
              <div className="mt-3 p-3 bg-green-100 rounded-lg">
                <p className="text-sm font-medium text-green-800">✅ Teste bem-sucedido!</p>
                <p className="text-sm text-green-700 mt-1">
                  {capitalGiro 
                    ? `Capital encontrado: R$ ${capitalGiro.valorInicial?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
                    : 'Nenhum capital configurado (normal para primeiro uso)'
                  }
                </p>
              </div>
            )}
          </div>

          {/* Botão de teste */}
          <div className="flex gap-3">
            <Button 
              onClick={testarCapitalGiro} 
              disabled={status === 'testing'}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {status === 'testing' ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Testando...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Testar Capital de Giro
                </>
              )}
            </Button>
          </div>

          {/* Instruções */}
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold">📋 Instruções para Correção:</p>
                <ol className="text-sm space-y-1 pl-4">
                  <li>1. <strong>Se o teste falhar:</strong> Execute a migração SQL no Supabase</li>
                  <li>2. <strong>Acesse:</strong> Painel Supabase → SQL Editor</li>
                  <li>3. <strong>Execute:</strong> O código SQL do arquivo EXECUTAR_MIGRAÇÃO_CAPITAL_GIRO.md</li>
                  <li>4. <strong>Teste novamente:</strong> Clique no botão acima após executar a migração</li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>

          {/* Informações técnicas */}
          <div className="bg-gray-50 p-4 rounded-lg text-sm">
            <h4 className="font-semibold mb-2">🔧 Detalhes Técnicos:</h4>
            <ul className="space-y-1">
              <li><strong>Erro esperado sem migração:</strong> PGRST205 - Table not found</li>
              <li><strong>Tabela necessária:</strong> public.capital_giro</li>
              <li><strong>Colunas:</strong> id, valor_inicial, data_configuracao, historico</li>
              <li><strong>Resultado esperado:</strong> null (sem capital) ou objeto CapitalGiro</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TesteCapitalGiro;