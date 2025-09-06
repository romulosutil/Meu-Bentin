import React from 'react';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { FormSection, FormGrid } from './ui/form-section';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  Package, 
  DollarSign, 
  Calendar, 
  Tag, 
  Palette, 
  Ruler, 
  Shirt, 
  User,
  ImageIcon
} from 'lucide-react';
import { Produto } from '../utils/supabaseServiceSemVendedor';

interface VisualizacaoProdutoProps {
  produto: Produto;
}

const VisualizacaoProduto: React.FC<VisualizacaoProdutoProps> = ({ produto }) => {
  const getStatusEstoque = (quantidade: number, minimo: number) => {
    if (quantidade === 0) return { 
      texto: 'Esgotado', 
      classe: 'bg-red-100 text-red-800 border-red-200' 
    };
    if (quantidade <= minimo) return { 
      texto: 'Baixo', 
      classe: 'bg-yellow-100 text-yellow-800 border-yellow-200' 
    };
    return { 
      texto: 'Normal', 
      classe: 'bg-green-100 text-green-800 border-green-200' 
    };
  };

  const getMargemColor = (margem?: number) => {
    if (!margem) return 'text-gray-500';
    if (margem < 15) return 'text-red-600';
    if (margem < 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  const status = getStatusEstoque(produto.quantidade, produto.minimo);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Imagem e Informações Rápidas */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg border p-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
              {produto.imageUrl ? (
                <ImageWithFallback
                  src={produto.imageUrl}
                  alt={produto.nome}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center">
                  <ImageIcon className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500 text-sm">Sem imagem</p>
                </div>
              )}
            </div>
          </div>

          {/* Cards de informações rápidas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-green-700 font-medium">Estoque</p>
                  <p className="text-xl font-bold text-green-800">{produto.quantidade}</p>
                </div>
                <Package className="h-6 w-6 text-green-600" />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-700 font-medium">Preço</p>
                  <p className="text-xl font-bold text-blue-800">
                    R$ {produto.preco.toFixed(0)}
                  </p>
                </div>
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Informações Detalhadas */}
        <div className="space-y-4">
          
          {/* Header do produto */}
          <div className="bg-white rounded-lg border p-4">
            <h2 className="text-xl font-semibold mb-2 text-gray-900">{produto.nome}</h2>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="outline">{produto.categoria}</Badge>
              <Badge className={status.classe}>{status.texto}</Badge>
              {produto.ativo ? (
                <Badge className="bg-green-100 text-green-800">Ativo</Badge>
              ) : (
                <Badge className="bg-gray-100 text-gray-800">Inativo</Badge>
              )}
            </div>
            {produto.descricao && (
              <p className="text-gray-600 text-sm">{produto.descricao}</p>
            )}
          </div>

          {/* Informações Básicas */}
          <div className="bg-white rounded-lg border p-4">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Informações Básicas
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Marca</p>
                <p className="font-medium">{produto.marca || 'Não informado'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">SKU</p>
                <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded inline-block">
                  {produto.sku || 'Não definido'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Fornecedor</p>
                <p className="font-medium">{produto.fornecedorNome || 'Não informado'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Vendedor</p>
                <p className="font-medium">{produto.vendedor}</p>
              </div>
            </div>
          </div>

          {/* Preços e Estoque */}
          <div className="bg-white rounded-lg border p-4">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Preços e Estoque
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Preço de Venda</p>
                <p className="text-lg font-semibold text-green-600">
                  R$ {produto.preco.toFixed(2)}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Custo</p>
                <p className="text-lg font-semibold">
                  R$ {produto.custo?.toFixed(2) || '0,00'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Quantidade</p>
                <p className="text-lg font-semibold">{produto.quantidade}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Estoque Mínimo</p>
                <p className="text-lg font-semibold">{produto.minimo}</p>
              </div>
            </div>

            {produto.margemLucro && produto.margemLucro > 0 && (
              <div className="p-3 rounded-lg bg-gray-50 border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Margem de Lucro</span>
                  <span className={`font-semibold ${getMargemColor(produto.margemLucro)}`}>
                    {produto.margemLucro.toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Atributos */}
          <div className="bg-white rounded-lg border p-4">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Shirt className="h-4 w-4" />
              Atributos do Produto
            </h3>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                {produto.genero && (
                  <div>
                    <p className="text-sm text-gray-500">Gênero</p>
                    <Badge variant="outline" className="capitalize">
                      {produto.genero}
                    </Badge>
                  </div>
                )}

                {produto.tipoTecido && (
                  <div>
                    <p className="text-sm text-gray-500">Tecido</p>
                    <p className="font-medium">{produto.tipoTecido}</p>
                  </div>
                )}
              </div>

              {produto.tamanhos && produto.tamanhos.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Tamanhos Disponíveis</p>
                  <div className="flex flex-wrap gap-1">
                    {produto.tamanhos.map(tamanho => (
                      <Badge key={tamanho} variant="secondary" className="text-xs">
                        {tamanho}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {produto.cores && produto.cores.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Cores Disponíveis</p>
                  <div className="flex flex-wrap gap-1">
                    {produto.cores.map(cor => (
                      <Badge key={cor} variant="secondary" className="text-xs">
                        {cor}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Informações de Sistema */}
          {(produto.dataCriacao || produto.dataAtualizacao) && (
            <div className="bg-white rounded-lg border p-4">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Informações de Sistema
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {produto.dataCriacao && (
                  <div>
                    <p className="text-sm text-gray-500">Data de Criação</p>
                    <p className="font-medium">
                      {new Date(produto.dataCriacao).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}
                
                {produto.dataAtualizacao && (
                  <div>
                    <p className="text-sm text-gray-500">Última Atualização</p>
                    <p className="font-medium">
                      {new Date(produto.dataAtualizacao).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisualizacaoProduto;