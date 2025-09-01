#!/usr/bin/env node

/**
 * Script para limpar arquivos de configuração duplicados
 */

import { existsSync, unlinkSync } from 'fs';

const filesToRemove = [
  'vite.config.prod.ts',
  'vite.config.unified.ts',
  'vercel-build.sh',
  'vercel-deploy-final.sh',
  'build-env.sh',
  'tailwind_backup.txt',
  'temp_backup.txt'
];

console.log('🧹 Limpando arquivos de configuração duplicados...\n');

filesToRemove.forEach(file => {
  if (existsSync(file)) {
    try {
      unlinkSync(file);
      console.log(`✅ Removido: ${file}`);
    } catch (error) {
      console.log(`⚠️  Erro ao remover ${file}: ${error.message}`);
    }
  } else {
    console.log(`ℹ️  Arquivo não encontrado: ${file}`);
  }
});

console.log('\n✅ Limpeza concluída!');