import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UsuarioPayload, RoleUsuario } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'helpdesk_ti_secret_2026';

/**
 * Verifica o token JWT e injeta o usuário na requisição.
 */
export const autenticar = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token de autenticação não fornecido' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET) as UsuarioPayload;
    req.usuario = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado. Faça login novamente.' });
  }
};

/**
 * Verifica se o usuário tem pelo menos um dos roles permitidos.
 * Uso: autorizar('admin') ou autorizar('admin', 'tecnico')
 */
export const autorizar = (...rolesPermitidos: RoleUsuario[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.usuario) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    if (!rolesPermitidos.includes(req.usuario.role)) {
      res.status(403).json({
        error: 'Acesso negado',
        message: `Esta ação requer permissão: ${rolesPermitidos.join(' ou ')}. Seu perfil: ${req.usuario.role}`,
      });
      return;
    }

    next();
  };
};

/**
 * Permite apenas admin ou o próprio usuário acessar o recurso.
 */
export const autorizarProprioOuAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.usuario) {
    res.status(401).json({ error: 'Não autenticado' });
    return;
  }

  const idParam = parseInt(String(req.params.id), 10);
  if (req.usuario.role === 'admin' || req.usuario.id === idParam) {
    next();
    return;
  }

  res.status(403).json({ error: 'Acesso negado. Você só pode modificar seu próprio perfil.' });
};
