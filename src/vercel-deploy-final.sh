#!/bin/bash

# Script de deploy definitivo para Vercel - Meu Bentin
# Este script garante que o build seja feito corretamente

set -e  # Para na primeira falha

echo "🚀 Iniciando deploy definitivo do Meu Bentin na Vercel..."
echo ""

# Limpar completamente qualquer resíduo
echo "🧹 Limpando arquivos anteriores..."
rm -rf dist build out .vercel .vite node_modules/.vite 2>/dev/null || true

# Verificar se o arquivo de configuração existe
if [ ! -f "vite.config.unified.ts" ]; then
    echo "❌ Arquivo vite.config.unified.ts não encontrado!"
    exit 1
fi

echo "✅ Arquivos limpos"
echo ""

# Build com configuração unificada
echo "📦 Executando build com configuração unificada..."
npx vite build --config vite.config.unified.ts --mode production

# Verificar se a pasta dist foi criada
if [ ! -d "dist" ]; then
    echo "❌ Pasta dist não foi criada!"
    exit 1
fi

echo "✅ Pasta dist criada"

# Verificar arquivos essenciais
if [ ! -f "dist/index.html" ]; then
    echo "❌ Arquivo index.html não encontrado em dist!"
    exit 1
fi

if [ ! -d "dist/assets" ]; then
    echo "❌ Pasta assets não encontrada em dist!"
    exit 1
fi

echo "✅ Arquivos essenciais verificados"

# Mostrar estrutura do build
echo ""
echo "📁 Estrutura do build gerado:"
ls -la dist/
echo ""
echo "📁 Conteúdo da pasta assets:"
ls -la dist/assets/ | head -10

# Verificar tamanho
echo ""
echo "📊 Tamanho do build:"
du -sh dist/

echo ""
echo "✅ Build completado com sucesso!"
echo "📂 Output Directory: dist/"
echo "🚀 Pronto para deploy na Vercel!"