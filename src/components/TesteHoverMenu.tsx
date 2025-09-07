import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Check, X, Mouse, Eye, AlertCircle, Navigation } from 'lucide-react';

interface TesteHover {
  nome: string;
  instrucao: string;
  status: 'pending' | 'success' | 'error';
  detalhes?: string;
}

const TesteHoverMenu = () => {
  const [testes, setTestes] = useState<TesteHover[]>([
    {
      nome: 'Hover Visível',
      instrucao: 'Passe o mouse sobre as abas do menu principal',
      status: 'pending'
    },
    {
      nome: 'Texto Legível',
      instrucao: 'Verifique se o texto continua legível no hover',
      status: 'pending'
    },
    {
      nome: 'Ícones Visíveis',
      instrucao: 'Confirme se os ícones permanecem visíveis no hover',
      status: 'pending'
    },
    {
      nome: 'Transição Suave',
      instrucao: 'Observe se a transição é suave sem piscadas',
      status: 'pending'
    },
    {
      nome: 'Estado Ativo',
      instrucao: 'Verifique se o estado ativo não é afetado pelo hover',
      status: 'pending'
    }
  ]);

  const [testeAtual, setTesteAtual] = useState(0);
  const [instrucoes, setInstrucoes] = useState(true);

  const marcarComoSucesso = (index: number) => {
    setTestes(prev => prev.map((teste, i) => 
      i === index 
        ? { ...teste, status: 'success' as const, detalhes: 'Teste aprovado pelo usuário' }
        : teste
    ));
  };

  const marcarComoErro = (index: number) => {
    setTestes(prev => prev.map((teste, i) => 
      i === index 
        ? { ...teste, status: 'error' as const, detalhes: 'Problema identificado pelo usuário' }
        : teste
    ));
  };

  const proximoTeste = () => {
    if (testeAtual < testes.length - 1) {
      setTesteAtual(testeAtual + 1);
    }
  };

  const testeAnterior = () => {
    if (testeAtual > 0) {
      setTesteAtual(testeAtual - 1);
    }
  };

  const resetarTestes = () => {
    setTestes(prev => prev.map(teste => ({ ...teste, status: 'pending' as const, detalhes: undefined })));
    setTesteAtual(0);
  };

  const getStatusIcon = (status: TesteHover['status']) => {
    switch (status) {
      case 'success':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'error':
        return <X className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: TesteHover['status']) => {
    switch (status) {
      case 'success':
        return 'text-green-600 border-green-200 bg-green-50';
      case 'error':
        return 'text-red-600 border-red-200 bg-red-50';
      default:
        return 'text-gray-500 border-gray-200 bg-gray-50';
    }
  };

  const testesCompletados = testes.filter(t => t.status !== 'pending').length;
  const testesAprovados = testes.filter(t => t.status === 'success').length;

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mouse className="h-5 w-5 text-blue-600" />
            🎯 Teste Hover - Menu Principal
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Validação da correção aplicada no hover das abas de navegação
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Instruções gerais */}
          {instrucoes && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <Navigation className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold">📋 Instruções para o Teste:</p>
                  <ol className="text-sm space-y-1 pl-4">
                    <li>1. <strong>Volte ao menu principal</strong> (abas: Dashboard, Estoque, Vendas, etc.)</li>
                    <li>2. <strong>Passe o mouse</strong> sobre cada aba lentamente</li>
                    <li>3. <strong>Observe o comportamento</strong> do hover (cor de fundo, texto, ícones)</li>
                    <li>4. <strong>Retorne aqui</strong> e marque cada teste como aprovado ou com erro</li>
                  </ol>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setInstrucoes(false)}
                    className="mt-2"
                  >
                    Entendi, começar testes
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Status geral dos testes */}
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold">Progresso dos Testes</h4>
              <Badge variant="outline">
                {testesCompletados}/{testes.length} completos
              </Badge>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(testesCompletados / testes.length) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Aprovados: {testesAprovados} | Reprovados: {testesCompletados - testesAprovados}
            </p>
          </div>

          {/* Teste atual em destaque */}
          {!instrucoes && (
            <Card className="border-2 border-blue-300 bg-blue-50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3 mb-3">
                  <Badge className="bg-blue-600 text-white">
                    Teste {testeAtual + 1}/{testes.length}
                  </Badge>
                  <h4 className="font-semibold">{testes[testeAtual].nome}</h4>
                </div>
                <p className="text-sm text-gray-700 mb-4">{testes[testeAtual].instrucao}</p>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700" 
                    onClick={() => marcarComoSucesso(testeAtual)}
                    disabled={testes[testeAtual].status !== 'pending'}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    ✅ Aprovado
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-red-300 text-red-600 hover:bg-red-50"
                    onClick={() => marcarComoErro(testeAtual)}
                    disabled={testes[testeAtual].status !== 'pending'}
                  >
                    <X className="h-4 w-4 mr-1" />
                    ❌ Com Problema
                  </Button>
                </div>

                {/* Navegação dos testes */}
                <div className="flex justify-between mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={testeAnterior}
                    disabled={testeAtual === 0}
                  >
                    ← Anterior
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={proximoTeste}
                    disabled={testeAtual === testes.length - 1}
                  >
                    Próximo →
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lista completa de testes */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-sm">Todos os Testes:</h4>
              <Button variant="outline" size="sm" onClick={resetarTestes}>
                Resetar Todos
              </Button>
            </div>
            
            {testes.map((teste, index) => (
              <div key={index} className={`p-3 rounded-lg border ${getStatusColor(teste.status)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(teste.status)}
                    <span className="font-medium text-sm">{teste.nome}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {testeAtual === index && (
                      <Badge variant="outline" className="text-blue-600 border-blue-300">
                        Ativo
                      </Badge>
                    )}
                    <Badge variant="outline" className={getStatusColor(teste.status)}>
                      {teste.status}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-1 pl-6">{teste.instrucao}</p>
                {teste.detalhes && (
                  <p className="text-xs mt-1 pl-6 font-medium">{teste.detalhes}</p>
                )}
              </div>
            ))}
          </div>

          {/* Checklist técnico */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h4 className="font-semibold text-sm mb-2">Checklist Técnico - Hover Correto:</h4>
            <ul className="text-xs space-y-1">
              <li>✅ Background: rgba(243, 244, 246, 0.9) com !important</li>
              <li>✅ Box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) com !important</li>
              <li>✅ Transform: scale(1.02) com !important</li>
              <li>✅ Transição suave de 200ms</li>
              <li>✅ Aba ativa não afetada pelo hover (hover:!bg-transparent)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TesteHoverMenu;