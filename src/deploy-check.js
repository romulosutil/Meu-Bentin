#!/usr/bin/env node

/**
 * Script de verificação pré-deploy para Meu Bentin
 * Verifica se todos os arquivos necessários estão presentes e corretos
 */

import fs from 'fs';
import path from 'path';

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

console.log(`${BLUE}🔍 Verificando configuração para deploy...${RESET}\n`);

const checks = [
  {
    name: 'Package.json existe',
    check: () => fs.existsSync('./package.json'),
    fix: 'Arquivo package.json não encontrado!'
  },
  {
    name: 'MeuBentinLogo.tsx existe',
    check: () => fs.existsSync('./components/MeuBentinLogo.tsx'),
    fix: 'Componente MeuBentinLogo.tsx não encontrado!'
  },
  {
    name: 'App.tsx existe e está válido',
    check: () => {
      if (!fs.existsSync('./App.tsx')) return false;
      const content = fs.readFileSync('./App.tsx', 'utf8');
      return content.includes("export default function App");
    },
    fix: 'App.tsx não encontrado ou inválido!'
  },
  {
    name: 'Vercel.json configurado',
    check: () => fs.existsSync('./vercel.json'),
    fix: 'Arquivo vercel.json não encontrado!'
  },
  {
    name: 'Globals.css existe',
    check: () => fs.existsSync('./styles/globals.css'),
    fix: 'Arquivo globals.css não encontrado!'
  },
  {
    name: 'Tailwind config existe',
    check: () => fs.existsSync('./tailwind.config.js'),
    fix: 'Arquivo tailwind.config.js não encontrado!'
  },
  {
    name: '.npmrc configurado',
    check: () => fs.existsSync('./.npmrc'),
    fix: 'Arquivo .npmrc não encontrado!'
  },
  {
    name: 'Vite config existe',
    check: () => fs.existsSync('./vite.config.ts'),
    fix: 'Arquivo vite.config.ts não encontrado!'
  }
];

let allPassed = true;

checks.forEach(({ name, check, fix }) => {
  const passed = check();
  if (passed) {
    console.log(`${GREEN}✅ ${name}${RESET}`);
  } else {
    console.log(`${RED}❌ ${name}${RESET}`);
    console.log(`${YELLOW}   Fix: ${fix}${RESET}`);
    allPassed = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log(`${GREEN}🎉 TUDO PRONTO PARA DEPLOY!${RESET}`);
  console.log(`${BLUE}📦 Próximos passos:${RESET}`);
  console.log('1. git add .');
  console.log('2. git commit -m "🚀 Deploy ready"');
  console.log('3. git push origin main');
  console.log('4. Deploy na Vercel');
} else {
  console.log(`${RED}⚠️  CORRIJA OS PROBLEMAS ANTES DO DEPLOY${RESET}`);
  process.exit(1);
}

// Verificar package.json para dependências problemáticas
if (fs.existsSync('./package.json')) {
  try {
    const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    
    const problematicDeps = Object.keys(deps).filter(dep => 
      dep.includes('jsr:') || 
      dep.includes('@supabase/') || 
      deps[dep].includes('jsr:') ||
      dep.startsWith('jsr:')
    );
    
    if (problematicDeps.length > 0) {
      console.log(`${YELLOW}⚠️  Dependências problemáticas encontradas:${RESET}`);
      problematicDeps.forEach(dep => {
        console.log(`${RED}   - ${dep}: ${deps[dep]}${RESET}`);
      });
      allPassed = false;
    } else {
      console.log(`${GREEN}✅ Package.json sem dependências problemáticas${RESET}`);
    }
  } catch (error) {
    console.log(`${RED}❌ Erro ao ler package.json: ${error.message}${RESET}`);
    allPassed = false;
  }
}

// Verificar se não há importações problemáticas nos arquivos frontend
const problematicImports = [];
const filesToCheck = ['./App.tsx', './components/MeuBentinLogo.tsx'];

filesToCheck.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('figma:asset') || content.includes('jsr:') || content.includes('npm:')) {
      problematicImports.push(file);
    }
  }
});

if (problematicImports.length > 0) {
  console.log(`${RED}❌ Importações problemáticas encontradas em:${RESET}`);
  problematicImports.forEach(file => {
    console.log(`${RED}   - ${file}${RESET}`);
  });
  allPassed = false;
} else {
  console.log(`${GREEN}✅ Nenhuma importação problemática encontrada${RESET}`);
}

// Verificar se .vercelignore existe
const vercelIgnoreCheck = {
  name: '.vercelignore existe',
  check: () => fs.existsSync('./.vercelignore'),
  fix: 'Arquivo .vercelignore não encontrado! Necessário para ignorar pasta supabase.'
};

const passed = vercelIgnoreCheck.check();
if (passed) {
  console.log(`${GREEN}✅ ${vercelIgnoreCheck.name}${RESET}`);
} else {
  console.log(`${RED}❌ ${vercelIgnoreCheck.name}${RESET}`);
  console.log(`${YELLOW}   Fix: ${vercelIgnoreCheck.fix}${RESET}`);
  allPassed = false;
}

console.log(`\n${BLUE}💡 Dica: Execute 'npm run build' para testar localmente antes do deploy${RESET}`);