# Validação com Zod no Backend

Este projeto utiliza [Zod](https://zod.dev/) para validação de dados de forma robusta e type-safe.

## 📋 Estrutura

### 1. Schemas (`/schemas`)
Contém os schemas de validação usando Zod. Cada schema define:
- **Campos obrigatórios e opcionais**
- **Tipos de dados esperados**
- **Validações customizadas** (formato de data, tamanho de texto, etc.)
- **Mensagens de erro personalizadas**

Exemplo:
```javascript
const createOrdemServicoSchema = z.object({
  body: z.object({
    solicitante: z
      .string({
        required_error: 'Campo obrigatório: solicitante',
      })
      .min(1, 'Solicitante não pode estar vazio')
      .trim()
  })
});
```

### 2. Middleware (`/middlewares/validateSchema.js`)
Middleware que:
- Intercepta as requisições antes de chegar aos controllers
- Valida os dados usando os schemas Zod
- Retorna erros formatados se a validação falhar
- Passa a requisição adiante se os dados estiverem válidos

### 3. Rotas (`/routes`)
As rotas aplicam o middleware de validação antes dos controllers:

```javascript
router.post('/', 
  validateSchema(createOrdemServicoSchema), 
  createOrdemServico
);
```

### 4. Controllers (`/controllers`)
Os controllers agora podem confiar que os dados já foram validados:
- ✅ Sem validações manuais repetitivas
- ✅ Código mais limpo e focado na lógica de negócio
- ✅ Menos propenso a erros

## 🎯 Benefícios

1. **Validação Centralizada**: Todas as validações em um único lugar
2. **Código Limpo**: Controllers sem validações manuais
3. **Mensagens Consistentes**: Erros formatados de forma padronizada
4. **Type-Safe**: Validação robusta com inferência de tipos
5. **Fácil Manutenção**: Alterar validações em um único local

## 📝 Schemas Disponíveis

- **createOrdemServicoSchema**: Validação para criar OS
- **updateOrdemServicoSchema**: Validação para atualizar OS
- **idParamSchema**: Validação de ID nos parâmetros
- **numeroParamSchema**: Validação de número da OS
- **statusParamSchema**: Validação de status
- **relatorioQuerySchema**: Validação de filtros do relatório

## 🔍 Formato de Erro

Quando a validação falha, a API retorna:

```json
{
  "error": "Erro de validação",
  "detalhes": [
    {
      "campo": "body.solicitante",
      "mensagem": "Campo obrigatório: solicitante"
    }
  ]
}
```

## 🚀 Como Adicionar Novas Validações

1. Criar/editar schema em `/schemas/ordemServicoSchema.js`
2. Aplicar o middleware na rota correspondente
3. Pronto! O controller receberá dados validados

Exemplo:
```javascript
// 1. Criar schema
const novoSchema = z.object({
  body: z.object({
    campo: z.string().min(5)
  })
});

// 2. Aplicar na rota
router.post('/rota', validateSchema(novoSchema), controller);

// 3. Controller recebe dados validados ✅
```
