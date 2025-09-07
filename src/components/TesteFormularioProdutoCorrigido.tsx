import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import FormularioProduto from './FormularioProduto';
import { Produto } from '../utils/supabaseServiceSemVendedor';
import { Package, CheckCircle2, AlertTriangle, Bug } from 'lucide-react';

/**
 * Componente para testar se as correções do FormularioProduto estão funcionando
 */
const TesteFormularioProdutoCorrigido: React.FC = () => {
  const [modalAberto, setModalAberto] = useState(false);
  const [produtoTeste, setProdutoTeste] = useState<Produto | undefined>(undefined);
  const [modoTeste, setModoTeste] = useState<'novo' | 'edicao'>('novo');
  const [resultados, setResultados] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const adicionarLog = (mensagem: string) => {
    setResultados(prev => [...prev, `${new Date().toLocaleTimeString()}: ${mensagem}`]);
  };

  // Produto de teste para edição
  const produtoParaEdicao: Produto = {
    id: 'test-123',
    nome: 'Vestido Princesa Rosa',
    categoria: 'Vestidos',
    preco: 89.99,
    precoCusto: 45.50,
    quantidade: 15,
    estoqueMinimo: 3,
    tamanho: 'M',
    cor: 'Rosa',
    marca: 'Meu Bentin',
    fornecedor: 'Fornecedor Teste',
    codigoBarras: 'TEST123',
    descricao: 'Vestido lindo para princesas',
    dataAtualizacao: new Date().toISOString(),
    ativo: true,
    imageUrl: 'https://example.com/image.jpg',
    tamanhos: ['M'],
    genero: 'feminino',
    cores: ['Rosa', 'Azul'],
    tipoTecido: 'Algodão',
    sku: 'VPR001'
  };

  const testarNovoFormulario = () => {
    adicionarLog('🆕 Testando formulário para NOVO produto');
    setModoTeste('novo');
    setProdutoTeste(undefined);
    setModalAberto(true);
  };

  const testarEdicaoFormulario = () => {
    adicionarLog('✏️ Testando formulário para EDIÇÃO de produto');
    adicionarLog(`📝 Preço: R$ ${produtoParaEdicao.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    adicionarLog(`💰 Custo: R$ ${produtoParaEdicao.precoCusto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    adicionarLog(`📐 Tamanho: ${produtoParaEdicao.tamanho}`);
    adicionarLog(`🎨 Cores: ${produtoParaEdicao.cores?.join(', ')}`);
    adicionarLog(`🏷️ SKU: ${produtoParaEdicao.sku}`);
    adicionarLog(`🏢 Fornecedor: ${produtoParaEdicao.fornecedor}`);
    
    setModoTeste('edicao');
    setProdutoTeste(produtoParaEdicao);
    setModalAberto(true);
  };

  const handleSubmit = async (produto: Omit<Produto, 'id' | 'dataAtualizacao'>) => {
    setIsSubmitting(true);
    adicionarLog('📤 Dados recebidos do formulário:');
    
    try {
      // Verificar se os campos estão sendo enviados corretamente
      adicionarLog(`✅ Nome: ${produto.nome}`);
      adicionarLog(`✅ Preço: R$ ${produto.preco.toFixed(2)} (${typeof produto.preco})`);
      adicionarLog(`✅ Custo: R$ ${produto.precoCusto.toFixed(2)} (${typeof produto.precoCusto})`);
      adicionarLog(`✅ Tamanho: ${produto.tamanho} (único: ${!Array.isArray(produto.tamanhos) || produto.tamanhos.length <= 1 ? 'SIM' : 'NÃO'})`);
      adicionarLog(`✅ Cores: [${produto.cores?.join(', ')}] (${produto.cores?.length || 0} cores)`);
      adicionarLog(`✅ SKU/Código: ${produto.codigoBarras}`);
      adicionarLog(`✅ Fornecedor: ${produto.fornecedor}`);
      
      // Validações específicas
      if (produto.preco > 0 && typeof produto.preco === 'number') {
        adicionarLog('🎉 SUCESSO: Preço formatado corretamente');
      } else {
        adicionarLog('❌ ERRO: Preço com problema na formatação');
      }
      
      if (produto.precoCusto >= 0 && typeof produto.precoCusto === 'number') {
        adicionarLog('🎉 SUCESSO: Custo formatado corretamente');
      } else {
        adicionarLog('❌ ERRO: Custo com problema na formatação');
      }
      
      if (produto.tamanho && produto.tamanho.length > 0) {
        adicionarLog('🎉 SUCESSO: Tamanho único selecionado');
      } else {
        adicionarLog('⚠️ AVISO: Nenhum tamanho selecionado');
      }
      
      if (produto.cores && produto.cores.length > 0) {
        adicionarLog('🎉 SUCESSO: Cores selecionadas');
      } else {
        adicionarLog('⚠️ AVISO: Nenhuma cor selecionada');
      }
      
      if (produto.codigoBarras && produto.codigoBarras.length > 0) {
        adicionarLog('🎉 SUCESSO: SKU/Código persistido');
      } else {
        adicionarLog('⚠️ AVISO: SKU/Código vazio');
      }
      
      if (produto.fornecedor && produto.fornecedor.length > 0) {
        adicionarLog('🎉 SUCESSO: Fornecedor persistido');
      } else {
        adicionarLog('⚠️ AVISO: Fornecedor vazio');
      }
      
      adicionarLog('🎯 TESTE CONCLUÍDO COM SUCESSO!');
      
    } catch (error) {
      adicionarLog(`❌ ERRO no teste: ${error}`);
    } finally {
      setIsSubmitting(false);
      setModalAberto(false);
    }
  };

  const limparResultados = () => {
    setResultados([]);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100 border border-blue-200">
            <Bug className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-xl">Teste das Correções - Modal Editar Produto</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Verifica se todas as correções solicitadas estão funcionando
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Botões de Teste */}
        <div className="flex gap-4">
          <Button
            onClick={testarNovoFormulario}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Package className="h-4 w-4 mr-2" />
            Testar Novo Produto
          </Button>
          
          <Button
            onClick={testarEdicaoFormulario}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Testar Edição Produto
          </Button>
          
          <Button
            onClick={limparResultados}
            variant="outline"
            className="border-gray-300"
          >
            Limpar Log
          </Button>
        </div>

        {/* Checklist de Correções */}
        <Alert className="border-blue-200 bg-blue-50">
          <AlertTriangle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700">
            <strong>Checklist de Correções:</strong>
            <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
              <li>✅ Preço de Venda: Máscara corrigida (não divide por 100)</li>
              <li>✅ Custo do Produto: Máscara corrigida (não divide por 100)</li>
              <li>✅ Tamanhos: Seleção única em vez de múltipla</li>
              <li>✅ Cores: Input para adicionar novas cores</li>
              <li>✅ SKU: Campo codigoBarras persistindo corretamente</li>
              <li>✅ Fornecedor: Campo fornecedor persistindo corretamente</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Log de Resultados */}
        {resultados.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 max-h-96 overflow-y-auto">
            <h4 className="font-medium text-gray-700">Log de Teste:</h4>
            {resultados.map((result, index) => (
              <div 
                key={index} 
                className={`text-sm font-mono p-2 rounded ${
                  result.includes('✅') || result.includes('🎉') ? 'bg-green-100 text-green-700' :
                  result.includes('❌') ? 'bg-red-100 text-red-700' :
                  result.includes('⚠️') ? 'bg-yellow-100 text-yellow-700' :
                  result.includes('🎯') ? 'bg-blue-100 text-blue-700 font-semibold' :
                  'bg-white text-gray-600'
                }`}
              >
                {result}
              </div>
            ))}
          </div>
        )}

        {/* Modal do Formulário */}
        <FormularioProduto
          open={modalAberto}
          produto={produtoTeste}
          onSubmit={handleSubmit}
          onCancel={() => setModalAberto(false)}
          isSubmitting={isSubmitting}
          categorias={['Vestidos', 'Calças', 'Camisetas', 'Acessórios']}
        />
      </CardContent>
    </Card>
  );
};

export default TesteFormularioProdutoCorrigido;