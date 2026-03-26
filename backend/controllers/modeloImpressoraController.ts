import { Request, Response } from 'express';
import prisma from '../config/prisma';

// ─────────────────────────────────────────────
// MODELOS DE IMPRESSORA
// ─────────────────────────────────────────────

/**
 * GET /api/modelos-impressora
 * Lista todos os modelos de impressora cadastrados
 */
export const getAllModelos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ativo } = req.query as { ativo?: string };
    const where: any = {};
    if (ativo !== undefined) {
      where.ativo = ativo === 'true';
    }

    const modelos = await prisma.modeloImpressoraCadastro.findMany({
      where,
      orderBy: { nome: 'asc' },
      include: {
        _count: {
          select: { estoques: true },
        },
      },
    });

    res.json(modelos);
  } catch (error) {
    console.error('Erro ao buscar modelos de impressora:', error);
    res.status(500).json({ error: 'Erro ao buscar modelos de impressora' });
  }
};

/**
 * GET /api/modelos-impressora/:id
 * Busca um modelo de impressora pelo ID
 */
export const getModeloById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };

    const modelo = await prisma.modeloImpressoraCadastro.findUnique({
      where: { id: Number(id) },
      include: {
        estoques: {
          select: {
            id: true,
            cor_tinta: true,
            codigo_tinta: true,
            quantidade_atual: true,
            quantidade_minima: true,
          },
        },
        _count: {
          select: { estoques: true },
        },
      },
    });

    if (!modelo) {
      res.status(404).json({ error: 'Modelo de impressora não encontrado' });
      return;
    }

    res.json(modelo);
  } catch (error) {
    console.error('Erro ao buscar modelo de impressora:', error);
    res.status(500).json({ error: 'Erro ao buscar modelo de impressora' });
  }
};

/**
 * POST /api/modelos-impressora
 * Cadastra um novo modelo de impressora
 */
export const createModelo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nome, descricao } = req.body;

    if (!nome || !nome.trim()) {
      res.status(400).json({ error: 'Nome do modelo é obrigatório' });
      return;
    }

    const modelo = await prisma.modeloImpressoraCadastro.create({
      data: {
        nome: nome.trim(),
        descricao: descricao?.trim() || null,
        ativo: true,
      },
    });

    res.status(201).json(modelo);
  } catch (error: any) {
    console.error('Erro ao criar modelo de impressora:', error);
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'Já existe um modelo com este nome.' });
      return;
    }
    res.status(500).json({ error: 'Erro ao criar modelo de impressora' });
  }
};

/**
 * PUT /api/modelos-impressora/:id
 * Atualiza um modelo de impressora.
 *
 * Quando o nome é alterado, o banco propaga automaticamente para estoque_tinta
 * via ON UPDATE CASCADE (FK estoque_tinta_modelo_impressora_fkey).
 * Portanto NÃO é necessário (nem seguro) fazer updateMany manual nos estoques.
 */
export const updateModelo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const { nome, descricao, ativo } = req.body;

    const existing = await prisma.modeloImpressoraCadastro.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      res.status(404).json({ error: 'Modelo de impressora não encontrado' });
      return;
    }

    // Atualiza o modelo diretamente.
    // Se o nome mudar, o ON UPDATE CASCADE da FK cuida de propagar para estoque_tinta.
    const updated = await prisma.modeloImpressoraCadastro.update({
      where: { id: Number(id) },
      data: {
        ...(nome !== undefined && { nome: nome.trim() }),
        ...(descricao !== undefined && { descricao: descricao?.trim() || null }),
        ...(ativo !== undefined && { ativo: Boolean(ativo) }),
      },
    });

    res.json(updated);
  } catch (error: any) {
    console.error('Erro ao atualizar modelo de impressora:', error);
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'Já existe um modelo com este nome.' });
      return;
    }
    res.status(500).json({ error: 'Erro ao atualizar modelo de impressora' });
  }
};

/**
 * DELETE /api/modelos-impressora/:id
 * Remove um modelo de impressora.
 *
 * A FK com ON DELETE RESTRICT no banco impede a exclusão quando há estoques associados.
 * A verificação prévia via _count garante uma mensagem de erro clara ao usuário.
 */
export const deleteModelo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };

    const existing = await prisma.modeloImpressoraCadastro.findUnique({
      where: { id: Number(id) },
      include: {
        _count: { select: { estoques: true } },
      },
    });

    if (!existing) {
      res.status(404).json({ error: 'Modelo de impressora não encontrado' });
      return;
    }

    if (existing._count.estoques > 0) {
      res.status(409).json({
        error: `Não é possível remover este modelo pois há ${existing._count.estoques} tinta(s) associada(s). Remova as tintas primeiro ou desative o modelo.`,
      });
      return;
    }

    await prisma.modeloImpressoraCadastro.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (error: any) {
    console.error('Erro ao deletar modelo de impressora:', error);
    // P2003: FK constraint violation (segurança extra caso _count falhe)
    if (error.code === 'P2003') {
      res.status(409).json({
        error: 'Não é possível remover este modelo pois há tintas associadas. Remova as tintas primeiro ou desative o modelo.',
      });
      return;
    }
    res.status(500).json({ error: 'Erro ao deletar modelo de impressora' });
  }
};
