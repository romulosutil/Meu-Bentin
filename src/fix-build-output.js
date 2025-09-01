#!/usr/bin/env node

/**
 * CORREÇÃO FINAL BUILD OUTPUT - Baseado no Exemplo Fornecido
 * Implementa a solução --output similar ao exemplo do usuário
 */

import { readFileSync, writeFileSync, existsSync, rmSync } from 'fs';

console.log('🔧 CORREÇÃO FINAL BUILD OUTPUT - Meu Bentin\n');
console.log('📋 Baseado no exemplo: "build": "[my-framework] build --output public"\n');

try {
  // Remover arquivos conflitantes
  console.log('🧹 Removendo arquivos de configuração conflitantes...');
  const filesToRemove = [
    'vite.config.prod.ts',
    'vite.config.unified.ts',
    'vite.config.js',
    'vite.config.local.ts',
    'build-config.js',
    'vercel-build.sh',
    'vercel-deploy-final.sh'
  ];
  
  filesToRemove.forEach(file => {
    if (existsSync(file)) {
      rmSync(file, { force: true });
      console.log(`   ✅ Removido: ${file}`);
    }
  });

  // Limpar diretórios
  console.log('\n🧹 Limpando diretórios de build...');
  const dirsToClean = ['dist', 'build', 'out', '.vercel', '.vite'];
  dirsToClean.forEach(dir => {
    if (existsSync(dir)) {
      rmSync(dir, { recursive: true, force: true });
      console.log(`   ✅ Removido: ${dir}`);
    }
  });

  // Ler e corrigir package.json
  console.log('\n📝 Corrigindo scripts no package.json...');
  const packageJsonPath = 'package.json';
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

  // Scripts corrigidos seguindo o padrão do exemplo
  const newScripts = {
    ...packageJson.scripts,
    "build": "vite build --outDir dist",
    "vercel-build": "rm -rf dist build && vite build --outDir dist",
    "build:prod": "vite build --outDir dist --mode production",
    "test:build": "node test-outdir.js"
  };

  packageJson.scripts = newScripts;
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('   ✅ Scripts atualizados no package.json');

  // Verificar e corrigir vercel.json
  console.log('\n📝 Verificando vercel.json...');
  const vercelJsonPath = 'vercel.json';
  if (existsSync(vercelJsonPath)) {
    const vercelConfig = JSON.parse(readFileSync(vercelJsonPath, 'utf8'));
    
    let needsUpdate = false;
    
    if (vercelConfig.outputDirectory !== 'dist') {
      vercelConfig.outputDirectory = 'dist';
      needsUpdate = true;
    }
    
    if (vercelConfig.buildCommand !== 'vite build --outDir dist') {
      vercelConfig.buildCommand = 'vite build --outDir dist';
      needsUpdate = true;
    }
    
    if (needsUpdate) {
      writeFileSync(vercelJsonPath, JSON.stringify(vercelConfig, null, 2));
      console.log('   ✅ vercel.json atualizado');
    } else {
      console.log('   ✅ vercel.json já está correto');
    }
  }

  // Criar vite.config.ts minimalista
  console.log('\n📝 Criando vite.config.ts ultra-simples...');
  const minimalViteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// CONFIGURAÇÃO MINIMALISTA - Força --outDir funcionar
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
})`;

  writeFileSync('vite.config.ts', minimalViteConfig);
  console.log('   ✅ vite.config.ts simplificado criado');

  // Mostrar resultado
  console.log('\n' + '='.repeat(50));
  console.log('🎉 CORREÇÃO CONCLUÍDA COM SUCESSO!');
  console.log('='.repeat(50));
  
  console.log('\n📋 Scripts atualizados:');
  console.log('   build: "vite build --outDir dist"');
  console.log('   vercel-build: "rm -rf dist build && vite build --outDir dist"');
  console.log('   build:prod: "vite build --outDir dist --mode production"');
  
  console.log('\n🔧 Configurações:');
  console.log('   ✅ vite.config.ts: ultra-simplificado');
  console.log('   ✅ vercel.json: outputDirectory "dist"');
  console.log('   ✅ package.json: scripts com --outDir explicit');
  
  console.log('\n🚀 COMANDOS DE TESTE:');
  console.log('   1. npm run test:build    # Testa --outDir');
  console.log('   2. npm run build         # Build local');
  console.log('   3. git add . && git commit -m "fix: Force --outDir dist"');
  console.log('   4. git push              # Deploy automático');
  
  console.log('\n💡 SOLUÇÃO IMPLEMENTADA:');
  console.log('   Similar ao exemplo: [my-framework] build --output public');
  console.log('   Nossa versão: vite build --outDir dist');
  console.log('   Força explicitamente o diretório de saída');

} catch (error) {
  console.error('\n❌ ERRO na correção:', error.message);
  process.exit(1);
}