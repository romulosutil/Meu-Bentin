#!/bin/bash

# ==========================================
# SCRIPT DE BUILD PARA VERCEL - MEU BENTIN
# ==========================================

echo "🏪 Iniciando build do Meu Bentin para Vercel..."

# Limpar diretórios antigos
echo "🧹 Limpando diretórios de build antigos..."
rm -rf dist build out .vercel .vite

# Instalar dependências (já feito pela Vercel, mas garantindo)
echo "📦 Verificando dependências..."

# Build com configuração específica
echo "🔨 Executando build do Vite..."
npx vite build --config vite.config.prod.ts --mode production

# Verificar se dist foi criado
if [ ! -d "dist" ]; then
    echo "❌ ERRO: Diretório dist não foi criado!"
    
    # Verificar se foi criado em outro local
    if [ -d "build" ]; then
        echo "📁 Movendo build/ para dist/..."
        mv build dist
    else
        echo "❌ FALHA CRÍTICA: Nenhum diretório de build encontrado!"
        exit 1
    fi
fi

# Verificar arquivos essenciais
echo "🔍 Verificando arquivos essenciais..."
if [ ! -f "dist/index.html" ]; then
    echo "❌ ERRO: index.html não encontrado em dist/"
    exit 1
fi

if [ ! -d "dist/assets" ]; then
    echo "❌ ERRO: Pasta assets não encontrada em dist/"
    exit 1
fi

# Mostrar estatísticas do build
echo "📊 Estatísticas do build:"
echo "   📁 $(ls dist/ | wc -l) arquivos/pastas em dist/"
echo "   📄 index.html: $(du -h dist/index.html | cut -f1)"
echo "   📁 assets/: $(ls dist/assets/ | wc -l) arquivos"

# Tamanho total
TOTAL_SIZE=$(du -sh dist/ | cut -f1)
echo "   💾 Tamanho total: $TOTAL_SIZE"

echo "✅ Build concluído com sucesso!"
echo "🚀 Pronto para deploy na Vercel!"

exit 0