import express from 'express';
import {
  getAllModelos,
  getModeloById,
  createModelo,
  updateModelo,
  deleteModelo,
} from '../controllers/modeloImpressoraController';

const router = express.Router();

// ─── Modelos de Impressora ─────────────────────
router.get('/', getAllModelos);
router.get('/:id', getModeloById);
router.post('/', createModelo);
router.put('/:id', updateModelo);
router.delete('/:id', deleteModelo);

export default router;
