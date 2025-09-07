import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { PiggyBank, AlertCircle, Settings } from 'lucide-react';

const TesteModalCapitalGiro = () => {
  const [modalAberto, setModalAberto] = useState(false);
  const [valorCapitalGiro, setValorCapitalGiro] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const formatarValor = (valor: number) => {
    if (!valor) return '';
    return `R$ ${Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const extrairNumero = (valorFormatado: string) => {
    const numero = valorFormatado.replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(numero) || 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorLimpo = extrairNumero(e.target.value);
    setValorCapitalGiro(valorLimpo);
  };

  const handleConfigurar = () => {
    setIsLoading(true);
    setTimeout(() => {
      console.log('Capital configurado:', valorCapitalGiro);
      setIsLoading(false);
      setModalAberto(false);
      setValorCapitalGiro(0);
    }, 1000);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-4">🧪 Teste Modal Capital de Giro</h1>
        <p className="text-center text-gray-600 mb-6">
          Teste se o modal ainda está "piscando" durante a digitação
        </p>

        <Dialog open={modalAberto} onOpenChange={setModalAberto}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <Settings className="h-4 w-4 mr-2" />
              Testar Modal Capital
            </Button>
          </DialogTrigger>
          
          <DialogContent className="w-[95vw] max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <PiggyBank className="h-5 w-5 text-bentin-orange" />
                Capital de Giro - Teste
              </DialogTitle>
              <DialogDescription>
                Digite um valor e observe se o modal pisca durante a digitação
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-6">
              <div className="space-y-3">
                <Label htmlFor="capitalInicial" className="text-sm font-semibold text-gray-700">
                  Valor do Capital de Giro (R$)
                </Label>
                
                <div className="relative">
                  <Input
                    id="capitalInicial"
                    type="text"
                    value={formatarValor(valorCapitalGiro)}
                    onChange={handleInputChange}
                    placeholder="R$ 50.000,00"
                    className="w-full h-12 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-bentin-pink focus:border-transparent transition-all duration-200"
                  />
                </div>
                
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Inclua o valor investido em estoque, reservas e capital operacional
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200/50">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-blue-900 mb-1">
                      💡 O que é Capital de Giro?
                    </h4>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      É o dinheiro disponível para as operações do dia a dia da loja, como compra de mercadorias, pagamento de fornecedores e despesas operacionais.
                    </p>
                  </div>
                </div>
              </div>

              {/* Debug Info */}
              <div className="bg-gray-50 p-3 rounded-lg border text-xs">
                <strong>Debug:</strong><br />
                Valor State: {valorCapitalGiro}<br />
                Valor Formatado: {formatarValor(valorCapitalGiro)}<br />
                Modal Status: {modalAberto ? 'Aberto' : 'Fechado'}
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setModalAberto(false)} 
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleConfigurar} 
                className="bentin-button-primary"
                disabled={isLoading || valorCapitalGiro <= 0}
              >
                {isLoading ? 'Configurando...' : 'Configurar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">📋 Instruções do Teste:</h3>
          <ol className="text-sm text-yellow-700 space-y-1">
            <li>1. Clique no botão para abrir o modal</li>
            <li>2. Digite valores no campo do capital</li>
            <li>3. Observe se o modal "pisca" ou re-renderiza</li>
            <li>4. Teste com diferentes valores (ex: 10000, 50000)</li>
            <li>5. Verifique se a formatação funciona corretamente</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default TesteModalCapitalGiro;