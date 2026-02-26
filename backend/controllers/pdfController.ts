import { Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import prisma from '../config/prisma';
import { formatServiceOrder } from '../utils/dateFormatter';
import { OrdemServicoFormatada } from '../types';

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

// Generate PDF of a single service order
export const generateServiceOrderPDF = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const orderData = await prisma.ordemServico.findUnique({
      where: { id: parseInt(String(id)) }
    });

    if (!orderData) {
      res.status(404).json({ error: 'Ordem de serviço não encontrada' });
      return;
    }

    const order = formatServiceOrder(orderData);
    
    if (!order) {
      res.status(500).json({ error: 'Erro ao formatar ordem de serviço' });
      return;
    }

    const doc = new PDFDocument({
      size: 'A4',
      // Margem um pouco menor para aproveitar melhor a folha
      margin: 40
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=OS-${order.numero_os}.pdf`);

    doc.pipe(res);

    doc.fontSize(24)
      .fillColor('#2563eb')
      .text('ORDEM DE SERVIÇO', { align: 'center' });

    doc.moveDown(0.5);

    doc.fontSize(18)
      .fillColor('#1e293b')
      .text(`OS #${order.numero_os}`, { align: 'center', underline: true });

    doc.moveDown(1);

    const statusColor = getStatusColor(order.status);
    doc.fontSize(14)
      .fillColor(statusColor)
      .text(`Status: ${getStatusLabel(order.status)}`, { align: 'center' });

    doc.moveDown(1.5);

    doc.strokeColor('#e2e8f0')
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke();

    doc.moveDown(1);

    // Main information
    const infoY = doc.y;
    const labelWidth = 130;
    const valueWidth = 200;
    const col1X = 50;
    const col2X = 340;
    const lineHeight = 20;
    let currentY = infoY;

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

    currentY = addInfoLine('Solicitante:', order.solicitante || '-', col1X, currentY);
    currentY = addInfoLine('Unidade:', order.unidade || '-', col1X, currentY);
    currentY = addInfoLine('Setor:', order.setor || '-', col1X, currentY);

    let rightY = infoY;
    rightY = addInfoLine('Data de Abertura:', order.data_abertura || '-', col2X, rightY, 170);
    if (order.data_fechamento) {
      rightY = addInfoLine('Data de Fechamento:', order.data_fechamento, col2X, rightY, 170);
    }

    doc.y = Math.max(currentY, rightY) + 10;

    doc.strokeColor('#e2e8f0')
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke();

    doc.moveDown(1);

    doc.fontSize(12)
      .fillColor('#1e293b')
      .font('Helvetica-Bold')
      .text('Descrição do Problema:', 50, doc.y);
    
    doc.moveDown(0.5);

    doc.fontSize(11)
      .fillColor('#1e293b')
      .font('Helvetica')
      .text(order.descricao_problema, {
        width: 500,
        align: 'left',
        lineGap: 5
      });

    doc.moveDown(1);

    if (order.servico_realizado) {
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
      
      doc.moveDown(0.3);

      doc.fontSize(11)
        .fillColor('#1e293b')
        .font('Helvetica')
        .text(order.servico_realizado, {
          width: 500,
          align: 'left',
          lineGap: 5
        });
    }

    const pageHeight = doc.page.height;
    const pageWidth = doc.page.width;
    const generationDate = new Date();
    const formattedDate = generationDate.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
    const formattedTime = generationDate.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    doc.fontSize(8)
      .fillColor('#64748b')
      .text(
        `Documento gerado em ${formattedDate} às ${formattedTime}`,
        50,
        pageHeight - 50,
        { align: 'center', width: pageWidth - 100 }
      );

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

export const generateReportPDF = async (req: Request, res: Response): Promise<void> => {
  try {
    // Nomes de parâmetros alinhados com o schema (reportQuerySchema) e com o front
    const { status, search, dia, mes, ano, dataInicio, dataFim } = req.query;

    const where: any = {};

    if (status && status !== 'todos') {
      where.status = status;
    }

    if (search) {
      const searchNum = parseInt(String(search), 10);
      where.OR = [
        ...(!isNaN(searchNum) ? [{ numero_os: searchNum }] : []),
        { solicitante: { contains: String(search) } },
        { unidade: { contains: String(search) } },
        { setor: { contains: String(search) } },
        { descricao_problema: { contains: String(search) } }
      ];
    }

    // Filtro por intervalo de datas (dataInicio / dataFim) tem prioridade
    if (dataInicio || dataFim) {
      where.data_abertura = {};
      if (dataInicio) {
        where.data_abertura.gte = new Date(String(dataInicio) + 'T00:00:00.000Z');
      }
      if (dataFim) {
        where.data_abertura.lte = new Date(String(dataFim) + 'T23:59:59.999Z');
      }
    } else if (dia || mes || ano) {
      // Quando não há intervalo explícito, usa dia / mês / ano
      // Usa o ano atual como fallback se não fornecido
      const now = new Date();
      const yearNum = ano ? parseInt(String(ano), 10) : now.getUTCFullYear();
      const mesNum = mes ? parseInt(String(mes), 10) : null;
      const diaNum = dia ? parseInt(String(dia), 10) : null;

      let start: Date;
      let end: Date;

      if (diaNum && mesNum) {
        // Dia + Mês específicos (com ou sem ano)
        start = new Date(Date.UTC(yearNum, mesNum - 1, diaNum, 0, 0, 0, 0));
        end = new Date(Date.UTC(yearNum, mesNum - 1, diaNum, 23, 59, 59, 999));
      } else if (diaNum && !mesNum) {
        // Apenas dia — busca esse dia em todos os meses do ano
        // Não é possível mapear diretamente no Prisma, então filtramos pelo ano
        // e o filtro por dia é aplicado após a query (fallback: retorna o mês atual)
        const currentMonth = now.getUTCMonth(); // 0-indexed
        start = new Date(Date.UTC(yearNum, currentMonth, diaNum, 0, 0, 0, 0));
        end = new Date(Date.UTC(yearNum, currentMonth, diaNum, 23, 59, 59, 999));
      } else if (mesNum && !diaNum) {
        // Mês inteiro
        start = new Date(Date.UTC(yearNum, mesNum - 1, 1, 0, 0, 0, 0));
        end = new Date(Date.UTC(yearNum, mesNum, 0, 23, 59, 59, 999));
      } else {
        // Apenas ano
        start = new Date(Date.UTC(yearNum, 0, 1, 0, 0, 0, 0));
        end = new Date(Date.UTC(yearNum, 11, 31, 23, 59, 59, 999));
      }

      where.data_abertura = { gte: start, lte: end };
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

    const orders = rows.map(formatServiceOrder).filter((order): order is OrdemServicoFormatada => order !== null);

    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });

    const today = new Date();
    const timestamp = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Relatorio-OS-${timestamp}.pdf`);

    doc.pipe(res);

    let pageHeight = doc.page.height;

    // Títulos menores para ganhar mais espaço na página
    doc.fontSize(18)
      .fillColor('#047857')
      .text('RELATÓRIO DE ORDENS DE SERVIÇO', { align: 'center' });

    doc.moveDown(0.5);

    const todayBR = today.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
    
    doc.fontSize(10)
      .fillColor('#64748b')
      .text(`Relatório gerado em: ${todayBR}`, { align: 'center' });

    // Total de OS logo abaixo da data, para ficar visualmente próximo
    doc.moveDown(0.2);
    doc.fontSize(10)
      .fillColor('#64748b')
      .text(`Total de OS: ${orders.length}`, { align: 'center' });

    doc.moveDown(0.8);

    const appliedFilters: string[] = [];
    
    if (status && status !== 'todos') {
      appliedFilters.push(`Status: ${getStatusLabel(String(status))}`);
    }
    
    if (dataInicio || dataFim) {
      const formatDateBR = (dateStr: string): string => {
        if (!dateStr) return '';
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
      };
      
      let periodText = 'Período: ';
      if (dataInicio && dataFim) {
        periodText += `${formatDateBR(String(dataInicio))} até ${formatDateBR(String(dataFim))}`;
      } else if (dataInicio) {
        periodText += `A partir de ${formatDateBR(String(dataInicio))}`;
      } else if (dataFim) {
        periodText += `Até ${formatDateBR(String(dataFim))}`;
      }
      appliedFilters.push(periodText);
    } else if (dia || mes || ano) {
      const dateFilters: string[] = [];
      if (dia) dateFilters.push(`Dia: ${dia}`);
      if (mes) {
        const months = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        dateFilters.push(`Mês: ${months[parseInt(String(mes), 10)]}`);
      }
      if (ano) dateFilters.push(`Ano: ${ano}`);
      appliedFilters.push(`Período: ${dateFilters.join(' / ')}`);
    }
    
    if (search) {
      appliedFilters.push(`Busca: "${search}"`);
    }

    if (appliedFilters.length > 0) {
      appliedFilters.forEach(filter => {
        doc.fontSize(9)
          .fillColor('#64748b')
          .text(filter, { align: 'center' });
      });
    }

    // Controle de quantidade de ordens por página
    let ordersOnCurrentPage = 0;

    // Texto resumido para o relatório (mantido), apenas para não ficar muito grande no papel
    const truncateTextForReport = (text: string | null | undefined, maxChars: number): string => {
      if (!text || text.trim() === '') return '-';
      const normalized = text.toString();
      if (normalized.length <= maxChars) return normalized;
      return normalized.slice(0, Math.max(0, maxChars - 3)) + '...';
    };

    // Estimativa de altura que uma OS ocupa na página,
    // para aproveitar melhor o espaço e minimizar sobras no fim da folha.
    const estimateOrderHeight = (order: OrdemServicoFormatada): number => {
      let totalHeight = 0;

      // Cabeçalho "OS #..." + status na mesma linha
      doc.fontSize(10).font('Helvetica-Bold');
      const headerLineHeight = doc.currentLineHeight();
      totalHeight += headerLineHeight;      // linha do cabeçalho
      totalHeight += headerLineHeight * 0.3; // moveDown(0.3) logo após o cabeçalho

      // Duas linhas de informações principais
      const solicitanteText = `Solicitante: ${order.solicitante || '-'}`;
      const unidadeText = `Unidade: ${order.unidade || '-'}`;
      const infoLine1 = `${solicitanteText}  |  ${unidadeText}`;

      const setorPart = `Setor: ${order.setor || '-'}`;
      const aberturaPart = `Data Abertura: ${order.data_abertura || '-'}`;
      const fechamentoPart = order.data_fechamento
        ? `Data Fechamento: ${order.data_fechamento}`
        : '';
      const infoLine2Parts = [setorPart, aberturaPart];
      if (fechamentoPart) {
        infoLine2Parts.push(fechamentoPart);
      }
      const infoLine2 = infoLine2Parts.join('  |  ');

      doc.fontSize(8).font('Helvetica');
      totalHeight += doc.heightOfString(infoLine1, { width: 500 });
      totalHeight += headerLineHeight * 0.2; // moveDown(0.2)
      totalHeight += doc.heightOfString(infoLine2, { width: 500 });
      totalHeight += headerLineHeight * 0.3; // moveDown(0.3)

      // Bloco "Problema"
      const problemaText = truncateTextForReport(order.descricao_problema || '-', 400);

      doc.fontSize(8).font('Helvetica-Bold');
      const labelLineHeight = doc.currentLineHeight();
      totalHeight += labelLineHeight;        // linha "Problema:"
      totalHeight += labelLineHeight * 0.3;  // moveDown(0.3)

      doc.fontSize(8).font('Helvetica');
      totalHeight += doc.heightOfString(problemaText, {
        width: 500,
        lineGap: 3
      });

      // Bloco "Serviço Realizado" (se existir)
      if (order.servico_realizado) {
        const servicoText = truncateTextForReport(order.servico_realizado, 300);

        totalHeight += labelLineHeight * 0.3; // moveDown(0.3) antes do label
        totalHeight += labelLineHeight;       // linha "Serviço Realizado:"
        totalHeight += labelLineHeight * 0.3; // moveDown(0.3) antes do texto

        totalHeight += doc.heightOfString(servicoText, {
          width: 500,
          lineGap: 3
        });
      }

      // Espaço final entre esta OS e a próxima (moveDown(0.3))
      totalHeight += labelLineHeight * 0.3;

      return totalHeight;
    };

    orders.forEach((order, index) => {
      if (index > 0) {
        const bottomMargin = 50; // margem inferior de segurança
        const availableHeight = pageHeight - bottomMargin - doc.y;
        const orderHeight = estimateOrderHeight(order);

        // Quebra de página somente se a próxima OS não couber inteira
        // E apenas se já houver pelo menos 1 OS na página atual (para evitar página em branco)
        if (ordersOnCurrentPage > 0 && orderHeight > availableHeight) {
          doc.addPage();
          pageHeight = doc.page.height;
          ordersOnCurrentPage = 0;
        }
      }

      const statusLabel = getStatusLabel(order.status);
      const statusColor = getStatusColor(order.status);
      const statusY = doc.y;
      
      doc.save();
      doc.fontSize(9).font('Helvetica-Bold');
      const statusWidth = doc.widthOfString(statusLabel);
      doc.restore();
      
      // Cabeçalho da OS com número menor
      doc.fontSize(10)
        .fillColor('#1e293b')
        .font('Helvetica-Bold')
        .text(`OS #${order.numero_os}`, 50, statusY);

      const statusX = Math.max(420, 550 - statusWidth - 5);
      
      doc.fontSize(9)
        .font('Helvetica-Bold')
        .fillColor(statusColor)
        .text(statusLabel, statusX, statusY);

      doc.moveDown(0.3);

      // Informações principais condensadas em 2 linhas para caber mais OS por página
      // Labels em negrito, valores em normal
      const infoY = doc.y;
      
      // Linha 1: Solicitante | Unidade
      doc.fontSize(8)
        .fillColor('#1e293b')
        .font('Helvetica-Bold')
        .text('Solicitante: ', 50, infoY);
      
      const solicitanteX = 50 + doc.widthOfString('Solicitante: ');
      doc.fontSize(8)
        .fillColor('#1e293b')
        .font('Helvetica')
        .text(order.solicitante || '-', solicitanteX, infoY);
      
      const unidadeLabelX = solicitanteX + doc.widthOfString(order.solicitante || '-') + 10;
      doc.fontSize(8)
        .fillColor('#1e293b')
        .font('Helvetica-Bold')
        .text('Unidade: ', unidadeLabelX, infoY);
      
      const unidadeX = unidadeLabelX + doc.widthOfString('Unidade: ');
      doc.fontSize(8)
        .fillColor('#1e293b')
        .font('Helvetica')
        .text(order.unidade || '-', unidadeX, infoY);

      doc.moveDown(0.2);

      // Linha 2: Setor | Data Abertura | Data Fechamento (se existir)
      const infoY2 = doc.y;
      
      doc.fontSize(8)
        .fillColor('#1e293b')
        .font('Helvetica-Bold')
        .text('Setor: ', 50, infoY2);
      
      const setorX = 50 + doc.widthOfString('Setor: ');
      doc.fontSize(8)
        .fillColor('#1e293b')
        .font('Helvetica')
        .text(order.setor || '-', setorX, infoY2);
      
      const aberturaLabelX = setorX + doc.widthOfString(order.setor || '-') + 10;
      doc.fontSize(8)
        .fillColor('#1e293b')
        .font('Helvetica-Bold')
        .text('Data Abertura: ', aberturaLabelX, infoY2);
      
      const aberturaX = aberturaLabelX + doc.widthOfString('Data Abertura: ');
      doc.fontSize(8)
        .fillColor('#1e293b')
        .font('Helvetica')
        .text(order.data_abertura || '-', aberturaX, infoY2);
      
      if (order.data_fechamento) {
        const fechamentoLabelX = aberturaX + doc.widthOfString(order.data_abertura || '-') + 10;
        doc.fontSize(8)
          .fillColor('#1e293b')
          .font('Helvetica-Bold')
          .text('Data Fechamento: ', fechamentoLabelX, infoY2);
        
        const fechamentoX = fechamentoLabelX + doc.widthOfString('Data Fechamento: ');
        doc.fontSize(8)
          .fillColor('#1e293b')
          .font('Helvetica')
          .text(order.data_fechamento, fechamentoX, infoY2);
      }

      doc.moveDown(0.3);

      const problemaText = truncateTextForReport(order.descricao_problema || '-', 400);

      doc.fontSize(8)
        .fillColor('#1e293b')
        .font('Helvetica-Bold')
        .text('Problema:', 50, doc.y);
      
      doc.moveDown(0.3);

      doc.fontSize(8)
        .fillColor('#1e293b')
        .font('Helvetica')
        .text(problemaText, {
          width: 500,
          align: 'left',
          lineGap: 3
        });

      const servicoText = truncateTextForReport(order.servico_realizado, 300);

      if (order.servico_realizado) {
        doc.moveDown(0.3);
        doc.fontSize(8)
          .fillColor('#1e293b')
          .font('Helvetica-Bold')
          .text('Serviço Realizado:', 50, doc.y);
        
        doc.moveDown(0.3);

        doc.fontSize(8)
          .fillColor('#1e293b')
          .font('Helvetica')
          .text(servicoText, {
            width: 500,
            align: 'left',
            lineGap: 3
          });
      }

      doc.moveDown(0.3);

      // Atualiza contador de ordens desta página
      ordersOnCurrentPage += 1;

      if (index < orders.length - 1) {
        if (doc.y + 20 < pageHeight - 50) {
          doc.strokeColor('#e2e8f0')
            .lineWidth(0.5)
            .moveTo(50, doc.y)
            .lineTo(550, doc.y)
            .stroke();
          doc.moveDown(0.8);
        }
      }
    });

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
