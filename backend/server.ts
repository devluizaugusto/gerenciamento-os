import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import ordemServicoRoutes from './routes/ordemServicoRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota de teste
app.get('/', (_req: Request, res: Response) => {
  res.json({ 
    message: 'API do Sistema de Ordem de Serviços',
    version: '2.1.3',
    endpoints: {
      ordensServico: '/api/ordens-servico'
    }
  });
});

app.use('/api/ordens-servico', ordemServicoRoutes);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Erro:', err);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: err.message 
  });
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

app.listen(Number(PORT), HOST, () => {
  console.log(`🚀 Servidor rodando em todas as interfaces (0.0.0.0:${PORT})`);
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`📍 Rede:  http://172.16.1.155:${PORT}`);
});
