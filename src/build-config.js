#!/usr/bin/env node

/**
 * Configuração de build - Meu Bentin
 * Garante que o build seja gerado no diretório correto
 */

import { existsSync, mkdirSync, rmSync } from 'fs';
import { resolve } from 'path';

const BUILD_DIR = 'dist';
const BUILD_PATH = resolve(process.cwd(), BUILD_DIR);

console.log('🔧 Configurando ambiente de build...\n');

// Limpar diretório de build se existir
if (existsSync(BUILD_PATH)) {
  console.log(`🧹 Limpando diretório ${BUILD_DIR}...`);
  rmSync(BUILD_PATH, { recursive: true, force: true });
}

// Garantir que o diretório pai existe
const parentDir = resolve(process.cwd());
if (!existsSync(parentDir)) {
  mkdirSync(parentDir, { recursive: true });
}

console.log(`✅ Configuração concluída`);
console.log(`📁 Build será gerado em: ${BUILD_PATH}`);
console.log(`📁 Diretório relativo: ${BUILD_DIR}\n`);