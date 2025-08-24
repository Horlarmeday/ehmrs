import path from 'path';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import fs from 'fs';
import { Response } from 'express';
import {
  Patient,
  PrescribedAdditionalItem,
  PrescribedDrug,
  PrescribedInvestigation,
  PrescribedService,
  PrescribedTest,
} from '../../../database/models';
import { ServiceName } from '../../../database/models/paymentHistory';

type ReceiptData = {
  id: number;
  transaction_date: Date;
  transaction_id: string;
  amount: number;
  mode_of_payment: string;
  notes: string;
  narration: string;
  patient: Patient;
  serviceName: ServiceName;
  drug: PrescribedDrug;
  test: PrescribedTest;
  investigation: PrescribedInvestigation;
  item: PrescribedAdditionalItem;
  service: PrescribedService;
};
export type PrintReceiptType = {
  payments: ReceiptData[];
  patient: Patient;
  res: Response;
  serviceName: ServiceName;
};

const formatCurrency = (value: number) => {
  // Use NGN symbol explicitly to avoid encoding issues
  const formatted = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(value || 0);

  // Replace the problematic symbol with the correct Naira symbol
  return formatted.replace(/NGN\s?/, '₦');
};

export const printReceiptPDF = async ({
  payments,
  patient,
  res,
  serviceName,
}: PrintReceiptType) => {
  const RECEIPT_WIDTH = 226.77; // 80mm in points
  // Patient details
  const patientName = patient
    ? `${patient.firstname || ''} ${patient.lastname || ''}`.trim()
    : 'N/A';
  const patientPhone = patient?.phone || 'N/A';
  const payment = payments[0];

  const totalPrice = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const verificationLink = `✅ Payment Verified by ${patientName}: ${formatCurrency(totalPrice)}`;
  const qrImage = await QRCode.toDataURL(verificationLink);

  // Set response headers for PDF streaming
  const filename = `${serviceName}-receipt-${Date.now()}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename=${filename}`);

  // Create PDF document with proper font encoding
  const doc = new PDFDocument({
    size: [RECEIPT_WIDTH, 600],
    margins: { top: 10, left: 10, right: 10, bottom: 10 },
    // Ensure proper Unicode support
    font: 'Helvetica',
  });

  doc.pipe(res);

  // Logo
  const logoPath =
    process.env.NODE_ENV === 'production'
      ? `ehmrs-api/public/Caroline.png`
      : 'src/public/Caroline.png';

  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, (RECEIPT_WIDTH - 60) / 2, 10, { width: 60 });
  }
  doc.moveDown(1);

  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('Heritage Kidney and Medical Care', { align: 'center' })
    .moveDown(0.2)
    .fontSize(8)
    .font('Helvetica')
    .text('kaura District, Opp. Suncity', { align: 'center' })
    .moveDown(0.5);

  // Receipt Title
  doc
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('PAYMENT RECEIPT', { align: 'center', underline: true })
    .moveDown(1);

  // Patient Info
  doc
    .fontSize(8)
    .font('Helvetica-Bold')
    .text('Patient Details', { align: 'left', underline: true })
    .font('Helvetica')
    .text(`Name: ${patientName}`)
    .text(`Phone: ${patientPhone}`)
    .moveDown(0.5);

  // Transaction Info
  doc
    .fontSize(8)
    .font('Helvetica')
    .text(`Date: ${new Date(payment.transaction_date).toLocaleString()}`)
    .text(`Receipt No: ${payment.transaction_id}`)
    .text(`Payment Mode: ${payment.mode_of_payment}`)
    .moveDown(0.5);

  // Helper function to render numbered items
  const renderNumberedItems = (items: Array<{ name: string; amount: number }>, title: string) => {
    doc.fontSize(9).font('Helvetica-Bold');
    doc.text(`${title}:`, { underline: true });

    items.forEach((item, index) => {
      doc.font('Helvetica').text(`${index + 1}. ${item.name} (${formatCurrency(item.amount)})`);
    });
  };

  // List all items for this payment type with numbering
  doc.moveDown(0.5);

  switch (serviceName) {
    case ServiceName.DRUGS:
      const drugItems = payments.map(p => ({
        name: p.drug?.drug?.name || 'N/A',
        amount: p?.amount || 0,
      }));
      renderNumberedItems(drugItems, 'Drugs');
      break;

    case ServiceName.TESTS:
      const testItems = payments.map(p => ({
        name: p.test?.test?.name || 'N/A',
        amount: p?.amount || 0,
      }));
      renderNumberedItems(testItems, 'Tests');
      break;

    case ServiceName.INVESTIGATIONS:
      const investigationItems = payments.map(p => ({
        name: p.investigation?.investigation?.name || 'N/A',
        amount: p?.amount || 0,
      }));
      renderNumberedItems(investigationItems, 'Investigations');
      break;

    case ServiceName.SERVICES:
      const serviceItems = payments.map(p => ({
        name: p.service?.service?.name || 'N/A',
        amount: p?.amount || 0,
      }));
      renderNumberedItems(serviceItems, 'Services');
      break;

    case ServiceName.ITEMS:
      const itemsList = payments.map(p => ({
        name: p.item?.drug?.name || 'N/A',
        amount: p?.amount || 0,
      }));
      renderNumberedItems(itemsList, 'Items');
      break;

    default:
      // Mixed items - group by type and number them
      doc.fontSize(9).font('Helvetica-Bold');
      doc.text('Items:', { underline: true });

      let itemCounter = 1;
      payments.forEach(p => {
        if (p.drug) {
          doc
            .font('Helvetica')
            .text(
              `${itemCounter}. Drug: ${p.drug.drug?.name || 'N/A'} (${formatCurrency(
                p?.amount || 0
              )})`
            );
          itemCounter++;
        }
        if (p.test) {
          doc
            .font('Helvetica')
            .text(
              `${itemCounter}. Test: ${p.test.test?.name || 'N/A'} (${formatCurrency(
                p?.amount || 0
              )})`
            );
          itemCounter++;
        }
        if (p.investigation) {
          doc
            .font('Helvetica')
            .text(
              `${itemCounter}. Investigation: ${p.investigation.investigation?.name ||
                'N/A'} (${formatCurrency(p?.amount || 0)})`
            );
          itemCounter++;
        }
        if (p.service) {
          doc
            .font('Helvetica')
            .text(
              `${itemCounter}. Service: ${p.service.service?.name || 'N/A'} (${formatCurrency(
                p?.amount || 0
              )})`
            );
          itemCounter++;
        }
        if (p.item) {
          doc
            .font('Helvetica')
            .text(
              `${itemCounter}. Item: ${p.item.drug?.name || 'N/A'} (${formatCurrency(
                p?.amount || 0
              )})`
            );
          itemCounter++;
        }
      });
      break;
  }

  // Narration/Notes (from first payment)
  if (payment.narration) {
    doc
      .moveDown(0.5)
      .font('Helvetica-Oblique')
      .text(`Narration: ${payment.narration}`);
  }
  if (payment.notes) {
    doc.font('Helvetica-Oblique').text(`Notes: ${payment.notes}`);
  }

  // Total Amount (sum all payments) - using the fixed currency formatting
  const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  doc
    .moveDown(0.5)
    .fontSize(12)
    .font('Helvetica-Bold')
    .text(`Amount Paid: ${formatCurrency(totalAmount)}`, { align: 'center' })
    .moveDown(0.5);

  // QR Code
  doc.image(qrImage, (RECEIPT_WIDTH - 60) / 2, doc.y, { width: 60 });
  doc.moveDown(1);

  doc
    .fontSize(7)
    .font('Helvetica')
    .text('Scan QR code to verify receipt', { align: 'center' })
    .moveDown(0.2)
    .font('Helvetica-Oblique');

  doc
    .moveDown(0.5)
    .fontSize(9)
    .font('Helvetica')
    .text('Thank you for your payment!', { align: 'center' })
    .moveDown(0.2)
    .text('Service To All', { align: 'center' });

  doc
    .moveDown(1)
    .fontSize(7)
    .font('Helvetica-Oblique')
    .text('Powered by Prismaspark Dynamics Ltd.', { align: 'center' });

  return doc.end();
};
