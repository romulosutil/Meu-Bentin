#!/usr/bin/env node

/**
 * VERIFICAÇÃO E CORREÇÃO VERCEL CONFIG - Meu Bentin
 * Garante que a configuração da Vercel está 100% correta
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';

console.log('🔧 VERIFICAÇÃO VERCEL CONFIG - Meu Bentin\n');

try {
  // Verificar vercel.json
  if (!existsSync('vercel.json')) {
    throw new Error('❌ vercel.json não encontrado!');
  }

  let vercelConfig = JSON.parse(readFileSync('vercel.json', 'utf8'));
  let needsUpdate = false;

  console.log('📋 Configuração atual:');
  console.log(`   Framework: ${vercelConfig.framework}`);
  console.log(`   Build Command: ${vercelConfig.buildCommand}`);
  console.log(`   Output Directory: ${vercelConfig.outputDirectory}`);

  // Verificar e corrigir framework
  if (vercelConfig.framework !== 'vite') {
    console.log('⚠️  Corrigindo framework para "vite"...');
    vercelConfig.framework = 'vite';
    needsUpdate = true;
  }

  // Verificar e corrigir buildCommand
  if (vercelConfig.buildCommand !== 'vite build') {
    console.log('⚠️  Corrigindo buildCommand para "vite build"...');
    vercelConfig.buildCommand = 'vite build';
    needsUpdate = true;
  }

  // Verificar e corrigir outputDirectory
  if (vercelConfig.outputDirectory !== 'dist') {
    console.log('⚠️  Corrigindo outputDirectory para "dist"...');
    vercelConfig.outputDirectory = 'dist';
    needsUpdate = true;
  }

  // Adicionar configurações essenciais se não existirem
  if (!vercelConfig.cleanUrls) {
    vercelConfig.cleanUrls = true;
    needsUpdate = true;
  }

  if (!vercelConfig.trailingSlash) {
    vercelConfig.trailingSlash = false;
    needsUpdate = true;
  }

  // Verificar rewrites (essencial para SPA)
  if (!vercelConfig.rewrites || !Array.isArray(vercelConfig.rewrites) || vercelConfig.rewrites.length === 0) {
    console.log('⚠️  Adicionando rewrites para SPA...');
    vercelConfig.rewrites = [
      {
        "source": "/((?!api).*)",
        "destination": "/index.html"
      }
    ];
    needsUpdate = true;
  }

  // Atualizar arquivo se necessário
  if (needsUpdate) {
    writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));
    console.log('✅ vercel.json atualizado com sucesso!');
  } else {
    console.log('✅ vercel.json já está correto!');
  }

  // Verificar vite.config.ts
  console.log('\n🔍 Verificando vite.config.ts...');
  
  if (!existsSync('vite.config.ts')) {
    throw new Error('❌ vite.config.ts não encontrado!');
  }

  const viteConfig = readFileSync('vite.config.ts', 'utf8');
  
  if (!viteConfig.includes("outDir: 'dist'")) {
    throw new Error('❌ vite.config.ts não tem outDir configurado como "dist"');
  }

  console.log('✅ vite.config.ts está correto!');

  // Verificar package.json
  console.log('\n🔍 Verificando package.json...');
  
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
  
  if (!packageJson.scripts.build) {
    throw new Error('❌ Script build não encontrado no package.json');
  }

  if (!packageJson.scripts['vercel-build']) {
    throw new Error('❌ Script vercel-build não encontrado no package.json');
  }

  console.log('✅ package.json está correto!');

  // Resultado final
  console.log('\n' + '='.repeat(50));
  console.log('🎉 CONFIGURAÇÃO VERCEL VERIFICADA E CORRIGIDA!');
  console.log('='.repeat(50));
  console.log('✅ Framework: vite');
  console.log('✅ Build Command: vite build');
  console.log('✅ Output Directory: dist');
  console.log('✅ SPA Rewrites: configurado');
  console.log('✅ Clean URLs: habilitado');
  
  console.log('\n🚀 DEPLOY NA VERCEL PRONTO PARA SER EXECUTADO!');
  
  console.log('\n📋 Comandos de teste recomendados:');
  console.log('   1. npm run test:dist     # Testa build local');
  console.log('   2. git add .');
  console.log('   3. git commit -m "fix: Config Vercel corrigida"');
  console.log('   4. git push             # Deploy automático');

} catch (error) {
  console.error('\n❌ ERRO:', error.message);
  process.exit(1);
}