# Frontend - Sistema de Ordem de Serviços

Interface web moderna e responsiva para gerenciamento de ordens de serviço, desenvolvida com React, TypeScript e Vite.

## 🎨 Funcionalidades

### Gestão de Ordens de Serviço
- ✅ Listagem completa de ordens de serviço com paginação otimizada
- ✅ Criação de novas ordens de serviço com validação em tempo real
- ✅ Edição de ordens de serviço existentes
- ✅ Exclusão de ordens de serviço com confirmação
- ✅ Visualização detalhada de cada OS em modal
- ✅ Geração de PDF individual de cada OS
- ✅ Geração de relatório PDF com todas as OS filtradas

### Filtros e Buscas
- ✅ Filtros por status (Todos, Aberto, Em Andamento, Finalizado)
- ✅ Busca em tempo real por:
  - Número da OS
  - Nome do solicitante
  - UBS (Unidade Básica de Saúde)
  - Setor
  - Descrição do problema
- ✅ Filtro por dia específico
- ✅ Filtro por mês (com seleção de meses)
- ✅ Filtro por ano
- ✅ Filtro por intervalo de datas (data inicial e final)
- ✅ Botão para limpar todos os filtros ativos

### Estatísticas em Tempo Real
- 📊 Card com estatísticas do dia
- 📊 Card com estatísticas do mês
- 📊 Card com estatísticas do ano
- 📊 Card dinâmico com estatísticas do período filtrado
- 📊 Indicador visual de filtros aplicados

### Design e UX
- ✅ Cores indicativas de status:
  - 🔴 **Vermelho** - Aberto
  - 🟡 **Amarelo** - Em Andamento
  - 🟢 **Verde** - Finalizado
- ✅ Cards com animações suaves e efeitos hover
- ✅ Notificações toast para feedback de ações
- ✅ Loading states otimizados
- ✅ Interface responsiva para desktop, tablet e mobile
- ✅ Design moderno com gradientes e sombras
- ✅ Datas formatadas no padrão brasileiro (DD/MM/YYYY)

## 🚀 Instalação

### Pré-requisitos
- Node.js 18+ instalado
- npm ou yarn
- Backend rodando em `http://localhost:3000`

### Passos

1. Navegue até a pasta do frontend:
```bash
cd frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Crie um arquivo `.env` (opcional) para configurar variáveis de ambiente:
```env
VITE_API_URL=http://localhost:3000
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

5. Acesse no navegador: `http://localhost:5173`

## 📦 Scripts Disponíveis

```bash
# Inicia o servidor de desenvolvimento
npm run dev

# Gera build de produção
npm run build

# Visualiza o build de produção localmente
npm run preview
```

## 🏗️ Estrutura do Projeto

```
frontend/
├── public/                       # Arquivos estáticos
├── src/
│   ├── components/               # Componentes React
│   │   ├── common/               # Componentes compartilhados
│   │   │   ├── Modal.tsx         # Modal reutilizável
│   │   │   ├── Statistics.tsx    # Card de estatísticas
│   │   │   └── Toast.tsx         # Notificações toast
│   │   ├── layout/               # Componentes de layout
│   │   │   ├── Header.tsx        # Cabeçalho da aplicação
│   │   │   └── Footer.tsx        # Rodapé da aplicação
│   │   └── orders/               # Componentes de OS
│   │       ├── ServiceOrderCard.tsx      # Card de exibição de OS
│   │       ├── ServiceOrderDetails.tsx   # Detalhes da OS
│   │       └── ServiceOrderForm.tsx      # Formulário de criação/edição
│   ├── hooks/                    # Hooks customizados
│   │   ├── useDebounce.ts        # Hook para debounce de inputs
│   │   ├── useOrdemServico.ts    # Hooks React Query para OS
│   │   └── useToast.ts           # Hook para notificações toast
│   ├── schemas/                  # Schemas de validação
│   │   └── ordemServicoSchema.ts # Schema Zod para OS
│   ├── services/                 # Serviços de API
│   │   └── api.ts                # Cliente Axios configurado
│   ├── types/                    # Definições de tipos TypeScript
│   │   └── index.ts              # Tipos compartilhados
│   ├── utils/                    # Funções utilitárias
│   │   └── statusColors.ts       # Configuração de cores por status
│   ├── App.tsx                   # Componente principal
│   ├── main.tsx                  # Ponto de entrada
│   ├── index.css                 # Estilos globais e Tailwind
│   └── vite-env.d.ts             # Definições de tipos Vite
├── index.html                    # Template HTML
├── package.json                  # Dependências e scripts
├── postcss.config.js             # Configuração PostCSS
├── tailwind.config.js            # Configuração Tailwind CSS
├── tsconfig.json                 # Configuração TypeScript
├── vite.config.ts                # Configuração Vite
└── README.md                     # Este arquivo
```

## 🎯 Guia de Uso

### Criar Nova Ordem de Serviço

1. Clique no botão **"+ Nova OS"** no cabeçalho
2. Preencha o formulário com as informações:
   - **Número OS** (obrigatório)
   - **Solicitante** (obrigatório)
   - **UBS** (obrigatório)
   - **Setor** (obrigatório)
   - **Descrição do Problema** (obrigatório)
   - **Data de Abertura** (obrigatório)
   - **Status** (obrigatório)
3. Clique em **"Criar OS"**

### Editar Ordem de Serviço

1. Clique no botão **"✏️ Editar"** no card da OS
2. Modifique os campos desejados
3. Para finalizar uma OS, altere o status para "Finalizado" e preencha:
   - **Serviço Realizado**
   - **Data de Fechamento**
4. Clique em **"Atualizar OS"**

### Visualizar Detalhes

1. Clique no botão **"👁️ Ver"** no card da OS
2. Uma modal será aberta com todas as informações completas

### Gerar PDF

- **PDF Individual**: Clique no botão **"📄 PDF"** no card da OS
- **Relatório Completo**: Clique no botão **"📊 Gerar Relatório PDF"** no cabeçalho
  - O relatório irá incluir apenas as OS visíveis nos filtros atuais

### Aplicar Filtros

**Por Status:**
- Clique nos botões: **Todos**, **Abertos**, **Em Andamento** ou **Finalizados**

**Por Busca:**
- Digite no campo de busca para filtrar por qualquer texto

**Por Data:**
- **Dia**: Digite o dia (1-31)
- **Mês**: Selecione o mês no dropdown
- **Ano**: Digite o ano (2020-2100)
- **Intervalo**: Selecione data inicial e/ou final

**Limpar Filtros:**
- Clique no botão **"Limpar Filtros"**

## 🛠️ Tecnologias e Bibliotecas

### Core
- **React 18** - Biblioteca JavaScript para interfaces
- **TypeScript** - Superset tipado do JavaScript
- **Vite** - Build tool moderna e rápida

### Gerenciamento de Estado
- **TanStack React Query** - Gerenciamento de estado assíncrono
- **React Query Devtools** - Ferramentas de debug para React Query

### Formulários e Validação
- **React Hook Form** - Gerenciamento de formulários performático
- **Zod** - Schema validation TypeScript-first
- **@hookform/resolvers** - Integração RHF + Zod

### Estilização
- **Tailwind CSS** - Framework CSS utility-first
- **PostCSS** - Processador CSS
- **Autoprefixer** - Adiciona vendor prefixes automaticamente

### HTTP Client
- **Axios** - Cliente HTTP com interceptors e configurações

### Otimizações
- **Lazy Loading** - Componentes carregados sob demanda
- **React.memo** - Memoização de componentes
- **useMemo** - Memoização de cálculos pesados
- **useCallback** - Memoização de funções
- **Debounce** - Otimização de inputs de busca

## ⚙️ Configuração

### API Backend

O frontend está configurado para se comunicar com o backend em `http://localhost:3000`. Para alterar, edite o arquivo `src/services/api.ts`:

```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
});
```

Ou configure a variável de ambiente `VITE_API_URL` no arquivo `.env`.

### Proxy (Desenvolvimento)

O Vite está configurado com proxy para evitar problemas de CORS em desenvolvimento. Veja `vite.config.ts`:

```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```

## 🎨 Personalização de Estilos

### Tailwind CSS

As configurações do Tailwind podem ser personalizadas em `tailwind.config.js`:

```javascript
export default {
  theme: {
    extend: {
      colors: {
        primary: '#dc2626', // Vermelho
        success: '#16a34a', // Verde
        warning: '#d97706', // Amarelo
        // ... adicione mais cores
      },
    },
  },
};
```

### CSS Global

Estilos globais e variáveis CSS em `src/index.css`:

```css
:root {
  /* Cores personalizadas */
  --color-primary: #dc2626;
  --color-success: #16a34a;
  /* ... */
}
```

## 📱 Responsividade

A interface é totalmente responsiva e se adapta a diferentes tamanhos de tela:

- **Desktop (1024px+)** - Grid com 3 colunas de cards
- **Tablet (768px - 1023px)** - Grid com 2 colunas de cards
- **Mobile (< 768px)** - Grid com 1 coluna de cards

Os componentes usam breakpoints do Tailwind:
- `sm:` - 640px
- `md:` - 768px
- `lg:` - 1024px

## 🚀 Build de Produção

### Gerar Build

```bash
npm run build
```

Os arquivos otimizados serão gerados na pasta `dist/`:
- HTML minificado
- CSS e JavaScript com code splitting
- Assets otimizados
- Source maps para debug

### Visualizar Build Localmente

```bash
npm run preview
```

Acesse: `http://localhost:4173`

### Deploy

Os arquivos da pasta `dist/` podem ser servidos por qualquer servidor web estático:
- Nginx
- Apache
- Vercel
- Netlify
- GitHub Pages
- Firebase Hosting

## 🔧 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do frontend:

```env
# URL da API backend
VITE_API_URL=http://localhost:3000

# Outras variáveis (se necessário)
VITE_APP_TITLE=Sistema de Ordem de Serviços
```

**Importante**: Todas as variáveis devem começar com `VITE_` para serem expostas ao cliente.

## 📄 Licença

Este projeto é de uso interno.

## 👥 Suporte

Para dúvidas ou problemas, entre em contato com a equipe de desenvolvimento.
