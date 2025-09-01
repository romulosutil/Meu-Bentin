# Meu Bentin - Sistema de Gestão

Sistema completo de gestão para loja infantil com controle de estoque, vendas, receita e análise de dados.

## 🚀 Tecnologias

- **React 18** + **TypeScript** 
- **Tailwind CSS v4** para estilização
- **Vite** para build e desenvolvimento
- **Radix UI** para componentes acessíveis
- **Recharts** para gráficos e visualizações
- **Motion** para animações suaves
- **LocalStorage** para persistência de dados

## ✨ Funcionalidades

### 📊 Dashboard
- Visão geral de vendas e estoque
- Métricas em tempo real
- Gráficos interativos

### 📦 Estoque
- Cadastro e edição de produtos
- Controle de quantidades
- Gestão de categorias
- Alertas de estoque baixo

### 💰 Vendas
- Registro de vendas
- Seleção de produtos
- Cálculo automático de totais
- Diferentes formas de pagamento

### 📈 Receita
- Análise de faturamento
- Relatórios por período
- Comparativo de performance

### 📊 Análise de Dados
- Produtos mais vendidos
- Performance por vendedor
- Tendências de vendas
- Insights estratégicos

## 🎨 Design System

Sistema baseado nas cores vibrantes da marca Meu Bentin:
- **Rosa**: `#e91e63` (Primária)
- **Azul**: `#2196f3` (Secundária)  
- **Verde**: `#4caf50` (Accent)
- **Laranja**: `#ff6b35` (Destaque)

## 🔐 Autenticação

Sistema de login seguro com:
- Sessão de 24 horas
- Verificação contínua
- Logout automático
- Interface infantil e colorida

## 🛠️ Instalação e Uso

### Pré-requisitos
- Node.js 18+
- npm 9+

### Desenvolvimento Local
```bash
# Clone o repositório
git clone https://github.com/usuario/meu-bentin-gestao.git

# Entre no diretório
cd meu-bentin-gestao

# Instale as dependências
npm install

# Execute o servidor de desenvolvimento
npm run dev
```

### Build para Produção
```bash
# Gere o build otimizado
npm run build

# Visualize o build localmente
npm run preview
```

## 📱 Responsividade

- ✅ Design mobile-first
- ✅ Navegação por abas otimizada
- ✅ Componentes adaptáveis
- ✅ Tipografia responsiva

## 🚀 Deploy

O projeto está configurado para deploy automático na Vercel:

1. **GitHub**: Faça push das alterações
2. **Vercel**: Deploy automático a partir do repositório
3. **Configurações**: Já otimizadas no `vercel.json`

### Variáveis de Ambiente
Não são necessárias para a versão atual com localStorage.

## 🏗️ Estrutura do Projeto

```
├── components/          # Componentes React
│   ├── ui/             # Componentes de UI (Radix UI)
│   ├── Dashboard.tsx   # Tela principal
│   ├── Estoque.tsx     # Gestão de estoque
│   ├── Vendas.tsx      # Sistema de vendas
│   ├── Receita.tsx     # Análise de receita
│   └── AnaliseData.tsx # Análises avançadas
├── hooks/              # Hooks personalizados
├── utils/              # Utilitários e contextos
├── styles/             # Estilos globais (CSS)
└── App.tsx             # Componente principal
```

## 🔧 Scripts Disponíveis

- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run preview` - Preview do build
- `npm run validate` - Validar dependências
- `npm run clean` - Limpar node_modules

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📞 Contato

Para suporte e dúvidas sobre o sistema Meu Bentin.

---

**Meu Bentin** - Sistema de gestão infantil completo 🎈