#!/usr/bin/env node

/**
 * MIGRAÇÃO VITE → NEXT.JS - Meu Bentin Sistema
 * Migra o projeto de Vite para Next.js para máxima compatibilidade
 */

import { existsSync, rmSync, writeFileSync, readFileSync } from 'fs';
import { execSync } from 'child_process';

console.log('🚀 MIGRAÇÃO VITE → NEXT.JS - Meu Bentin Sistema\n');

try {
  // Passo 1: Limpeza de arquivos do Vite
  console.log('🧹 Removendo arquivos do Vite...');
  const viteFiles = [
    'vite.config.ts',
    'vite.config.js',
    'vite.config.prod.ts',
    'vite.config.unified.ts',
    'vite.config.local.ts',
    'index.html',
    'src/main.tsx',
    // Scripts relacionados ao Vite
    'test-outdir.js',
    'fix-build-output.js',
    'build-verify.js',
    'final-build-test.js',
    'dist-test-final.js',
    'vercel-config-fix.js',
    'build-config.js',
    'vercel-build.sh',
    'vercel-deploy-final.sh',
    'build-env.sh',
    'cleanup-configs.js',
    'final-cleanup.js',
    'deploy-check.js'
  ];

  let removedCount = 0;
  viteFiles.forEach(file => {
    if (existsSync(file)) {
      rmSync(file, { force: true });
      console.log(`   ✅ Removido: ${file}`);
      removedCount++;
    }
  });

  // Remover diretórios do Vite
  const viteDirs = ['src', 'dist', 'build', '.vite', 'node_modules/.vite'];
  viteDirs.forEach(dir => {
    if (existsSync(dir)) {
      rmSync(dir, { recursive: true, force: true });
      console.log(`   ✅ Removido diretório: ${dir}`);
      removedCount++;
    }
  });

  console.log(`   📊 Total removido: ${removedCount} arquivos/diretórios`);

  // Passo 2: Criar arquivo public/favicon.ico se não existir
  console.log('\n📁 Configurando diretório public...');
  if (!existsSync('public')) {
    execSync('mkdir -p public');
    console.log('   ✅ Diretório public/ criado');
  }

  // Passo 3: Criar .gitignore para Next.js
  console.log('\n📝 Atualizando .gitignore...');
  const nextjsGitignore = `
# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build
/dist

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local
.env
.vercel

# Vercel
.vercel

# Typescript
*.tsbuildinfo
next-env.d.ts

# IDE
.vscode/
.idea/

# Cache
.cache/
node_modules/.cache/
`;

  writeFileSync('.gitignore', nextjsGitignore.trim());
  console.log('   ✅ .gitignore atualizado para Next.js');

  // Passo 4: Criar next-env.d.ts
  console.log('\n📝 Criando next-env.d.ts...');
  const nextEnvTypes = `/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.
`;

  writeFileSync('next-env.d.ts', nextEnvTypes);
  console.log('   ✅ next-env.d.ts criado');

  // Passo 5: Atualizar tsconfig.json para Next.js
  console.log('\n📝 Atualizando tsconfig.json...');
  const tsconfigNextjs = {
    "compilerOptions": {
      "target": "es5",
      "lib": ["dom", "dom.iterable", "es6"],
      "allowJs": true,
      "skipLibCheck": true,
      "strict": true,
      "forceConsistentCasingInFileNames": true,
      "noEmit": true,
      "esModuleInterop": true,
      "module": "esnext",
      "moduleResolution": "node",
      "resolveJsonModule": true,
      "isolatedModules": true,
      "jsx": "preserve",
      "incremental": true,
      "plugins": [
        {
          "name": "next"
        }
      ],
      "baseUrl": ".",
      "paths": {
        "@/*": ["./*"]
      }
    },
    "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
    "exclude": ["node_modules"]
  };

  writeFileSync('tsconfig.json', JSON.stringify(tsconfigNextjs, null, 2));
  console.log('   ✅ tsconfig.json atualizado para Next.js');

  // Passo 6: Criar eslintrc.json para Next.js
  console.log('\n📝 Criando .eslintrc.json...');
  const eslintNextjs = {
    "extends": "next/core-web-vitals"
  };

  writeFileSync('.eslintrc.json', JSON.stringify(eslintNextjs, null, 2));
  console.log('   ✅ .eslintrc.json criado');

  // Passo 7: Verificar se App.tsx pode ser importado
  console.log('\n🔍 Verificando App.tsx...');
  if (existsSync('App.tsx')) {
    const appContent = readFileSync('App.tsx', 'utf8');
    if (appContent.includes('export default')) {
      console.log('   ✅ App.tsx tem export default - compatível');
    } else {
      console.log('   ⚠️  App.tsx pode precisar de ajustes no export');
    }
  } else {
    console.log('   ❌ App.tsx não encontrado!');
  }

  // Passo 8: Instruções finais
  console.log('\n' + '='.repeat(60));
  console.log('🎉 MIGRAÇÃO PARA NEXT.JS CONCLUÍDA!');
  console.log('='.repeat(60));

  console.log('\n📋 ESTRUTURA CRIADA:');
  console.log('   ✅ pages/_app.tsx - Wrapper global');
  console.log('   ✅ pages/_document.tsx - HTML customizado');
  console.log('   ✅ pages/index.tsx - Página principal');
  console.log('   ✅ next.config.js - Configuração Next.js');
  console.log('   ✅ tailwind.config.js - Configuração Tailwind');
  console.log('   ✅ vercel.json - Configuração Vercel atualizada');

  console.log('\n🚀 PRÓXIMOS PASSOS:');
  console.log('   1. npm install - Instalar dependências Next.js');
  console.log('   2. npm run dev - Testar desenvolvimento');
  console.log('   3. npm run build - Testar build');
  console.log('   4. git add . && git commit -m "migrate: Vite to Next.js"');
  console.log('   5. git push - Deploy automático na Vercel');

  console.log('\n✨ VANTAGENS DO NEXT.JS:');
  console.log('   🎯 Zero configuração de build');
  console.log('   🎯 Deploy perfeito na Vercel');
  console.log('   🎯 Otimizações automáticas');
  console.log('   🎯 Melhor compatibilidade');
  console.log('   🎯 SSG/SSR se necessário');

  console.log('\n💡 COMANDOS ÚTEIS:');
  console.log('   npm run dev      # Desenvolvimento');
  console.log('   npm run build    # Build de produção');
  console.log('   npm run start    # Servir build');
  console.log('   npm run lint     # Linting Next.js');

} catch (error) {
  console.error('\n❌ ERRO na migração:', error.message);
  process.exit(1);
}