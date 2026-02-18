import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import fs from 'fs';
import { Response } from 'express';
import {
  ClinicalPayment,
  ClinicalBill,
  ClinicalBillItem,
  Patient,
  ClinicalPaymentItem,
} from '../../../database/models';
import { PaymentMethod, PaymentStatus, PaymentType } from '../enums';

export interface ClinicalReceiptData {
  payment: ClinicalPayment;
  bill: ClinicalBill;
  billItems: ClinicalBillItem[];
  paymentItems: ClinicalPaymentItem[]; // Payment-item records showing what was actually paid for
  patient: Patient;
}

export interface PrintClinicalReceiptType {
  receiptData: ClinicalReceiptData;
  res: Response;
}

export interface PatientDepositReceiptData {
  deposit: any;
  patient: any;
  createdBy?: any;
  updatedBy?: any;
  bankAccount?: any;
  posTerminal?: any;
  transactions: any[];
  totals: {
    totalAmount: number;
    currentBalance: number;
    totalUsed: number;
    totalRefunded: number;
    totalAdjusted: number;
  };
}

export interface PrintPatientDepositReceiptType {
  receiptData: PatientDepositReceiptData;
  res: Response;
}

const formatCurrency = (value: number) => {
  // Format number with commas and 2 decimal places, then add NGN prefix
  // This avoids the problematic ₦ symbol entirely
  const number = (value || 0).toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `N${number}`;
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const printClinicalReceiptPDF = async ({ receiptData, res }: PrintClinicalReceiptType) => {
  const { payment, bill, billItems, paymentItems, patient } = receiptData;

  // Use same paper size as existing helper (80mm receipt)
  const RECEIPT_WIDTH = 226.77; // 80mm in points
  const RECEIPT_HEIGHT = 600;

  // Patient details
  const patientName = patient
    ? `${patient.firstname || ''} ${patient.lastname || ''}`.trim()
    : 'N/A';
  const patientPhone = patient?.phone || 'N/A';
  const patientId = patient?.id || 'N/A';

  // Generate QR code for receipt verification
  const verificationData = `Receipt: ${
    payment.payment_reference
  }, Patient: ${patientName}, Amount: ${formatCurrency(payment.amount)}`;
  const qrImage = await QRCode.toDataURL(verificationData);

  // Set response headers for PDF streaming
  const filename = `receipt-${payment.payment_reference}-${Date.now()}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

  // Create PDF document with same settings as existing helper
  const doc = new PDFDocument({
    size: [RECEIPT_WIDTH, RECEIPT_HEIGHT],
    margins: { top: 10, left: 10, right: 10, bottom: 10 },
    font: 'Helvetica',
  });

  doc.pipe(res);

  // Logo (same path logic as existing helper)
  const logoPath =
    process.env.NODE_ENV === 'production'
      ? `server/public/health-clone.png`
      : 'src/public/health-clone.png';

  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, (RECEIPT_WIDTH - 60) / 2, 10, { width: 60 });
  }
  doc.moveDown(1);

  // Hospital Header (same as existing helper)
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('Health Clone Medical Center', { align: 'center' })
    .moveDown(0.2)
    .fontSize(8)
    .font('Helvetica')
    .text('Karu. ', { align: 'center' })
    .moveDown(0.5);

  // Receipt Title
  doc
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('PAYMENT RECEIPT', { align: 'center', underline: true })
    .moveDown(1);

  // Receipt Number and Date
  doc
    .fontSize(8)
    .font('Helvetica-Bold')
    .text(`Receipt No: ${payment.payment_reference}`, { align: 'left' })
    .font('Helvetica')
    .text(`Date: ${formatDate(payment.processed_at || new Date())}`)
    .text(`Bill No: ${bill.bill_number}`)
    .moveDown(0.5);

  // Patient Information
  doc
    .fontSize(8)
    .font('Helvetica-Bold')
    .text('Patient Details', { align: 'left', underline: true })
    .font('Helvetica')
    .text(`Name: ${patientName}`)
    .text(`ID: ${patientId}`)
    .text(`Phone: ${patientPhone}`)
    .moveDown(0.5);

  // Payment Information
  doc
    .fontSize(8)
    .font('Helvetica-Bold')
    .text('Payment Details', { align: 'left', underline: true })
    .font('Helvetica')
    .text(`Method: ${payment.payment_method}`)
    .text(`Type: ${payment.payment_type}`)
    .text(`Status: ${payment.status}`)
    .text(`Amount: ${formatCurrency(payment.amount)}`)
    .moveDown(0.5);

  // Bill Items - Show only items that were actually paid for
  if (paymentItems && paymentItems.length > 0) {
    doc
      .fontSize(8)
      .font('Helvetica-Bold')
      .text('Items Paid For', { align: 'left', underline: true })
      .moveDown(0.2);

    paymentItems.forEach((paymentItem, index) => {
      const billItem = billItems.find(item => item.id === paymentItem.bill_item_id);
      if (billItem) {
        doc
          .font('Helvetica')
          .fontSize(7)
          .text(`${index + 1}. ${billItem.item_name}`, { align: 'left' })
          .text(
            `   Qty: ${billItem.quantity} × ${formatCurrency(
              billItem.unit_price
            )} = ${formatCurrency(billItem.total_price)}`,
            { align: 'left' }
          );

        if (billItem.discount_amount && billItem.discount_amount > 0) {
          doc.text(`   Discount: -${formatCurrency(billItem.discount_amount)}`, { align: 'left' });
        }

        doc.text(`   Final: ${formatCurrency(billItem.final_price)}`, { align: 'left' });

        // Show payment details for this item
        if (paymentItem.payment_status === 'PARTIAL') {
          doc.text(
            `   Amount Paid: ${formatCurrency(paymentItem.amount_paid)} (${
              paymentItem.payment_percentage
            }%)`,
            { align: 'left' }
          );
        } else {
          doc.text(`   Amount Paid: ${formatCurrency(paymentItem.amount_paid)}`, { align: 'left' });
        }

        doc.moveDown(0.2);
      }
    });
  }

  // Payment Summary - Show what was actually paid for
  doc
    .moveDown(0.5)
    .fontSize(8)
    .font('Helvetica-Bold')
    .text('Payment Summary', { align: 'left', underline: true })
    .font('Helvetica');

  // Calculate totals from payment items
  const totalPaidForItems = paymentItems.reduce(
    (sum, item) => sum + parseFloat(item.amount_paid.toString()),
    0
  );
  const totalItemsCost = paymentItems.reduce((sum, item) => {
    const billItem = billItems.find(bi => bi.id === item.bill_item_id);
    return (
      sum +
      (billItem
        ? parseFloat(billItem.final_price?.toString() || billItem.total_price?.toString() || '0')
        : 0)
    );
  }, 0);

  doc.text(`Items Paid For: ${formatCurrency(totalPaidForItems)}`);

  if (totalPaidForItems < totalItemsCost) {
    doc.text(`Remaining Balance: ${formatCurrency(totalItemsCost - totalPaidForItems)}`);
  }

  doc.moveDown(0.5);

  // Total Amount Paid
  doc
    .fontSize(10)
    .font('Helvetica-Bold')
    .text(`Total Amount Paid: ${formatCurrency(payment.amount)}`, { align: 'center' })
    .moveDown(0.5);

  // Notes
  if (payment.notes) {
    doc
      .moveDown(0.5)
      .fontSize(7)
      .font('Helvetica-Oblique')
      .text(`Notes: ${payment.notes}`, { align: 'left' });
  }

  // QR Code for verification
  doc.image(qrImage, (RECEIPT_WIDTH - 60) / 2, doc.y, { width: 60 });
  doc.moveDown(1);

  doc
    .fontSize(7)
    .font('Helvetica')
    .text('Scan QR code to verify receipt', { align: 'center' })
    .moveDown(0.2)
    .font('Helvetica-Oblique');

  // Footer
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

export const printPatientDepositReceiptPDF = async ({
  receiptData,
  res,
}: PrintPatientDepositReceiptType) => {
  const { deposit, patient, createdBy, bankAccount, posTerminal, totals } = receiptData;

  const RECEIPT_WIDTH = 226.77;
  const RECEIPT_HEIGHT = 720;

  const toNumber = (value: any) => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const patientName = patient
    ? `${patient.firstname || ''} ${patient.lastname || ''}`.trim()
    : 'N/A';
  const patientPhone = patient?.phone || 'N/A';
  const patientId = patient?.hospital_id || patient?.id || 'N/A';

  const createdByName = createdBy
    ? `${createdBy.firstname || ''} ${createdBy.lastname || ''}`.trim()
    : 'System';

  const referenceNumber = deposit?.reference_number || deposit?.referenceNumber || 'N/A';
  const receiptAmount = toNumber(deposit?.amount || totals?.totalAmount || 0);
  const currentBalance = toNumber(
    totals?.currentBalance ?? deposit?.current_balance ?? deposit?.amount ?? 0
  );
  const depositStatus = deposit?.status || 'UNKNOWN';
  const depositType = deposit?.deposit_type || deposit?.payment_method || 'N/A';
  const depositDate =
    deposit?.deposit_date || deposit?.createdAt || deposit?.created_at || new Date().toISOString();

  const paymentChannelLines: string[] = [];
  if (bankAccount) {
    const accountName = bankAccount.account_name || bankAccount.accountName;
    const accountNumber = bankAccount.account_number || bankAccount.accountNumber;
    const bankName = bankAccount.bank_name || bankAccount.bankName;
    paymentChannelLines.push(`Bank: ${bankName || 'N/A'}`);
    paymentChannelLines.push(`Account: ${accountName || 'N/A'} (${accountNumber || 'N/A'})`);
  } else if (posTerminal) {
    paymentChannelLines.push(`POS Terminal: ${posTerminal.terminal_id || 'N/A'}`);
    paymentChannelLines.push(`Type: ${posTerminal.terminal_type || 'N/A'}`);
    if (posTerminal.merchant_name) {
      paymentChannelLines.push(`Provider: ${posTerminal.merchant_name}`);
    }
  } else {
    paymentChannelLines.push('Channel: Cash');
  }

  const verificationData = `Deposit: ${referenceNumber}, Patient: ${patientName}, Amount: ${formatCurrency(
    receiptAmount
  )}`;
  const qrImage = await QRCode.toDataURL(verificationData);

  const filename = `deposit-receipt-${referenceNumber}-${Date.now()}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

  const doc = new PDFDocument({
    size: [RECEIPT_WIDTH, RECEIPT_HEIGHT],
    margins: { top: 10, left: 10, right: 10, bottom: 10 },
    font: 'Helvetica',
  });

  doc.pipe(res);

  const logoPath =
    process.env.NODE_ENV === 'production' ? `server/public/health-clone.png` : 'src/public/health-clone.png';

  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, (RECEIPT_WIDTH - 60) / 2, 10, { width: 60 });
  }

  doc.moveDown(1);

  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('Health Clone Medical Center', { align: 'center' })
    .moveDown(0.2)
    .fontSize(8)
    .font('Helvetica')
    .text('Karu. ', { align: 'center' })
    .moveDown(0.5);

  doc
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('PATIENT DEPOSIT RECEIPT', { align: 'center', underline: true })
    .moveDown(1);

  doc
    .fontSize(8)
    .font('Helvetica-Bold')
    .text(`Receipt No: ${referenceNumber}`, { align: 'left' })
    .font('Helvetica')
    .text(`Date: ${formatDate(depositDate)}`)
    .text(`Processed By: ${createdByName || 'System'}`)
    .moveDown(0.5);

  doc
    .fontSize(8)
    .font('Helvetica-Bold')
    .text('Patient Details', { align: 'left', underline: true })
    .font('Helvetica')
    .text(`Name: ${patientName}`)
    .text(`Hospital ID: ${patientId}`)
    .text(`Phone: ${patientPhone}`)
    .moveDown(0.5);

  doc
    .fontSize(8)
    .font('Helvetica-Bold')
    .text('Deposit Details', { align: 'left', underline: true })
    .font('Helvetica')
    .text(`Type: ${depositType}`)
    .text(`Status: ${depositStatus}`)
    .text(`Initial Amount: ${formatCurrency(receiptAmount)}`)
    .text(`Current Balance: ${formatCurrency(currentBalance)}`)
    .text(`Total Used: ${formatCurrency(totals?.totalUsed || 0)}`)
    .text(`Total Refunded: ${formatCurrency(totals?.totalRefunded || 0)}`)
    .moveDown(0.5);

  doc
    .font('Helvetica-Bold')
    .text('Payment Channel', { align: 'left', underline: true })
    .font('Helvetica');

  paymentChannelLines.forEach(line => {
    doc.text(line);
  });

  doc.moveDown(0.5);

  doc
    .fontSize(10)
    .font('Helvetica-Bold')
    .text(`Deposit Amount: ${formatCurrency(receiptAmount)}`, { align: 'center' })
    .moveDown(0.2)
    .text(`Current Balance: ${formatCurrency(currentBalance)}`, { align: 'center' })
    .moveDown(0.5);

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
    .text('Thank you for your patronage!', { align: 'center' })
    .moveDown(0.2)
    .text('Service To All', { align: 'center' });

  doc
    .moveDown(1)
    .fontSize(7)
    .font('Helvetica-Oblique')
    .text('Powered by Prismaspark Dynamics Ltd.', { align: 'center' });

  return doc.end();
};

export interface DepositTransactionReceiptData {
  transaction: any;
  deposit: any;
  patient: any;
  createdByStaff: any;
  bankAccount?: any;
  posTerminal?: any;
}

export interface PrintDepositTransactionReceiptType {
  receiptData: DepositTransactionReceiptData;
  res: Response;
  print?: boolean;
}

export const printDepositTransactionReceiptPDF = async ({
  receiptData,
  res,
  print = false,
}: PrintDepositTransactionReceiptType) => {
  const { transaction, deposit, patient, createdByStaff, bankAccount, posTerminal } = receiptData;

  const RECEIPT_WIDTH = 226.77;
  const RECEIPT_HEIGHT = 720;

  const toNumber = (value: any) => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const patientName = patient
    ? `${patient.firstname || ''} ${patient.lastname || ''}`.trim()
    : 'N/A';
  const patientPhone = patient?.phone || 'N/A';
  const patientId = patient?.hospital_id || patient?.id || 'N/A';

  const createdByName = createdByStaff
    ? `${createdByStaff.firstname || ''} ${createdByStaff.lastname || ''}`.trim()
    : 'System';

  const referenceNumber = transaction?.reference_number || 'N/A';
  const transactionType = transaction?.transaction_type || 'N/A';
  const transactionAmount = toNumber(transaction?.amount || 0);
  const previousBalance = toNumber(transaction?.previous_balance || 0);
  const newBalance = toNumber(transaction?.new_balance || 0);
  const depositType = deposit?.deposit_type || deposit?.payment_method || 'N/A';
  const depositReference = deposit?.reference_number || 'N/A';
  const transactionDate =
    transaction?.createdAt || transaction?.created_at || new Date().toISOString();
  const description = transaction?.description || '';

  const paymentChannelLines: string[] = [];
  if (bankAccount) {
    const accountName = bankAccount.account_name || bankAccount.accountName;
    const accountNumber = bankAccount.account_number || bankAccount.accountNumber;
    const bankName = bankAccount.bank_name || bankAccount.bankName;
    paymentChannelLines.push(`Bank: ${bankName || 'N/A'}`);
    paymentChannelLines.push(`Account: ${accountName || 'N/A'} (${accountNumber || 'N/A'})`);
  } else if (posTerminal) {
    paymentChannelLines.push(`POS Terminal: ${posTerminal.terminal_id || 'N/A'}`);
    paymentChannelLines.push(`Type: ${posTerminal.terminal_type || 'N/A'}`);
    if (posTerminal.merchant_name) {
      paymentChannelLines.push(`Provider: ${posTerminal.merchant_name}`);
    }
  } else {
    paymentChannelLines.push('Channel: Cash');
  }

  const verificationData = `Transaction: ${referenceNumber}, Type: ${transactionType}, Patient: ${patientName}, Amount: ${formatCurrency(
    transactionAmount
  )}`;
  const qrImage = await QRCode.toDataURL(verificationData);

  const filename = `deposit-transaction-receipt-${referenceNumber}-${Date.now()}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `${print ? 'inline' : 'attachment'}; filename=${filename}`
  );

  const doc = new PDFDocument({
    size: [RECEIPT_WIDTH, RECEIPT_HEIGHT],
    margins: { top: 10, left: 10, right: 10, bottom: 10 },
    font: 'Helvetica',
  });

  doc.pipe(res);

  const logoPath =
    process.env.NODE_ENV === 'production' ? `server/public/health-clone.png` : 'src/public/health-clone.png';

  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, (RECEIPT_WIDTH - 60) / 2, 10, { width: 60 });
  }

  doc.moveDown(1);

  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('Health Clone Medical Center', { align: 'center' })
    .moveDown(0.2)
    .fontSize(8)
    .font('Helvetica')
    .text('Karu. ', { align: 'center' })
    .moveDown(0.5);

  doc
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('DEPOSIT TRANSACTION RECEIPT', { align: 'center', underline: true })
    .moveDown(1);

  doc
    .fontSize(8)
    .font('Helvetica-Bold')
    .text(`Transaction Ref: ${referenceNumber}`, { align: 'left' })
    .font('Helvetica')
    .text(`Date: ${formatDate(transactionDate)}`)
    .text(`Type: ${transactionType}`)
    .text(`Processed By: ${createdByName || 'System'}`)
    .moveDown(0.5);

  doc
    .fontSize(8)
    .font('Helvetica-Bold')
    .text('Patient Details', { align: 'left', underline: true })
    .font('Helvetica')
    .text(`Name: ${patientName}`)
    .text(`Hospital ID: ${patientId}`)
    .text(`Phone: ${patientPhone}`)
    .moveDown(0.5);

  doc
    .fontSize(8)
    .font('Helvetica-Bold')
    .text('Transaction Details', { align: 'left', underline: true })
    .font('Helvetica')
    .text(`Deposit Ref: ${depositReference}`)
    .text(`Deposit Type: ${depositType}`)
    .text(`Previous Balance: ${formatCurrency(previousBalance)}`)
    .text(`Transaction Amount: ${formatCurrency(transactionAmount)}`)
    .text(`New Balance: ${formatCurrency(newBalance)}`);

  if (description) {
    doc.text(`Description: ${description}`);
  }

  doc.moveDown(0.5);

  doc
    .font('Helvetica-Bold')
    .text('Payment Channel', { align: 'left', underline: true })
    .font('Helvetica');

  paymentChannelLines.forEach(line => {
    doc.text(line);
  });

  doc.moveDown(0.5);

  doc
    .fontSize(10)
    .font('Helvetica-Bold')
    .text(`Transaction Amount: ${formatCurrency(transactionAmount)}`, { align: 'center' })
    .moveDown(0.2)
    .text(`New Balance: ${formatCurrency(newBalance)}`, { align: 'center' })
    .moveDown(0.5);

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
    .text('Thank you for your patronage!', { align: 'center' })
    .moveDown(0.2)
    .text('Service To All', { align: 'center' });

  doc
    .moveDown(1)
    .fontSize(7)
    .font('Helvetica-Oblique')
    .text('Powered by Prismaspark Dynamics Ltd.', { align: 'center' });

  return doc.end();
};
