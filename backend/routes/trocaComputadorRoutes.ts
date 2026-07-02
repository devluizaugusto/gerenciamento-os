import express from 'express';
import {
  getAllTrocasComputador,
  getTrocaComputadorById,
  createTrocaComputador,
  updateTrocaComputador,
  deleteTrocaComputador,
} from '../controllers/trocaComputadorController';
import { validateSchema } from '../middlewares/validateSchema';
import {
  createTrocaComputadorSchema,
  updateTrocaComputadorSchema,
  idParamSchema,
} from '../schemas/trocaComputadorSchema';

const router = express.Router();

router.get('/', getAllTrocasComputador);
router.get('/:id', validateSchema(idParamSchema), getTrocaComputadorById);
router.post('/', validateSchema(createTrocaComputadorSchema), createTrocaComputador);
router.put('/:id', validateSchema(updateTrocaComputadorSchema), updateTrocaComputador);
router.delete('/:id', validateSchema(idParamSchema), deleteTrocaComputador);

export default router;
