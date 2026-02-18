import PDFDocument from 'pdfkit';
import { Response } from 'express';
import dayjs from 'dayjs';
import path from 'path';
import fs from 'fs';
import { FinancialStatementData } from '../services/patientFinancialStatement.service';

// Color scheme for professional look
const COLORS = {
  primary: '#2C3E50',      // Dark blue-gray
  secondary: '#3498DB',    // Bright blue
  success: '#27AE60',      // Green
  danger: '#E74C3C',       // Red
  warning: '#F39C12',      // Orange
  light: '#ECF0F1',        // Light gray
  dark: '#34495E',         // Dark gray
  white: '#FFFFFF',
  border: '#BDC3C7',       // Border gray
  headerBg: '#34495E',     // Header background
  sectionBg: '#F8F9FA',    // Section background
};

const formatCurrency = (value: number): string => {
  const number = (value || 0).toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `N${number}`;
};

const formatDate = (date: Date): string => {
  return dayjs(date).format('DD MMM YYYY');
};

const formatDateTime = (date: Date): string => {
  return dayjs(date).format('DD MMM YYYY, HH:mm');
};

export interface FinancialStatementPDFOptions {
  data: FinancialStatementData;
  includeDetails: boolean;
  res: Response;
  filename?: string;
}

export const generateFinancialStatementPDF = async ({
  data,
  includeDetails,
  res,
  filename,
}: FinancialStatementPDFOptions) => {
  const { patient, period, bills, deposits, summary } = data;

  // Set response headers for PDF streaming
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

  // Create PDF document in A4 size for better readability
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 40, left: 40, right: 40, bottom: 60 },
    bufferPages: true,
  });

  doc.pipe(res);

  const pageWidth = 595.28; // A4 width in points
  const pageHeight = 841.89; // A4 height in points
  const leftMargin = 40;
  const rightMargin = 555;
  const contentWidth = rightMargin - leftMargin;

  // Helper function to draw horizontal line
  const drawLine = (y?: number, color: string = COLORS.border, width: number = 1) => {
    const yPos = y || doc.y;
    doc
      .strokeColor(color)
      .lineWidth(width)
      .moveTo(leftMargin, yPos)
      .lineTo(rightMargin, yPos)
      .stroke();
  };

  // Helper function to draw filled rectangle
  const drawBox = (x: number, y: number, width: number, height: number, fillColor: string, borderColor?: string) => {
    doc.fillColor(fillColor).rect(x, y, width, height).fill();
    if (borderColor) {
      doc.strokeColor(borderColor).rect(x, y, width, height).stroke();
    }
  };

  // ===== HEADER SECTION WITH LOGO =====
  // Draw header background
  drawBox(0, 0, pageWidth, 100, COLORS.headerBg);

  // Try to add logo
  const logoPath =
  process.env.NODE_ENV === 'production'
    ? `server/public/health-clone.png`
    : 'src/public/health-clone.png';
  let logoYPos = 20;
  
  if (fs.existsSync(logoPath)) {
    try {
      doc.image(logoPath, leftMargin, logoYPos, { width: 60, height: 60 });
    } catch (error) {
      console.error('Failed to load logo:', error);
    }
  }

  // Hospital info next to logo
  doc.fillColor(COLORS.white)
    .fontSize(18)
    .font('Helvetica-Bold')
    .text('Health Clone Medical Center', leftMargin + 75, logoYPos + 5, {
      width: contentWidth - 75,
    });
  
  doc.fontSize(9)
    .font('Helvetica')
    .text('Karu. ', leftMargin + 75, logoYPos + 30);
  
  doc.fontSize(9).text('Tel: +234 XXX XXX XXXX | Email: info@healthclone.com', leftMargin + 75, logoYPos + 45);

  // Document title
  doc.fillColor(COLORS.white)
    .fontSize(14)
    .font('Helvetica-Bold')
    .text('PATIENT FINANCIAL STATEMENT', leftMargin, logoYPos + 68, {
      align: 'center',
      width: contentWidth,
    });

  doc.y = 110; // Position after header

  // ===== PATIENT INFORMATION =====
  const patientName = `${patient.firstname || ''} ${patient.lastname || ''}`.trim();
  let yPos = doc.y + 10;

  // Patient info box
  const infoBoxHeight = 70;
  drawBox(leftMargin, yPos, contentWidth, infoBoxHeight, COLORS.sectionBg, COLORS.border);

  yPos += 12;
  doc.fillColor(COLORS.primary)
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('Patient Information', leftMargin + 10, yPos);

  yPos += 18;
  const col1X = leftMargin + 15;
  const col2X = leftMargin + 120;
  const col3X = leftMargin + 280;
  const col4X = leftMargin + 380;

  doc.fontSize(9).font('Helvetica-Bold').fillColor(COLORS.dark);
  doc.text('Name:', col1X, yPos);
  doc.font('Helvetica').fillColor(COLORS.primary).text(patientName, col2X, yPos, { width: 150 });

  doc.font('Helvetica-Bold').fillColor(COLORS.dark).text('Hospital ID:', col3X, yPos);
  doc.font('Helvetica').fillColor(COLORS.primary).text(patient.hospital_id || 'N/A', col4X, yPos);

  yPos += 15;
  doc.font('Helvetica-Bold').fillColor(COLORS.dark).text('Statement Period:', col1X, yPos);
  doc
    .font('Helvetica')
    .fillColor(COLORS.primary)
    .text(`${formatDate(period.startDate)} to ${formatDate(period.endDate)}`, col2X, yPos, {
      width: 150,
    });

  if (patient.phone) {
    doc.font('Helvetica-Bold').fillColor(COLORS.dark).text('Phone:', col3X, yPos);
    doc.font('Helvetica').fillColor(COLORS.primary).text(patient.phone, col4X, yPos);
  }

  doc.y = yPos + 25;

  // ===== SUMMARY SECTION =====
  yPos = doc.y + 5;
  
  doc.fillColor(COLORS.primary)
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('Financial Summary', leftMargin, yPos);

  yPos += 20;

  // Summary box with gradient-like effect
  const summaryBoxHeight = deposits && deposits.length > 0 ? 90 : 75;
  drawBox(leftMargin, yPos, contentWidth, summaryBoxHeight, COLORS.white, COLORS.border);

  yPos += 12;
  const labelX = leftMargin + 15;
  const countX = leftMargin + 280;
  const amountX = leftMargin + 370;

  // Header row
  doc.fontSize(9).font('Helvetica-Bold').fillColor(COLORS.dark);
  doc.text('Description', labelX, yPos);
  doc.text('Count', countX, yPos, { width: 80, align: 'right' });
  doc.text('Amount', amountX, yPos, { width: 120, align: 'right' });

  yPos += 15;
  drawLine(yPos, COLORS.light, 1);
  yPos += 8;

  // Data rows
  doc.fontSize(9).font('Helvetica').fillColor(COLORS.primary);
  
  doc.text('Total Bills', labelX, yPos);
  doc.text(`${summary.totalBills}`, countX, yPos, { width: 80, align: 'right' });
  doc.text(formatCurrency(summary.totalBillsAmount), amountX, yPos, { width: 120, align: 'right' });

  yPos += 14;
  doc.text('Total Payments', labelX, yPos);
  doc.text(`${summary.totalPayments}`, countX, yPos, { width: 80, align: 'right' });
  doc.fillColor(COLORS.success).text(formatCurrency(summary.totalPaymentsAmount), amountX, yPos, {
    width: 120,
    align: 'right',
  });

  if (deposits && deposits.length > 0) {
    yPos += 14;
    doc.fillColor(COLORS.primary).text('Total Deposits', labelX, yPos);
    doc.text(`${summary.totalDeposits}`, countX, yPos, { width: 80, align: 'right' });
    doc.fillColor(COLORS.secondary).text(formatCurrency(summary.totalDepositsAmount), amountX, yPos, {
      width: 120,
      align: 'right',
    });
  }

  yPos += 16;
  drawLine(yPos, COLORS.border, 1);
  yPos += 8;

  // Outstanding balance (highlighted)
  doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.dark);
  doc.text('Outstanding Balance', labelX, yPos);
  const balanceColor = summary.outstandingBalance > 0 ? COLORS.danger : COLORS.success;
  doc.fillColor(balanceColor).text(formatCurrency(summary.outstandingBalance), amountX, yPos, {
    width: 120,
    align: 'right',
  });

  doc.y = yPos + 25;

  // ===== BILLS SECTION =====
  yPos = doc.y + 5;
  
  doc.fillColor(COLORS.primary)
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('Bills and Payments', leftMargin, yPos);

  doc.y = yPos + 18;

  if (bills.length === 0) {
    yPos = doc.y;
    drawBox(leftMargin, yPos, contentWidth, 40, COLORS.sectionBg, COLORS.border);
    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor(COLORS.dark)
      .text('No bills found for the selected period.', leftMargin, yPos + 15, {
        align: 'center',
        width: contentWidth,
      });
    doc.y = yPos + 15;
  } else {
    bills.forEach((billGroup, billIndex) => {
      const bill = billGroup.bill;
      const items = billGroup.items;
      const payments = billGroup.payments;

      const billAmount = parseFloat(bill.final_amount as any) || 0;
      const totalPaid = payments.reduce((sum, p) => sum + (parseFloat(p.amount as any) || 0), 0);
      const billBalance = billAmount - totalPaid;

      // Calculate bill box height
      let billBoxHeight = 80; // Increased base height for header + amount boxes
      if (includeDetails && items && items.length > 0) {
        billBoxHeight += 25 + items.length * 11; // More accurate spacing
      }
      if (payments && payments.length > 0) {
        billBoxHeight += 25 + payments.length * 11; // Account for header + payments
      } else {
        billBoxHeight += 20; // "No payments" text with padding
      }

      // Check if we need a new page
      if (doc.y + billBoxHeight > pageHeight - 70) {
        doc.addPage();
        doc.y = 50;
      }

      const billStartY = doc.y;
      yPos = billStartY;

      // Bill card with border
      drawBox(leftMargin, yPos, contentWidth, billBoxHeight, COLORS.white, COLORS.border);

      // Bill header with colored left border accent
      drawBox(leftMargin, yPos, 4, billBoxHeight, COLORS.secondary);

      yPos += 12;

      // Bill number and date
      doc.fontSize(11).font('Helvetica-Bold').fillColor(COLORS.primary);
      doc.text(`Bill #${bill.bill_number}`, leftMargin + 15, yPos);
      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor(COLORS.dark)
        .text(formatDate(bill.createdAt), leftMargin + contentWidth - 90, yPos);

      yPos += 18;

      // Bill financial summary in colored boxes
      const boxWidth = (contentWidth - 60) / 3;
      const amountBoxY = yPos;

      // Amount box
      drawBox(leftMargin + 15, amountBoxY, boxWidth, 28, '#E8F4F8', COLORS.border);
      doc.fontSize(8).font('Helvetica').fillColor(COLORS.dark).text('Amount', leftMargin + 20, amountBoxY + 5);
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor(COLORS.primary)
        .text(formatCurrency(billAmount), leftMargin + 20, amountBoxY + 16);

      // Paid box
      drawBox(leftMargin + 25 + boxWidth, amountBoxY, boxWidth, 28, '#E8F5E9', COLORS.border);
      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor(COLORS.dark)
        .text('Paid', leftMargin + 30 + boxWidth, amountBoxY + 5);
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor(COLORS.success)
        .text(formatCurrency(totalPaid), leftMargin + 30 + boxWidth, amountBoxY + 16);

      // Balance box
      const balanceBoxColor = billBalance > 0 ? '#FFEBEE' : '#E8F5E9';
      drawBox(leftMargin + 35 + boxWidth * 2, amountBoxY, boxWidth, 28, balanceBoxColor, COLORS.border);
      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor(COLORS.dark)
        .text('Balance', leftMargin + 40 + boxWidth * 2, amountBoxY + 5);
      const balanceTextColor = billBalance > 0 ? COLORS.danger : COLORS.success;
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor(balanceTextColor)
        .text(formatCurrency(billBalance), leftMargin + 40 + boxWidth * 2, amountBoxY + 16);

      yPos += 30;

      // Bill Items (if includeDetails is true)
      if (includeDetails && items && items.length > 0) {
        yPos += 3;
        drawLine(yPos, COLORS.light, 1);
        yPos += 10;

        doc.fontSize(9).font('Helvetica-Bold').fillColor(COLORS.dark);
        doc.text('Item', leftMargin + 20, yPos, { width: 200 });
        doc.text('Qty', leftMargin + 240, yPos, { width: 40, align: 'right' });
        doc.text('Unit Price', leftMargin + 290, yPos, { width: 80, align: 'right' });
        doc.text('Total', leftMargin + 380, yPos, { width: 100, align: 'right' });

        yPos += 10;

        doc.fontSize(8).font('Helvetica').fillColor(COLORS.primary);
        items.forEach((item, itemIndex) => {
          if (itemIndex > 0) yPos += 9;

          const itemName =
            item.item_name.length > 32 ? item.item_name.substring(0, 32) + '...' : item.item_name;
          doc.text(itemName, leftMargin + 20, yPos, { width: 200 });
          doc.text(item.quantity.toString(), leftMargin + 240, yPos, { width: 40, align: 'right' });
          doc.text(formatCurrency(item.unit_price), leftMargin + 290, yPos, {
            width: 80,
            align: 'right',
          });
          doc.text(formatCurrency(item.total_price), leftMargin + 380, yPos, {
            width: 100,
            align: 'right',
          });
        });

        yPos += 8;
      }

      // Payments section
      yPos += 3;
      drawLine(yPos, COLORS.light, 1);
      yPos += 10;

      if (payments && payments.length > 0) {
        doc.fontSize(9).font('Helvetica-Bold').fillColor(COLORS.dark);
        doc.text('Payments', leftMargin + 20, yPos);

        yPos += 10;

        doc.fontSize(8).font('Helvetica').fillColor(COLORS.primary);
        payments.forEach((payment, payIndex) => {
          if (payIndex > 0) yPos += 9;

          doc.fillColor(COLORS.success).text('#', leftMargin + 20, yPos);
          doc
            .fillColor(COLORS.primary)
            .text(`${payment.payment_reference} - ${formatDate(payment.processed_at)}`, leftMargin + 30, yPos, {
              width: 250,
            });
          doc.text(payment.payment_method, leftMargin + 290, yPos, { width: 80 });
          doc
            .fillColor(COLORS.success)
            .font('Helvetica-Bold')
            .text(formatCurrency(payment.amount), leftMargin + 380, yPos, {
              width: 100,
              align: 'right',
            });
          doc.font('Helvetica');
        });
      } else {
        doc.fontSize(8).font('Helvetica').fillColor(COLORS.dark).text('No payments recorded', leftMargin + 20, yPos);
      }

      doc.y = billStartY + billBoxHeight + 12;
    });
  }

  // ===== DEPOSITS SECTION =====
  if (deposits && deposits.length > 0) {
    // Check if we need a new page
    if (doc.y > pageHeight - 200) {
      doc.addPage();
      doc.y = 50;
    }

    yPos = doc.y + 15;

    doc.fillColor(COLORS.primary)
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Patient Deposits', leftMargin, yPos);

    yPos += 20;

    // Deposits table box
    const depositsBoxHeight = 45 + deposits.length * 18;
    drawBox(leftMargin, yPos, contentWidth, depositsBoxHeight, COLORS.white, COLORS.border);

    yPos += 12;

    // Table header
    doc.fontSize(9).font('Helvetica-Bold').fillColor(COLORS.dark);
    doc.text('Reference', leftMargin + 15, yPos, { width: 110 });
    doc.text('Date', leftMargin + 130, yPos, { width: 80 });
    doc.text('Amount', leftMargin + 220, yPos, { width: 90, align: 'right' });
    doc.text('Balance', leftMargin + 320, yPos, { width: 90, align: 'right' });
    doc.text('Status', leftMargin + 420, yPos, { width: 60 });

    yPos += 15;
    drawLine(yPos, COLORS.light, 1);
    yPos += 8;

    // Table rows
    doc.fontSize(8).font('Helvetica').fillColor(COLORS.primary);
    deposits.forEach((deposit, index) => {
      if (index > 0) yPos += 15;

      doc.text(deposit.reference_number, leftMargin + 15, yPos, { width: 110 });
      doc.text(formatDate(deposit.deposit_date), leftMargin + 130, yPos, { width: 80 });
      doc
        .fillColor(COLORS.secondary)
        .font('Helvetica-Bold')
        .text(formatCurrency(deposit.amount), leftMargin + 220, yPos, {
          width: 90,
          align: 'right',
        });
      doc
        .fillColor(COLORS.primary)
        .font('Helvetica')
        .text(formatCurrency(deposit.current_balance), leftMargin + 320, yPos, {
          width: 90,
          align: 'right',
        });

      // Status badge
      const statusColor =
        deposit.status === 'ACTIVE'
          ? COLORS.success
          : deposit.status === 'USED'
          ? COLORS.warning
          : COLORS.dark;
      doc.fillColor(statusColor).text(deposit.status, leftMargin + 420, yPos, { width: 60 });
    });

    doc.y = yPos + 25;
  }

  // ===== FOOTER =====
  // Add footer to all pages
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);

    // Footer line
    const footerY = pageHeight - 45;
    drawLine(footerY, COLORS.light, 1);

    // Footer text
    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor(COLORS.dark)
      .text(`Page ${i + 1} of ${range.count}`, leftMargin, footerY + 10, {
        width: contentWidth / 2 - 20,
        align: 'left',
      });

    doc.text(`Generated on ${formatDateTime(new Date())}`, leftMargin + contentWidth / 2, footerY + 10, {
      width: contentWidth / 2,
      align: 'right',
    });

    // Confidentiality notice
    doc.fontSize(7).fillColor(COLORS.dark).text(
      'This document is confidential and intended solely for the use of the patient.',
      leftMargin,
      footerY + 22,
      {
        width: contentWidth,
        align: 'center',
      }
    );
  }

  doc.end();
};

