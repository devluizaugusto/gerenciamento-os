# 🔧 Solução do Erro de Conexão

## ❌ Problema Identificado

```
Failed to load resource:
net::ERR_CONNECTION_TIMED_OUT
http://172.16.0.127:3001/api/ordens-servico
```

## 🎯 Causa

O frontend estava configurado com um **IP fixo** (`172.16.0.127`) que:
1. Pode estar incorreto ou desatualizado
2. O backend pode não estar rodando nesse endereço
3. Firewall pode estar bloqueando a conexão

## ✅ Solução Implementada

### 1. **Configuração Dinâmica da API**

**Antes:**
```typescript
const api = axios.create({
  baseURL: 'http://172.16.0.127:3001/api', // ❌ IP fixo
});
```

**Depois:**
```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api', // ✅ Dinâmico
});
```

### 2. **Proxy do Vite Otimizado**

**Antes:**
```javascript
proxy: {
  '/api': {
    target: 'http://172.16.0.127:3001', // ❌ IP fixo
  }
}
```

**Depois:**
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:3001',    // ✅ localhost
    changeOrigin: true,
    secure: false,
  }
}
```

## 🚀 Como Usar

### Em Desenvolvimento (Padrão)

1. **NÃO crie arquivo `.env`** - Usará o proxy automático
2. Certifique-se que o backend está rodando:
   ```bash
   cd backend
   npm run dev
   ```
3. Execute o frontend:
   ```bash
   cd frontend
   npm run dev
   ```

O frontend vai:
- Rodar em `http://localhost:5173`
- Fazer requisições para `/api/*`
- Vite vai redirecionar para `http://localhost:3001/api/*`

### Em Produção ou Desenvolvimento Remoto

1. Crie um arquivo `.env` na pasta `frontend/`:
   ```env
   VITE_API_URL=http://SEU_IP:3001/api
   ```

2. Substitua `SEU_IP` pelo IP correto:
   ```env
   # Exemplo local
   VITE_API_URL=http://localhost:3001/api
   
   # Exemplo rede local
   VITE_API_URL=http://192.168.1.100:3001/api
   
   # Exemplo produção
   VITE_API_URL=https://api.seudominio.com/api
   ```

3. Reinicie o frontend para aplicar as mudanças

## 📋 Checklist de Troubleshooting

### ✅ Verificar se o Backend está Rodando

```bash
cd backend
npm run dev
```

Deve mostrar:
```
🚀 Servidor rodando na porta 3001
📍 API disponível em http://localhost:3001/api/ordens-servico
```

### ✅ Testar Backend Diretamente

Abra no navegador ou use curl:
```bash
curl http://localhost:3001/api/ordens-servico
```

Deve retornar JSON com as ordens de serviço.

### ✅ Verificar Porta em Uso

Windows:
```powershell
netstat -ano | findstr :3001
```

Linux/Mac:
```bash
lsof -i :3001
```

### ✅ Verificar Firewall

Se estiver usando IP da rede local, certifique-se que:
- Firewall do Windows permite conexões na porta 3001
- Antivírus não está bloqueando

## 🔍 Logs Úteis

### Backend
```bash
cd backend
npm run dev
# Observe se há erros de conexão com banco de dados
```

### Frontend (Console do Navegador)
```
F12 > Console
# Observe se há erros de CORS ou conexão
```

## 🎯 Vantagens da Nova Configuração

1. ✅ **Desenvolvimento mais simples** - Funciona com localhost automaticamente
2. ✅ **Flexível** - Pode configurar para qualquer IP/domínio via `.env`
3. ✅ **Sem CORS** - Proxy do Vite resolve problemas de CORS
4. ✅ **Production-ready** - Pronto para deploy

## 📝 Arquivos Modificados

- ✅ `frontend/src/services/api.ts` - Configuração dinâmica
- ✅ `frontend/vite.config.js` - Proxy otimizado
- ✅ `frontend/.env.example` - Exemplo de configuração

## 🔄 Próximos Passos

1. **Reinicie o backend**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Reinicie o frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Acesse**: `http://localhost:5173`

4. **Verifique**: Console do navegador não deve ter erros de conexão

---

**Status**: ✅ **Configuração Corrigida e Otimizada**
