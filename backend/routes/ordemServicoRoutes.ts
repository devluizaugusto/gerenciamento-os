import express from 'express';
import {
  getAllServiceOrders,
  getServiceOrderById,
  getServiceOrderByNumber,
  createServiceOrder,
  updateServiceOrder,
  deleteServiceOrder,
  getServiceOrdersByStatus
} from '../controllers/ordemServicoController';
import {
  generateServiceOrderPDF,
  generateReportPDF
} from '../controllers/pdfController';
import { validateSchema } from '../middlewares/validateSchema';
import { autorizar } from '../middlewares/authMiddleware';
import {
  createServiceOrderSchema,
  updateServiceOrderSchema,
  idParamSchema,
  orderNumberParamSchema,
  statusParamSchema,
  reportQuerySchema
} from '../schemas/ordemServicoSchema';

const router = express.Router();

// ─── Leitura: admin + tecnico + visualizador ──────────────────────────────
router.get('/', getAllServiceOrders);
router.get('/status/:status', validateSchema(statusParamSchema), getServiceOrdersByStatus);
router.get('/numero/:numero', validateSchema(orderNumberParamSchema), getServiceOrderByNumber);
router.get('/:id', validateSchema(idParamSchema), getServiceOrderById);

// ─── PDFs: todos os perfis autenticados podem gerar ───────────────────────
router.get('/pdf/relatorio/geral', validateSchema(reportQuerySchema), generateReportPDF);
router.get('/pdf/:id', validateSchema(idParamSchema), generateServiceOrderPDF);

// ─── Escrita: somente admin e técnico ─────────────────────────────────────
router.post('/',
  autorizar('admin', 'tecnico'),
  validateSchema(createServiceOrderSchema),
  createServiceOrder
);
router.put('/:id',
  autorizar('admin', 'tecnico'),
  validateSchema(updateServiceOrderSchema),
  updateServiceOrder
);

// ─── Exclusão: somente admin ──────────────────────────────────────────────
router.delete('/:id',
  autorizar('admin'),
  validateSchema(idParamSchema),
  deleteServiceOrder
);

export default router;
