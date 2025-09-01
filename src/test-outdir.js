#!/usr/bin/env node

/**
 * TESTE ESPECÍFICO --outDir - Validação Comando Build
 * Testa se o parâmetro --outDir está forçando a saída correta
 */

import { execSync } from 'child_process';
import { existsSync, rmSync, readdirSync } from 'fs';

console.log('🎯 TESTE ESPECÍFICO --outDir PARAMETER\n');

function cleanAll() {
  const dirs = ['dist', 'build', 'out', '.vercel', '.vite'];
  dirs.forEach(dir => {
    if (existsSync(dir)) {
      rmSync(dir, { recursive: true, force: true });
      console.log(`✅ Removido: ${dir}`);
    }
  });
}

function testBuildCommand() {
  console.log('\n🏗️  Testando comando: vite build --outDir dist --mode production\n');
  
  try {
    const output = execSync('vite build --outDir dist --mode production', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    console.log('📋 Output do build:');
    console.log(output);
    console.log('\n' + '='.repeat(50));
    
    return output;
  } catch (error) {
    console.error('❌ Erro no build:', error.message);
    if (error.stdout) console.log('STDOUT:', error.stdout);
    if (error.stderr) console.log('STDERR:', error.stderr);
    throw error;
  }
}

function validateResult() {
  console.log('🔍 Validando resultado...\n');
  
  // Verificar se dist foi criado
  if (!existsSync('dist')) {
    throw new Error('❌ Pasta "dist" NÃO foi criada!');
  }
  console.log('✅ Pasta "dist" foi criada');
  
  // Verificar se build foi criada (não deveria)
  if (existsSync('build')) {
    console.log('⚠️  PROBLEMA: Pasta "build" também foi criada!');
    const buildContents = readdirSync('build');
    console.log('📁 Conteúdo da pasta build:', buildContents);
    return false;
  }
  console.log('✅ Pasta "build" NÃO foi criada (correto)');
  
  // Verificar conteúdo do dist
  const distContents = readdirSync('dist');
  console.log('📁 Conteúdo da pasta dist:', distContents);
  
  // Verificar arquivos essenciais
  if (!existsSync('dist/index.html')) {
    throw new Error('❌ index.html não encontrado em dist/');
  }
  console.log('✅ index.html encontrado em dist/');
  
  if (!existsSync('dist/assets')) {
    throw new Error('❌ Pasta assets não encontrada em dist/');
  }
  console.log('✅ Pasta assets encontrada em dist/');
  
  return true;
}

// Executar teste
try {
  console.log('🚀 INICIANDO TESTE DO PARÂMETRO --outDir\n');
  
  // Passo 1: Limpeza
  console.log('🧹 Limpando diretórios...');
  cleanAll();
  
  // Passo 2: Build com --outDir
  const buildOutput = testBuildCommand();
  
  // Passo 3: Validação
  const success = validateResult();
  
  if (success) {
    console.log('\n' + '='.repeat(50));
    console.log('🎉 TESTE DO --outDir BEM-SUCEDIDO!');
    console.log('='.repeat(50));
    console.log('✅ O parâmetro --outDir dist está funcionando');
    console.log('✅ Nenhuma pasta "build" foi criada');
    console.log('✅ Todos os arquivos estão em "dist"');
    
    // Verificar se build output menciona dist
    if (buildOutput.includes('dist/')) {
      console.log('✅ Output do build menciona "dist/"');
    } else {
      console.log('⚠️  Output do build não menciona "dist/" explicitamente');
    }
    
    console.log('\n🚀 COMANDO VERCEL-BUILD VALIDADO!');
    console.log('🔗 Executar: npm run vercel-build');
  }
  
} catch (error) {
  console.error('\n❌ TESTE FALHOU:', error.message);
  
  console.log('\n🔧 DIAGNÓSTICO:');
  console.log('   1. O parâmetro --outDir não está sendo respeitado');
  console.log('   2. Pode haver configuração conflitante');
  console.log('   3. Versão do Vite pode ter problema');
  
  console.log('\n🛠️  SOLUÇÕES:');
  console.log('   1. Verificar versão do Vite: npx vite --version');
  console.log('   2. Reinstalar Vite: npm install vite@latest');
  console.log('   3. Usar absolute path: vite build --outDir ./dist');
  
  process.exit(1);
}