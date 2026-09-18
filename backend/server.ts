import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import ordemServicoRoutes from './routes/ordemServicoRoutes';
import tintaRoutes from './routes/tintaRoutes';
import modeloImpressoraRoutes from './routes/modeloImpressoraRoutes';
import trocaComputadorRoutes from './routes/trocaComputadorRoutes';
import authRoutes from './routes/authRoutes';
import { autenticar } from './middlewares/authMiddleware';
import { seedAdmin } from './controllers/authController';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Rota de health check ─────────────────────────────────────────────────
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'API do Sistema de Ordem de Serviços',
    version: '3.0.0',
    endpoints: {
      auth: '/api/auth',
      ordensServico: '/api/ordens-servico',
      tintas: '/api/tintas',
      modelosImpressora: '/api/modelos-impressora',
      trocasComputador: '/api/trocas-computador',
    },
  });
});

// ─── Rotas de autenticação (pública: login) ───────────────────────────────
app.use('/api/auth', authRoutes);

// ─── Rotas protegidas — exigem autenticação ───────────────────────────────
// Admin e Técnico podem criar/editar/deletar OS
app.use('/api/ordens-servico', autenticar, ordemServicoRoutes);

// Admin e Técnico podem gerenciar tintas; Visualizador só lê
app.use('/api/tintas', autenticar, tintaRoutes);

// Modelos de impressora — somente admin gerencia
app.use('/api/modelos-impressora', autenticar, modeloImpressoraRoutes);

// Trocas de computador — admin e técnico
app.use('/api/trocas-computador', autenticar, trocaComputadorRoutes);

// ─── Error handler ────────────────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Erro:', err);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: err.message,
  });
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// ─── Inicialização ────────────────────────────────────────────────────────
app.listen(Number(PORT), HOST, async () => {
  console.log(`🚀 Servidor rodando em todas as interfaces (0.0.0.0:${PORT})`);
  console.log(`📍 Local: http://localhost:${PORT}`);
  // Cria o usuário admin padrão se não existir nenhum usuário
  await seedAdmin();
});
