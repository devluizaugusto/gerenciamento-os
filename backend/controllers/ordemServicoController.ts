import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { formatOrdemServico, formatOrdensServico } from '../utils/dateFormatter';
import { StatusOrdemServico } from '../types';

// Obter todas as ordens de serviço
export const getAllOrdensServico = async (_req: Request, res: Response): Promise<void> => {
  try {
    const rows = await prisma.ordemServico.findMany({
      orderBy: {
        numero_os: 'asc'
      }
    });
    
    const ordensFormatadas = formatOrdensServico(rows);
    res.json(ordensFormatadas);
  } catch (error) {
    console.error('Erro ao buscar ordens de serviço:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar ordens de serviço',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

// Obter ordem de serviço por ID
export const getOrdemServicoById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const ordem = await prisma.ordemServico.findUnique({
      where: { id: parseInt(String(id)) }
    });
    
    if (!ordem) {
      res.status(404).json({ error: 'Ordem de serviço não encontrada' });
      return;
    }
    
    const ordemFormatada = formatOrdemServico(ordem);
    res.json(ordemFormatada);
  } catch (error) {
    console.error('Erro ao buscar ordem de serviço:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar ordem de serviço',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

// Obter ordem de serviço por número
export const getOrdemServicoByNumero = async (req: Request, res: Response): Promise<void> => {
  try {
    const { numero } = req.params;
    
    const ordem = await prisma.ordemServico.findUnique({
      where: { numero_os: parseInt(String(numero)) }
    });
    
    if (!ordem) {
      res.status(404).json({ error: 'Ordem de serviço não encontrada' });
      return;
    }
    
    const ordemFormatada = formatOrdemServico(ordem);
    res.json(ordemFormatada);
  } catch (error) {
    console.error('Erro ao buscar ordem de serviço:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar ordem de serviço',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

// Criar nova ordem de serviço
export const createOrdemServico = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      solicitante,
      ubs,
      setor,
      descricao_problema,
      data_abertura,
      servico_realizado,
      status,
      data_fechamento
    } = req.body;
    
    // Gerar número da OS automaticamente
    const maxOrdem = await prisma.ordemServico.findFirst({
      orderBy: {
        numero_os: 'desc'
      },
      select: {
        numero_os: true
      }
    });
    
    let numeroOS: number;
    if (!maxOrdem || !maxOrdem.numero_os) {
      numeroOS = 1027;
    } else {
      numeroOS = parseInt(String(maxOrdem.numero_os), 10) + 1;
      if (numeroOS < 1027) {
        numeroOS = 1027;
      }
    }
    
    // Validar status
    const statusValidos: StatusOrdemServico[] = ['aberto', 'em_andamento', 'finalizado'];
    const statusFinal: StatusOrdemServico = status && statusValidos.includes(status) ? status : 'aberto';
    
    // Converter data_abertura se vier no formato brasileiro
    let dataAberturaFormatada = data_abertura;
    if (data_abertura && data_abertura.includes('/')) {
      const parts = data_abertura.split('/');
      if (parts.length === 3) {
        dataAberturaFormatada = `${parts[2]}-${parts[1]}-${parts[0]}T12:00:00.000Z`;
      }
    } else if (data_abertura && data_abertura.includes('-')) {
      dataAberturaFormatada = `${data_abertura}T12:00:00.000Z`;
    }
    
    // Converter data_fechamento se vier no formato brasileiro
    let dataFechamentoFormatada: string | null = null;
    if (data_fechamento && data_fechamento.trim() !== '') {
      if (data_fechamento.includes('/')) {
        const parts = data_fechamento.split('/');
        if (parts.length === 3) {
          dataFechamentoFormatada = `${parts[2]}-${parts[1]}-${parts[0]}T12:00:00.000Z`;
        }
      } else if (data_fechamento.includes('-')) {
        dataFechamentoFormatada = `${data_fechamento}T12:00:00.000Z`;
      }
    }
    
    const novaOrdem = await prisma.ordemServico.create({
      data: {
        numero_os: numeroOS,
        solicitante,
        ubs,
        setor,
        descricao_problema,
        data_abertura: new Date(dataAberturaFormatada),
        servico_realizado: servico_realizado || null,
        status: statusFinal,
        data_fechamento: dataFechamentoFormatada ? new Date(dataFechamentoFormatada) : null
      }
    });
    
    const ordemFormatada = formatOrdemServico(novaOrdem);
    res.status(201).json(ordemFormatada);
  } catch (error) {
    console.error('Erro ao criar ordem de serviço:', error);
    
    res.status(500).json({ 
      error: 'Erro ao criar ordem de serviço',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

// Atualizar ordem de serviço
export const updateOrdemServico = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      solicitante,
      ubs,
      setor,
      descricao_problema,
      data_abertura,
      servico_realizado,
      status,
      data_fechamento
    } = req.body;
    
    // Verificar se a ordem existe
    const existing = await prisma.ordemServico.findUnique({
      where: { id: parseInt(String(id)) }
    });
    
    if (!existing) {
      res.status(404).json({ error: 'Ordem de serviço não encontrada' });
      return;
    }
    
    // Preparar dados para atualização
    const updateData: any = {};
    
    if (solicitante !== undefined) updateData.solicitante = solicitante;
    if (ubs !== undefined) updateData.ubs = ubs;
    if (setor !== undefined) updateData.setor = setor;
    if (descricao_problema !== undefined) updateData.descricao_problema = descricao_problema;
    if (servico_realizado !== undefined) updateData.servico_realizado = servico_realizado;
    
    // Processar data_abertura
    if (data_abertura !== undefined && data_abertura !== null && String(data_abertura).trim() !== '') {
      let dataAberturaFormatada = String(data_abertura);
      console.log('📅 [UPDATE] data_abertura recebida:', data_abertura);
      if (dataAberturaFormatada.includes('/')) {
        const parts = dataAberturaFormatada.split('/');
        if (parts.length === 3) {
          dataAberturaFormatada = `${parts[2]}-${parts[1]}-${parts[0]}T12:00:00.000Z`;
        }
      } else if (dataAberturaFormatada.includes('-')) {
        dataAberturaFormatada = `${dataAberturaFormatada}T12:00:00.000Z`;
      }
      updateData.data_abertura = new Date(dataAberturaFormatada);
      console.log('📅 [UPDATE] data_abertura formatada:', dataAberturaFormatada);
      console.log('📅 [UPDATE] data_abertura Date object:', updateData.data_abertura);
    }
    
    // Processar data_fechamento
    if (data_fechamento !== undefined) {
      console.log('📅 [UPDATE] data_fechamento recebida:', data_fechamento);
      if (data_fechamento === null || String(data_fechamento).trim() === '') {
        updateData.data_fechamento = null;
        console.log('📅 [UPDATE] data_fechamento definida como NULL');
      } else {
        let dataFechamentoFormatada = String(data_fechamento);
        if (dataFechamentoFormatada.includes('/')) {
          const parts = dataFechamentoFormatada.split('/');
          if (parts.length === 3) {
            dataFechamentoFormatada = `${parts[2]}-${parts[1]}-${parts[0]}T12:00:00.000Z`;
          }
        } else if (dataFechamentoFormatada.includes('-')) {
          dataFechamentoFormatada = `${dataFechamentoFormatada}T12:00:00.000Z`;
        }
        updateData.data_fechamento = new Date(dataFechamentoFormatada);
        console.log('📅 [UPDATE] data_fechamento formatada:', dataFechamentoFormatada);
        console.log('📅 [UPDATE] data_fechamento Date object:', updateData.data_fechamento);
      }
    }
    
    // Processar status
    if (status !== undefined) {
      const statusValidos: StatusOrdemServico[] = ['aberto', 'em_andamento', 'finalizado'];
      if (statusValidos.includes(status)) {
        updateData.status = status;
        
        // Se finalizar e data_fechamento não foi informada, adicionar data atual
        if (status === 'finalizado' && data_fechamento === undefined) {
          updateData.data_fechamento = new Date();
        }
        
        // Se não estiver finalizado e data_fechamento não foi informada, remover data de fechamento
        if (status !== 'finalizado' && data_fechamento === undefined) {
          updateData.data_fechamento = null;
        }
      }
    }
    
    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ error: 'Nenhum campo para atualizar' });
      return;
    }
    
    console.log('💾 [UPDATE] Dados que serão salvos no banco:', JSON.stringify(updateData, null, 2));
    
    const ordemAtualizada = await prisma.ordemServico.update({
      where: { id: parseInt(String(id)) },
      data: updateData
    });
    
    console.log('✅ [UPDATE] Ordem atualizada no banco:', JSON.stringify(ordemAtualizada, null, 2));
    
    const ordemFormatada = formatOrdemServico(ordemAtualizada);
    console.log('📤 [UPDATE] Ordem formatada para retornar:', JSON.stringify(ordemFormatada, null, 2));
    
    res.json(ordemFormatada);
  } catch (error) {
    console.error('Erro ao atualizar ordem de serviço:', error);
    
    res.status(500).json({ 
      error: 'Erro ao atualizar ordem de serviço',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

// Deletar ordem de serviço
export const deleteOrdemServico = async (req: Request, res: Response): Promise<void> => {
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

// Filtrar por status
export const getOrdensServicoByStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.params;
    
    const statusValidos: StatusOrdemServico[] = ['aberto', 'em_andamento', 'finalizado'];
    if (!statusValidos.includes(status as StatusOrdemServico)) {
      res.status(400).json({ error: 'Status inválido' });
      return;
    }
    
    const rows = await prisma.ordemServico.findMany({
      where: { status: String(status) },
      orderBy: {
        numero_os: 'asc'
      }
    });
    
    const ordensFormatadas = formatOrdensServico(rows);
    res.json(ordensFormatadas);
  } catch (error) {
    console.error('Erro ao buscar ordens de serviço por status:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar ordens de serviço',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};
