#!/usr/bin/env node

/**
 * Script de verificação do build - Meu Bentin
 * Verifica se o build foi gerado corretamente na pasta dist
 */

import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const BUILD_DIR = 'dist';
const REQUIRED_FILES = ['index.html'];
const REQUIRED_DIRS = ['assets'];

console.log('🔍 Verificando build do Meu Bentin...\n');

// Verificar se a pasta dist existe
if (!existsSync(BUILD_DIR)) {
  console.error(`❌ Erro: Pasta ${BUILD_DIR} não encontrada!`);
  process.exit(1);
}

console.log(`✅ Pasta ${BUILD_DIR} encontrada`);

// Verificar arquivos obrigatórios
let allFilesPresent = true;

REQUIRED_FILES.forEach(file => {
  const filePath = join(BUILD_DIR, file);
  if (existsSync(filePath)) {
    const stats = statSync(filePath);
    console.log(`✅ ${file} - ${(stats.size / 1024).toFixed(2)} KB`);
  } else {
    console.error(`❌ Arquivo obrigatório não encontrado: ${file}`);
    allFilesPresent = false;
  }
});

// Verificar diretórios obrigatórios
REQUIRED_DIRS.forEach(dir => {
  const dirPath = join(BUILD_DIR, dir);
  if (existsSync(dirPath)) {
    const files = readdirSync(dirPath);
    console.log(`✅ ${dir}/ - ${files.length} arquivos`);
    
    // Mostrar alguns arquivos de exemplo
    files.slice(0, 3).forEach(file => {
      const filePath = join(dirPath, file);
      const stats = statSync(filePath);
      console.log(`   📄 ${file} - ${(stats.size / 1024).toFixed(2)} KB`);
    });
    
    if (files.length > 3) {
      console.log(`   📄 ... e mais ${files.length - 3} arquivos`);
    }
  } else {
    console.error(`❌ Diretório obrigatório não encontrado: ${dir}`);
    allFilesPresent = false;
  }
});

// Verificar se existem pastas indesejadas
const unwantedDirs = ['build', 'out'];
unwantedDirs.forEach(dir => {
  if (existsSync(dir)) {
    console.warn(`⚠️  Pasta inesperada encontrada: ${dir} (pode causar conflitos)`);
  }
});

// Mostrar tamanho total do build
function getDirSize(dirPath) {
  let totalSize = 0;
  const files = readdirSync(dirPath);
  
  files.forEach(file => {
    const filePath = join(dirPath, file);
    const stats = statSync(filePath);
    
    if (stats.isDirectory()) {
      totalSize += getDirSize(filePath);
    } else {
      totalSize += stats.size;
    }
  });
  
  return totalSize;
}

const totalSize = getDirSize(BUILD_DIR);
console.log(`\n📦 Tamanho total do build: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

if (allFilesPresent) {
  console.log('\n✅ Build verificado com sucesso! Pronto para deploy na Vercel.');
  process.exit(0);
} else {
  console.log('\n❌ Problemas encontrados no build. Verifique os erros acima.');
  process.exit(1);
}