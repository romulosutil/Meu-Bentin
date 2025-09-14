import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { PhoneInput, DateInput, InstagramInput, CurrencyInput } from './ui/masked-input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle2, AlertCircle, Phone, Calendar, DollarSign, Instagram } from 'lucide-react';

interface FormData {
  telefone: string;
  dataNascimento: string;
  instagram: string;
  preco: number;
}

const TesteMascarasInput: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    telefone: '',
    dataNascimento: '',
    instagram: '',
    preco: 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitMessage, setSubmitMessage] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação simples
    const newErrors: Record<string, string> = {};
    
    if (!formData.telefone) {
      newErrors.telefone = 'Telefone é obrigatório';
    }
    
    if (!formData.dataNascimento) {
      newErrors.dataNascimento = 'Data de nascimento é obrigatória';
    }
    
    if (!formData.instagram) {
      newErrors.instagram = 'Instagram é obrigatório';
    }
    
    if (formData.preco <= 0) {
      newErrors.preco = 'Preço deve ser maior que zero';
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      setSubmitMessage(`
        ✅ Dados validados com sucesso!
        📞 Telefone: ${formData.telefone}
        📅 Data: ${formData.dataNascimento}
        📱 Instagram: ${formData.instagram}
        💰 Preço: R$ ${formData.preco.toFixed(2)}
      `);
    } else {
      setSubmitMessage('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-foreground mb-2">
          Teste das Máscaras de Input
        </h1>
        <p className="text-muted-foreground">
          Demonstração das máscaras implementadas no sistema Meu Bentin
        </p>
      </div>

      {/* Indicadores das Máscaras */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Badge variant="outline" className="flex items-center gap-2">
          <Phone className="h-3 w-3" />
          Telefone: (XX) XXXXX-XXXX
        </Badge>
        <Badge variant="outline" className="flex items-center gap-2">
          <Calendar className="h-3 w-3" />
          Data: DD/MM/AAAA
        </Badge>
        <Badge variant="outline" className="flex items-center gap-2">
          <Instagram className="h-3 w-3" />
          Instagram: @usuario
        </Badge>
        <Badge variant="outline" className="flex items-center gap-2">
          <DollarSign className="h-3 w-3" />
          Moeda: R$ XXX,XX
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulário de Teste */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Formulário de Teste
            </CardTitle>
            <CardDescription>
              Preencha os campos para testar as máscaras de input implementadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo de Telefone */}
              <div className="space-y-2">
                <PhoneInput
                  id="telefone"
                  label="Telefone"
                  required
                  initialValue={formData.telefone}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, telefone: value }))}
                  error={errors.telefone}
                />
                <p className="text-xs text-gray-500">
                  Digite apenas números. A máscara (XX) XXXXX-XXXX será aplicada automaticamente.
                </p>
              </div>

              {/* Campo de Data */}
              <div className="space-y-2">
                <DateInput
                  id="dataNascimento"
                  label="Data de Nascimento"
                  required
                  initialValue={formData.dataNascimento}
                  onValueChange={(value) => {
                    // Converter formato DD/MM/AAAA para string
                    setFormData(prev => ({ ...prev, dataNascimento: value }));
                  }}
                  error={errors.dataNascimento}
                />
                <p className="text-xs text-gray-500">
                  Digite no formato DDMMAAAA. A máscara DD/MM/AAAA será aplicada automaticamente.
                </p>
              </div>

              {/* Campo de Instagram */}
              <div className="space-y-2">
                <InstagramInput
                  id="instagram"
                  label="Instagram"
                  required
                  initialValue={formData.instagram}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, instagram: value }))}
                  error={errors.instagram}
                />
                <p className="text-xs text-gray-500">
                  O @ será adicionado automaticamente. Digite apenas o nome do usuário.
                </p>
              </div>

              {/* Campo de Preço */}
              <div className="space-y-2">
                <CurrencyInput
                  id="preco"
                  label="Preço"
                  required
                  initialValue={formData.preco}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, preco: value }))}
                  error={errors.preco}
                />
                <p className="text-xs text-gray-500">
                  Digite valores em centavos. R$ 1.000,00 = digite 100000.
                </p>
              </div>

              <Button type="submit" className="w-full">
                Testar Validação
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Resultado do Teste */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              Resultado da Validação
            </CardTitle>
            <CardDescription>
              Visualize os dados processados pelas máscaras
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitMessage ? (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  <pre className="whitespace-pre-wrap text-sm font-mono">
                    {submitMessage}
                  </pre>
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <p className="text-muted-foreground text-center py-6">
                  Preencha o formulário e clique em "Testar Validação" para ver os dados processados.
                </p>
                
                {/* Preview dos valores em tempo real */}
                <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-700">Preview dos Valores:</h4>
                  
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Telefone:</span>
                      <span className="font-mono">{formData.telefone || '(vazio)'}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Data:</span>
                      <span className="font-mono">{formData.dataNascimento || '(vazio)'}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Instagram:</span>
                      <span className="font-mono">{formData.instagram || '(vazio)'}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Preço:</span>
                      <span className="font-mono">
                        {formData.preco > 0 ? `R$ ${formData.preco.toFixed(2)}` : '(vazio)'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mostrar erros */}
            {Object.keys(errors).length > 0 && (
              <div className="mt-4">
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-medium text-red-700">Erros encontrados:</p>
                      <ul className="list-disc list-inside text-sm text-red-600">
                        {Object.entries(errors).map(([field, error]) => (
                          <li key={field}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Guia de Integração */}
      <Card className="border-2 border-dashed border-gray-300">
        <CardHeader>
          <CardTitle className="text-center">Integração com Dados Existentes</CardTitle>
          <CardDescription className="text-center">
            Como as máscaras preservam compatibilidade com o banco de dados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-green-700">✅ Garantias de Segurança</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Máscaras não alteram dados existentes</li>
                <li>• Validação preserva formatos antigos</li>
                <li>• Conversão automática para banco de dados</li>
                <li>• Campos vazios tratados corretamente</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-blue-700">📋 Formatos Suportados</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• <strong>Telefone:</strong> (11) 99999-9999 → 11999999999</li>
                <li>• <strong>Data:</strong> DD/MM/AAAA → AAAA-MM-DD</li>
                <li>• <strong>Instagram:</strong> @usuario → @usuario</li>
                <li>• <strong>Moeda:</strong> R$ 10,50 → 10.50</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TesteMascarasInput;