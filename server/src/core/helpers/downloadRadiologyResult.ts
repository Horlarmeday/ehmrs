import { Response } from 'express';
import { PatientInfo } from './downloadTestResult';
import PDFDocument from './pdfKitTable';
import axios from 'axios';

export type RadiologyResult = {
  investigationName: string;
  result: string; // HTML content with embedded images
  approvedDate: string;
  approvedBy: string;
};

export const downloadRadiologyResult = async (
  patientInfo: PatientInfo,
  radiologyResults: RadiologyResult[],
  res: Response
) => {
  const doc = new PDFDocument({});
  const filename = `${patientInfo.patientName}_${patientInfo.accession_number}_radiology_result.pdf`;

  // Set response headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

  doc.pipe(res);

  // Generate PDF content
  generateHeader(doc);
  generatePatientInformation(doc, patientInfo);
  
  let currentY = doc.y;
  
  for (const result of radiologyResults) {
    if (currentY + 200 > doc.page.height - 100) {
      doc.addPage();
      currentY = 50;
    }
    currentY = await generateInvestigationResult(doc, result, currentY);
  }

  addSignaturesAndFooter(doc, patientInfo.test_verifier, patientInfo.test_approver);

  return doc.end();
};

function generateHeader(doc: PDFDocument) {
  const filePath =
    process.env.NODE_ENV === 'production'
      ? `server/public/Caroline.png`
      : 'src/public/Caroline.png';
  doc
    .image(filePath, 50, 45, { width: 50 })
    .fillColor('#444444')
    .fontSize(15)
    .text('Heritage Kidney and Medical Care', 110, 62)
    .fontSize(11)
    .text('Kaura District, Opp. Suncity', 200, 55, { align: 'right' })
    .text('Abuja,', 200, 70, { align: 'right' })
    .text('Federal Capital Territory, Nigeria.', 200, 85, { align: 'right' })
    .text('support@heritagekidney.com', 200, 100, { align: 'right' })
    .text('08134848878', 200, 115, { align: 'right' })
    .moveDown(1.5);
}

function generatePatientInformation(doc: PDFDocument, patientInfo: PatientInfo) {
  doc
    .fillColor('#444444')
    .fontSize(20)
    .text('Radiology Investigation Result', 50, 160, { align: 'center' });

  generateHr(doc, 185);

  const patientInformationTop = 200;

  doc
    .fontSize(10)
    .text('Accession Number:', 71, patientInformationTop)
    .font('Helvetica-Bold')
    .text(patientInfo.accession_number, 171, patientInformationTop)
    .font('Helvetica')
    .text('Order Date:', 71, patientInformationTop + 15)
    .text(patientInfo.orderDate, 171, patientInformationTop + 15)
    .text('Report Date:', 71, patientInformationTop + 30)
    .text(patientInfo.reportDate, 171, patientInformationTop + 30)

    .text('Patient Name:', 321, patientInformationTop)
    .font('Helvetica-Bold')
    .text(patientInfo.patientName, 401, patientInformationTop)
    .font('Helvetica')
    .text('Patient ID:', 321, patientInformationTop + 15)
    .text(patientInfo.patientId, 401, patientInformationTop + 15)
    .text('Other Details:', 321, patientInformationTop + 30)
    .text(patientInfo.sex + ', ' + patientInfo.age + ' years, ', 401, patientInformationTop + 30)
    .moveDown();

  generateHr(doc, 252);
  doc.moveDown();
}

async function generateInvestigationResult(
  doc: PDFDocument,
  result: RadiologyResult,
  y: number
): Promise<number> {
  doc.y = y;
  doc.moveDown(1.5);

  const tableWidth = 465;
  const rectX = (doc.page.width - tableWidth) / 2;

  // Investigation name header with background
  doc
    .fillColor('#f0f0f0')
    .rect(rectX, doc.y - 5, tableWidth, 25)
    .fill();

  doc
    .fillColor('#444444')
    .fontSize(12)
    .text(result.investigationName, rectX, doc.y, {
      width: tableWidth,
      align: 'center',
    });

  doc.moveDown(1);

  // Add approval info if available
  if (result.approvedDate) {
    doc
      .fontSize(9)
      .fillColor('#666666')
      .text(
        `Approved: ${result.approvedDate} by ${result.approvedBy || 'Radiologist'}`,
        rectX,
        doc.y,
        { width: tableWidth, align: 'left' }
      );
    doc.moveDown(0.5);
  }

  // Process HTML content
  const textContent = stripHtmlTags(result.result);
  
  doc
    .fontSize(11)
    .fillColor('#444444')
    .text(textContent, rectX, doc.y, {
      width: tableWidth,
      align: 'left',
      lineGap: 5,
    });

  doc.moveDown(2);

  return doc.y;
}

function stripHtmlTags(html: string): string {
  if (!html) return 'No result content available';
  
  // Basic HTML to text conversion
  let text = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<li>/gi, '• ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
  
  return text;
}

function addSignaturesAndFooter(doc: PDFDocument, verifier: string, approver: string) {
  const pageHeight = doc.page.height;
  const pageWidth = doc.page.width;

  if (doc.y > pageHeight - 250) {
    doc.addPage();
  }

  const signatureY = pageHeight - 150;
  const lineWidth = 200;

  doc.fontSize(10);

  // Verifier
  generateVerifierLineAndName(doc, pageWidth, lineWidth, signatureY, 'Verified By:', verifier);
  // Approver
  generateApproverLineAndName(doc, pageWidth, lineWidth, signatureY, 'Approved By', approver);

  generateFooter(doc);
}

function generateVerifierLineAndName(
  doc: PDFDocument,
  pageWidth: number,
  lineWidth: number,
  signatureY: number,
  text: string,
  name: string
) {
  doc
    .fontSize(11)
    .fillColor('#000000')
    .font('Helvetica-Bold')
    .text(name, pageWidth / 4 - lineWidth / 2, signatureY - 20, {
      width: lineWidth,
      align: 'center',
    });

  doc
    .strokeColor('#aaaaaa')
    .lineWidth(1)
    .moveTo(pageWidth / 4 - lineWidth / 2, signatureY)
    .lineTo(pageWidth / 4 + lineWidth / 2, signatureY)
    .stroke();

  doc
    .fontSize(9)
    .font('Helvetica')
    .text(text, pageWidth / 4 - lineWidth / 2, signatureY + 5, {
      width: lineWidth,
      align: 'center',
    });
}

function generateApproverLineAndName(
  doc: PDFDocument,
  pageWidth: number,
  lineWidth: number,
  signatureY: number,
  text: string,
  name: string
) {
  doc
    .fontSize(11)
    .fillColor('#000000')
    .font('Helvetica-Bold')
    .text(name, (3 * pageWidth) / 4 - lineWidth / 2, signatureY - 20, {
      width: lineWidth,
      align: 'center',
    });

  doc
    .strokeColor('#aaaaaa')
    .lineWidth(1)
    .moveTo((3 * pageWidth) / 4 - lineWidth / 2, signatureY)
    .lineTo((3 * pageWidth) / 4 + lineWidth / 2, signatureY)
    .stroke();

  doc
    .fontSize(9)
    .font('Helvetica')
    .text(text, (3 * pageWidth) / 4 - lineWidth / 2, signatureY + 5, {
      width: lineWidth,
      align: 'center',
    });
}

function generateFooter(doc: PDFDocument) {
  const pageHeight = doc.page.height;
  const pageWidth = doc.page.width;

  doc.page.margins = {
    top: 0,
    bottom: 0,
    left: 50,
    right: 50,
  };

  doc
    .fontSize(10)
    .fillColor('#000000')
    .text(
      'Kindly note that, this result must be signed and stamped before it can be considered valid.',
      50,
      pageHeight - 30,
      {
        align: 'center',
        width: pageWidth - 100,
      }
    );

  doc.page.margins = {
    top: 50,
    bottom: 50,
    left: 50,
    right: 50,
  };
}

function generateHr(doc: PDFDocument, y: number, lineWidth = 1) {
  doc
    .strokeColor('#aaaaaa')
    .lineWidth(lineWidth)
    .moveTo(71, y)
    .lineTo(540, y)
    .stroke();
}

