# 🏥 Sistema de Ordem de Serviços

Sistema completo para gerenciamento de ordens de serviço de uma Unidade Básica de Saúde (UBS), desenvolvido com tecnologias modernas e boas práticas de desenvolvimento.

## 📋 Sobre o Projeto

Este sistema foi desenvolvido para facilitar o gerenciamento de ordens de serviço em unidades de saúde, permitindo o controle completo desde a abertura até o fechamento de cada solicitação, incluindo filtros avançados, estatísticas em tempo real e geração de relatórios em PDF.

## ✨ Principais Funcionalidades

### 📝 Gestão Completa de OS
- Criação, edição, visualização e exclusão de ordens de serviço
- Controle de status (Aberto, Em Andamento, Finalizado)
- Registro completo de informações: solicitante, UBS, setor, problema e solução
- Datas de abertura e fechamento

### 🔍 Filtros e Buscas Avançadas
- Filtro por status
- Busca em tempo real por texto (número, solicitante, UBS, setor, descrição)
- Filtro por dia, mês e ano específicos
- Filtro por intervalo de datas personalizado
- Combinação múltipla de filtros

### 📊 Estatísticas em Tempo Real
- Total de ordens do dia
- Total de ordens do mês (ou todos os meses do ano)
- Total de ordens do ano
- Total de ordens no período filtrado
- Indicadores visuais por status

### 📄 Geração de PDF
- PDF individual de cada ordem de serviço
- Relatório completo com todas as ordens (com filtros aplicados)
- Layout profissional e organizado
- Cores indicativas de status

### 🎨 Interface Moderna
- Design responsivo (desktop, tablet, mobile)
- Animações suaves e efeitos visuais
- Notificações toast para feedback
- Cores indicativas por status
- Cards organizados e informativos

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** - Biblioteca JavaScript para UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool rápida
- **Tailwind CSS** - Framework CSS utility-first
- **React Query** - Gerenciamento de estado assíncrono
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas
- **Axios** - Cliente HTTP

### Backend
- **Node.js** - Runtime JavaScript
- **TypeScript** - Tipagem estática
- **Express** - Framework web
- **Prisma ORM** - ORM moderno para TypeScript
- **MySQL** - Banco de dados relacional
- **Zod** - Validação de dados
- **PDFKit** - Geração de PDF
- **Compression** - Compressão de respostas

## 📁 Estrutura do Projeto

```
sistema-ordem-servico/
├── backend/                  # API REST
│   ├── config/               # Configurações
│   ├── controllers/          # Controladores
│   ├── middlewares/          # Middlewares
│   ├── prisma/               # Schema Prisma
│   ├── routes/               # Rotas da API
│   ├── schemas/              # Schemas de validação
│   ├── types/                # Tipos TypeScript
│   ├── utils/                # Utilitários
│   ├── server.ts             # Servidor principal
│   ├── package.json
│   └── README.md
├── frontend/                 # Interface Web
│   ├── src/
│   │   ├── components/       # Componentes React
│   │   ├── hooks/            # Hooks customizados
│   │   ├── schemas/          # Schemas de validação
│   │   ├── services/         # Serviços de API
│   │   ├── types/            # Tipos TypeScript
│   │   ├── utils/            # Utilitários
│   │   ├── App.tsx           # Componente principal
│   │   └── main.tsx          # Ponto de entrada
│   ├── package.json
│   └── README.md
├── OTIMIZACOES.md           # Documentação de otimizações
├── OTIMIZACOES_APLICADAS.md # Otimizações implementadas
└── README.md                # Este arquivo
```

## 🚀 Guia de Instalação

### Pré-requisitos

Certifique-se de ter instalado:
- **Node.js** 18 ou superior
- **npm** ou **yarn**
- **MySQL** 8.0 ou superior

### Passo 1: Clone o Repositório

```bash
git clone <url-do-repositorio>
cd sistema-ordem-servico
```

### Passo 2: Configurar o Backend

```bash
cd backend
npm install
```

Crie um arquivo `.env`:

```env
DATABASE_URL="mysql://usuario:senha@localhost:3306/sistema_ordem_servico"
PORT=3000
NODE_ENV=development
```

Configure o banco de dados:

```bash
npm run prisma:generate
npm run prisma:push
```

Inicie o servidor:

```bash
npm run dev
```

O backend estará rodando em: `http://localhost:3000`

### Passo 3: Configurar o Frontend

Em outro terminal:

```bash
cd frontend
npm install
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

O frontend estará rodando em: `http://localhost:5173`

## 📖 Guia de Uso

### 1️⃣ Criar uma Nova Ordem de Serviço

1. Acesse o sistema pelo navegador
2. Clique no botão **"+ Nova OS"** no cabeçalho
3. Preencha o formulário com as informações obrigatórias
4. Clique em **"Criar OS"**

### 2️⃣ Visualizar e Filtrar Ordens

- Use os **botões de status** para filtrar por Aberto, Em Andamento ou Finalizado
- Digite no **campo de busca** para pesquisar por qualquer informação
- Use os **filtros de data** para buscar por período específico
- Clique em **"Limpar Filtros"** para resetar

### 3️⃣ Editar uma Ordem de Serviço

1. Clique no botão **"✏️ Editar"** no card da OS
2. Modifique os campos necessários
3. Para finalizar, altere o status e preencha o serviço realizado
4. Clique em **"Atualizar OS"**

### 4️⃣ Gerar PDF

- **PDF Individual**: Clique em **"📄 PDF"** no card da OS
- **Relatório Completo**: Clique em **"📊 Gerar Relatório PDF"** no cabeçalho

## 🎨 Capturas de Tela

### Dashboard Principal
Interface moderna com cards de estatísticas e listagem de ordens de serviço.

### Filtros Avançados
Sistema completo de filtros por status, busca, data e período.

### Visualização de OS
Modal com todos os detalhes da ordem de serviço.

### Formulário de Edição
Formulário completo com validação em tempo real.

## 📊 Status das Ordens

| Status         | Cor       | Descrição                         |
|----------------|-----------|-----------------------------------|
| Aberto         | 🔴 Vermelho | Ordem recém-criada              |
| Em Andamento   | 🟡 Amarelo  | Ordem sendo atendida            |
| Finalizado     | 🟢 Verde    | Ordem concluída                 |

## 🔧 Comandos Úteis

### Backend

```bash
# Desenvolvimento com hot reload
npm run dev

# Build para produção
npm run build

# Executar em produção
npm start

# Atualizar Prisma
npm run prisma:generate
npm run prisma:push
```

### Frontend

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## 🌐 API Endpoints

### Base URL
```
http://localhost:3000/api
```

### Principais Endpoints

```
GET    /api/ordens-servico           # Listar todas
GET    /api/ordens-servico/:id       # Buscar por ID
GET    /api/ordens-servico/numero/:numero  # Buscar por número
POST   /api/ordens-servico           # Criar nova
PUT    /api/ordens-servico/:id       # Atualizar
DELETE /api/ordens-servico/:id       # Deletar
GET    /api/ordens-servico/:id/pdf   # Gerar PDF individual
POST   /api/pdf/relatorio            # Gerar relatório PDF
```

Consulte `backend/README.md` para documentação completa da API.

## 🔒 Validação de Dados

### Frontend
- Validação em tempo real com React Hook Form + Zod
- Feedback visual imediato de erros
- Máscaras de formatação para datas

### Backend
- Validação de schemas com Zod
- Sanitização de dados de entrada
- Tratamento robusto de erros
- Mensagens de erro detalhadas

## 📱 Responsividade

O sistema é totalmente responsivo e funciona perfeitamente em:

- 🖥️ **Desktop** (1024px+) - Grid com 3 colunas
- 📱 **Tablet** (768px - 1023px) - Grid com 2 colunas
- 📱 **Mobile** (< 768px) - Grid com 1 coluna

## ⚡ Otimizações Implementadas

### Frontend
- ✅ Lazy Loading de componentes
- ✅ Memoização com React.memo, useMemo e useCallback
- ✅ Debounce em campos de busca
- ✅ Code splitting automático
- ✅ Cache de requisições com React Query
- ✅ Compressão de assets no build

### Backend
- ✅ Compressão gzip/deflate de respostas
- ✅ Queries otimizadas com Prisma
- ✅ Validação eficiente com Zod
- ✅ Conexão pooling do MySQL
- ✅ TypeScript para type safety

Consulte `OTIMIZACOES_APLICADAS.md` para detalhes completos.

## 📚 Documentação Adicional

- **[Backend README](backend/README.md)** - Documentação completa da API
- **[Frontend README](frontend/README.md)** - Documentação da interface
- **[TYPESCRIPT.md](backend/TYPESCRIPT.md)** - Guia TypeScript do projeto
- **[VALIDACAO.md](backend/VALIDACAO.md)** - Documentação de validações
- **[OTIMIZACOES.md](OTIMIZACOES.md)** - Plano de otimizações
- **[OTIMIZACOES_APLICADAS.md](OTIMIZACOES_APLICADAS.md)** - Otimizações implementadas

## 🐛 Solução de Problemas

### Backend não inicia

1. Verifique se o MySQL está rodando
2. Confirme as credenciais no `.env`
3. Execute `npm run prisma:generate` novamente

### Frontend não conecta ao backend

1. Verifique se o backend está rodando em `http://localhost:3000`
2. Confirme a configuração de CORS no backend
3. Limpe o cache do navegador

### Erro ao criar ordem de serviço

1. Verifique se todos os campos obrigatórios estão preenchidos
2. Confirme que o número da OS é único
3. Verifique o formato da data (DD/MM/YYYY)

## 🚀 Próximas Melhorias

- [ ] Autenticação e autorização de usuários
- [ ] Dashboard com gráficos e métricas
- [ ] Histórico de alterações de cada OS
- [ ] Notificações por e-mail
- [ ] Exportação para Excel/CSV
- [ ] Upload de anexos (fotos, documentos)
- [ ] API de busca avançada com Elasticsearch
- [ ] Testes unitários e de integração
- [ ] CI/CD com GitHub Actions

## 📄 Licença

Este projeto é de uso interno.

## 👨‍💻 Desenvolvimento

Desenvolvido para gerenciamento eficiente de ordens de serviço em unidades de saúde.

## 📞 Suporte

Para dúvidas, problemas ou sugestões:
- Abra uma issue no repositório
- Entre em contato com a equipe de desenvolvimento

---

**Desenvolvido com ❤️ para otimizar o gerenciamento de ordens de serviço**
