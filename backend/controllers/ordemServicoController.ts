import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { formatServiceOrder, formatServiceOrders } from '../utils/dateFormatter';
import { StatusOrdemServico } from '../types';

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
    
    let formattedOpeningDate = data_abertura;
    if (data_abertura && data_abertura.includes('/')) {
      const parts = data_abertura.split('/');
      if (parts.length === 3) {
        formattedOpeningDate = `${parts[2]}-${parts[1]}-${parts[0]}T12:00:00.000Z`;
      }
    } else if (data_abertura && data_abertura.includes('-')) {
      formattedOpeningDate = `${data_abertura}T12:00:00.000Z`;
    }
    
    let formattedClosingDate: string | null = null;
    if (data_fechamento && data_fechamento.trim() !== '') {
      if (data_fechamento.includes('/')) {
        const parts = data_fechamento.split('/');
        if (parts.length === 3) {
          formattedClosingDate = `${parts[2]}-${parts[1]}-${parts[0]}T12:00:00.000Z`;
        }
      } else if (data_fechamento.includes('-')) {
        formattedClosingDate = `${data_fechamento}T12:00:00.000Z`;
      }
    }
    
    const newOrder = await prisma.ordemServico.create({
      data: {
        numero_os: orderNumber,
        solicitante,
        unidade,
        setor,
        descricao_problema,
        data_abertura: new Date(formattedOpeningDate),
        servico_realizado: servico_realizado || null,
        status: finalStatus,
        data_fechamento: formattedClosingDate ? new Date(formattedClosingDate) : null
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
    
    if (solicitante !== undefined) updateData.solicitante = solicitante;
    if (unidade !== undefined) updateData.unidade = unidade;
    if (setor !== undefined) updateData.setor = setor;
    if (descricao_problema !== undefined) updateData.descricao_problema = descricao_problema;
    if (servico_realizado !== undefined) updateData.servico_realizado = servico_realizado;
    
    if (data_abertura !== undefined && data_abertura !== null && String(data_abertura).trim() !== '') {
      let formattedOpeningDate = String(data_abertura);
      if (formattedOpeningDate.includes('/')) {
        const parts = formattedOpeningDate.split('/');
        if (parts.length === 3) {
          formattedOpeningDate = `${parts[2]}-${parts[1]}-${parts[0]}T12:00:00.000Z`;
        }
      } else if (formattedOpeningDate.includes('-')) {
        formattedOpeningDate = `${formattedOpeningDate}T12:00:00.000Z`;
      }
      updateData.data_abertura = new Date(formattedOpeningDate);
    }
    
    if (data_fechamento !== undefined) {
      if (data_fechamento === null || String(data_fechamento).trim() === '') {
        updateData.data_fechamento = null;
      } else {
        let formattedClosingDate = String(data_fechamento);
        if (formattedClosingDate.includes('/')) {
          const parts = formattedClosingDate.split('/');
          if (parts.length === 3) {
            formattedClosingDate = `${parts[2]}-${parts[1]}-${parts[0]}T12:00:00.000Z`;
          }
        } else if (formattedClosingDate.includes('-')) {
          formattedClosingDate = `${formattedClosingDate}T12:00:00.000Z`;
        }
        updateData.data_fechamento = new Date(formattedClosingDate);
      }
    }
    
    // Process status
    if (status !== undefined) {
      const validStatuses: StatusOrdemServico[] = ['aberto', 'em_andamento', 'finalizado'];
      if (validStatuses.includes(status)) {
        updateData.status = status;
        
        if (status === 'finalizado' && data_fechamento === undefined) {
          updateData.data_fechamento = new Date();
        }
        
        // If not finalized and data_fechamento was not provided, remove closing date
        if (status !== 'finalizado' && data_fechamento === undefined) {
          updateData.data_fechamento = null;
        }
      }
    }
    
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
