import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ordemServicoRoutes from './routes/ordemServicoRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota de teste
app.get('/', (_req: Request, res: Response) => {
  res.json({ 
    message: 'API do Sistema de Ordem de Serviços',
    version: '1.0.0',
    endpoints: {
      ordensServico: '/api/ordens-servico'
    }
  });
});

// Rotas da API
app.use('/api/ordens-servico', ordemServicoRoutes);

// Middleware de tratamento de erros
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Erro:', err);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: err.message 
  });
});

// Middleware para rotas não encontradas
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 API disponível em http://localhost:${PORT}/api/ordens-servico`);
});
