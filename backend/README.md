# Backend - Sistema de Ordem de Serviços

API REST para gerenciamento de ordens de serviço com banco de dados MySQL.

## 📋 Funcionalidades

- CRUD completo de ordens de serviço
- Formatação automática de datas no padrão brasileiro (DD/MM/YYYY)
- Status com cores: Aberto (vermelho), Em Andamento (amarelo), Finalizado (verde)
- Filtros por status e busca por número de OS

## 🚀 Instalação

1. Instale as dependências:
```bash
npm install
```

2. Configure o arquivo `.env` na raiz do backend:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=sistema_ordem_servico
DB_PORT=3306
PORT=3000
```

3. Crie o banco de dados MySQL:
```sql
CREATE DATABASE sistema_ordem_servico;
```

4. A tabela será criada automaticamente ao iniciar o servidor.

5. Inicie o servidor:
```bash
# Produção
npm start

# Desenvolvimento (com nodemon)
npm run dev
```

## 📚 Estrutura da API

### Endpoints

#### GET `/api/ordens-servico`
Lista todas as ordens de serviço.

#### GET `/api/ordens-servico/:id`
Busca uma ordem de serviço por ID.

#### GET `/api/ordens-servico/numero/:numero`
Busca uma ordem de serviço por número.

#### GET `/api/ordens-servico/status/:status`
Lista ordens de serviço filtradas por status (`aberto`, `em_andamento`, `finalizado`).

#### POST `/api/ordens-servico`
Cria uma nova ordem de serviço.

**Body exemplo:**
```json
{
  "numero_os": 1001,
  "solicitante": "João Silva",
  "ubs": "UBS Central",
  "setor": "Informática",
  "descricao_problema": "Computador não liga",
  "data_abertura": "15/12/2024",
  "servico_realizado": null,
  "status": "aberto"
}
```

#### PUT `/api/ordens-servico/:id`
Atualiza uma ordem de serviço existente.

**Body exemplo:**
```json
{
  "status": "finalizado",
  "servico_realizado": "Troca de fonte do computador",
  "data_fechamento": "16/12/2024"
}
```

#### DELETE `/api/ordens-servico/:id`
Deleta uma ordem de serviço.

## 📊 Estrutura da Tabela

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INT | ID único (auto-incremento) |
| numero_os | INT | Número da ordem de serviço (único) |
| solicitante | VARCHAR(255) | Nome do solicitante |
| ubs | VARCHAR(255) | Nome da UBS |
| setor | VARCHAR(255) | Setor responsável |
| descricao_problema | TEXT | Descrição do problema |
| data_abertura | DATE | Data de abertura |
| servico_realizado | TEXT | Descrição do serviço realizado |
| status | ENUM | Status: 'aberto', 'em_andamento', 'finalizado' |
| data_fechamento | DATE | Data de fechamento |
| created_at | TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | Data de atualização |

## 🎨 Status e Cores

- **aberto** (vermelho) - Ordem de serviço aberta
- **em_andamento** (amarelo) - Ordem de serviço em andamento
- **finalizado** (verde) - Ordem de serviço finalizada

## 📅 Formato de Datas

Todas as datas são retornadas no formato brasileiro: **DD/MM/YYYY**

As datas podem ser enviadas no formato brasileiro (DD/MM/YYYY) ou ISO (YYYY-MM-DD) e serão automaticamente convertidas.

## 🛠️ Tecnologias

- Node.js
- Express.js
- MySQL2
- CORS
- dotenv
