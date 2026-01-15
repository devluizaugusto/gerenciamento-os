import express from 'express';
import {
  getAllOrdensServico,
  getOrdemServicoById,
  getOrdemServicoByNumero,
  createOrdemServico,
  updateOrdemServico,
  deleteOrdemServico,
  getOrdensServicoByStatus
} from '../controllers/ordemServicoController';
import {
  generateOrdemServicoPDF,
  generateRelatorioPDF
} from '../controllers/pdfController';
import { validateSchema } from '../middlewares/validateSchema';
import {
  createOrdemServicoSchema,
  updateOrdemServicoSchema,
  idParamSchema,
  numeroParamSchema,
  statusParamSchema,
  relatorioQuerySchema
} from '../schemas/ordemServicoSchema';

const router = express.Router();

// Rotas - Importante: rotas específicas devem vir antes das genéricas
router.get('/pdf/relatorio/geral', validateSchema(relatorioQuerySchema), generateRelatorioPDF);
router.get('/pdf/:id', validateSchema(idParamSchema), generateOrdemServicoPDF);
router.get('/', getAllOrdensServico);
router.get('/status/:status', validateSchema(statusParamSchema), getOrdensServicoByStatus);
router.get('/numero/:numero', validateSchema(numeroParamSchema), getOrdemServicoByNumero);
router.get('/:id', validateSchema(idParamSchema), getOrdemServicoById);
router.post('/', validateSchema(createOrdemServicoSchema), createOrdemServico);
router.put('/:id', validateSchema(updateOrdemServicoSchema), updateOrdemServico);
router.delete('/:id', validateSchema(idParamSchema), deleteOrdemServico);

export default router;
