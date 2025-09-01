#!/usr/bin/env node

/**
 * LIMPEZA DEFINITIVA - Meu Bentin Sistema
 * Remove arquivos duplicados e desnecessários para otimizar o projeto
 */

import { existsSync, unlinkSync, readdirSync } from 'fs';
import { join } from 'path';

console.log('🧹 LIMPEZA DEFINITIVA - Meu Bentin Sistema\n');

// Arquivos de configuração duplicados para remover
const duplicateConfigs = [
  'vite.config.prod.ts',
  'vite.config.unified.ts',
  'vercel-build.sh',
  'vercel-deploy-final.sh',
  'build-env.sh',
  'tailwind_backup.txt',
  'temp_backup.txt',
  'build-config.js',
  'cleanup-configs.js',
  'deploy-check.js',
  'vite.config.js',
  'vite.config.mjs',
  '.viterc',
  'vite.config.local.ts'
];

// Documentações duplicadas/desnecessárias
const duplicateDocs = [
  'VERCEL_BUILD_FIX.md',
  'VERCEL_BUILD_SOLUTION.md',
  'VERCEL_DEPLOY_FIX.md',
  'DEPLOY_TROUBLESHOOTING.md'
];

// Scripts de build temporários
const tempScripts = [
  'deploy-check.js',
  'cleanup-configs.js',
  'build-config.js'
];

let removedCount = 0;

// Função para remover arquivos
function removeFile(file, category) {
  if (existsSync(file)) {
    try {
      unlinkSync(file);
      console.log(`✅ [${category}] Removido: ${file}`);
      removedCount++;
    } catch (error) {
      console.log(`⚠️  Erro ao remover ${file}: ${error.message}`);
    }
  }
}

// Remover configurações duplicadas
console.log('📋 Removendo configurações duplicadas...');
duplicateConfigs.forEach(file => removeFile(file, 'CONFIG'));

// Remover documentações duplicadas
console.log('\n📚 Removendo documentações duplicadas...');
duplicateDocs.forEach(file => removeFile(file, 'DOCS'));

// Remover scripts temporários
console.log('\n🔧 Removendo scripts temporários...');
tempScripts.forEach(file => removeFile(file, 'SCRIPTS'));

// Verificar se há pastas dist, build ou out que podem causar conflito
console.log('\n🔍 Verificando pastas de build...');
['dist', 'build', 'out', '.vercel', '.vite'].forEach(dir => {
  if (existsSync(dir)) {
    console.log(`⚠️  Pasta de build encontrada: ${dir} (será limpa no próximo build)`);
  }
});

// Verificar configurações finais
console.log('\n✅ Verificação final das configurações...');

// Verificar vite.config.ts
if (existsSync('vite.config.ts')) {
  console.log('✅ Configuração Vite principal: OK');
} else {
  console.log('❌ ERRO: vite.config.ts não encontrado!');
}

// Verificar vercel.json
if (existsSync('vercel.json')) {
  console.log('✅ Configuração Vercel: OK');
} else {
  console.log('❌ ERRO: vercel.json não encontrado!');
}

// Verificar package.json
if (existsSync('package.json')) {
  console.log('✅ Package.json: OK');
} else {
  console.log('❌ ERRO: package.json não encontrado!');
}

console.log(`\n🎉 LIMPEZA CONCLUÍDA!`);
console.log(`📊 Total de arquivos removidos: ${removedCount}`);
console.log(`\n✅ Configuração otimizada e pronta para build!`);
console.log(`🚀 Execute: npm run build:test para verificar`);