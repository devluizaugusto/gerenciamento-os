# Frontend - Sistema de Ordem de Serviços

Interface web moderna e responsiva para gerenciamento de ordens de serviço, desenvolvida com React e Vite.

## 🎨 Funcionalidades

- ✅ Listagem de todas as ordens de serviço
- ✅ Criação de novas ordens de serviço
- ✅ Edição de ordens de serviço existentes
- ✅ Exclusão de ordens de serviço
- ✅ Visualização detalhada de cada OS
- ✅ Filtros por status (Aberto, Em Andamento, Finalizado)
- ✅ Busca por número, solicitante, UBS, setor ou problema
- ✅ Cores indicativas de status:
  - 🔴 **Vermelho** - Aberto
  - 🟡 **Amarelo** - Em Andamento
  - 🟢 **Verde** - Finalizado
- ✅ Datas formatadas no padrão brasileiro (DD/MM/YYYY)
- ✅ Interface responsiva para desktop, tablet e mobile
- ✅ Design moderno e intuitivo

## 🚀 Instalação

1. Instale as dependências:
```bash
npm install
```

2. Certifique-se de que o backend está rodando em `http://localhost:3000`

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

4. Acesse no navegador: `http://localhost:5173`

## 📦 Build para Produção

```bash
npm run build
```

Os arquivos otimizados serão gerados na pasta `dist/`.

Para visualizar o build de produção:

```bash
npm run preview
```

## 🏗️ Estrutura do Projeto

```
frontend/
├── public/                 # Arquivos estáticos
├── src/
│   ├── components/         # Componentes React
│   │   ├── Modal.jsx
│   │   ├── OrdemServicoCard.jsx
│   │   ├── OrdemServicoDetails.jsx
│   │   └── OrdemServicoForm.jsx
│   ├── services/           # Serviços de API
│   │   └── api.js
│   ├── utils/              # Utilitários
│   │   └── statusColors.js
│   ├── App.jsx             # Componente principal
│   ├── App.css             # Estilos principais
│   ├── index.css           # Estilos globais
│   └── main.jsx            # Ponto de entrada
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 🎯 Uso

### Criar Nova OS

1. Clique no botão **"+ Nova OS"** no cabeçalho
2. Preencha os campos obrigatórios (marcados com *)
3. Clique em **"Criar OS"**

### Editar OS

1. Clique no botão **"Editar"** no card da OS
2. Modifique os campos desejados
3. Clique em **"Atualizar OS"**

### Visualizar Detalhes

1. Clique no botão **"Ver Detalhes"** no card da OS
2. Uma modal será aberta com todas as informações

### Filtrar por Status

Use os botões de filtro acima da lista:
- **Todos** - Mostra todas as OS
- **Aberto** - Mostra apenas OS abertas (vermelho)
- **Em Andamento** - Mostra apenas OS em andamento (amarelo)
- **Finalizado** - Mostra apenas OS finalizadas (verde)

### Buscar

Use o campo de busca para encontrar OS por:
- Número da OS
- Nome do solicitante
- UBS
- Setor
- Descrição do problema

## 🛠️ Tecnologias

- **React 18** - Biblioteca JavaScript para interfaces
- **Vite** - Build tool e servidor de desenvolvimento
- **Axios** - Cliente HTTP para comunicação com a API
- **CSS3** - Estilização moderna com variáveis CSS e Grid/Flexbox

## ⚙️ Configuração

O frontend está configurado para se comunicar com o backend em `http://localhost:3000`. Para alterar isso, edite o arquivo `src/services/api.js`:

```javascript
const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Altere aqui
  // ...
});
```

Ou configure um proxy no `vite.config.js` (já configurado).

## 🎨 Personalização

As cores e estilos podem ser personalizados editando as variáveis CSS em `src/index.css`:

```css
:root {
  --primary-color: #2563eb;
  --success-color: #28a745;
  --warning-color: #ffc107;
  --danger-color: #dc3545;
  /* ... */
}
```

## 📱 Responsividade

A interface é totalmente responsiva e se adapta a:
- **Desktop** - Layout em grid com múltiplas colunas
- **Tablet** - Layout adaptado com 1-2 colunas
- **Mobile** - Layout em coluna única otimizado para toque
