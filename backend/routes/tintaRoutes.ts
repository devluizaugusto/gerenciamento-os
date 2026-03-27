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
import {
  createEstoqueTintaSchema,
  updateEstoqueTintaSchema,
  createSaidaTintaSchema,
  updateSaidaTintaSchema,
  idParamTintaSchema,
  historicoQuerySchema,
} from '../schemas/tintaSchema';

const router = express.Router();

// ─── Estoque ─────────────────────────────────
router.get('/estoque', getAllEstoque);
router.get('/estoque/:id', validateSchema(idParamTintaSchema), getEstoqueById);
router.post('/estoque', validateSchema(createEstoqueTintaSchema), createEstoque);
router.put('/estoque/:id', validateSchema(updateEstoqueTintaSchema), updateEstoque);
router.delete('/estoque/:id', validateSchema(idParamTintaSchema), deleteEstoque);

// ─── Saídas ──────────────────────────────────
router.get('/saidas', validateSchema(historicoQuerySchema), getAllSaidas);
router.post('/saidas', validateSchema(createSaidaTintaSchema), createSaida);
router.put('/saidas/:id', validateSchema(updateSaidaTintaSchema), updateSaida);
router.delete('/saidas/:id', validateSchema(idParamTintaSchema), deleteSaida);
router.patch('/saidas/:id/estorno', validateSchema(idParamTintaSchema), estornarSaida);

export default router;
