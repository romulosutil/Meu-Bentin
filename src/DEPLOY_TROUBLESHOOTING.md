# 🔧 Troubleshooting - Deploy Meu Bentin

## ❌ Problemas Comuns e Soluções

### 1. Erro: `npm error Invalid package name "jsr:"`

**Sintoma:**
```
npm error Invalid package name "jsr:" of package "jsr:@^supabase"
```

**Soluções:**

#### Solução A - Limpar Cache
```bash
# No terminal do computador local
npm cache clean --force
rm -rf node_modules
rm package-lock.json
npm install
```

#### Solução B - Force Redeploy
1. **GitHub:** Faça um pequeno commit (adicione espaço em qualquer arquivo)
2. **Vercel:** No painel, vá em Deployments → Redeploy

#### Solução C - Verificar Vercel Settings
1. **Environment Variables:** Certifique-se que não há variáveis com prefixos JSR
2. **Build Settings:**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### 2. Erro: Module not found

**Sintoma:**
```
Error: Cannot resolve module './components/MeuBentinLogo'
```

**Solução:**
- ✅ Arquivo `/components/MeuBentinLogo.tsx` existe
- ✅ Import correto no `/App.tsx`: `import MeuBentinLogo from './components/MeuBentinLogo'`

### 3. Erro: Tailwind classes not working

**Sintoma:**
Classes CSS não aplicadas corretamente

**Solução:**
- ✅ Arquivo `/styles/globals.css` está sendo importado no `main.tsx`
- ✅ Tailwind config está correto

### 4. Erro: Build timeout

**Sintoma:**
Build demora muito ou dá timeout

**Solução:**
```json
// No vercel.json, adicionar:
{
  "functions": {
    "app.tsx": {
      "maxDuration": 30
    }
  }
}
```

## 🎯 Configurações Corretas

### Package.json ✅
```json
{
  "name": "meu-bentin-gestao",
  "version": "1.0.0",
  "type": "module",
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  }
}
```

### Vercel.json ✅
```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install"
}
```

### .npmrc ✅
```
registry=https://registry.npmjs.org/
save-exact=false
package-lock=true
```

## 🚀 Checklist de Deploy

### Antes do Commit:
- [ ] Todos os arquivos salvos
- [ ] Logo `MeuBentinLogo.tsx` funcionando
- [ ] `App.tsx` importa logo corretamente
- [ ] Build local funciona: `npm run build`

### No GitHub:
- [ ] Repository name: "Meu Bentin"
- [ ] Arquivos commitados e pushed
- [ ] Branch main está atualizada

### Na Vercel:
- [ ] Import from GitHub selecionado
- [ ] Framework Detection: Vite
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`

## 🔍 Logs de Debug

### Para ver logs detalhados:
1. **Vercel Dashboard** → **Project** → **Functions** → **View Logs**
2. **Local Debug:**
```bash
npm run build --verbose
npm run preview
```

### Verificar se build local funciona:
```bash
# Instalar dependências
npm install

# Build de produção
npm run build

# Testar build
npm run preview
```

## 📞 Suporte Rápido

### Status dos Arquivos Principais:
- ✅ `/App.tsx` - Logo integrado
- ✅ `/components/MeuBentinLogo.tsx` - SVG customizado
- ✅ `/package.json` - Dependências corretas
- ✅ `/vercel.json` - Configuração Vite
- ✅ `/.npmrc` - Registry NPM oficial

### Deploy Alternativo (se Vercel falhar):
1. **Netlify**: Mesmo processo, selecionar Vite
2. **Railway**: Deploy direto do GitHub
3. **Render**: Static site deployment

---

## 💡 Dicas Importantes

1. **Sempre limpar cache** antes de redeploy
2. **Usar npm ao invés de yarn/pnpm** para melhor compatibilidade
3. **Verificar node version** no Vercel (deve ser 18+)
4. **Commits pequenos** facilitam debug

**O sistema está otimizado para deploy! 🎉**