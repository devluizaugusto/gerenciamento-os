import { Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import prisma from '../config/prisma';
import { formatServiceOrder } from '../utils/dateFormatter';
import { OrdemServicoFormatada } from '../types';

// Helper function to get status color
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

    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });

    // Set filename
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=OS-${order.numero_os}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // Header
    doc.fontSize(24)
      .fillColor('#2563eb')
      .text('ORDEM DE SERVIÇO', { align: 'center' });

    doc.moveDown(0.5);

    // Order number
    doc.fontSize(18)
      .fillColor('#1e293b')
      .text(`OS #${order.numero_os}`, { align: 'center', underline: true });

    doc.moveDown(1);

    // Status with color
    const statusColor = getStatusColor(order.status);
    doc.fontSize(14)
      .fillColor(statusColor)
      .text(`Status: ${getStatusLabel(order.status)}`, { align: 'center' });

    doc.moveDown(1.5);

    // Divider line
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

    // Helper function to add info line
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

    // Left column
    currentY = addInfoLine('Solicitante:', order.solicitante || '-', col1X, currentY);
    currentY = addInfoLine('Unidade:', order.unidade || '-', col1X, currentY);
    currentY = addInfoLine('Setor:', order.setor || '-', col1X, currentY);

    // Right column
    let rightY = infoY;
    rightY = addInfoLine('Data de Abertura:', order.data_abertura || '-', col2X, rightY, 170);
    if (order.data_fechamento) {
      rightY = addInfoLine('Data de Fechamento:', order.data_fechamento, col2X, rightY, 170);
    }

    doc.y = Math.max(currentY, rightY) + 10;

    // Divider line
    doc.strokeColor('#e2e8f0')
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke();

    doc.moveDown(1);

    // Problem Description
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

    // Service Performed
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
      
      doc.moveDown(0.5);

      doc.fontSize(11)
        .fillColor('#1e293b')
        .font('Helvetica')
        .text(order.servico_realizado, {
          width: 500,
          align: 'left',
          lineGap: 5
        });
    }

    // Footer
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

    // Finalize PDF
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

// Generate PDF report of multiple service orders
export const generateReportPDF = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, search, day, month, year, startDate, endDate } = req.query;

    // Build Prisma filters
    const where: any = {};

    if (status && status !== 'todos') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { order_number: { contains: String(search) } },
        { requester: { contains: String(search) } },
        { unit: { contains: String(search) } },
        { department: { contains: String(search) } },
        { problem_description: { contains: String(search) } }
      ];
    }

    // Date range filter
    if (startDate || endDate) {
      where.opening_date = {};
      if (startDate) {
        where.opening_date.gte = new Date(String(startDate));
      }
      if (endDate) {
        const endDateObj = new Date(String(endDate));
        endDateObj.setHours(23, 59, 59, 999);
        where.opening_date.lte = endDateObj;
      }
    } else {
      // Date filters (day, month, year)
      if (day || month || year) {
        if (year) {
          const startOfYear = new Date(parseInt(String(year)), 0, 1);
          const endOfYear = new Date(parseInt(String(year)), 11, 31, 23, 59, 59, 999);
          where.opening_date = { gte: startOfYear, lte: endOfYear };
          
          if (month) {
            const startOfMonth = new Date(parseInt(String(year)), parseInt(String(month)) - 1, 1);
            const endOfMonth = new Date(parseInt(String(year)), parseInt(String(month)), 0, 23, 59, 59, 999);
            where.opening_date = { gte: startOfMonth, lte: endOfMonth };
            
            if (day) {
              const specificDate = new Date(parseInt(String(year)), parseInt(String(month)) - 1, parseInt(String(day)));
              const endOfDay = new Date(parseInt(String(year)), parseInt(String(month)) - 1, parseInt(String(day)), 23, 59, 59, 999);
              where.opening_date = { gte: specificDate, lte: endOfDay };
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

    const orders = rows.map(formatServiceOrder).filter((order): order is OrdemServicoFormatada => order !== null);

    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });

    // Set filename
    const today = new Date();
    const timestamp = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Relatorio-OS-${timestamp}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // Variables for page control
    const pageHeight = doc.page.height;

    // Header
    doc.fontSize(24)
      .fillColor('#047857')
      .text('RELATÓRIO DE ORDENS DE SERVIÇO', { align: 'center' });

    doc.moveDown(0.5);

    // Generation date
    const todayBR = today.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
    
    doc.fontSize(12)
      .fillColor('#64748b')
      .text(`Relatório gerado em: ${todayBR}`, { align: 'center' });

    doc.moveDown(1);

    // Show applied filters
    const appliedFilters: string[] = [];
    
    if (status && status !== 'todos') {
      appliedFilters.push(`Status: ${getStatusLabel(String(status))}`);
    }
    
    if (startDate || endDate) {
      const formatDateBR = (dateStr: string): string => {
        if (!dateStr) return '';
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
      };
      
      let periodText = 'Período: ';
      if (startDate && endDate) {
        periodText += `${formatDateBR(String(startDate))} até ${formatDateBR(String(endDate))}`;
      } else if (startDate) {
        periodText += `A partir de ${formatDateBR(String(startDate))}`;
      } else if (endDate) {
        periodText += `Até ${formatDateBR(String(endDate))}`;
      }
      appliedFilters.push(periodText);
    } else if (day || month || year) {
      const dateFilters: string[] = [];
      if (day) dateFilters.push(`Dia: ${day}`);
      if (month) {
        const months = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        dateFilters.push(`Mês: ${months[parseInt(String(month), 10)]}`);
      }
      if (year) dateFilters.push(`Ano: ${year}`);
      appliedFilters.push(`Período: ${dateFilters.join(' / ')}`);
    }
    
    if (search) {
      appliedFilters.push(`Busca: "${search}"`);
    }

    if (appliedFilters.length > 0) {
      appliedFilters.forEach(filter => {
        doc.fontSize(11)
          .fillColor('#64748b')
          .text(filter, { align: 'center' });
      });
    }

    // If there's a date filter, show highlighted box with statistics
    if (startDate || endDate) {
      doc.moveDown(0.8);
      
      // Highlight box
      const boxY = doc.y;
      const boxHeight = 60;
      const boxX = 50;
      const boxWidth = 500;
      
      // Box background
      doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 8)
        .fillAndStroke('#d1fae5', '#10b981');
      
      // Title
      doc.fontSize(12)
        .fillColor('#047857')
        .font('Helvetica-Bold')
        .text('ESTATÍSTICAS DO PERÍODO', boxX + 20, boxY + 12, { width: boxWidth - 40, align: 'center' });
      
      // Total OS
      doc.fontSize(16)
        .fillColor('#065f46')
        .font('Helvetica-Bold')
        .text(
          `${orders.length} ${orders.length === 1 ? 'Ordem de Serviço' : 'Ordens de Serviço'}`,
          boxX + 20,
          boxY + 32,
          { width: boxWidth - 40, align: 'center' }
        );
      
      doc.y = boxY + boxHeight + 15;
    } else {
      // Simple total when there's no period filter
      doc.moveDown(0.5);
      doc.fontSize(12)
        .fillColor('#64748b')
        .text(`Total de OS: ${orders.length}`, { align: 'center' });
      doc.moveDown(1);
    }

    // List of service orders
    orders.forEach((order, index) => {
      // Check if a new page is needed
      if (index > 0) {
        const minSpace = 120;
        
        if (doc.y + minSpace > pageHeight - 70) {
          doc.addPage();
        }
      }

      // Order number and Status
      const statusLabel = getStatusLabel(order.status);
      const statusColor = getStatusColor(order.status);
      const statusY = doc.y;
      
      doc.save();
      doc.fontSize(10).font('Helvetica-Bold');
      const statusWidth = doc.widthOfString(statusLabel);
      doc.restore();
      
      doc.fontSize(14)
        .fillColor('#1e293b')
        .font('Helvetica-Bold')
        .text(`OS #${order.numero_os}`, 50, statusY);

      const statusX = Math.max(420, 550 - statusWidth - 5);
      
      doc.fontSize(10)
        .font('Helvetica-Bold')
        .fillColor(statusColor)
        .text(statusLabel, statusX, statusY);

      doc.moveDown(0.5);

      // Main information
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
      const h1 = addRelLine('Solicitante:', order.solicitante || '-', col1XRel, relY);
      addRelLine('Unidade:', order.unidade || '-', col2XRel, relY, 200);
      relY += h1;
      
      const h2 = addRelLine('Setor:', order.setor || '-', col1XRel, relY);
      addRelLine('Data Abertura:', order.data_abertura || '-', col2XRel, relY, 200);
      relY += h2;
      
      if (order.data_fechamento) {
        addRelLine('Data Fechamento:', order.data_fechamento, col2XRel, relY, 200);
        relY += 13;
      }
      
      doc.y = relY + 8;

      // Problem Description
      doc.fontSize(9)
        .fillColor('#1e293b')
        .font('Helvetica-Bold')
        .text('Problema:', 50, doc.y);
      
      doc.moveDown(0.3);

      doc.fontSize(9)
        .fillColor('#1e293b')
        .font('Helvetica')
        .text(order.descricao_problema || '-', {
          width: 500,
          align: 'left',
          lineGap: 3
        });

      if (order.servico_realizado) {
        doc.moveDown(0.5);
        doc.fontSize(9)
          .fillColor('#1e293b')
          .font('Helvetica-Bold')
          .text('Serviço Realizado:', 50, doc.y);
        
        doc.moveDown(0.3);

        doc.fontSize(9)
          .fillColor('#1e293b')
          .font('Helvetica')
          .text(order.servico_realizado, {
            width: 500,
            align: 'left',
            lineGap: 3
          });
      }

      doc.moveDown(1);

      // Divider line
      if (index < orders.length - 1) {
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

    // Finalize PDF
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
