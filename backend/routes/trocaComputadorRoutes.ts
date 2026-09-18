import express from 'express';
import {
  getAllTrocasComputador,
  getTrocaComputadorById,
  createTrocaComputador,
  updateTrocaComputador,
  deleteTrocaComputador,
} from '../controllers/trocaComputadorController';
import { validateSchema } from '../middlewares/validateSchema';
import { autorizar } from '../middlewares/authMiddleware';
import {
  createTrocaComputadorSchema,
  updateTrocaComputadorSchema,
  idParamSchema,
} from '../schemas/trocaComputadorSchema';

const router = express.Router();

// ─── Leitura: todos os perfis autenticados ────────────────────────────────
router.get('/', getAllTrocasComputador);
router.get('/:id', validateSchema(idParamSchema), getTrocaComputadorById);

// ─── Escrita: admin e técnico ─────────────────────────────────────────────
router.post('/',
  autorizar('admin', 'tecnico'),
  validateSchema(createTrocaComputadorSchema),
  createTrocaComputador
);
router.put('/:id',
  autorizar('admin', 'tecnico'),
  validateSchema(updateTrocaComputadorSchema),
  updateTrocaComputador
);

// ─── Exclusão: somente admin ──────────────────────────────────────────────
router.delete('/:id',
  autorizar('admin'),
  validateSchema(idParamSchema),
  deleteTrocaComputador
);

export default router;
