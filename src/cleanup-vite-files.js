#!/usr/bin/env node

/**
 * LIMPEZA COMPLETA DOS ARQUIVOS DO VITE
 * Remove todos os arquivos conflitantes do Vite para Next.js
 */

import { existsSync, rmSync } from 'fs';

console.log('🧹 LIMPEZA COMPLETA - REMOVENDO ARQUIVOS DO VITE\n');

const filesToRemove = [
  // Arquivos de configuração do Vite
  'vite.config.ts',
  'vite.config.js', 
  'vite.config.prod.ts',
  'vite.config.unified.ts',
  'index.html',
  'src/main.tsx',
  'tsconfig.node.json',
  
  // Scripts de build do Vite
  'build-config.js',
  'build-env.sh',
  'build-verify.js',
  'cleanup-configs.js',
  'deploy-check.js',
  'dist-test-final.js',
  'final-build-test.js',
  'final-cleanup.js',
  'fix-build-output.js',
  'test-outdir.js',
  'vercel-build.sh',
  'vercel-config-fix.js',
  'vercel-deploy-final.sh',
  'migrate-to-nextjs.js',
  
  // Documentação obsoleta
  'BUILD_OUTPUT_SOLUTION.md',
  'DEPLOY_GUIDE.md',
  'DEPLOY_TROUBLESHOOTING.md',
  'DIST_PROBLEM_FINAL_FIX.md',
  'VERCEL_BUILD_FINAL_SOLUTION.md',
  'VERCEL_BUILD_FIX.md',
  'VERCEL_BUILD_SOLUTION.md',
  'VERCEL_DEPLOY_FIX.md',
  'VERCEL_DEPLOY_SUCCESS.md',
  
  // Arquivos temporários
  'tailwind_backup.txt',
  'temp_backup.txt'
];

const dirsToRemove = [
  'src',
  'dist',
  'build',
  '.vite',
  'node_modules/.vite'
];

let removedCount = 0;

// Remover arquivos
filesToRemove.forEach(file => {
  if (existsSync(file)) {
    try {
      rmSync(file, { force: true });
      console.log(`   ✅ Removido: ${file}`);
      removedCount++;
    } catch (error) {
      console.log(`   ⚠️  Erro ao remover ${file}: ${error.message}`);
    }
  }
});

// Remover diretórios
dirsToRemove.forEach(dir => {
  if (existsSync(dir)) {
    try {
      rmSync(dir, { recursive: true, force: true });
      console.log(`   ✅ Removido diretório: ${dir}`);
      removedCount++;
    } catch (error) {
      console.log(`   ⚠️  Erro ao remover ${dir}: ${error.message}`);
    }
  }
});

console.log(`\n📊 Total removido: ${removedCount} arquivos/diretórios`);
console.log('\n🎉 LIMPEZA CONCLUÍDA! Projeto limpo para Next.js.');
console.log('\n🚀 PRÓXIMOS PASSOS:');
console.log('   1. rm -rf node_modules package-lock.json');
console.log('   2. npm install');
console.log('   3. npm run dev');