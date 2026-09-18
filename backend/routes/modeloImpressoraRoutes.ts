import express from 'express';
import {
  getAllModelos,
  getModeloById,
  createModelo,
  updateModelo,
  deleteModelo,
} from '../controllers/modeloImpressoraController';
import { autorizar } from '../middlewares/authMiddleware';

const router = express.Router();

// ─── Leitura: todos os perfis autenticados ────────────────────────────────
router.get('/', getAllModelos);
router.get('/:id', getModeloById);

// ─── Escrita e exclusão: somente admin ───────────────────────────────────
router.post('/', autorizar('admin'), createModelo);
router.put('/:id', autorizar('admin'), updateModelo);
router.delete('/:id', autorizar('admin'), deleteModelo);

export default router;
