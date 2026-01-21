# Backend - Sistema de Ordem de Serviços

API REST robusta para gerenciamento de ordens de serviço, desenvolvida com Node.js, TypeScript, Express e Prisma ORM.

## 📋 Funcionalidades

### CRUD Completo
- ✅ Criar novas ordens de serviço
- ✅ Listar todas as ordens de serviço
- ✅ Buscar ordem por ID
- ✅ Buscar ordem por número
- ✅ Atualizar ordens existentes
- ✅ Excluir ordens de serviço

### Validação e Segurança
- ✅ Validação completa com Zod schemas
- ✅ Sanitização de dados de entrada
- ✅ Tratamento de erros robusto
- ✅ Validação de datas no formato brasileiro
- ✅ Validação de números únicos de OS

### Formatação e Utilidades
- ✅ Formatação automática de datas (DD/MM/YYYY)
- ✅ Conversão de datas entre formatos BR e ISO
- ✅ Compressão de respostas HTTP (gzip)
- ✅ CORS configurado para desenvolvimento

### Geração de PDF
- ✅ PDF individual de cada ordem de serviço
- ✅ Relatório PDF com múltiplas ordens
- ✅ Layout profissional e organizado
- ✅ Cores por status nas visualizações
- ✅ Download automático de PDFs

### Status e Organização
- 🔴 **Aberto** - Ordem recém-criada
- 🟡 **Em Andamento** - Ordem sendo atendida
- 🟢 **Finalizado** - Ordem concluída

## 🚀 Instalação

### Pré-requisitos
- Node.js 18+ instalado
- MySQL 8.0+ instalado e rodando
- npm ou yarn

### Passos

1. Navegue até a pasta do backend:
```bash
cd backend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure o arquivo `.env` na raiz do backend:
```env
# Configuração do Banco de Dados
DATABASE_URL="mysql://usuario:senha@localhost:3306/sistema_ordem_servico"

# Porta do servidor
PORT=3000

# Ambiente
NODE_ENV=development
```

4. Configure o banco de dados:
```bash
# Gera o Prisma Client
npm run prisma:generate

# Sincroniza o schema com o banco de dados
npm run prisma:push
```

5. Inicie o servidor:
```bash
# Desenvolvimento (com hot reload)
npm run dev

# Produção (requer build primeiro)
npm run build
npm start
```

O servidor estará rodando em: `http://localhost:3000`

## 📦 Scripts Disponíveis

```bash
# Desenvolvimento com hot reload
npm run dev

# Compilar TypeScript para JavaScript
npm run build

# Executar em produção (após build)
npm start

# Gerar Prisma Client
npm run prisma:generate

# Sincronizar schema com banco de dados
npm run prisma:push

# Importar schema do banco existente
npm run prisma:pull
```

## 🏗️ Estrutura do Projeto

```
backend/
├── config/                       # Configurações
│   └── prisma.ts                 # Cliente Prisma configurado
├── controllers/                  # Controladores (lógica de negócio)
│   ├── ordemServicoController.ts # Controller de Ordens de Serviço
│   └── pdfController.ts          # Controller de geração de PDF
├── middlewares/                  # Middlewares
│   └── validateSchema.ts         # Middleware de validação Zod
├── prisma/                       # Prisma ORM
│   └── schema.prisma             # Schema do banco de dados
├── routes/                       # Definição de rotas
│   └── ordemServicoRoutes.ts     # Rotas de Ordens de Serviço
├── schemas/                      # Schemas de validação
│   └── ordemServicoSchema.ts     # Schema Zod para OS
├── types/                        # Tipos TypeScript
│   └── index.ts                  # Tipos compartilhados
├── utils/                        # Utilitários
│   └── dateFormatter.ts          # Formatação de datas
├── server.ts                     # Ponto de entrada da aplicação
├── tsconfig.json                 # Configuração TypeScript
├── package.json                  # Dependências e scripts
├── database.sql                  # Schema SQL (referência)
├── env.example.txt               # Exemplo de arquivo .env
├── exemplos-requisicoes.http     # Exemplos de requisições
├── exemplos-validacao.http       # Exemplos de validação
├── TYPESCRIPT.md                 # Documentação TypeScript
├── VALIDACAO.md                  # Documentação de validação
└── README.md                     # Este arquivo
```

## 📚 API Endpoints

### Base URL
```
http://localhost:3000/api
```

### Ordens de Serviço

#### 📋 Listar todas as ordens
```http
GET /api/ordens-servico
```

**Resposta:**
```json
[
  {
    "id": 1,
    "numero_os": 1001,
    "solicitante": "João Silva",
    "ubs": "UBS Central",
    "setor": "Informática",
    "descricao_problema": "Computador não liga",
    "data_abertura": "15/01/2026",
    "servico_realizado": null,
    "status": "aberto",
    "data_fechamento": null,
    "created_at": "2026-01-15T10:30:00.000Z",
    "updated_at": "2026-01-15T10:30:00.000Z"
  }
]
```

#### 🔍 Buscar ordem por ID
```http
GET /api/ordens-servico/:id
```

**Parâmetros:**
- `id` (number) - ID da ordem de serviço

#### 🔢 Buscar ordem por número
```http
GET /api/ordens-servico/numero/:numero
```

**Parâmetros:**
- `numero` (number) - Número da ordem de serviço

#### ➕ Criar nova ordem
```http
POST /api/ordens-servico
Content-Type: application/json
```

**Body:**
```json
{
  "numero_os": 1002,
  "solicitante": "Maria Santos",
  "ubs": "UBS Norte",
  "setor": "Manutenção",
  "descricao_problema": "Ar condicionado com defeito",
  "data_abertura": "16/01/2026",
  "status": "aberto"
}
```

**Validações:**
- `numero_os`: número positivo, único
- `solicitante`: string, mínimo 3 caracteres
- `ubs`: string, não vazio
- `setor`: string, não vazio
- `descricao_problema`: string, mínimo 10 caracteres
- `data_abertura`: formato DD/MM/YYYY ou YYYY-MM-DD
- `status`: "aberto" | "em_andamento" | "finalizado"

#### ✏️ Atualizar ordem
```http
PUT /api/ordens-servico/:id
Content-Type: application/json
```

**Body (exemplo - finalizar OS):**
```json
{
  "status": "finalizado",
  "servico_realizado": "Troca do compressor do ar condicionado",
  "data_fechamento": "16/01/2026"
}
```

**Validações:**
- Todos os campos são opcionais
- Se `status` = "finalizado", `servico_realizado` e `data_fechamento` são obrigatórios
- `data_fechamento` deve ser >= `data_abertura`

#### 🗑️ Deletar ordem
```http
DELETE /api/ordens-servico/:id
```

**Parâmetros:**
- `id` (number) - ID da ordem de serviço

### Geração de PDF

#### 📄 Gerar PDF de uma ordem
```http
GET /api/ordens-servico/:id/pdf
```

**Resposta:**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="OS_1001.pdf"`

#### 📊 Gerar relatório PDF
```http
POST /api/pdf/relatorio
Content-Type: application/json
```

**Body (opcional - para filtros):**
```json
{
  "status": "aberto",
  "search": "computador",
  "dia": 15,
  "mes": 1,
  "ano": 2026,
  "dataInicio": "2026-01-01",
  "dataFim": "2026-01-31"
}
```

**Resposta:**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="Relatorio_OS_[timestamp].pdf"`

## 📊 Estrutura do Banco de Dados

### Tabela: `ordem_servico`

| Campo               | Tipo          | Descrição                        | Constraints          |
|---------------------|---------------|----------------------------------|----------------------|
| `id`                | INT           | ID único auto-incremento         | PRIMARY KEY          |
| `numero_os`         | INT           | Número da ordem de serviço       | UNIQUE, NOT NULL     |
| `solicitante`       | VARCHAR(255)  | Nome do solicitante              | NOT NULL             |
| `ubs`               | VARCHAR(255)  | Unidade Básica de Saúde          | NOT NULL             |
| `setor`             | VARCHAR(255)  | Setor responsável                | NOT NULL             |
| `descricao_problema`| TEXT          | Descrição detalhada do problema  | NOT NULL             |
| `data_abertura`     | DATE          | Data de abertura da OS           | NOT NULL             |
| `servico_realizado` | TEXT          | Descrição do serviço realizado   | NULLABLE             |
| `status`            | ENUM          | Status da OS                     | NOT NULL             |
| `data_fechamento`   | DATE          | Data de fechamento da OS         | NULLABLE             |
| `created_at`        | DATETIME      | Data de criação do registro      | DEFAULT NOW()        |
| `updated_at`        | DATETIME      | Data de última atualização       | ON UPDATE NOW()      |

**Valores do ENUM `status`:**
- `aberto`
- `em_andamento`
- `finalizado`

## 🛠️ Tecnologias Utilizadas

### Core
- **Node.js** - Runtime JavaScript
- **TypeScript** - JavaScript com tipagem estática
- **Express.js** - Framework web minimalista

### Banco de Dados
- **MySQL** - Sistema de gerenciamento de banco de dados
- **Prisma ORM** - ORM TypeScript-first moderno
- **@prisma/client** - Cliente Prisma gerado

### Validação e Segurança
- **Zod** - Schema validation TypeScript-first
- **CORS** - Cross-Origin Resource Sharing
- **Compression** - Compressão gzip/deflate

### Geração de PDF
- **PDFKit** - Biblioteca para geração de PDF

### Ambiente e Utilidades
- **dotenv** - Carregamento de variáveis de ambiente
- **ts-node** - Execução TypeScript diretamente
- **ts-node-dev** - Hot reload para desenvolvimento

## ⚙️ Configuração

### Variáveis de Ambiente (.env)

```env
# ======================================
# CONFIGURAÇÃO DO BANCO DE DADOS
# ======================================
DATABASE_URL="mysql://usuario:senha@localhost:3306/sistema_ordem_servico"

# ======================================
# CONFIGURAÇÃO DO SERVIDOR
# ======================================
PORT=3000

# ======================================
# AMBIENTE
# ======================================
NODE_ENV=development
```

### Prisma Schema

O arquivo `prisma/schema.prisma` define a estrutura do banco:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model OrdemServico {
  id                  Int       @id @default(autoincrement())
  numero_os           Int       @unique
  solicitante         String    @db.VarChar(255)
  ubs                 String    @db.VarChar(255)
  setor               String    @db.VarChar(255)
  descricao_problema  String    @db.Text
  data_abertura       DateTime  @db.Date
  servico_realizado   String?   @db.Text
  status              Status
  data_fechamento     DateTime? @db.Date
  created_at          DateTime  @default(now())
  updated_at          DateTime  @updatedAt

  @@map("ordem_servico")
}

enum Status {
  aberto
  em_andamento
  finalizado
}
```

## 📅 Formato de Datas

### Recebimento (API aceita ambos)
- **Formato Brasileiro**: `DD/MM/YYYY` → `15/01/2026`
- **Formato ISO**: `YYYY-MM-DD` → `2026-01-15`

### Resposta (API sempre retorna)
- **Formato Brasileiro**: `DD/MM/YYYY` → `15/01/2026`

### Conversão Automática
O backend converte automaticamente entre os formatos usando `utils/dateFormatter.ts`.

## 🔒 Validação de Dados

### Schema Zod (ordemServicoSchema.ts)

```typescript
export const createOrdemServicoSchema = z.object({
  numero_os: z.number().int().positive(),
  solicitante: z.string().min(3).max(255),
  ubs: z.string().min(1).max(255),
  setor: z.string().min(1).max(255),
  descricao_problema: z.string().min(10),
  data_abertura: z.string(), // Validado por regex DD/MM/YYYY
  servico_realizado: z.string().optional(),
  status: z.enum(['aberto', 'em_andamento', 'finalizado']),
  data_fechamento: z.string().optional(),
});
```

### Middleware de Validação

```typescript
export const validateSchema = (schema: z.ZodType<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: error.errors,
        });
      }
      next(error);
    }
  };
};
```

## 🧪 Testando a API

### Usando arquivos .http

O projeto inclui arquivos com exemplos de requisições:

**exemplos-requisicoes.http** - Exemplos de uso básico
**exemplos-validacao.http** - Exemplos de validação

Use extensões como:
- REST Client (VS Code)
- HTTP Client (IntelliJ)

### Usando cURL

```bash
# Listar todas as ordens
curl http://localhost:3000/api/ordens-servico

# Criar nova ordem
curl -X POST http://localhost:3000/api/ordens-servico \
  -H "Content-Type: application/json" \
  -d '{
    "numero_os": 1003,
    "solicitante": "Pedro Oliveira",
    "ubs": "UBS Sul",
    "setor": "TI",
    "descricao_problema": "Rede sem internet",
    "data_abertura": "16/01/2026",
    "status": "aberto"
  }'
```

### Usando Postman/Insomnia

Importe a collection ou use os exemplos dos arquivos `.http`.

## 🚀 Deploy em Produção

### Build

```bash
npm run build
```

Gera os arquivos JavaScript na pasta `dist/`.

### Executar

```bash
npm start
```

### Considerações de Produção

1. **Variáveis de Ambiente**: Configure `.env` de produção
2. **Banco de Dados**: Use credenciais seguras
3. **CORS**: Restrinja origens permitidas
4. **Logs**: Implemente sistema de logs
5. **Monitoramento**: Use ferramentas como PM2
6. **SSL/HTTPS**: Configure certificados SSL
7. **Rate Limiting**: Implemente limitação de requisições

## 📖 Documentação Adicional

- **TYPESCRIPT.md** - Guia completo de TypeScript no projeto
- **VALIDACAO.md** - Documentação detalhada de validações
- **exemplos-requisicoes.http** - Exemplos práticos de uso da API
- **exemplos-validacao.http** - Exemplos de validação e erros

## 🐛 Tratamento de Erros

A API retorna erros padronizados:

```json
{
  "error": "Mensagem de erro amigável",
  "details": [] // Detalhes adicionais quando aplicável
}
```

**Códigos HTTP:**
- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Dados inválidos
- `404` - Não encontrado
- `500` - Erro interno do servidor

## 📄 Licença

Este projeto é de uso interno.

## 👥 Suporte

Para dúvidas ou problemas, entre em contato com a equipe de desenvolvimento.
