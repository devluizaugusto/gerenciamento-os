import { Request, Response } from 'express';
import prisma from '../config/prisma';
import {
  formatTrocaComputador,
  formatTrocasComputador,
  parseDateInput,
} from '../utils/trocaComputadorFormatter';

const SETOR_FIXO = 'VACINA';
const VALID_STATUSES = ['em_andamento', 'finalizado'] as const;

export const getAllTrocasComputador = async (_req: Request, res: Response): Promise<void> => {
  try {
    const rows = await prisma.trocaComputador.findMany({
      orderBy: [{ data_troca: 'desc' }, { id: 'desc' }],
    });
    res.json(formatTrocasComputador(rows));
  } catch (error) {
    console.error('Erro ao buscar trocas de computador:', error);
    res.status(500).json({
      error: 'Erro ao buscar trocas de computador',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
};

export const getTrocaComputadorById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const troca = await prisma.trocaComputador.findUnique({
      where: { id: parseInt(String(id)) },
    });

    if (!troca) {
      res.status(404).json({ error: 'Registro de troca não encontrado' });
      return;
    }

    res.json(formatTrocaComputador(troca));
  } catch (error) {
    console.error('Erro ao buscar troca de computador:', error);
    res.status(500).json({
      error: 'Erro ao buscar troca de computador',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
};

export const createTrocaComputador = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      patrimonio_cpu_antigo,
      patrimonio_monitor_antigo,
      patrimonio_cpu_novo,
      patrimonio_monitor_novo,
      unidade,
      data_troca,
      status,
    } = req.body;

    const finalStatus = status && VALID_STATUSES.includes(status) ? status : 'em_andamento';

    const troca = await prisma.trocaComputador.create({
      data: {
        patrimonio_cpu_antigo: patrimonio_cpu_antigo.trim(),
        patrimonio_monitor_antigo: patrimonio_monitor_antigo.trim(),
        patrimonio_cpu_novo: patrimonio_cpu_novo.trim(),
        patrimonio_monitor_novo: patrimonio_monitor_novo.trim(),
        unidade: unidade.trim(),
        setor: SETOR_FIXO,
        data_troca: parseDateInput(data_troca),
        status: finalStatus,
      },
    });

    res.status(201).json(formatTrocaComputador(troca));
  } catch (error) {
    console.error('Erro ao criar troca de computador:', error);
    res.status(500).json({
      error: 'Erro ao criar troca de computador',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
};

export const updateTrocaComputador = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      patrimonio_cpu_antigo,
      patrimonio_monitor_antigo,
      patrimonio_cpu_novo,
      patrimonio_monitor_novo,
      unidade,
      data_troca,
      status,
    } = req.body;

    const existing = await prisma.trocaComputador.findUnique({
      where: { id: parseInt(String(id)) },
    });

    if (!existing) {
      res.status(404).json({ error: 'Registro de troca não encontrado' });
      return;
    }

    const troca = await prisma.trocaComputador.update({
      where: { id: parseInt(String(id)) },
      data: {
        ...(patrimonio_cpu_antigo !== undefined && { patrimonio_cpu_antigo: patrimonio_cpu_antigo.trim() }),
        ...(patrimonio_monitor_antigo !== undefined && { patrimonio_monitor_antigo: patrimonio_monitor_antigo.trim() }),
        ...(patrimonio_cpu_novo !== undefined && { patrimonio_cpu_novo: patrimonio_cpu_novo.trim() }),
        ...(patrimonio_monitor_novo !== undefined && { patrimonio_monitor_novo: patrimonio_monitor_novo.trim() }),
        ...(unidade !== undefined && { unidade: unidade.trim() }),
        ...(data_troca !== undefined && { data_troca: parseDateInput(data_troca) }),
        ...(status !== undefined && VALID_STATUSES.includes(status) && { status }),
        setor: SETOR_FIXO,
      },
    });

    res.json(formatTrocaComputador(troca));
  } catch (error) {
    console.error('Erro ao atualizar troca de computador:', error);
    res.status(500).json({
      error: 'Erro ao atualizar troca de computador',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
};

export const deleteTrocaComputador = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await prisma.trocaComputador.findUnique({
      where: { id: parseInt(String(id)) },
    });

    if (!existing) {
      res.status(404).json({ error: 'Registro de troca não encontrado' });
      return;
    }

    await prisma.trocaComputador.delete({ where: { id: parseInt(String(id)) } });
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar troca de computador:', error);
    res.status(500).json({
      error: 'Erro ao deletar troca de computador',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
};
