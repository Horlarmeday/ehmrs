import { Response } from 'express';
import PDFDocumentWithTable from './pdfKitTable';

export type ApprovalInfo = {
  tester?: string;
  conducted_date?: string | null;
  verified_by?: string | null;
  verified_date?: string | null;
  approved_by?: string | null;
  approved_date?: string | null;
};

export type Result = {
  name?: string;
  model?: string;
  range?: string;
  rows: string[] | string[][];
  headers: string[];
  align?: string[];
};

export type TestResult = {
  test: string;
  results: Result[];
  approval?: ApprovalInfo;
};

export type PatientInfo = {
  patientName: string;
  patientId: string;
  age: number;
  sex: string;
  orderDate: string;
  accession_number: string;
  collectionDate: string;
  reportDate: string;
  test_verifier: string;
  test_approver: string;
  sample_receiver: string;
  tester: string;
};

const THEME = {
  primary: '#0f4c81', // Medical Deep Navy
  primaryLight: '#eef4fb', // Subtle Ice Blue
  textDark: '#1e293b', // Slate 800
  textMuted: '#64748b', // Slate 500
  cardBg: '#f8fafc', // Slate 50
  cardBorder: '#cbd5e1', // Slate 300
  white: '#ffffff',
};

export const downloadTestResult = (
  patientInfo: PatientInfo,
  testResults: TestResult[],
  res: Response
) => {
  const doc = new PDFDocumentWithTable({
    margin: 40,
    size: 'A4',
    bufferPages: true,
  });
  doc.page.margins.bottom = 60; // keep content clear of the footer band

  const filename = `Lab_Report_${patientInfo.accession_number || 'Result'}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

  doc.pipe(res);

  generateHeader(doc);
  generatePatientCard(doc, patientInfo);

  const contentWidth = doc.page.width - 80;

  testResults.forEach(testResult => {
    if (doc.y + 120 > doc.page.height - 120) {
      doc.addPage();
    }

    generateTestHeader(doc, testResult.test, contentWidth);
    generateResultTable(doc, testResult, contentWidth);

    if (testResult.approval) {
      generateInlineApproval(doc, testResult.approval, contentWidth);
    }
    doc.moveDown(0.6);
  });

  generateSignatureSection(doc, patientInfo.test_verifier, patientInfo.test_approver);
  generatePageFooters(doc);

  doc.end();
};

function generateHeader(doc: PDFDocumentWithTable) {
  const logoPath =
    process.env.NODE_ENV === 'production'
      ? 'ehmrs-api/public/images/logo-letter-1.png'
      : 'src/public/images/logo-letter-2.png';

  // Accent bar
  doc.rect(0, 0, doc.page.width, 5).fill(THEME.primary);

  // Logo fallback handler
  try {
    doc.image(logoPath, 40, 20, { width: 44 });
  } catch {
    doc.roundedRect(40, 20, 44, 44, 4).fill(THEME.primaryLight);
    doc
      .fillColor(THEME.primary)
      .fontSize(8)
      .text('HOSPITAL', 44, 38);
  }

  // Facility Details
  doc
    .fillColor(THEME.primary)
    .font('Helvetica-Bold')
    .fontSize(13)
    .text('ST. VINCENT DE PAUL HOSPITAL', 92, 22)
    .font('Helvetica')
    .fontSize(8)
    .fillColor(THEME.textMuted)
    .text('Diagnostic Laboratory & Pathology Center', 92, 37)
    .text('Plot 505, Cadastral Zone F01, Kubwa Extension, FCT – Abuja', 92, 48);

  // Contact Info
  doc
    .fontSize(8)
    .fillColor(THEME.textMuted)
    .text('dcstvinhosp@gmail.com', 350, 25, { align: 'right', width: 205 })
    .text('+234 (0) 813 484 8878', 350, 36, { align: 'right', width: 205 })
    .text('www.stvincenthospital.ng', 350, 47, { align: 'right', width: 205 });

  doc
    .strokeColor(THEME.cardBorder)
    .lineWidth(0.5)
    .moveTo(40, 70)
    .lineTo(doc.page.width - 40, 70)
    .stroke();

  doc.y = 78;
  doc
    .fillColor(THEME.textDark)
    .font('Helvetica-Bold')
    .fontSize(11)
    .text('LABORATORY INVESTIGATION REPORT', 40, 78, { align: 'center' });

  doc.y = 96;
}

function generatePatientCard(doc: PDFDocumentWithTable, patient: PatientInfo) {
  const startX = 40;
  const startY = doc.y;
  const cardWidth = doc.page.width - 80;
  const cardHeight = 65;

  doc
    .roundedRect(startX, startY, cardWidth, cardHeight, 5)
    .fillAndStroke(THEME.cardBg, THEME.cardBorder);

  const col1X = startX + 12;
  const col2X = startX + 185;
  const col3X = startX + 360;
  const row1Y = startY + 10;
  const row2Y = startY + 26;
  const row3Y = startY + 42;

  const renderField = (label: string, value: string | number, x: number, y: number) => {
    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor(THEME.textMuted)
      .text(label, x, y, { continued: true })
      .font('Helvetica-Bold')
      .fillColor(THEME.textDark)
      .text(`  ${value || '—'}`);
  };

  renderField('Patient Name:', patient.patientName, col1X, row1Y);
  renderField('Patient ID:', patient.patientId, col1X, row2Y);
  renderField('Age / Sex:', `${patient.age} Yrs / ${patient.sex}`, col1X, row3Y);

  renderField('Accession No:', patient.accession_number, col2X, row1Y);
  renderField('Order Date:', patient.orderDate, col2X, row2Y);
  renderField('Collection Date:', patient.collectionDate, col2X, row3Y);

  renderField('Report Date:', patient.reportDate || 'N/A', col3X, row1Y);
  renderField('Sample Receiver:', patient.sample_receiver || 'N/A', col3X, row2Y);
  renderField('Lab Scientist:', patient.tester || 'N/A', col3X, row3Y);

  doc.y = startY + cardHeight + 12;
}

function generateTestHeader(doc: PDFDocumentWithTable, testName: string, width: number) {
  const startY = doc.y;
  const height = 20;

  doc.roundedRect(40, startY, width, height, 3).fill(THEME.primary);

  doc
    .fillColor(THEME.white)
    .font('Helvetica-Bold')
    .fontSize(9)
    .text(testName.toUpperCase(), 48, startY + 5, {
      width: width - 16,
      align: 'left',
    });

  doc.y = startY + height + 6;
}

function generateResultTable(doc: PDFDocumentWithTable, testResult: TestResult, width: number) {
  if (!testResult.results || testResult.results.length === 0) return;

  // Flatten and normalize rows into string[][]
  const normalizedRows: string[][] = [];
  testResult.results.forEach(item => {
    if (!item?.rows) return;
    if (Array.isArray(item.rows[0])) {
      (item.rows as string[][]).forEach(r => {
        normalizedRows.push(r.map(c => String(c ?? '')));
      });
    } else {
      normalizedRows.push((item.rows as string[]).map(c => String(c ?? '')));
    }
  });

  const rawHeaders = testResult.results[0]?.headers || ['Test Name', 'Result', 'Ref Range'];
  const headers = rawHeaders.map(h => String(h).toUpperCase());

  doc.table(
    {
      headers,
      rows: normalizedRows,
    },
    {
      columnSpacing: 10,
      rowSpacing: 6,
      width,
      prepareHeader: () => {
        doc
          .font('Helvetica-Bold')
          .fontSize(8)
          .fillColor(THEME.textDark);
        doc.strokeColor(THEME.primary);
      },
      prepareRow: () => {
        doc
          .font('Helvetica')
          .fontSize(8.5)
          .fillColor(THEME.textDark);
        doc.strokeColor(THEME.cardBorder);
      },
    }
  );
}

function generateInlineApproval(doc: PDFDocumentWithTable, approval: ApprovalInfo, width: number) {
  const parts = [
    approval.conducted_date && `Tested: ${approval.conducted_date}`,
    approval.verified_date && `Verified: ${approval.verified_date}`,
    approval.approved_date && `Approved: ${approval.approved_date}`,
  ].filter(Boolean);

  if (!parts.length) return;

  doc.y += 2;
  doc
    .fillColor(THEME.textMuted)
    .font('Helvetica')
    .fontSize(7.5)
    .text(parts.join('   |   '), 40, doc.y, {
      width,
      align: 'right',
    });
}

function generateSignatureSection(doc: PDFDocumentWithTable, verifier: string, approver: string) {
  const pageHeight = doc.page.height;
  const pageWidth = doc.page.width;

  if (doc.y > pageHeight - 110) {
    doc.addPage();
  }

  const signAreaY = pageHeight - 95;
  const boxWidth = 180;
  const leftColX = 55;
  const rightColX = pageWidth - 55 - boxWidth;

  const renderSignatory = (x: number, title: string, name: string) => {
    doc
      .fontSize(9)
      .fillColor(THEME.textDark)
      .font('Helvetica-Bold')
      .text(name || 'Pending Sign-off', x, signAreaY - 14, {
        width: boxWidth,
        align: 'center',
      });

    doc
      .strokeColor(THEME.cardBorder)
      .lineWidth(0.8)
      .moveTo(x, signAreaY)
      .lineTo(x + boxWidth, signAreaY)
      .stroke();

    doc
      .fontSize(7.5)
      .font('Helvetica')
      .fillColor(THEME.textMuted)
      .text(title, x, signAreaY + 4, {
        width: boxWidth,
        align: 'center',
      });
  };

  renderSignatory(leftColX, 'Medical Laboratory Scientist (Verified)', verifier);
  renderSignatory(rightColX, 'Consultant Pathologist (Approved)', approver);
}

function generatePageFooters(doc: PDFDocumentWithTable) {
  const range = doc.bufferedPageRange();
  const pageHeight = doc.page.height;
  const pageWidth = doc.page.width;
  const note =
    'Kindly note that, this result must be signed and stamped before it can be considered valid.';

  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);

    // no `width` + lineBreak: false → bypasses LineWrapper's maxY check,
    // so drawing below the bottom margin cannot trigger a phantom page break
    doc
      .fontSize(7)
      .font('Helvetica')
      .fillColor(THEME.textMuted)
      .text(note, 40, pageHeight - 26, { lineBreak: false });

    // align: 'right' requires a width, so measure and position manually
    const label = `Page ${i + 1} of ${range.count}`;
    const labelWidth = doc.widthOfString(label);
    doc
      .fontSize(7.5)
      .font('Helvetica')
      .fillColor(THEME.textMuted)
      .text(label, pageWidth - 40 - labelWidth, pageHeight - 26, { lineBreak: false });
  }
}
