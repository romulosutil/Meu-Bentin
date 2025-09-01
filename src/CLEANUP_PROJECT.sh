#!/bin/bash

echo "🧹 LIMPEZA RADICAL DO PROJETO MEU BENTIN"
echo "======================================"

# REMOVER TODA A DOCUMENTAÇÃO OBSOLETA
echo "📋 Removendo documentação obsoleta..."
rm -f *.md
echo "✅ Documentação obsoleta removida"

# REMOVER TODOS OS SCRIPTS OBSOLETOS
echo "🔧 Removendo scripts de build obsoletos..."
rm -f *.js *.sh
echo "✅ Scripts obsoletos removidos"

# REMOVER ARQUIVOS VITE COMPLETAMENTE
echo "🗑️ Removendo arquivos Vite..."
rm -f vite.config.* tsconfig.node.json index.html
rm -rf src/
echo "✅ Arquivos Vite removidos"

# REMOVER ARQUIVOS DE BACKUP E TEMPORÁRIOS
echo "🧽 Removendo backups e temporários..."
rm -f *.backup *.new *.txt package.json.backup package.json.new
rm -f vercel.minimal.json CLEAN_NEXTJS.sh REMOVE_VITE_FILES.md SOLUCAO_DEFINITIVA.md
echo "✅ Arquivos temporários removidos"

# REMOVER DIRETÓRIO GUIDELINES VAZIO
echo "📁 Limpando diretórios vazios..."
rm -rf guidelines/
echo "✅ Diretórios vazios removidos"

# LIMPAR CACHE
echo "🧹 Limpando cache..."
rm -rf node_modules package-lock.json .next out dist build .vite .npm .cache
npm cache clean --force
echo "✅ Cache limpo"

echo ""
echo "🎉 LIMPEZA CONCLUÍDA!"
echo "==================="
echo "✅ Projeto otimizado e limpo"
echo "✅ Apenas arquivos essenciais mantidos"
echo "✅ Frontend estável preservado"