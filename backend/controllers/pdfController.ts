import { Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import prisma from '../config/prisma';
import { formatOrdemServico } from '../utils/dateFormatter';
import { OrdemServicoFormatada } from '../types';

// Função auxiliar para obter cor do status
const getStatusColor = (status: string): string => {
  const config: Record<string, string> = {
    aberto: '#dc3545',
    em_andamento: '#ffc107',
    finalizado: '#28a745'
  };
  return config[status] || '#000000';
};

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    aberto: 'Aberto',
    em_andamento: 'Em Andamento',
    finalizado: 'Finalizado'
  };
  return labels[status] || status;
};

// Gerar PDF de uma única ordem de serviço
export const generateOrdemServicoPDF = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const ordemData = await prisma.ordemServico.findUnique({
      where: { id: parseInt(String(id)) }
    });

    if (!ordemData) {
      res.status(404).json({ error: 'Ordem de serviço não encontrada' });
      return;
    }

    const ordem = formatOrdemServico(ordemData);
    
    if (!ordem) {
      res.status(500).json({ error: 'Erro ao formatar ordem de serviço' });
      return;
    }

    // Criar documento PDF
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });

    // Definir nome do arquivo
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=OS-${ordem.numero_os}.pdf`);

    // Pipe do PDF para a resposta
    doc.pipe(res);

    // Cabeçalho
    doc.fontSize(24)
      .fillColor('#2563eb')
      .text('ORDEM DE SERVIÇO', { align: 'center' });

    doc.moveDown(0.5);

    // Número da OS
    doc.fontSize(18)
      .fillColor('#1e293b')
      .text(`OS #${ordem.numero_os}`, { align: 'center', underline: true });

    doc.moveDown(1);

    // Status com cor
    const statusColor = getStatusColor(ordem.status);
    doc.fontSize(14)
      .fillColor(statusColor)
      .text(`Status: ${getStatusLabel(ordem.status)}`, { align: 'center' });

    doc.moveDown(1.5);

    // Linha divisória
    doc.strokeColor('#e2e8f0')
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke();

    doc.moveDown(1);

    // Informações principais
    const infoY = doc.y;
    const labelWidth = 130;
    const valueWidth = 200;
    const col1X = 50;
    const col2X = 340;
    const lineHeight = 20;
    let currentY = infoY;

    // Função auxiliar para adicionar linha de informação
    const addInfoLine = (label: string, value: string | null | number, x: number, y: number, maxWidth: number = valueWidth): number => {
      const labelX = x;
      const valueX = x + labelWidth;
      const textValue = (value || '-').toString();
      
      doc.fontSize(10)
        .fillColor('#64748b')
        .text(label, labelX, y);
      
      const textHeight = doc.heightOfString(textValue, {
        width: maxWidth
      });
      
      doc.fontSize(11)
        .fillColor('#1e293b')
        .text(textValue, valueX, y, {
          width: maxWidth,
          align: 'left'
        });
      
      return y + Math.max(lineHeight, textHeight + 2);
    };

    // Coluna esquerda
    currentY = addInfoLine('Solicitante:', ordem.solicitante || '-', col1X, currentY);
    currentY = addInfoLine('Unidade:', ordem.ubs || '-', col1X, currentY);
    currentY = addInfoLine('Setor:', ordem.setor || '-', col1X, currentY);

    // Coluna direita
    let rightY = infoY;
    rightY = addInfoLine('Data de Abertura:', ordem.data_abertura || '-', col2X, rightY, 170);
    if (ordem.data_fechamento) {
      rightY = addInfoLine('Data de Fechamento:', ordem.data_fechamento, col2X, rightY, 170);
    }

    doc.y = Math.max(currentY, rightY) + 10;

    // Linha divisória
    doc.strokeColor('#e2e8f0')
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke();

    doc.moveDown(1);

    // Descrição do Problema
    doc.fontSize(12)
      .fillColor('#1e293b')
      .font('Helvetica-Bold')
      .text('Descrição do Problema:', 50, doc.y);
    
    doc.moveDown(0.5);

    doc.fontSize(11)
      .fillColor('#1e293b')
      .font('Helvetica')
      .text(ordem.descricao_problema, {
        width: 500,
        align: 'left',
        lineGap: 5
      });

    doc.moveDown(1);

    // Serviço Realizado
    if (ordem.servico_realizado) {
      doc.strokeColor('#e2e8f0')
        .lineWidth(1)
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke();

      doc.moveDown(1);

      doc.fontSize(12)
        .fillColor('#1e293b')
        .font('Helvetica-Bold')
        .text('Serviço Realizado:', 50, doc.y);
      
      doc.moveDown(0.5);

      doc.fontSize(11)
        .fillColor('#1e293b')
        .font('Helvetica')
        .text(ordem.servico_realizado, {
          width: 500,
          align: 'left',
          lineGap: 5
        });
    }

    // Rodapé
    const pageHeight = doc.page.height;
    const pageWidth = doc.page.width;
    const dataGeracao = new Date();
    const dataFormatada = dataGeracao.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
    const horaFormatada = dataGeracao.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    doc.fontSize(8)
      .fillColor('#64748b')
      .text(
        `Documento gerado em ${dataFormatada} às ${horaFormatada}`,
        50,
        pageHeight - 50,
        { align: 'center', width: pageWidth - 100 }
      );

    // Finalizar PDF
    doc.end();
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Erro ao gerar PDF',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
};

// Gerar relatório PDF de múltiplas ordens de serviço
export const generateRelatorioPDF = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, search, dia, mes, ano, dataInicio, dataFim } = req.query;

    // Construir filtros do Prisma
    const where: any = {};

    if (status && status !== 'todos') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { numero_os: { contains: String(search) } },
        { solicitante: { contains: String(search) } },
        { ubs: { contains: String(search) } },
        { setor: { contains: String(search) } },
        { descricao_problema: { contains: String(search) } }
      ];
    }

    // Filtro por intervalo de datas
    if (dataInicio || dataFim) {
      where.data_abertura = {};
      if (dataInicio) {
        where.data_abertura.gte = new Date(String(dataInicio));
      }
      if (dataFim) {
        const dataFimDate = new Date(String(dataFim));
        dataFimDate.setHours(23, 59, 59, 999);
        where.data_abertura.lte = dataFimDate;
      }
    } else {
      // Filtros de data (dia, mês, ano)
      if (dia || mes || ano) {
        if (ano) {
          const startOfYear = new Date(parseInt(String(ano)), 0, 1);
          const endOfYear = new Date(parseInt(String(ano)), 11, 31, 23, 59, 59, 999);
          where.data_abertura = { gte: startOfYear, lte: endOfYear };
          
          if (mes) {
            const startOfMonth = new Date(parseInt(String(ano)), parseInt(String(mes)) - 1, 1);
            const endOfMonth = new Date(parseInt(String(ano)), parseInt(String(mes)), 0, 23, 59, 59, 999);
            where.data_abertura = { gte: startOfMonth, lte: endOfMonth };
            
            if (dia) {
              const specificDate = new Date(parseInt(String(ano)), parseInt(String(mes)) - 1, parseInt(String(dia)));
              const endOfDay = new Date(parseInt(String(ano)), parseInt(String(mes)) - 1, parseInt(String(dia)), 23, 59, 59, 999);
              where.data_abertura = { gte: specificDate, lte: endOfDay };
            }
          }
        }
      }
    }

    const rows = await prisma.ordemServico.findMany({
      where,
      orderBy: {
        data_abertura: 'asc'
      }
    });

    if (rows.length === 0) {
      res.status(404).json({ error: 'Nenhuma ordem de serviço encontrada para o relatório' });
      return;
    }

    const ordens = rows.map(formatOrdemServico).filter((ordem): ordem is OrdemServicoFormatada => ordem !== null);

    // Criar documento PDF
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });

    // Definir nome do arquivo
    const hoje = new Date();
    const timestamp = `${String(hoje.getDate()).padStart(2, '0')}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${hoje.getFullYear()}`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Relatorio-OS-${timestamp}.pdf`);

    // Pipe do PDF para a resposta
    doc.pipe(res);

    // Variáveis para controle de página
    const pageHeight = doc.page.height;

    // Cabeçalho
    doc.fontSize(24)
      .fillColor('#2563eb')
      .text('RELATÓRIO DE ORDENS DE SERVIÇO', { align: 'center' });

    doc.moveDown(0.5);

    // Data de geração
    const dataHojeBR = hoje.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
    
    doc.fontSize(12)
      .fillColor('#64748b')
      .text(`Relatório gerado em: ${dataHojeBR}`, { align: 'center' });

    // Mostrar filtros aplicados
    const filtrosAplicados: string[] = [];
    
    if (status && status !== 'todos') {
      filtrosAplicados.push(`Status: ${getStatusLabel(String(status))}`);
    }
    
    if (dataInicio || dataFim) {
      const formatarDataBR = (dataStr: string): string => {
        if (!dataStr) return '';
        const [ano, mes, dia] = dataStr.split('-');
        return `${dia}/${mes}/${ano}`;
      };
      
      let periodoTexto = 'Período: ';
      if (dataInicio && dataFim) {
        periodoTexto += `${formatarDataBR(String(dataInicio))} até ${formatarDataBR(String(dataFim))}`;
      } else if (dataInicio) {
        periodoTexto += `A partir de ${formatarDataBR(String(dataInicio))}`;
      } else if (dataFim) {
        periodoTexto += `Até ${formatarDataBR(String(dataFim))}`;
      }
      filtrosAplicados.push(periodoTexto);
    } else if (dia || mes || ano) {
      const filtrosData: string[] = [];
      if (dia) filtrosData.push(`Dia: ${dia}`);
      if (mes) {
        const meses = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        filtrosData.push(`Mês: ${meses[parseInt(String(mes), 10)]}`);
      }
      if (ano) filtrosData.push(`Ano: ${ano}`);
      filtrosAplicados.push(`Período: ${filtrosData.join(' / ')}`);
    }
    
    if (search) {
      filtrosAplicados.push(`Busca: "${search}"`);
    }

    if (filtrosAplicados.length > 0) {
      filtrosAplicados.forEach(filtro => {
        doc.fontSize(11)
          .fillColor('#64748b')
          .text(filtro, { align: 'center' });
      });
    }

    // Se houver filtro de data, mostrar caixa destacada com estatísticas
    if (dataInicio || dataFim) {
      doc.moveDown(0.8);
      
      // Caixa de destaque
      const boxY = doc.y;
      const boxHeight = 60;
      const boxX = 50;
      const boxWidth = 500;
      
      // Fundo da caixa
      doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 8)
        .fillAndStroke('#dbeafe', '#3b82f6');
      
      // Título
      doc.fontSize(12)
        .fillColor('#1e40af')
        .font('Helvetica-Bold')
        .text('ESTATÍSTICAS DO PERÍODO', boxX + 20, boxY + 12, { width: boxWidth - 40 });
      
      // Total de OS
      doc.fontSize(16)
        .fillColor('#1e3a8a')
        .font('Helvetica-Bold')
        .text(
          `${ordens.length} ${ordens.length === 1 ? 'Ordem de Serviço' : 'Ordens de Serviço'}`,
          boxX + 20,
          boxY + 32,
          { width: boxWidth - 40, align: 'center' }
        );
      
      doc.y = boxY + boxHeight + 15;
    } else {
      // Total simples quando não há filtro de período
      doc.moveDown(0.5);
      doc.fontSize(12)
        .fillColor('#64748b')
        .text(`Total de OS: ${ordens.length}`, { align: 'center' });
      doc.moveDown(1);
    }

    // Lista de ordens de serviço
    ordens.forEach((ordem, index) => {
      // Verificar se precisa de nova página
      if (index > 0) {
        const espacoMinimo = 120;
        
        if (doc.y + espacoMinimo > pageHeight - 70) {
          doc.addPage();
        }
      }

      // Número da OS e Status
      const statusLabel = getStatusLabel(ordem.status);
      const statusColor = getStatusColor(ordem.status);
      const statusY = doc.y;
      
      doc.save();
      doc.fontSize(10).font('Helvetica-Bold');
      const statusWidth = doc.widthOfString(statusLabel);
      doc.restore();
      
      doc.fontSize(14)
        .fillColor('#1e293b')
        .font('Helvetica-Bold')
        .text(`OS #${ordem.numero_os}`, 50, statusY);

      const statusX = Math.max(420, 550 - statusWidth - 5);
      
      doc.fontSize(10)
        .font('Helvetica-Bold')
        .fillColor(statusColor)
        .text(statusLabel, statusX, statusY);

      doc.moveDown(0.5);

      // Informações principais
      const itemStartY = doc.y;
      const labelWidthRel = 85;
      const valueWidthRel = 170;
      const col1XRel = 50;
      const col2XRel = 310;
      
      const addRelLine = (label: string, value: string | null | number, x: number, y: number, maxWidth: number = valueWidthRel): number => {
        const labelX = x;
        const valueX = x + labelWidthRel;
        const valueText = (value || '-').toString();
        
        doc.fontSize(9)
          .fillColor('#64748b')
          .text(label, labelX, y);
        
        const textHeight = doc.heightOfString(valueText, {
          width: maxWidth
        });
        
        doc.fontSize(9)
          .fillColor('#1e293b')
          .text(valueText, valueX, y, {
            width: maxWidth,
            align: 'left'
          });
        
        return Math.max(13, textHeight + 1);
      };
      
      let relY = itemStartY;
      const h1 = addRelLine('Solicitante:', ordem.solicitante || '-', col1XRel, relY);
      addRelLine('Unidade:', ordem.ubs || '-', col2XRel, relY, 200);
      relY += h1;
      
      const h2 = addRelLine('Setor:', ordem.setor || '-', col1XRel, relY);
      addRelLine('Data Abertura:', ordem.data_abertura || '-', col2XRel, relY, 200);
      relY += h2;
      
      if (ordem.data_fechamento) {
        addRelLine('Data Fechamento:', ordem.data_fechamento, col2XRel, relY, 200);
        relY += 13;
      }
      
      doc.y = relY + 8;

      // Descrição do Problema
      doc.fontSize(9)
        .fillColor('#1e293b')
        .font('Helvetica-Bold')
        .text('Problema:', 50, doc.y);
      
      doc.moveDown(0.3);

      doc.fontSize(9)
        .fillColor('#1e293b')
        .font('Helvetica')
        .text(ordem.descricao_problema || '-', {
          width: 500,
          align: 'left',
          lineGap: 3
        });

      if (ordem.servico_realizado) {
        doc.moveDown(0.5);
        doc.fontSize(9)
          .fillColor('#1e293b')
          .font('Helvetica-Bold')
          .text('Serviço Realizado:', 50, doc.y);
        
        doc.moveDown(0.3);

        doc.fontSize(9)
          .fillColor('#1e293b')
          .font('Helvetica')
          .text(ordem.servico_realizado, {
            width: 500,
            align: 'left',
            lineGap: 3
          });
      }

      doc.moveDown(1);

      // Linha divisória
      if (index < ordens.length - 1) {
        if (doc.y + 20 < pageHeight - 70) {
          doc.strokeColor('#e2e8f0')
            .lineWidth(0.5)
            .moveTo(50, doc.y)
            .lineTo(550, doc.y)
            .stroke();
          doc.moveDown(0.8);
        }
      }
    });

    // Finalizar PDF
    doc.end();
  } catch (error) {
    console.error('Erro ao gerar relatório PDF:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Erro ao gerar relatório PDF',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
};
