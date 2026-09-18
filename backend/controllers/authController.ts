import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';
import { RoleUsuario } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'helpdesk_ti_secret_2026';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '12h';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  tecnico: 'Técnico',
  visualizador: 'Visualizador',
};

/* ─── Login ──────────────────────────────────────────────────────────────── */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
      return;
    }

    const usuario = await prisma.usuario.findUnique({ where: { email: String(email).toLowerCase().trim() } });

    if (!usuario || !usuario.ativo) {
      res.status(401).json({ error: 'Credenciais inválidas ou usuário inativo' });
      return;
    }

    const senhaValida = await bcrypt.compare(String(senha), usuario.senha_hash);
    if (!senhaValida) {
      res.status(401).json({ error: 'Credenciais inválidas' });
      return;
    }

    // Atualiza último login
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { ultimo_login: new Date() },
    });

    const payload = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role as RoleUsuario,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES } as any);

    res.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
        role_label: ROLE_LABELS[usuario.role] ?? usuario.role,
      },
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

/* ─── Me (dados do usuário logado) ──────────────────────────────────────── */
export const me = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.usuario) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuario.id },
      select: { id: true, nome: true, email: true, role: true, ativo: true, ultimo_login: true, created_at: true },
    });

    if (!usuario || !usuario.ativo) {
      res.status(401).json({ error: 'Usuário não encontrado ou inativo' });
      return;
    }

    res.json({
      ...usuario,
      role_label: ROLE_LABELS[usuario.role] ?? usuario.role,
    });
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

/* ─── Listar usuários (admin only) ──────────────────────────────────────── */
export const listarUsuarios = async (_req: Request, res: Response): Promise<void> => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: { id: true, nome: true, email: true, role: true, ativo: true, ultimo_login: true, created_at: true, updated_at: true },
      orderBy: [{ role: 'asc' }, { nome: 'asc' }],
    });

    res.json(usuarios.map(u => ({ ...u, role_label: ROLE_LABELS[u.role] ?? u.role })));
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
};

/* ─── Criar usuário (admin only) ─────────────────────────────────────────── */
export const criarUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nome, email, senha, role } = req.body;

    if (!nome || !email || !senha) {
      res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios' });
      return;
    }

    const rolesValidas: RoleUsuario[] = ['admin', 'tecnico', 'visualizador'];
    const roleValida: RoleUsuario = rolesValidas.includes(role) ? role : 'tecnico';

    // Validação básica de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'E-mail inválido' });
      return;
    }

    if (String(senha).length < 6) {
      res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres' });
      return;
    }

    const emailNorm = String(email).toLowerCase().trim();
    const existe = await prisma.usuario.findUnique({ where: { email: emailNorm } });
    if (existe) {
      res.status(409).json({ error: 'E-mail já cadastrado' });
      return;
    }

    const senhaHash = await bcrypt.hash(String(senha), 12);

    const novoUsuario = await prisma.usuario.create({
      data: { nome: String(nome).trim(), email: emailNorm, senha_hash: senhaHash, role: roleValida },
      select: { id: true, nome: true, email: true, role: true, ativo: true, created_at: true },
    });

    res.status(201).json({ ...novoUsuario, role_label: ROLE_LABELS[novoUsuario.role] ?? novoUsuario.role });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
};

/* ─── Atualizar usuário ──────────────────────────────────────────────────── */
export const atualizarUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nome, email, senha, role, ativo } = req.body;
    const usuarioLogado = req.usuario!;

    const usuarioExistente = await prisma.usuario.findUnique({ where: { id: parseInt(String(id)) } });
    if (!usuarioExistente) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }

    // Técnico só pode editar seus próprios dados (nome/senha)
    if (usuarioLogado.role !== 'admin' && usuarioLogado.id !== parseInt(String(id))) {
      res.status(403).json({ error: 'Você só pode editar seu próprio perfil' });
      return;
    }

    // Só admin pode mudar role ou ativo
    const updateData: any = {};
    if (nome) updateData.nome = String(nome).trim();
    if (email && usuarioLogado.role === 'admin') updateData.email = String(email).toLowerCase().trim();
    if (senha) {
      if (String(senha).length < 6) {
        res.status(400).json({ error: 'A nova senha deve ter no mínimo 6 caracteres' });
        return;
      }
      updateData.senha_hash = await bcrypt.hash(String(senha), 12);
    }
    if (usuarioLogado.role === 'admin') {
      const rolesValidas: RoleUsuario[] = ['admin', 'tecnico', 'visualizador'];
      if (role && rolesValidas.includes(role)) updateData.role = role;
      if (ativo !== undefined) updateData.ativo = Boolean(ativo);
    }

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ error: 'Nenhum campo para atualizar' });
      return;
    }

    const atualizado = await prisma.usuario.update({
      where: { id: parseInt(String(id)) },
      data: updateData,
      select: { id: true, nome: true, email: true, role: true, ativo: true, updated_at: true },
    });

    res.json({ ...atualizado, role_label: ROLE_LABELS[atualizado.role] ?? atualizado.role });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
};

/* ─── Deletar usuário (admin only) ──────────────────────────────────────── */
export const deletarUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const usuarioLogado = req.usuario!;

    if (usuarioLogado.id === parseInt(String(id))) {
      res.status(400).json({ error: 'Você não pode excluir sua própria conta' });
      return;
    }

    const existente = await prisma.usuario.findUnique({ where: { id: parseInt(String(id)) } });
    if (!existente) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }

    await prisma.usuario.delete({ where: { id: parseInt(String(id)) } });
    res.json({ message: 'Usuário excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ error: 'Erro ao deletar usuário' });
  }
};

/* ─── Alterar senha própria ──────────────────────────────────────────────── */
export const alterarSenha = async (req: Request, res: Response): Promise<void> => {
  try {
    const usuarioLogado = req.usuario!;
    const { senha_atual, nova_senha } = req.body;

    if (!senha_atual || !nova_senha) {
      res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias' });
      return;
    }

    if (String(nova_senha).length < 6) {
      res.status(400).json({ error: 'A nova senha deve ter no mínimo 6 caracteres' });
      return;
    }

    const usuario = await prisma.usuario.findUnique({ where: { id: usuarioLogado.id } });
    if (!usuario) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }

    const senhaValida = await bcrypt.compare(String(senha_atual), usuario.senha_hash);
    if (!senhaValida) {
      res.status(401).json({ error: 'Senha atual incorreta' });
      return;
    }

    const novoHash = await bcrypt.hash(String(nova_senha), 12);
    await prisma.usuario.update({ where: { id: usuarioLogado.id }, data: { senha_hash: novoHash } });

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({ error: 'Erro ao alterar senha' });
  }
};

/* ─── Seed: cria admin inicial se não existir ───────────────────────────── */
export const seedAdmin = async (): Promise<void> => {
  try {
    const count = await prisma.usuario.count();
    if (count === 0) {
      const senhaHash = await bcrypt.hash('admin123', 12);
      await prisma.usuario.create({
        data: {
          nome: 'Administrador',
          email: 'admin@helpdesk.ti',
          senha_hash: senhaHash,
          role: 'admin',
        },
      });
      console.log('✅ Usuário admin criado: admin@helpdesk.ti / admin123');
      console.log('⚠️  ALTERE A SENHA PADRÃO IMEDIATAMENTE!');
    }
  } catch (error) {
    console.error('Erro ao criar admin inicial:', error);
  }
};
