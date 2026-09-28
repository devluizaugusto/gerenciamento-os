# Recuperação de senha por link local

A tela de login possui **Esqueceu sua senha?**. O sistema gera um link temporário local, válido por 15 minutos e de uso único. Não depende de SMTP.

## Após extrair o projeto

Backend:
```powershell
cd backend
npm install
npm run prisma:generate
npm run prisma:push
npm run reset-admin
npm run dev
```

Frontend (outro terminal):
```powershell
cd frontend
npm install
npm run dev
```

## Como funciona
1. Clique em **Esqueceu sua senha?**.
2. Informe o e-mail cadastrado.
3. O sistema mostra um link local válido por 15 minutos.
4. Copie o link e abra no navegador ou envie ao usuário.
5. Defina a nova senha.

O token é armazenado apenas como hash no banco e é invalidado após o uso.
