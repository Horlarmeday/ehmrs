import * as XLSX from 'xlsx';
import { Response } from 'express';
import PDFDocument from './pdfKitTable';

export const exportDataToCSV = (res: Response, data: any[], headers: string[][]) => {
  const workbook = XLSX.utils.book_new();
  // adding headers
  const workSheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);
  XLSX.utils.sheet_add_aoa(workSheet, headers);

  // Export as CSV

  XLSX.utils.sheet_add_json(workSheet, data, { origin: 'A2', skipHeader: true });
  XLSX.utils.book_append_sheet(workbook, workSheet, 'Exported Data');

  const csvData = XLSX.write(workbook, { type: 'buffer', bookType: 'csv' });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=exported_data.csv');
  return res.send(csvData);
};

export const exportDataToExcel = (res: Response, data: any[], headers: string[][]) => {
  const workbook = XLSX.utils.book_new();
  // adding headers
  const workSheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);
  XLSX.utils.sheet_add_aoa(workSheet, headers);

  XLSX.utils.sheet_add_json(workSheet, data, { origin: 'A2', skipHeader: true });
  XLSX.utils.book_append_sheet(workbook, workSheet, 'Exported Data');

  const xlsxData = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader('Content-Disposition', 'attachment; filename=exported_data.xlsx');
  return res.send(xlsxData);
};

export const exportDataToPDF = (res: Response, data: any[], headers: string[][]) => {
  // Export as PDF
  const doc = new PDFDocument({});
  const filename = 'exported_data.pdf';

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

  doc.pipe(res);

  // Add headers to the PDF table
  doc.font('Helvetica-Bold');
  doc.text('Exported Data', { align: 'center' });
  doc.moveDown();
  doc.font('Helvetica');
  doc.table(
    { headers: headers.flat(), rows: data.map(row => Object.values(row)) },
    {
      prepareHeader: () => doc.font('Helvetica-Bold'),
      prepareRow: row => doc.font('Helvetica'),
      // width: 412,
      // align: ['center', 'center', 'cent er'],
    }
  );

  return doc.end();
};
