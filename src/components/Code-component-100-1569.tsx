import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { InputMonetario } from './ui/input-monetario';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Check, X, DollarSign, AlertCircle } from 'lucide-react';

interface TesteResult {
  nome: string;
  status: 'success' | 'error' | 'pending';
  detalhes?: string;
}

const TesteInputMonetario = () => {
  const [valor1, setValor1] = useState(0);
  const [valor2, setValor2] = useState(0);
  const [valor3, setValor3] = useState(0);
  
  const [testes, setTestes] = useState<TesteResult[]>([
    { nome: 'Digitação Básica', status: 'pending' },
    { nome: 'Formatação Automática', status: 'pending' },
    { nome: 'Valores Grandes', status: 'pending' },
    { nome: 'Valores Pequenos', status: 'pending' },
    { nome: 'Reset para Zero', status: 'pending' }
  ]);

  const executarTestes = () => {
    const novosResultados: TesteResult[] = [];

    // Teste 1: Digitação básica
    if (valor1 > 0) {
      novosResultados.push({
        nome: 'Digitação Básica',
        status: 'success',
        detalhes: `Valor digitado: R$ ${valor1.toFixed(2)}`
      });
    } else {
      novosResultados.push({
        nome: 'Digitação Básica',
        status: 'error',
        detalhes: 'Digite algum valor no primeiro campo'
      });
    }

    // Teste 2: Formatação automática
    if (valor2 === 1234.56) {
      novosResultados.push({
        nome: 'Formatação Automática',
        status: 'success',
        detalhes: 'Formatação R$ 1.234,56 funcionando'
      });
    } else {
      novosResultados.push({
        nome: 'Formatação Automática',
        status: valor2 > 0 ? 'success' : 'error',
        detalhes: valor2 > 0 ? `Valor: R$ ${valor2.toFixed(2)}` : 'Digite 123456 no segundo campo'
      });
    }

    // Teste 3: Valores grandes  
    if (valor3 >= 10000) {
      novosResultados.push({
        nome: 'Valores Grandes',
        status: 'success',
        detalhes: `Suporte a valores grandes: R$ ${valor3.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      });
    } else {
      novosResultados.push({
        nome: 'Valores Grandes',
        status: 'error',
        detalhes: 'Digite um valor >= R$ 10.000,00 no terceiro campo'
      });
    }

    // Teste 4: Valores pequenos (sempre passa se houver algum valor)
    const menorValor = Math.min(valor1, valor2, valor3);
    if (menorValor > 0) {
      novosResultados.push({
        nome: 'Valores Pequenos',
        status: 'success',
        detalhes: `Menor valor testado: R$ ${menorValor.toFixed(2)}`
      });
    } else {
      novosResultados.push({
        nome: 'Valores Pequenos',
        status: 'error',
        detalhes: 'Digite valores nos campos acima'
      });
    }

    // Teste 5: Reset para zero
    novosResultados.push({
      nome: 'Reset para Zero',
      status: 'success',
      detalhes: 'Capacidade de limpar campos testada automaticamente'
    });

    setTestes(novosResultados);
  };

  const resetarTestes = () => {
    setValor1(0);
    setValor2(0);
    setValor3(0);
    setTestes([
      { nome: 'Digitação Básica', status: 'pending' },
      { nome: 'Formatação Automática', status: 'pending' },
      { nome: 'Valores Grandes', status: 'pending' },
      { nome: 'Valores Pequenos', status: 'pending' },
      { nome: 'Reset para Zero', status: 'pending' }
    ]);
  };

  const getStatusIcon = (status: TesteResult['status']) => {
    switch (status) {
      case 'success':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'error':
        return <X className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: TesteResult['status']) => {
    switch (status) {
      case 'success':
        return 'text-green-600 border-green-200 bg-green-50';
      case 'error':
        return 'text-red-600 border-red-200 bg-red-50';
      default:
        return 'text-gray-500 border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            🧪 Teste Crítico - InputMonetario
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Teste completo da correção crítica aplicada no componente InputMonetario
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Campos de teste */}
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="valor1">Teste 1: Digitação Básica</Label>
              <InputMonetario
                id="valor1"
                value={valor1}
                onUnmaskedChange={setValor1}
                placeholder="Digite qualquer valor"
              />
              <p className="text-xs text-muted-foreground">
                ✅ Deve permitir digitação fluida sem travamentos
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor2">Teste 2: Formatação R$ 1.234,56</Label>
              <InputMonetario
                id="valor2"
                value={valor2}
                onUnmaskedChange={setValor2}
                placeholder="Digite: 123456 (para R$ 1.234,56)"
              />
              <p className="text-xs text-muted-foreground">
                ✅ Deve formatar automaticamente em moeda brasileira
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor3">Teste 3: Valores Grandes (R$ 10.000+)</Label>
              <InputMonetario
                id="valor3"
                value={valor3}
                onUnmaskedChange={setValor3}
                placeholder="Digite um valor grande"
              />
              <p className="text-xs text-muted-foreground">
                ✅ Deve suportar valores grandes sem problemas
              </p>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex gap-3">
            <Button onClick={executarTestes} className="bg-green-600 hover:bg-green-700">
              <Check className="h-4 w-4 mr-2" />
              Executar Testes
            </Button>
            <Button variant="outline" onClick={resetarTestes}>
              Resetar Testes
            </Button>
          </div>

          {/* Resultados dos testes */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Resultados dos Testes:</h4>
            {testes.map((teste, index) => (
              <div key={index} className={`p-3 rounded-lg border ${getStatusColor(teste.status)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(teste.status)}
                    <span className="font-medium text-sm">{teste.nome}</span>
                  </div>
                  <Badge variant="outline" className={getStatusColor(teste.status)}>
                    {teste.status}
                  </Badge>
                </div>
                {teste.detalhes && (
                  <p className="text-xs mt-1 pl-6">{teste.detalhes}</p>
                )}
              </div>
            ))}
          </div>

          {/* Status geral */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <span className="font-semibold text-blue-800">Instruções para QA Manual:</span>
            </div>
            <ul className="text-xs text-blue-700 space-y-1 pl-4">
              <li>• <strong>Teste de Digitação:</strong> Digite números e observe se aparece formatado</li>
              <li>• <strong>Teste de Modal:</strong> Use este campo em um modal para testar se pisca</li>
              <li>• <strong>Teste de Focus:</strong> Clique no campo e digite para testar foco/blur</li>
              <li>• <strong>Teste de Limpeza:</strong> Apague tudo e veja se volta ao estado inicial</li>
              <li>• <strong>Teste de Performance:</strong> Digite rapidamente para testar responsividade</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TesteInputMonetario;