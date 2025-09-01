#!/bin/bash

# Script para garantir variáveis de ambiente corretas no build

export NODE_ENV=production
export VITE_BUILD_TARGET=vercel
export BUILD_OUTPUT_DIR=dist

echo "🔧 Configurando ambiente de build..."
echo "NODE_ENV: $NODE_ENV"
echo "BUILD_OUTPUT_DIR: $BUILD_OUTPUT_DIR"
echo "VITE_BUILD_TARGET: $VITE_BUILD_TARGET"

# Limpar cache e arquivos antigos
rm -rf dist build out .vite node_modules/.vite 2>/dev/null || true

echo "✅ Ambiente configurado"