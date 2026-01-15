# Sistema de Ordem de Serviços

Sistema completo de gerenciamento de ordens de serviço com backend em Node.js/Express/MySQL e frontend em React.

## 📋 Funcionalidades

### Backend
- ✅ API REST completa com CRUD de ordens de serviço
- ✅ Banco de dados MySQL com criação automática de tabelas
- ✅ Formatação automática de datas no padrão brasileiro (DD/MM/YYYY)
- ✅ Validação de dados e tratamento de erros
- ✅ Filtros por status e busca por número

### Frontend
- ✅ Interface web moderna e responsiva
- ✅ Listagem com cards visuais
- ✅ Criação, edição e exclusão de OS
- ✅ Modal de visualização de detalhes
- ✅ Filtros por status com cores:
  - 🔴 **Vermelho** - Aberto
  - 🟡 **Amarelo** - Em Andamento
  - 🟢 **Verde** - Finalizado
- ✅ Busca avançada por múltiplos campos
- ✅ Design responsivo para desktop, tablet e mobile

## 🗂️ Estrutura do Projeto

```
sistema-ordem-servico/
├── backend/          # API Node.js/Express/MySQL
│   ├── config/       # Configuração do banco de dados
│   ├── controllers/  # Lógica de negócio
│   ├── routes/       # Rotas da API
│   ├── utils/        # Utilitários (formatação de datas)
│   └── server.js     # Servidor Express
│
└── frontend/         # Interface React
    └── src/
        ├── components/   # Componentes React
        ├── services/     # Serviços de API
        ├── utils/        # Utilitários
        └── App.jsx       # Componente principal
```

## 🚀 Como Executar

### Pré-requisitos

- Node.js (versão 16 ou superior)
- MySQL (versão 5.7 ou superior)
- npm ou yarn

### 1. Configurar o Backend

```bash
cd backend
npm install
```

Crie um arquivo `.env` na pasta `backend/`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=sistema_ordem_servico
DB_PORT=3306
PORT=3000
```

Crie o banco de dados MySQL:

```sql
CREATE DATABASE sistema_ordem_servico;
```

Ou execute o script SQL:

```bash
mysql -u root -p < database.sql
```

Inicie o servidor backend:

```bash
npm start
# ou para desenvolvimento com auto-reload
npm run dev
```

O backend estará rodando em `http://localhost:3000`

### 2. Configurar o Frontend

Em um novo terminal:

```bash
cd frontend
npm install
npm run dev
```

O frontend estará rodando em `http://localhost:5173`

## 📊 Campos da Ordem de Serviço

| Campo | Tipo | Descrição | Obrigatório |
|-------|------|-----------|-------------|
| Número OS | INT | Número único da ordem de serviço | Sim |
| Solicitante | VARCHAR(255) | Nome do solicitante | Sim |
| UBS | VARCHAR(255) | Nome da Unidade Básica de Saúde | Sim |
| Setor | VARCHAR(255) | Setor responsável | Sim |
| Descrição do Problema | TEXT | Descrição detalhada do problema | Sim |
| Data de Abertura | DATE | Data de abertura da OS | Sim |
| Serviço Realizado | TEXT | Descrição do serviço realizado | Não |
| Status | ENUM | Status: aberto, em_andamento, finalizado | Sim |
| Data de Fechamento | DATE | Data de fechamento (quando finalizada) | Não |

## 🎨 Status e Cores

- **aberto** (🔴 Vermelho) - Ordem de serviço aberta, aguardando atendimento
- **em_andamento** (🟡 Amarelo) - Ordem de serviço em andamento
- **finalizado** (🟢 Verde) - Ordem de serviço finalizada

## 📅 Formato de Datas

Todas as datas são formatadas e exibidas no padrão brasileiro: **DD/MM/YYYY**

## 🔌 Endpoints da API

### GET `/api/ordens-servico`
Lista todas as ordens de serviço.

### GET `/api/ordens-servico/:id`
Busca uma ordem de serviço por ID.

### GET `/api/ordens-servico/numero/:numero`
Busca uma ordem de serviço por número.

### GET `/api/ordens-servico/status/:status`
Lista ordens de serviço filtradas por status.

### POST `/api/ordens-servico`
Cria uma nova ordem de serviço.

### PUT `/api/ordens-servico/:id`
Atualiza uma ordem de serviço existente.

### DELETE `/api/ordens-servico/:id`
Deleta uma ordem de serviço.

Para mais detalhes, consulte o README.md de cada pasta (backend/ e frontend/).

## 🛠️ Tecnologias Utilizadas

### Backend
- Node.js
- Express.js
- MySQL2
- CORS
- dotenv

### Frontend
- React 18
- Vite
- Axios
- CSS3 (Grid, Flexbox, Custom Properties)

## 📝 Scripts Disponíveis

### Backend
- `npm start` - Inicia o servidor em modo produção
- `npm run dev` - Inicia o servidor em modo desenvolvimento (com nodemon)

### Frontend
- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run preview` - Visualiza o build de produção

## 🐛 Solução de Problemas

### Backend não conecta ao MySQL
- Verifique se o MySQL está rodando
- Confirme as credenciais no arquivo `.env`
- Certifique-se de que o banco de dados foi criado

### Frontend não conecta ao Backend
- Verifique se o backend está rodando na porta 3000
- Confirme a URL da API em `frontend/src/services/api.js`
- Verifique se o CORS está habilitado no backend

### Erro ao criar OS
- Verifique se o número da OS não está duplicado
- Confirme que todos os campos obrigatórios foram preenchidos
- Verifique os logs do backend para mais detalhes

## 📄 Licença

Este projeto foi desenvolvido para uso interno.

## 👨‍💻 Autor

Desenvolvido como sistema de gerenciamento de ordens de serviço para UBS.

---

**Desenvolvido com ❤️ usando React e Node.js**
