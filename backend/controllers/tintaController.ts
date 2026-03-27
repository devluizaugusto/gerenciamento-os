import { Request, Response } from 'express';
import prisma from '../config/prisma';

// ─────────────────────────────────────────────
// ESTOQUE
// ─────────────────────────────────────────────

/**
 * GET /api/tintas/estoque
 * Lista todo o estoque de tintas com saldo atual
 */
export const getAllEstoque = async (_req: Request, res: Response): Promise<void> => {
  try {
    const estoques = await prisma.estoqueTinta.findMany({
      orderBy: [{ modelo_impressora: 'asc' }, { cor_tinta: 'asc' }],
      include: {
        saidas: {
          orderBy: { data_saida: 'desc' },
          take: 5,
          select: {
            id: true,
            quantidade: true,
            setor: true,
            responsavel: true,
            data_saida: true,
            observacao: true,
          },
        },
        _count: {
          select: { saidas: true },
        },
      },
    });
    res.json(estoques);
  } catch (error) {
    console.error('Erro ao buscar estoque de tintas:', error);
    res.status(500).json({ error: 'Erro ao buscar estoque de tintas' });
  }
};

/**
 * GET /api/tintas/estoque/:id
 * Busca um item de estoque pelo ID
 */
export const getEstoqueById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: number | string };
    const estoque = await prisma.estoqueTinta.findUnique({
      where: { id: Number(id) },
      include: {
        saidas: {
          orderBy: { data_saida: 'desc' },
        },
      },
    });

    if (!estoque) {
      res.status(404).json({ error: 'Estoque de tinta não encontrado' });
      return;
    }

    res.json(estoque);
  } catch (error) {
    console.error('Erro ao buscar estoque de tinta:', error);
    res.status(500).json({ error: 'Erro ao buscar estoque de tinta' });
  }
};

/**
 * POST /api/tintas/estoque
 * Cadastra um novo item de estoque
 */
export const createEstoque = async (req: Request, res: Response): Promise<void> => {
  try {
    const { modelo_impressora, cor_tinta, codigo_tinta, quantidade_atual, quantidade_minima } =
      req.body;

    // Verificar duplicata


    const estoque = await prisma.estoqueTinta.create({
      data: {
        modelo_impressora,
        cor_tinta,
        codigo_tinta,
        quantidade_atual: Number(quantidade_atual),
        quantidade_minima: quantidade_minima !== undefined ? Number(quantidade_minima) : 2,
      },
    });

    res.status(201).json(estoque);
  } catch (error: any) {
    console.error('Erro ao criar estoque de tinta:', error);
    if (error.code === 'P2002') {
      res.status(409).json({
        error: 'Já existe um registro com este modelo e código de tinta.',
      });
      return;
    }
    res.status(500).json({ error: 'Erro ao criar estoque de tinta' });
  }
};

/**
 * PUT /api/tintas/estoque/:id
 * Atualiza dados de um item de estoque (entrada de tinta / ajuste)
 */
export const updateEstoque = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: number | string };
    const { modelo_impressora, cor_tinta, codigo_tinta, quantidade_atual, quantidade_minima } =
      req.body;

    const existing = await prisma.estoqueTinta.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      res.status(404).json({ error: 'Estoque de tinta não encontrado' });
      return;
    }

    const updated = await prisma.estoqueTinta.update({
      where: { id: Number(id) },
      data: {
        ...(modelo_impressora !== undefined && { modelo_impressora }),
        ...(cor_tinta !== undefined && { cor_tinta }),
        ...(codigo_tinta !== undefined && { codigo_tinta }),
        ...(quantidade_atual !== undefined && { quantidade_atual: Number(quantidade_atual) }),
        ...(quantidade_minima !== undefined && { quantidade_minima: Number(quantidade_minima) }),
      },
    });

    res.json(updated);
  } catch (error: any) {
    console.error('Erro ao atualizar estoque de tinta:', error);
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'Conflito: já existe registro com este modelo e código.' });
      return;
    }
    res.status(500).json({ error: 'Erro ao atualizar estoque de tinta' });
  }
};

/**
 * DELETE /api/tintas/estoque/:id
 * Remove um item de estoque
 */
export const deleteEstoque = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: number | string };

    const existing = await prisma.estoqueTinta.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      res.status(404).json({ error: 'Estoque de tinta não encontrado' });
      return;
    }

    await prisma.estoqueTinta.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar estoque de tinta:', error);
    res.status(500).json({ error: 'Erro ao deletar estoque de tinta' });
  }
};

// ─────────────────────────────────────────────
// SAÍDAS
// ─────────────────────────────────────────────

/**
 * GET /api/tintas/saidas
 * Lista o histórico de saídas com filtros opcionais
 */
export const getAllSaidas = async (req: Request, res: Response): Promise<void> => {
  try {
    const { estoque_id, setor, unidade, dataInicio, dataFim, modelo } = req.query as {
      estoque_id?: string;
      setor?: string;
      unidade?: string;
      dataInicio?: string;
      dataFim?: string;
      modelo?: string;
    };

    const where: any = {};

    if (estoque_id) {
      where.estoque_id = Number(estoque_id);
    }

    if (setor) {
      where.setor = { contains: setor };
    }

    if (unidade) {
      where.unidade = { contains: unidade };
    }

    if (dataInicio || dataFim) {
      where.data_saida = {};
      if (dataInicio) {
        where.data_saida.gte = new Date(dataInicio + 'T00:00:00.000Z');
      }
      if (dataFim) {
        where.data_saida.lte = new Date(dataFim + 'T23:59:59.999Z');
      }
    }

    if (modelo) {
      where.estoque = { modelo_impressora: modelo };
    }

    const saidas = await prisma.saidaTinta.findMany({
      where,
      orderBy: { data_saida: 'desc' },
      include: {
        estoque: {
          select: {
            id: true,
            modelo_impressora: true,
            cor_tinta: true,
            codigo_tinta: true,
            quantidade_atual: true,
          },
        },
      },
    });

    res.json(saidas);
  } catch (error) {
    console.error('Erro ao buscar saídas de tinta:', error);
    res.status(500).json({ error: 'Erro ao buscar saídas de tinta' });
  }
};

/**
 * POST /api/tintas/saidas
 * Registra uma saída de tinta e decrementa o estoque
 */
export const createSaida = async (req: Request, res: Response): Promise<void> => {
  try {
    const { estoque_id, quantidade, unidade, setor, responsavel, observacao, data_saida } = req.body;

    const estoque = await prisma.estoqueTinta.findUnique({ where: { id: Number(estoque_id) } });
    if (!estoque) {
      res.status(404).json({ error: 'Estoque de tinta não encontrado' });
      return;
    }

    if (estoque.quantidade_atual < Number(quantidade)) {
      res.status(400).json({
        error: `Estoque insuficiente. Disponível: ${estoque.quantidade_atual} unidade(s).`,
      });
      return;
    }

    // Transação: cria saída + decrementa estoque
    const [saida] = await prisma.$transaction([
      prisma.saidaTinta.create({
        data: {
          estoque_id: Number(estoque_id),
          quantidade: Number(quantidade),
          unidade,
          setor,
          responsavel,
          observacao: observacao || null,
          data_saida: new Date(data_saida + 'T00:00:00.000Z'),
        },
        include: {
          estoque: true,
        },
      }),
      prisma.estoqueTinta.update({
        where: { id: Number(estoque_id) },
        data: {
          quantidade_atual: {
            decrement: Number(quantidade),
          },
        },
      }),
    ]);

    res.status(201).json(saida);
  } catch (error) {
    console.error('Erro ao registrar saída de tinta:', error);
    res.status(500).json({ error: 'Erro ao registrar saída de tinta' });
  }
};

/**
 * PUT /api/tintas/saidas/:id
 * Edita os dados de uma saída (unidade, setor, responsavel, observacao, data_saida, quantidade)
 * Ajusta o estoque se a quantidade mudar.
 */
export const updateSaida = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: number | string };
    const { quantidade, unidade, setor, responsavel, observacao, data_saida } = req.body;

    const saida = await prisma.saidaTinta.findUnique({ where: { id: Number(id) } });
    if (!saida) {
      res.status(404).json({ error: 'Saída de tinta não encontrada' });
      return;
    }

    const novaQtd = quantidade !== undefined ? Number(quantidade) : saida.quantidade;
    const diffQtd = saida.quantidade - novaQtd; // positivo = estoque aumenta, negativo = diminui

    if (novaQtd < 1) {
      res.status(400).json({ error: 'Quantidade deve ser pelo menos 1' });
      return;
    }

    if (diffQtd < 0) {
      // Verificar se há estoque suficiente para aumentar a saída
      const estoque = await prisma.estoqueTinta.findUnique({ where: { id: saida.estoque_id } });
      if (!estoque || estoque.quantidade_atual < Math.abs(diffQtd)) {
        res.status(400).json({
          error: `Estoque insuficiente para aumentar a saída. Disponível: ${estoque?.quantidade_atual ?? 0}`,
        });
        return;
      }
    }

    const updateData: any = {};
    if (quantidade !== undefined) updateData.quantidade = novaQtd;
    if (unidade !== undefined) updateData.unidade = unidade;
    if (setor !== undefined) updateData.setor = setor;
    if (responsavel !== undefined) updateData.responsavel = responsavel;
    if (observacao !== undefined) updateData.observacao = observacao || null;
    if (data_saida !== undefined) updateData.data_saida = new Date(data_saida + 'T00:00:00.000Z');

    const ops: any[] = [
      prisma.saidaTinta.update({ where: { id: Number(id) }, data: updateData }),
    ];

    if (diffQtd !== 0) {
      ops.push(
        prisma.estoqueTinta.update({
          where: { id: saida.estoque_id },
          data: { quantidade_atual: { increment: diffQtd } },
        })
      );
    }

    const [saidaAtualizada] = await prisma.$transaction(ops);
    res.json(saidaAtualizada);
  } catch (error) {
    console.error('Erro ao atualizar saída de tinta:', error);
    res.status(500).json({ error: 'Erro ao atualizar saída de tinta' });
  }
};

/**
 * DELETE /api/tintas/saidas/:id
 * Cancela/remove uma saída (estorna a quantidade ao estoque)
 */
export const deleteSaida = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: number | string };

    const saida = await prisma.saidaTinta.findUnique({ where: { id: Number(id) } });
    if (!saida) {
      res.status(404).json({ error: 'Saída de tinta não encontrada' });
      return;
    }

    // Transação: remove saída + estorna estoque (quantidade total)
    await prisma.$transaction([
      prisma.saidaTinta.delete({ where: { id: Number(id) } }),
      prisma.estoqueTinta.update({
        where: { id: saida.estoque_id },
        data: {
          quantidade_atual: {
            increment: saida.quantidade,
          },
        },
      }),
    ]);

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao cancelar saída de tinta:', error);
    res.status(500).json({ error: 'Erro ao cancelar saída de tinta' });
  }
};

/**
 * PATCH /api/tintas/saidas/:id/estorno
 * Estorno parcial ou total de uma saída.
 * Body: { quantidade: number }  — deve ser >= 1 e <= saida.quantidade
 * Se quantidade == saida.quantidade → deleta o registro (estorno total)
 * Se quantidade < saida.quantidade → subtrai da saída e devolve ao estoque
 */
export const estornarSaida = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: number | string };
    const { quantidade } = req.body as { quantidade: number };

    if (!quantidade || !Number.isInteger(Number(quantidade)) || Number(quantidade) < 1) {
      res.status(400).json({ error: 'Quantidade para estorno deve ser um número inteiro >= 1' });
      return;
    }

    const saida = await prisma.saidaTinta.findUnique({ where: { id: Number(id) } });
    if (!saida) {
      res.status(404).json({ error: 'Saída de tinta não encontrada' });
      return;
    }

    const qtdEstorno = Number(quantidade);

    if (qtdEstorno > saida.quantidade) {
      res.status(400).json({
        error: `Quantidade para estorno (${qtdEstorno}) não pode ser maior que a quantidade da saída (${saida.quantidade})`,
      });
      return;
    }

    if (qtdEstorno === saida.quantidade) {
      // Estorno total → deleta o registro
      await prisma.$transaction([
        prisma.saidaTinta.delete({ where: { id: Number(id) } }),
        prisma.estoqueTinta.update({
          where: { id: saida.estoque_id },
          data: { quantidade_atual: { increment: qtdEstorno } },
        }),
      ]);
      res.status(200).json({ message: 'Saída estornada por completo e removida do histórico.' });
    } else {
      // Estorno parcial → reduz a quantidade da saída e devolve ao estoque
      const [saidaAtualizada] = await prisma.$transaction([
        prisma.saidaTinta.update({
          where: { id: Number(id) },
          data: { quantidade: { decrement: qtdEstorno } },
        }),
        prisma.estoqueTinta.update({
          where: { id: saida.estoque_id },
          data: { quantidade_atual: { increment: qtdEstorno } },
        }),
      ]);
      res.status(200).json({
        message: `Estorno parcial de ${qtdEstorno} unidade(s) realizado. Saldo restante na saída: ${saidaAtualizada.quantidade}.`,
        saida: saidaAtualizada,
      });
    }
  } catch (error) {
    console.error('Erro ao estornar saída de tinta:', error);
    res.status(500).json({ error: 'Erro ao estornar saída de tinta' });
  }
};
