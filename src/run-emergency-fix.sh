#!/bin/bash

echo "🚨 CORREÇÃO DE EMERGÊNCIA - NEXT.JS"
echo "=================================="

# Executar correção automática
if [ -f "emergency-fix.js" ]; then
    echo "📋 Executando correção automática..."
    node emergency-fix.js
else
    echo "❌ Arquivo emergency-fix.js não encontrado!"
    echo "💡 Execute manualmente:"
    echo "   1. rm -rf node_modules package-lock.json .next"
    echo "   2. mv package.json.new package.json"
    echo "   3. mv vercel.minimal.json vercel.json"
    echo "   4. npm cache clean --force"
    echo "   5. npm install --legacy-peer-deps"
    exit 1
fi

echo ""
echo "🎉 CORREÇÃO CONCLUÍDA!"
echo "🚀 Execute: git add . && git commit -m 'fix: emergency Next.js' && git push"