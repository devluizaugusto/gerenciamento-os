import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { formatServiceOrder, formatServiceOrders } from '../utils/dateFormatter';
import { StatusOrdemServico } from '../types';


const parseDateOnly = (value: unknown): Date | null => {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  const raw = String(value).trim();
  let year: number, month: number, day: number;
  const br = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (br) {
    day = Number(br[1]); month = Number(br[2]); year = Number(br[3]);
  } else if (iso) {
    year = Number(iso[1]); month = Number(iso[2]); day = Number(iso[3]);
  } else return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return date;
};

const todayUTC = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
};

export const getAllServiceOrders = async (_req: Request, res: Response): Promise<void> => {
  try {
    const rows = await prisma.ordemServico.findMany({
      orderBy: {
        numero_os: 'asc'
      }
    });
    
    const formattedOrders = formatServiceOrders(rows);
    res.json(formattedOrders);
  } catch (error) {
    console.error('Erro ao buscar ordens de serviço:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar ordens de serviço',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

export const getServiceOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const order = await prisma.ordemServico.findUnique({
      where: { id: parseInt(String(id)) }
    });
    
    if (!order) {
      res.status(404).json({ error: 'Ordem de serviço não encontrada' });
      return;
    }
    
    const formattedOrder = formatServiceOrder(order);
    res.json(formattedOrder);
  } catch (error) {
    console.error('Erro ao buscar ordem de serviço:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar ordem de serviço',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

export const getServiceOrderByNumber = async (req: Request, res: Response): Promise<void> => {
  try {
    const { numero } = req.params;
    
    const order = await prisma.ordemServico.findUnique({
      where: { numero_os: parseInt(String(numero)) }
    });
    
    if (!order) {
      res.status(404).json({ error: 'Ordem de serviço não encontrada' });
      return;
    }
    
    const formattedOrder = formatServiceOrder(order);
    res.json(formattedOrder);
  } catch (error) {
    console.error('Erro ao buscar ordem de serviço:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar ordem de serviço',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

export const createServiceOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      solicitante,
      unidade,
      setor,
      descricao_problema,
      data_abertura,
      servico_realizado,
      status,
      data_fechamento
    } = req.body;
    
    const maxOrder = await prisma.ordemServico.findFirst({
      orderBy: {
        numero_os: 'desc'
      },
      select: {
        numero_os: true
      }
    });
    
    let orderNumber: number;
    if (!maxOrder || !maxOrder.numero_os) {
      orderNumber = 1027;
    } else {
      orderNumber = parseInt(String(maxOrder.numero_os), 10) + 1;
      if (orderNumber < 1027) {
        orderNumber = 1027;
      }
    }
    
    const validStatuses: StatusOrdemServico[] = ['aberto', 'em_andamento', 'finalizado'];
    const finalStatus: StatusOrdemServico = status && validStatuses.includes(status) ? status : 'aberto';
    
    const openingDate = parseDateOnly(data_abertura);
    const closingDate = parseDateOnly(data_fechamento);
    if (!openingDate) {
      res.status(400).json({ error: 'Data de abertura inválida' });
      return;
    }
    if (openingDate > todayUTC()) {
      res.status(400).json({ error: 'A data de abertura não pode ser futura' });
      return;
    }

    if (finalStatus === 'finalizado') {
      if (!servico_realizado || !String(servico_realizado).trim()) {
        res.status(400).json({ error: 'Informe o serviço realizado para finalizar a OS' });
        return;
      }
      if (!closingDate) {
        res.status(400).json({ error: 'Informe a data de fechamento para finalizar a OS' });
        return;
      }
      if (closingDate < openingDate) {
        res.status(400).json({ error: 'A data de fechamento não pode ser anterior à abertura' });
        return;
      }
    } else if (data_fechamento || (servico_realizado && String(servico_realizado).trim())) {
      res.status(400).json({ error: 'Serviço realizado e data de fechamento só podem ser informados em OS finalizada' });
      return;
    }

    const newOrder = await prisma.ordemServico.create({
      data: {
        numero_os: orderNumber,
        solicitante,
        unidade,
        setor,
        descricao_problema,
        data_abertura: openingDate,
        servico_realizado: finalStatus === 'finalizado' ? String(servico_realizado).trim() : null,
        status: finalStatus,
        data_fechamento: finalStatus === 'finalizado' ? closingDate : null
      }
    });
    
    const formattedOrder = formatServiceOrder(newOrder);
    res.status(201).json(formattedOrder);
  } catch (error) {
    console.error('Erro ao criar ordem de serviço:', error);
    
    res.status(500).json({ 
      error: 'Erro ao criar ordem de serviço',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

export const updateServiceOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      solicitante,
      unidade,
      setor,
      descricao_problema,
      data_abertura,
      servico_realizado,
      status,
      data_fechamento
    } = req.body;
    
    const existing = await prisma.ordemServico.findUnique({
      where: { id: parseInt(String(id)) }
    });
    
    if (!existing) {
      res.status(404).json({ error: 'Ordem de serviço não encontrada' });
      return;
    }
    
    const updateData: any = {};

    if (solicitante !== undefined) updateData.solicitante = String(solicitante).trim();
    if (unidade !== undefined) updateData.unidade = String(unidade).trim();
    if (setor !== undefined) updateData.setor = String(setor).trim();
    if (descricao_problema !== undefined) updateData.descricao_problema = String(descricao_problema).trim();

    const nextStatus: StatusOrdemServico = status !== undefined
      ? status as StatusOrdemServico
      : existing.status as StatusOrdemServico;

    if (status !== undefined && !['aberto', 'em_andamento', 'finalizado'].includes(status)) {
      res.status(400).json({ error: 'Status inválido' });
      return;
    }

    let nextOpeningDate = existing.data_abertura;
    if (data_abertura !== undefined) {
      const parsed = parseDateOnly(data_abertura);
      if (!parsed) {
        res.status(400).json({ error: 'Data de abertura inválida' });
        return;
      }
      if (parsed > todayUTC()) {
        res.status(400).json({ error: 'A data de abertura não pode ser futura' });
        return;
      }
      nextOpeningDate = parsed;
      updateData.data_abertura = parsed;
    }

    let nextService = existing.servico_realizado;
    if (servico_realizado !== undefined) {
      nextService = servico_realizado === null ? null : String(servico_realizado).trim();
      updateData.servico_realizado = nextService;
    }

    let nextClosingDate = existing.data_fechamento;
    if (data_fechamento !== undefined) {
      nextClosingDate = parseDateOnly(data_fechamento);
      if (data_fechamento && !nextClosingDate) {
        res.status(400).json({ error: 'Data de fechamento inválida' });
        return;
      }
      updateData.data_fechamento = nextClosingDate;
    }

    if (nextStatus === 'finalizado') {
      if (!nextService || !String(nextService).trim()) {
        res.status(400).json({ error: 'Informe o serviço realizado para finalizar a OS' });
        return;
      }
      if (!nextClosingDate) {
        res.status(400).json({ error: 'Informe a data de fechamento para finalizar a OS' });
        return;
      }
      if (nextClosingDate < nextOpeningDate) {
        res.status(400).json({ error: 'A data de fechamento não pode ser anterior à abertura' });
        return;
      }
    } else {
      // OS aberta/em andamento nunca fica com dados de encerramento.
      nextClosingDate = null;
      nextService = null;
      updateData.data_fechamento = null;
      updateData.servico_realizado = null;
    }

    if (status !== undefined) updateData.status = nextStatus;

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ error: 'Nenhum campo para atualizar' });
      return;
    }
    
    const updatedOrder = await prisma.ordemServico.update({
      where: { id: parseInt(String(id)) },
      data: updateData
    });
    
    const formattedOrder = formatServiceOrder(updatedOrder);
    res.json(formattedOrder);
  } catch (error) {
    console.error('Erro ao atualizar ordem de serviço:', error);
    
    res.status(500).json({ 
      error: 'Erro ao atualizar ordem de serviço',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

export const deleteServiceOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const deleted = await prisma.ordemServico.delete({
      where: { id: parseInt(String(id)) }
    }).catch(error => {
      if (error.code === 'P2025') {
        return null;
      }
      throw error;
    });
    
    if (!deleted) {
      res.status(404).json({ error: 'Ordem de serviço não encontrada' });
      return;
    }
    
    res.json({ message: 'Ordem de serviço deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar ordem de serviço:', error);
    res.status(500).json({ 
      error: 'Erro ao deletar ordem de serviço',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

export const getServiceOrdersByStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.params;
    
    const validStatuses: StatusOrdemServico[] = ['aberto', 'em_andamento', 'finalizado'];
    if (!validStatuses.includes(status as StatusOrdemServico)) {
      res.status(400).json({ error: 'Status inválido' });
      return;
    }
    
    const rows = await prisma.ordemServico.findMany({
      where: { status: String(status) },
      orderBy: {
        numero_os: 'asc'
      }
    });
    
    const formattedOrders = formatServiceOrders(rows);
    res.json(formattedOrders);
  } catch (error) {
    console.error('Erro ao buscar ordens de serviço por status:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar ordens de serviço',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};
