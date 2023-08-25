import { Response } from 'express';
import PDFDocument from './pdfKitTable';

type TestResults = {
  testName: string;
  result: string;
  unit: string;
  abnormalState: string;
  validRange: string;
  comments: string;
};

type PatientInfo = {
  patientName: string;
  patientId: string;
  age: number;
  sex: string;
  orderDate: string;
  accession_number: string;
  reportDate: string;
};

export const downloadTestResult = (
  patientInfo: PatientInfo,
  testResults: TestResults[],
  res: Response
) => {
  const doc = new PDFDocument({});
  const filename = 'lab_test_result.pdf';
  // Stream the PDF output to a file (change 'lab_report.pdf' to your desired filename)
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

  doc.pipe(res);

  generateHeader(doc);
  generatePatientInformation(doc, patientInfo);
  generateResultTable(doc, testResults);
  generateStampAndSignature(doc, 630);
  generateFooter(doc);
  // Finalize the PDF
  return doc.end();
};

function generateHeader(doc) {
  doc
    .image('src/public/images/logo-letter-1.png', 50, 45, { width: 50 })
    .fillColor('#444444')
    .fontSize(15)
    .text('St. Vincent Hospital', 110, 57)
    .fontSize(10)
    .text('5965+P2R,', 200, 65, { align: 'right' })
    .text('Kubwa 901101, Abuja, FCT', 200, 80, { align: 'right' })
    .moveDown(1.5);
}

function generateFooter(doc) {
  doc
    .fontSize(10)
    .text(
      'Kindly note that, this result must be signed and stamped before it can be considered valid.',
      50,
      700,
      { align: 'center', width: 500 }
    );
}

function generateStampAndSignature(doc, y) {
  doc
    .strokeColor('#aaaaaa')
    .lineWidth(1)
    .moveTo(190, y)
    .lineTo(400, y)
    .stroke();

  doc.fontSize(10).text('Stamp, Signature and Date', 240, y + 15);
}

function generateHr(doc, y, lineWidth = 1) {
  doc
    .strokeColor('#aaaaaa')
    .lineWidth(lineWidth)
    .moveTo(71, y)
    .lineTo(540, y)
    .stroke();
}

function generatePatientInformation(doc, patientInfo) {
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
}

function generateResultTable(doc, testResults) {
  doc.moveDown(1.5);
  doc.table(
    {
      headers: ['Test Name', 'Result', 'Unit', 'Abnormal State', 'Comments', 'Valid Range'],
      rows: testResults.map(testResult => [
        testResult.testName,
        testResult.result.toString(),
        testResult.unit,
        testResult.abnormalState,
        testResult.comments || '-',
        testResult.validRange,
      ]),
    },
    {
      prepareHeader: () => doc.font('Helvetica-Bold'),
      prepareRow: row => doc.font('Helvetica'),
      // width: 500,
      align: ['left', 'right', 'left', 'left', 'left', 'left'],
      padding: 5,
      borderWidth: 1,
      borderColor: '#ddd',
    }
  );
}
