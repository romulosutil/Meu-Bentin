import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Phone, Calendar, DollarSign, Instagram, CheckCircle2, Info } from 'lucide-react';

// Funções de formatação inline para evitar dependências
const formatarTelefone = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, (_, p1, p2, p3) => {
      if (p3) return `(${p1}) ${p2}-${p3}`;
      if (p2) return `(${p1}) ${p2}`;
      if (p1) return `(${p1}`;
      return '';
    });
  } else {
    return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, (_, p1, p2, p3) => {
      if (p3) return `(${p1}) ${p2}-${p3}`;
      if (p2) return `(${p1}) ${p2}`;
      if (p1) return `(${p1}`;
      return '';
    });
  }
};

const formatarData = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  return numbers.replace(/(\d{2})(\d{2})(\d{0,4})/, (_, day, month, year) => {
    if (year) return `${day}/${month}/${year}`;
    if (month) return `${day}/${month}`;
    return day;
  });
};

const formatarInstagram = (value: string): string => {
  const cleaned = value.replace(/[^a-zA-Z0-9._]/g, '');
  return cleaned.startsWith('@') ? cleaned : '@' + cleaned;
};

const formatarMoeda = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (!numbers) return '';
  
  const amount = parseInt(numbers) / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  }).format(amount);
};

const DemoMascarasFuncionando: React.FC = () => {
  const [telefone, setTelefone] = useState('');
  const [data, setData] = useState('');
  const [instagram, setInstagram] = useState('');
  const [moeda, setMoeda] = useState('');
  
  const [resultado, setResultado] = useState('');

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTelefone(formatarTelefone(e.target.value));
  };

  const handleDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData(formatarData(e.target.value));
  };

  const handleInstagramChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInstagram(formatarInstagram(e.target.value));
  };

  const handleMoedaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMoeda(formatarMoeda(e.target.value));
  };

  const testarMascaras = () => {
    const dadosProcessados = {
      telefone: telefone.replace(/\D/g, ''),
      data: data.replace(/\D/g, ''),
      instagram: instagram,
      moeda: moeda.replace(/\D/g, ''),
      valorMoeda: parseInt(moeda.replace(/\D/g, '')) / 100
    };

    setResultado(JSON.stringify(dadosProcessados, null, 2));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Demonstração das Máscaras de Input - Funcionando
          </CardTitle>
          <CardDescription>
            Versão simplificada que garante o funcionamento das máscaras
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            
            {/* Aviso sobre a implementação */}
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Esta versão usa máscaras inline para garantir funcionamento sem dependências externas.
              </AlertDescription>
            </Alert>

            {/* Formulário de Teste */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Campos com Máscara */}
              <div className="space-y-4">
                <h3 className="font-medium">Campos com Máscara</h3>
                
                {/* Telefone */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Telefone
                  </Label>
                  <Input
                    value={telefone}
                    onChange={handleTelefoneChange}
                    placeholder="Digite apenas números"
                    maxLength={15}
                  />
                  <p className="text-xs text-gray-500">Máscara: (XX) XXXXX-XXXX</p>
                </div>

                {/* Data */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Data de Nascimento
                  </Label>
                  <Input
                    value={data}
                    onChange={handleDataChange}
                    placeholder="Digite DDMMAAAA"
                    maxLength={10}
                  />
                  <p className="text-xs text-gray-500">Máscara: DD/MM/AAAA</p>
                </div>

                {/* Instagram */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Instagram className="h-4 w-4" />
                    Instagram
                  </Label>
                  <Input
                    value={instagram}
                    onChange={handleInstagramChange}
                    placeholder="Digite o usuário"
                    maxLength={31}
                  />
                  <p className="text-xs text-gray-500">Máscara: @usuario</p>
                </div>

                {/* Moeda */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Valor
                  </Label>
                  <Input
                    value={moeda}
                    onChange={handleMoedaChange}
                    placeholder="Digite apenas números"
                  />
                  <p className="text-xs text-gray-500">Máscara: R$ XXX,XX</p>
                </div>

                <Button onClick={testarMascaras} className="w-full">
                  Testar Máscaras
                </Button>
              </div>

              {/* Resultado */}
              <div className="space-y-4">
                <h3 className="font-medium">Resultado Processado</h3>
                
                {resultado ? (
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-green-800 mb-2">Dados para o Banco:</h4>
                      <pre className="text-xs font-mono text-green-700 whitespace-pre-wrap">
                        {resultado}
                      </pre>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-dashed border-gray-300">
                    <CardContent className="p-4 text-center text-gray-500">
                      <p>Preencha os campos e clique em "Testar Máscaras"</p>
                    </CardContent>
                  </Card>
                )}

                {/* Preview dos valores formatados */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Preview Visual:</h4>
                  
                  {telefone && (
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <Phone className="h-3 w-3" />
                      <span className="text-sm">{telefone}</span>
                    </div>
                  )}
                  
                  {data && (
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <Calendar className="h-3 w-3" />
                      <span className="text-sm">{data}</span>
                    </div>
                  )}
                  
                  {instagram && (
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <Instagram className="h-3 w-3" />
                      <span className="text-sm">{instagram}</span>
                    </div>
                  )}
                  
                  {moeda && (
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <DollarSign className="h-3 w-3" />
                      <span className="text-sm">{moeda}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instruções de Integração */}
      <Card className="border-2 border-dashed border-gray-300">
        <CardHeader>
          <CardTitle>✅ Status da Implementação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-green-700 mb-2">Máscaras Implementadas</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>✅ Telefone: (XX) XXXXX-XXXX</li>
                <li>✅ Data: DD/MM/AAAA</li>
                <li>✅ Instagram: @usuario</li>
                <li>✅ Moeda: R$ XXX,XX</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-blue-700 mb-2">Componentes Atualizados</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>✅ GerenciarClientesFixedMascaras</li>
                <li>✅ FormularioProdutoComMascaras</li>
                <li>✅ CaixaComMascaras</li>
                <li>✅ Hooks de máscara defensivos</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DemoMascarasFuncionando;