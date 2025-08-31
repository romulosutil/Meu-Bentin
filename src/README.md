# 🧸 Meu Bentin - Sistema de Gestão

Sistema completo de gestão para loja infantil desenvolvido com React, TypeScript e Tailwind CSS.

## ✨ Funcionalidades

### 📊 Dashboard
- Visão geral das métricas principais
- Produtos mais vendidos
- Alertas de estoque
- Sistema de metas de vendas
- Análise de capital de giro

### 📦 Controle de Estoque
- Cadastro de produtos
- Gerenciamento de categorias
- Controle de quantidades
- Alertas de estoque baixo
- Registro de perdas

### 🛒 Gestão de Vendas
- Registro de vendas
- Gestão de vendedores
- Controle de formas de pagamento
- Histórico de vendas com filtros
- Atualização automática do estoque

### 💰 Análise Financeira
- Relatórios de receita
- Gráficos de evolução
- Análise por forma de pagamento
- Receita por categoria
- Controle de capital de giro

### 📈 Análise de Dados
- Insights automáticos
- Tendências de vendas
- Performance de vendedores
- Análise por categoria
- Alertas inteligentes

## 🚀 Tecnologias

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts
- **Icons**: Lucide React
- **UI Components**: Radix UI
- **Build Tool**: Vite
- **Persistence**: LocalStorage

## 🏗️ Arquitetura

- **Context API**: Gerenciamento de estado global
- **Custom Hooks**: Lógica reutilizável
- **Component Library**: Sistema de design consistente
- **Lazy Loading**: Otimização de performance
- **Responsive Design**: Mobile-first approach

## 📱 Responsividade

O sistema é totalmente responsivo e otimizado para:
- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large Desktop (1440px+)

## 🎨 Design System

### Logotipo Oficial
O sistema utiliza o logotipo oficial do Meu Bentin, que apresenta três crianças abraçadas representando diversão e cuidado.

#### Componente MeuBentinLogo
```tsx
// Uso padrão no header
<MeuBentinLogoHeader />

// Uso customizado com tamanhos
<MeuBentinLogo size="sm" | "md" | "lg" | "xl" />

// Variações específicas
<MeuBentinLogoNavbar />    // Para navegação
<MeuBentinLogoCompact />   // Versão compacta
```

### Cores Principais
- **Rosa**: #e91e63 (Destaque - "Meu")
- **Azul**: #2196f3 (Informação - "Ben") 
- **Verde**: #4caf50 (Sucesso - "tin")
- **Laranja**: #ff6b35 (Atenção)
- **Mint**: #66bb6a (Complementar)

### Componentes
- Cards com elevação e hover effects
- Botões com estados interativos
- Formulários com validação
- Tabelas responsivas
- Gráficos interativos
- Logo responsivo com fallback elegante

## 🔧 Instalação e Deploy

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação Local
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/meu-bentin-gestao.git

# Entre no diretório
cd meu-bentin-gestao

# Instale as dependências
npm install

# Execute o projeto
npm run dev
```

### Deploy no Vercel

#### Opção 1: Via GitHub
1. Faça fork do repositório
2. Conecte sua conta Vercel ao GitHub
3. Importe o projeto no Vercel
4. O deploy será automático

#### Opção 2: Via Vercel CLI
```bash
# Instale a CLI do Vercel
npm i -g vercel

# Faça deploy
vercel

# Para deploy de produção
vercel --prod
```

## 📊 Persistência de Dados

O sistema utiliza **LocalStorage** para persistência local dos dados:
- ✅ Não requer configuração de banco
- ✅ Funciona offline
- ✅ Deploy simples no Vercel
- ⚠️ Dados ficam no navegador do usuário

### Estrutura dos Dados
- `meu-bentin-produtos`: Lista de produtos
- `meu-bentin-categorias`: Categorias disponíveis
- `meu-bentin-vendedores`: Cadastro de vendedores
- `meu-bentin-vendas`: Histórico de vendas
- `meu-bentin-perdas`: Registro de perdas
- `capitalGiro`: Configuração do capital de giro

## 🔒 Segurança e Performance

- ✅ Validação de formulários
- ✅ Error boundaries
- ✅ Lazy loading de componentes
- ✅ Otimização de bundle
- ✅ Code splitting automático
- ✅ Performance monitoring
- ✅ Acessibilidade (WCAG)

## 🧪 Estado de Teste Limpo

O sistema inicia com:
- ✅ Categorias básicas pré-definidas
- ✅ Um vendedor exemplo
- ✅ Arrays vazios para produtos, vendas e perdas
- ✅ Fluxo completo de configuração inicial

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

---

**Desenvolvido com ❤️ para Meu Bentin**