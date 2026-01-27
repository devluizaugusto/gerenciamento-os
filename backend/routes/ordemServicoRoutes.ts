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
import {
  createServiceOrderSchema,
  updateServiceOrderSchema,
  idParamSchema,
  orderNumberParamSchema,
  statusParamSchema,
  reportQuerySchema
} from '../schemas/ordemServicoSchema';

const router = express.Router();

// Routes - Important: specific routes must come before generic ones
router.get('/pdf/relatorio/geral', validateSchema(reportQuerySchema), generateReportPDF);
router.get('/pdf/:id', validateSchema(idParamSchema), generateServiceOrderPDF);
router.get('/', getAllServiceOrders);
router.get('/status/:status', validateSchema(statusParamSchema), getServiceOrdersByStatus);
router.get('/numero/:numero', validateSchema(orderNumberParamSchema), getServiceOrderByNumber);
router.get('/:id', validateSchema(idParamSchema), getServiceOrderById);
router.post('/', validateSchema(createServiceOrderSchema), createServiceOrder);
router.put('/:id', validateSchema(updateServiceOrderSchema), updateServiceOrder);
router.delete('/:id', validateSchema(idParamSchema), deleteServiceOrder);

export default router;
