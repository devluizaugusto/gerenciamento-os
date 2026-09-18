import { Router } from 'express';
import {
  login,
  me,
  listarUsuarios,
  criarUsuario,
  atualizarUsuario,
  deletarUsuario,
  alterarSenha,
} from '../controllers/authController';
import { autenticar, autorizar, autorizarProprioOuAdmin } from '../middlewares/authMiddleware';

const router = Router();

// ─── Rotas públicas ───────────────────────────────────────────
router.post('/login', login);

// ─── Rotas autenticadas ───────────────────────────────────────
router.get('/me', autenticar, me);
router.put('/alterar-senha', autenticar, alterarSenha);

// ─── Rotas para admin e o próprio usuário ─────────────────────
router.put('/:id', autenticar, autorizarProprioOuAdmin, atualizarUsuario);

// ─── Rotas exclusivas para admin ─────────────────────────────
router.get('/', autenticar, autorizar('admin'), listarUsuarios);
router.post('/', autenticar, autorizar('admin'), criarUsuario);
router.delete('/:id', autenticar, autorizar('admin'), deletarUsuario);

export default router;
