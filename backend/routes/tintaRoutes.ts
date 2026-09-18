import express from 'express';
import {
  getAllEstoque,
  getEstoqueById,
  createEstoque,
  updateEstoque,
  deleteEstoque,
  getAllSaidas,
  createSaida,
  updateSaida,
  deleteSaida,
  estornarSaida,
} from '../controllers/tintaController';
import { validateSchema } from '../middlewares/validateSchema';
import { autorizar } from '../middlewares/authMiddleware';
import {
  createEstoqueTintaSchema,
  updateEstoqueTintaSchema,
  createSaidaTintaSchema,
  updateSaidaTintaSchema,
  idParamTintaSchema,
  historicoQuerySchema,
} from '../schemas/tintaSchema';

const router = express.Router();

// ─── Leitura: todos os perfis autenticados ────────────────────────────────
router.get('/estoque', getAllEstoque);
router.get('/estoque/:id', validateSchema(idParamTintaSchema), getEstoqueById);
router.get('/saidas', validateSchema(historicoQuerySchema), getAllSaidas);

// ─── Saídas (registrar/editar/estornar): admin e técnico ──────────────────
router.post('/saidas',
  autorizar('admin', 'tecnico'),
  validateSchema(createSaidaTintaSchema),
  createSaida
);
router.put('/saidas/:id',
  autorizar('admin', 'tecnico'),
  validateSchema(updateSaidaTintaSchema),
  updateSaida
);
router.patch('/saidas/:id/estorno',
  autorizar('admin', 'tecnico'),
  validateSchema(idParamTintaSchema),
  estornarSaida
);

// ─── Gerenciar estoque (criar/editar): admin e técnico ────────────────────
router.post('/estoque',
  autorizar('admin', 'tecnico'),
  validateSchema(createEstoqueTintaSchema),
  createEstoque
);
router.put('/estoque/:id',
  autorizar('admin', 'tecnico'),
  validateSchema(updateEstoqueTintaSchema),
  updateEstoque
);

// ─── Deletar estoque/saída: somente admin ─────────────────────────────────
router.delete('/estoque/:id',
  autorizar('admin'),
  validateSchema(idParamTintaSchema),
  deleteEstoque
);
router.delete('/saidas/:id',
  autorizar('admin'),
  validateSchema(idParamTintaSchema),
  deleteSaida
);

export default router;
