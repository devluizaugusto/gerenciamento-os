# Correções desta versão

- O link de recuperação agora é clicável e abre diretamente a página de redefinição na mesma aba.
- A sessão de login agora usa `sessionStorage`: ao abrir uma nova sessão/aba do sistema, a tela começa no login; ao atualizar a página durante a mesma sessão, o login permanece.
- O token de recuperação continua válido por 15 minutos e é de uso único.


### Logout automático por inatividade

A sessão é encerrada automaticamente após **30 minutos sem interação**. Movimento/uso do mouse, teclado, toque, rolagem ou clique reinicia o contador. Para alterar o tempo, defina no frontend um `VITE_SESSION_IDLE_MINUTES` com a quantidade de minutos desejada.
