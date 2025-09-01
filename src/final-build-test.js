#!/usr/bin/env node

/**
 * VERIFICAÇÃO COMPLETA - Build Configuration Meu Bentin
 * Testa todas as configurações de build e deploy
 */

import { existsSync, readFileSync } from 'fs';

console.log('🔥 VERIFICAÇÃO COMPLETA - Build Meu Bentin Sistema\n');

let errors = [];
let warnings = [];
let success = [];

// Teste 1: Verificar arquivos essenciais
console.log('1️⃣ Verificando arquivos essenciais...');
const essentialFiles = [
  'vite.config.ts',
  'vercel.json', 
  'package.json',
  'App.tsx',
  'index.html'
];

essentialFiles.forEach(file => {
  if (existsSync(file)) {
    success.push(`✅ ${file} encontrado`);
  } else {
    errors.push(`❌ ${file} não encontrado`);
  }
});

// Teste 2: Verificar configs duplicadas/conflitantes
console.log('\n2️⃣ Verificando configs duplicadas...');
const conflictingFiles = [
  'vite.config.prod.ts', 
  'vite.config.unified.ts',
  'vercel-build.sh',
  'vercel-deploy-final.sh',
  'build-env.sh'
];

let foundConflicts = false;
conflictingFiles.forEach(file => {
  if (existsSync(file)) {
    warnings.push(`⚠️  Arquivo conflitante: ${file}`);
    foundConflicts = true;
  }
});

if (!foundConflicts) {
  success.push('✅ Nenhum arquivo conflitante encontrado');
}

// Teste 3: Verificar configuração Vite
console.log('\n3️⃣ Verificando configuração Vite...');
if (existsSync('vite.config.ts')) {
  try {
    const viteConfig = readFileSync('vite.config.ts', 'utf8');
    if (viteConfig.includes("outDir: 'dist'")) {
      success.push('✅ Output directory configurado corretamente: dist');
    } else if (viteConfig.includes('path.resolve(__dirname, \'dist\')')) {
      warnings.push('⚠️  Output usando path.resolve - pode causar problemas');
    } else {
      errors.push('❌ Output directory não encontrado na config');
    }
  } catch (err) {
    errors.push('❌ Erro ao ler vite.config.ts');
  }
}

// Teste 4: Verificar configuração Vercel
console.log('\n4️⃣ Verificando configuração Vercel...');
if (existsSync('vercel.json')) {
  try {
    const vercelConfig = JSON.parse(readFileSync('vercel.json', 'utf8'));
    
    if (vercelConfig.outputDirectory === 'dist') {
      success.push('✅ Vercel outputDirectory: dist');
    } else {
      warnings.push(`⚠️  Vercel outputDirectory: ${vercelConfig.outputDirectory}`);
    }
    
    if (vercelConfig.buildCommand && vercelConfig.buildCommand.includes('vite build')) {
      success.push('✅ Vercel buildCommand contém vite build');
    } else {
      warnings.push('⚠️  Vercel buildCommand pode estar incorreto');
    }
    
    if (vercelConfig.framework === 'vite') {
      success.push('✅ Framework Vercel: vite');
    } else {
      warnings.push(`⚠️  Framework Vercel: ${vercelConfig.framework || 'não definido'}`);
    }
    
  } catch (err) {
    errors.push('❌ Erro ao ler vercel.json - JSON inválido');
  }
}

// Teste 5: Verificar scripts package.json
console.log('\n5️⃣ Verificando scripts package.json...');
if (existsSync('package.json')) {
  try {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    
    if (packageJson.scripts?.build) {
      success.push(`✅ Script build: ${packageJson.scripts.build}`);
    } else {
      errors.push('❌ Script build não encontrado');
    }
    
    if (packageJson.scripts?.['vercel-build']) {
      success.push('✅ Script vercel-build configurado');
    } else {
      warnings.push('⚠️  Script vercel-build não encontrado');
    }
    
    if (packageJson.scripts?.['build:verify']) {
      success.push('✅ Script build:verify configurado');
    }
    
  } catch (err) {
    errors.push('❌ Erro ao ler package.json');
  }
}

// Teste 6: Verificar pastas que podem causar conflito
console.log('\n6️⃣ Verificando pastas de conflito...');
['dist', 'build', 'out'].forEach(dir => {
  if (existsSync(dir)) {
    warnings.push(`⚠️  Pasta ${dir} existe (será limpa no build)`);
  }
});

// Resultado final
console.log('\n' + '='.repeat(50));
console.log('📊 RESULTADO DA VERIFICAÇÃO');
console.log('='.repeat(50));

if (success.length > 0) {
  console.log('\n✅ SUCESSOS:');
  success.forEach(msg => console.log(`   ${msg}`));
}

if (warnings.length > 0) {
  console.log('\n⚠️  AVISOS:');
  warnings.forEach(msg => console.log(`   ${msg}`));
}

if (errors.length > 0) {
  console.log('\n❌ ERROS:');
  errors.forEach(msg => console.log(`   ${msg}`));
}

// Status final
console.log('\n' + '='.repeat(50));
if (errors.length === 0) {
  console.log('🎉 SISTEMA PRONTO PARA DEPLOY!');
  console.log('🚀 Configuração validada com sucesso');
  
  if (warnings.length > 0) {
    console.log('\nℹ️  Execute "node final-cleanup.js" para resolver avisos');
  }
  
  console.log('\n📋 Próximos passos:');
  console.log('   1. npm run build (teste local)');
  console.log('   2. git add . && git commit -m "Fix: Otimização final"');
  console.log('   3. git push (deploy automático Vercel)');
  
  process.exit(0);
} else {
  console.log('❌ CORRIJA OS ERROS ANTES DO DEPLOY');
  console.log('\nℹ️  Execute "node final-cleanup.js" para limpar conflitos');
  process.exit(1);
}