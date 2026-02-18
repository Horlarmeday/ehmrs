import { Response } from 'express';
import PDFDocument from './pdfKitTable';

export type TestResult = {
  test: string;
  results: Result[];
};

type Result = {
  name: string;
  model: string;
  range: string;
  description?: string;
  rows: string[];
  headers: string[];
  align: string[];
};

export type PatientInfo = {
  patientName: string;
  patientId: string;
  age: number;
  sex: string;
  orderDate: string;
  accession_number: string;
  reportDate: string;
  test_verifier: string;
  test_approver: string;
  sample_receiver: string;
  tester: string;
};

export const downloadTestResult = (
  patientInfo: PatientInfo,
  testResults: TestResult[],
  res: Response
) => {
  const doc = new PDFDocument({});
  const filename = `${patientInfo.patientName}_${patientInfo.accession_number}_test_result.pdf`;
  // Stream the PDF output to a file (change 'lab_report.pdf' to your desired filename)
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

  doc.pipe(res);

  generateHeader(doc);
  generatePatientInformation(doc, patientInfo);
  // generateSampleCollectorAndTester(
  //   doc,
  //   patientInfo?.sample_receiver || 'N/A',
  //   patientInfo?.tester || 'N/A'
  // );

  let currentY = doc.y; // Starting Y position after patient information
  const tableWidth = 465;

  testResults.forEach(testResult => {
    if (currentY + 200 > doc.page.height - 100) {
      doc.addPage();
      currentY = 50; // Reset Y position for the new page
    }
    currentY = generateTestName(doc, testResult, currentY, tableWidth);
    currentY = generateResultTable(doc, testResult, currentY);
    doc.moveDown(1); // Add some space between tables
    currentY = doc.y; // Update currentY to the new position after moving down
  });

  // generateResultTable(doc, testResults);
  addStampSignatureAndFooter(doc, patientInfo.test_verifier, patientInfo.test_approver);
  // Finalize the PDF
  return doc.end();
};

function generateHeader(doc: PDFDocument) {
  const filePath =
    process.env.NODE_ENV === 'production'
      ? `server/public/health-clone.png`
      : 'src/public/health-clone.png';
  doc
    .image(filePath, 50, 45, { width: 50 })
    .fillColor('#444444')
    .fontSize(15)
    .text('Health Clone Medical Center', 110, 62)
    .fontSize(11)
    .text('Karu. ', 200, 55, { align: 'right' })
    .text('Abuja,', 200, 70, { align: 'right' })
    .text('Federal Capital Territory, Nigeria.', 200, 85, { align: 'right' })
    .text('support@healthclone.com', 200, 100, { align: 'right' })
    .text('08134848878', 200, 115, { align: 'right' })
    .moveDown(1.5);
}

function generatePatientInformation(doc: PDFDocument, patientInfo: PatientInfo) {
  doc
    .fillColor('#444444')
    .fontSize(20)
    .text('Lab Test Result', 50, 160, { align: 'center' });

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
    .text('Collection Date:', 71, patientInformationTop + 30)
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

function generateTestName(doc: PDFDocument, testResult: TestResult, y: number, tableWidth: number) {
  doc.y = y; // Set the current Y position
  doc.moveDown(1.5);

  const testName = testResult.test;
  const fontSize = 12;
  const padding = 10; // Padding on left and right
  const backgroundHeight = 25; // Height of the background rectangle

  // Calculate the position of the background rectangle
  const rectX = (doc.page.width - tableWidth) / 2; // Center the rectangle based on table width

  // Draw the background rectangle
  doc
    .fillColor('#f0f0f0') // Light gray background color
    .rect(rectX, doc.y - 5, tableWidth, backgroundHeight)
    .fill();

  // Write the test name
  doc
    .fillColor('#444444')
    .fontSize(fontSize)
    .text(testName, rectX, doc.y, {
      width: tableWidth,
      align: 'center',
    });

  return doc.y + backgroundHeight; // Return the new Y position after writing the test name
}

function generateResultTable(doc: PDFDocument, testResult: TestResult, y: number) {
  doc.y = y; // Set the current Y position
  // doc.moveDown(1.5);
  // Check if there's enough space on the current page
  // const tableHeight = (testResults.length + 1) * 30; // Estimate table height (adjust as needed)
  // if (doc.y + tableHeight > doc.page.height - 100) {
  //   doc.addPage(); // Add a new page if there's not enough space
  // }
  const rows = testResult.results.map(result => result?.rows);
  const headers = testResult.results[0].headers;
  const align = testResult.results[0].align;

  doc.table(
    {
      headers,
      rows,
    },
    {
      prepareHeader: () => doc.font('Helvetica-Bold'),
      prepareRow: () => doc.font('Helvetica'),
      align,
      padding: 5,
      borderWidth: 1,
      borderColor: '#ddd',
    }
  );

  // Render descriptions after the table
  // After table is rendered, doc.y will be at the bottom of the table
  const leftMargin = 71; // Left margin for text alignment
  const tableWidth = 465; // Table width
  const descriptionLeftMargin = leftMargin + 10; // Slightly indented from table

  // Add some space after the table before descriptions
  doc.moveDown(0.5);

  testResult.results.forEach((result) => {
    if (result.description && result.description.trim()) {
      // Check if we need a new page
      if (doc.y + 50 > doc.page.height - 100) {
        doc.addPage();
        doc.y = 50;
      }

      // Set font properties for text measurement
      doc.fontSize(10).font('Helvetica');

      // Calculate text height
      const padding = 10;
      const textWidth = tableWidth - 20 - padding * 2;
      const textHeight = doc.heightOfString(result.description, {
        width: textWidth,
        lineGap: 2,
      });

      // Calculate box dimensions
      const boxHeight = textHeight + padding * 2;
      const boxY = doc.y;
      const boxWidth = tableWidth - 20;

      // Draw grey background rectangle
      doc
        .fillColor('#f8f9fa')
        .rect(descriptionLeftMargin, boxY, boxWidth, boxHeight)
        .fill();

      // Draw border
      doc
        .strokeColor('#e0e0e0')
        .lineWidth(1)
        .rect(descriptionLeftMargin, boxY, boxWidth, boxHeight)
        .stroke();

      // Render text on top with padding
      doc
        .fillColor('#5e6278')
        .text(result.description, descriptionLeftMargin + padding, boxY + padding, {
          width: textWidth,
          align: 'left',
          lineGap: 2,
        });

      // Update doc.y to position after the description box
      doc.y = boxY + boxHeight;

      // Move down after description
      doc.moveDown(0.5);
    }
  });

  return doc.y; // Return the new Y position after generating the table and descriptions
}

function addStampSignatureAndFooter(doc: PDFDocument, verifier: string, approver: string) {
  // const pageHeight = doc.page.height;
  // const marginBottom = 50; // Adjust this value as needed
  //
  // // If there isn't enough space at the bottom of the current page, add a new page
  // if (doc.y > pageHeight - 100) {
  //   // 150 is an estimate for stamp + footer height, adjust as needed
  //   doc.addPage();
  // }
  //
  // // Calculate Y position for stamp and signature
  // const stampY = pageHeight - 100; // Adjust this value as needed
  //
  // generateStampAndSignature(doc, stampY);
  const pageHeight = doc.page.height;
  const pageWidth = doc.page.width;
  const margins = {
    top: 50,
    bottom: 50,
    left: 50,
    right: 50,
  };

  // If there isn't enough space at the bottom of the current page, add a new page
  if (doc.y > pageHeight - 250) {
    doc.addPage();
  }

  // Calculate Y position for signatures
  const signatureY = pageHeight - 150;
  const lineWidth = 200;

  doc.fontSize(10); // Font size for names

  // Verifier
  generateVerifierLineAndName(doc, pageWidth, lineWidth, signatureY, 'Verified By:', verifier);
  // Approver
  generateApproverLineAndName(doc, pageWidth, lineWidth, signatureY, 'Approved By', approver);

  generateFooter(doc);
}

function generateSampleCollectorAndTester(
  doc: PDFDocument,
  sampleReceiver: string,
  tester: string
) {
  const margin = 71;
  const availableWidth = doc.page.width - margin * 2;
  const halfWidth = availableWidth / 2;
  const currentY = doc.y + 10;
  doc.fontSize(10);

  // Left column: Sample Collector with name in bold
  doc.font('Helvetica').text('Sample Collector:', margin, currentY, {
    width: halfWidth,
    align: 'left',
    continued: true,
  });
  doc.font('Helvetica-Bold').text(` ${sampleReceiver}`, { continued: false });

  // Right column: Tester with name in bold
  doc.font('Helvetica').text('Tester:', margin + halfWidth, currentY, {
    width: halfWidth,
    align: 'left',
    continued: true,
  });
  doc.font('Helvetica-Bold').text(` ${tester}`, { continued: false });

  doc.moveDown();
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
    .fillColor('#000000') // Black color for the name
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
    .fillColor('#000000') // Black color for the name
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
    .fillColor('#000000') // Ensure footer text is in black
    .text(
      'Kindly note that, this result must be signed and stamped before it can be considered valid.',
      50,
      pageHeight - 30,
      {
        align: 'center',
        width: pageWidth - 100, // Full width minus left and right margins
      }
    );

  // Reset margins to default if needed
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
