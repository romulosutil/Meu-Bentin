#!/usr/bin/env node

/**
 * TESTE DEFINITIVO DIST - Meu Bentin Sistema
 * Força teste do output directory correto
 */

import { execSync } from 'child_process';
import { existsSync, rmSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

console.log('🎯 TESTE DEFINITIVO DIST - Meu Bentin Sistema\n');

// Função para limpar todas as pastas de build
function cleanBuildDirs() {
  const dirsToClean = ['dist', 'build', 'out', '.vercel', '.vite', 'node_modules/.vite'];
  
  console.log('🧹 Limpando todas as pastas de build...');
  dirsToClean.forEach(dir => {
    if (existsSync(dir)) {
      try {
        rmSync(dir, { recursive: true, force: true });
        console.log(`✅ Removido: ${dir}`);
      } catch (error) {
        console.log(`⚠️  Erro ao remover ${dir}: ${error.message}`);
      }
    }
  });
}

// Função para verificar configuração Vite
function checkViteConfig() {
  console.log('\n🔍 Verificando configuração Vite...');
  
  if (!existsSync('vite.config.ts')) {
    throw new Error('❌ vite.config.ts não encontrado!');
  }
  
  const viteConfig = require('fs').readFileSync('vite.config.ts', 'utf8');
  
  // Verificar se outDir está correto
  if (viteConfig.includes("outDir: 'dist'")) {
    console.log('✅ outDir configurado corretamente: dist');
  } else {
    throw new Error('❌ outDir não está configurado como "dist"');
  }
  
  // Verificar se não há referências a 'build'
  if (viteConfig.includes("outDir: 'build'") || viteConfig.includes('dir: \'build\'')) {
    throw new Error('❌ Configuração contém referência à pasta "build"');
  }
  
  console.log('✅ Configuração Vite está correta');
}

// Função para executar build
function runBuild() {
  console.log('\n🏗️  Executando build de teste...');
  
  try {
    // Executar build com output verboso
    const buildOutput = execSync('npx vite build --mode production', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    console.log('📋 Output do build:');
    console.log(buildOutput);
    
    return buildOutput;
  } catch (error) {
    console.error('❌ Erro no build:', error.message);
    if (error.stdout) console.log('STDOUT:', error.stdout);
    if (error.stderr) console.log('STDERR:', error.stderr);
    throw error;
  }
}

// Função para verificar resultado
function verifyBuildResult() {
  console.log('\n🔍 Verificando resultado do build...');
  
  // Verificar se dist existe
  if (!existsSync('dist')) {
    throw new Error('❌ Pasta "dist" não foi criada!');
  }
  
  console.log('✅ Pasta "dist" foi criada');
  
  // Verificar se build foi criada (não deveria existir)
  if (existsSync('build')) {
    console.log('⚠️  ATENÇÃO: Pasta "build" foi criada (incorreto)');
    
    // Mostrar conteúdo da pasta build
    const buildContents = readdirSync('build');
    console.log('📁 Conteúdo da pasta build:', buildContents);
  }
  
  // Verificar conteúdo da pasta dist
  const distContents = readdirSync('dist');
  console.log('📁 Conteúdo da pasta dist:', distContents);
  
  // Verificar se index.html existe em dist
  if (!existsSync('dist/index.html')) {
    throw new Error('❌ index.html não encontrado em dist/');
  }
  
  console.log('✅ index.html encontrado em dist/');
  
  // Verificar se assets existem
  if (!existsSync('dist/assets')) {
    throw new Error('❌ Pasta assets não encontrada em dist/');
  }
  
  const assetsContents = readdirSync('dist/assets');
  console.log('📁 Assets encontrados:', assetsContents.length, 'arquivos');
  
  // Verificar tamanho total
  const distSize = getDirSize('dist');
  console.log(`📊 Tamanho total da pasta dist: ${(distSize / 1024 / 1024).toFixed(2)}MB`);
  
  return true;
}

// Função para calcular tamanho do diretório
function getDirSize(dirPath) {
  let totalSize = 0;
  
  function calculateSize(itemPath) {
    const stats = statSync(itemPath);
    
    if (stats.isDirectory()) {
      const items = readdirSync(itemPath);
      items.forEach(item => {
        calculateSize(join(itemPath, item));
      });
    } else {
      totalSize += stats.size;
    }
  }
  
  calculateSize(dirPath);
  return totalSize;
}

// Executar teste completo
async function runCompleteTest() {
  try {
    console.log('🚀 INICIANDO TESTE DEFINITIVO DO DIST\n');
    
    // Passo 1: Limpeza
    cleanBuildDirs();
    
    // Passo 2: Verificar configuração
    checkViteConfig();
    
    // Passo 3: Build
    const buildOutput = runBuild();
    
    // Passo 4: Verificar resultado
    verifyBuildResult();
    
    // Resultado final
    console.log('\n' + '='.repeat(50));
    console.log('🎉 TESTE DEFINITIVO CONCLUÍDO COM SUCESSO!');
    console.log('='.repeat(50));
    console.log('✅ Pasta "dist" foi criada corretamente');
    console.log('✅ Todos os assets estão na pasta dist');
    console.log('✅ Configuração está funcionando perfeitamente');
    
    // Verificar se há menção a "build" no output
    if (buildOutput.includes('build/')) {
      console.log('\n⚠️  ATENÇÃO: Output do build menciona pasta "build"');
      console.log('Isso pode indicar um problema na configuração.');
    } else {
      console.log('\n✅ Output do build não menciona pasta "build"');
    }
    
    console.log('\n🚀 SISTEMA PRONTO PARA DEPLOY NA VERCEL!');
    
  } catch (error) {
    console.error('\n❌ TESTE FALHOU:', error.message);
    console.log('\n🔧 POSSÍVEIS CAUSAS:');
    console.log('   1. Configuração Vite incorreta');
    console.log('   2. Cache do Vite corrompido');
    console.log('   3. Dependências conflitantes');
    console.log('   4. Arquivos de configuração duplicados');
    
    console.log('\n🛠️  SOLUÇÕES SUGERIDAS:');
    console.log('   1. npm run clean && npm install');
    console.log('   2. Remover node_modules e reinstalar');
    console.log('   3. Verificar se não há vite.config.js escondido');
    
    process.exit(1);
  }
}

// Executar
runCompleteTest();