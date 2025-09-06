import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { supabaseService, Produto } from '../utils/supabaseServiceSemVendedor';
import { Database, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

/**
 * Componente para testar se os campos extras estão sendo persistidos no Supabase
 */
const TesteSupabaseProdutos: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const adicionarLog = (mensagem: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${mensagem}`]);
  };

  const testarPersistencia = async () => {
    setIsLoading(true);
    setError(null);
    setResults([]);
    
    try {
      adicionarLog('🔄 Iniciando teste de persistência...');
      
      // Criar um produto de teste com todos os campos extras
      const produtoTeste: Omit<Produto, 'id' | 'dataAtualizacao'> = {
        nome: `Teste Persistência ${Date.now()}`,
        categoria: 'Teste',
        preco: 29.90,
        precoCusto: 15.00,
        quantidade: 10,
        estoqueMinimo: 2,
        cor: 'Azul, Rosa',
        tamanho: 'P, M, G',
        marca: 'Meu Bentin',
        fornecedor: 'Fornecedor Teste',
        codigoBarras: `TEST${Date.now()}`,
        descricao: 'Produto criado para testar persistência dos campos extras',
        ativo: true,
        // Campos extras que queremos testar:
        imageUrl: 'https://example.com/image.jpg',
        tamanhos: ['P', 'M', 'G'],
        genero: 'unissex',
        cores: ['Azul', 'Rosa', 'Verde'],
        tipoTecido: 'Algodão',
        sku: `SKU${Date.now()}`
      };

      adicionarLog('✅ Produto de teste criado com campos extras');

      // Adicionar o produto
      const produtoAdicionado = await supabaseService.addProduto(produtoTeste);
      adicionarLog(`✅ Produto adicionado com ID: ${produtoAdicionado.id}`);

      // Verificar se os campos extras foram persistidos
      const camposExtras = {
        'imageUrl': produtoAdicionado.imageUrl,
        'tamanhos': JSON.stringify(produtoAdicionado.tamanhos),
        'genero': produtoAdicionado.genero,
        'cores': JSON.stringify(produtoAdicionado.cores),
        'tipoTecido': produtoAdicionado.tipoTecido
      };

      let sucessos = 0;
      let falhas = 0;

      for (const [campo, valor] of Object.entries(camposExtras)) {
        if (valor && valor !== '[]' && valor !== '') {
          adicionarLog(`✅ Campo '${campo}' persistido: ${valor}`);
          sucessos++;
        } else {
          adicionarLog(`❌ Campo '${campo}' NÃO persistido (vazio): ${valor}`);
          falhas++;
        }
      }

      // Buscar o produto novamente para confirmar
      const produtos = await supabaseService.getProdutos();
      const produtoEncontrado = produtos.find(p => p.id === produtoAdicionado.id);

      if (produtoEncontrado) {
        adicionarLog('✅ Produto encontrado na busca');
        adicionarLog(`Campos no produto encontrado: imageUrl='${produtoEncontrado.imageUrl}', genero='${produtoEncontrado.genero}'`);
      } else {
        adicionarLog('❌ Produto não encontrado na busca');
        falhas++;
      }

      // Resultado final
      if (sucessos > falhas) {
        adicionarLog(`🎉 TESTE SUCESSO: ${sucessos}/${sucessos + falhas} campos extras funcionando!`);
      } else {
        adicionarLog(`⚠️ TESTE PARCIAL: ${sucessos}/${sucessos + falhas} campos extras funcionando`);
      }

      // Limpar produto de teste
      try {
        await supabaseService.deleteProduto(produtoAdicionado.id);
        adicionarLog('🗑️ Produto de teste removido');
      } catch (cleanupError) {
        adicionarLog('⚠️ Erro ao remover produto de teste (não é crítico)');
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMsg);
      adicionarLog(`❌ ERRO: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const verificarTabelaSupabase = () => {
    adicionarLog('📋 Execute este SQL no Supabase para verificar as colunas:');
    adicionarLog(`
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'produtos' 
AND column_name IN ('image_url', 'tamanhos', 'genero', 'cores', 'tipo_tecido')
ORDER BY column_name;
    `.trim());
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Database className="h-6 w-6 text-blue-600" />
        <h3 className="text-xl font-semibold">Teste de Persistência - Campos Extras</h3>
      </div>

      <div className="space-y-4">
        <div className="flex gap-4">
          <Button 
            onClick={testarPersistencia}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testando...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Testar Persistência
              </>
            )}
          </Button>

          <Button 
            onClick={verificarTabelaSupabase}
            variant="outline"
            className="border-orange-300 text-orange-600 hover:bg-orange-50"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Ver SQL Verificação
          </Button>
        </div>

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              <strong>Erro:</strong> {error}
            </AlertDescription>
          </Alert>
        )}

        {results.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 max-h-96 overflow-y-auto">
            <h4 className="font-medium text-gray-700">Log do Teste:</h4>
            {results.map((result, index) => (
              <div 
                key={index} 
                className={`text-sm font-mono p-2 rounded ${
                  result.includes('✅') ? 'bg-green-100 text-green-700' :
                  result.includes('❌') ? 'bg-red-100 text-red-700' :
                  result.includes('⚠️') ? 'bg-yellow-100 text-yellow-700' :
                  result.includes('🎉') ? 'bg-blue-100 text-blue-700 font-semibold' :
                  'bg-white text-gray-600'
                }`}
              >
                {result}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-800 mb-2">ℹ️ Como interpretar os resultados:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li><strong>✅ Campo persistido:</strong> O campo está sendo salvo corretamente no Supabase</li>
          <li><strong>❌ Campo NÃO persistido:</strong> O campo não está sendo salvo (colunas não existem na tabela)</li>
          <li><strong>🎉 TESTE SUCESSO:</strong> Maioria dos campos extras funcionando</li>
          <li><strong>⚠️ TESTE PARCIAL:</strong> Alguns campos não estão funcionando - execute a migração SQL</li>
        </ul>
      </div>
    </Card>
  );
};

export default TesteSupabaseProdutos;