import fs from 'fs';
import { degrees, PDFDocument, PDFFont, PDFImage, PDFPage, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';
import { logger } from './logger';
import { Patient } from '../../database/models';
import dayjs from 'dayjs';

async function generateQRCodeImage(patientInfo: Record<string, any>, pdfDoc: PDFDocument) {
  const data = {
    name: patientInfo.fullname,
    phone: patientInfo.phone,
    gender: patientInfo.gender,
    dob: dayjs(patientInfo.dob).format('YYYY-MM-DD'),
    address: patientInfo.address,
    next_of_kin: patientInfo.next_of_kin,
    next_of_kin_phone: patientInfo.next_of_kin_phone,
  };
  const qrData = JSON.stringify(data);
  const qrBuffer = await QRCode.toBuffer(qrData);
  return await pdfDoc.embedPng(qrBuffer);
}

async function embedPage(pdfDoc: PDFDocument, templatePath: string) {
  const bgDoc = await PDFDocument.load(fs.readFileSync(templatePath));
  const [page] = await bgDoc.getPages();
  return await pdfDoc.embedPage(page);
}

function drawFrontContent(page: PDFPage, font: PDFFont, boldFont: PDFFont, patient: Patient) {
  const black = rgb(0, 0, 0);
  let y = 90;

  page.drawText('Hospital No:', { x: 20, y, size: 9, font, color: black, opacity: 1 });
  page.drawText(patient.hospital_id, { x: 80, y, size: 8, font: boldFont, color: black });

  y -= 15;
  page.drawText('Name:', { x: 20, y, size: 9, font, color: black, opacity: 1 });
  page.drawText(<string>patient.fullname, { x: 80, y, size: 8, font: boldFont, color: black });

  y -= 15;
  page.drawText('Sex', { x: 20, y, size: 9, font, color: black, opacity: 1 });
  page.drawText(patient.gender, { x: 80, y, size: 8, font: boldFont, color: black });

  y -= 15;
  page.drawText('Date of Birth:', { x: 20, y, size: 9, font, color: black, opacity: 1 });
  page.drawText(dayjs(patient.date_of_birth).format('DD/MM/YYYY'), {
    x: 80,
    y,
    size: 8,
    font: boldFont,
    color: black,
  });
  y -= 15;
  page.drawText('N of K:', { x: 20, y, size: 9, font, color: black, opacity: 1 });
  page.drawText(patient.next_of_kin_phone, {
    x: 80,
    y,
    size: 8,
    font: boldFont,
    color: black,
  });
  y -= 15;
  page.drawText('Issued Date:', { x: 20, y, size: 9, font, color: black, opacity: 1 });
  page.drawText(dayjs(patient.createdAt).format('DD/MM/YYYY'), {
    x: 80,
    y,
    size: 8,
    font: boldFont,
    color: black,
  });
}

function drawBackContent(
  page: PDFPage,
  cardSize: [number, number],
  font: PDFFont,
  qrImage: PDFImage
) {
  const black = rgb(0, 0, 0);
  const text = [
    'PLATEAU STATE SPECIALIST HOSPITAL JOS.',
    'This Medical Card is the property of the above named Hospital, and the bearer',
    'whose information is contained. If found, pls report to the nearest Police Station',
    'or the address of the named Institution.',
  ];
  const fontSize = 6.5;
  const lineHeight = 10;
  let y = cardSize[1] - 25;

  text.forEach(line => {
    const textWidth = font.widthOfTextAtSize(line, fontSize);
    const x = (cardSize[0] - 5 - textWidth) / 2; // 👈 Center align
    page.drawText(line, { x, y, size: fontSize, font, color: black });
    y -= lineHeight;
  });

  const qrDims = qrImage.scale(0.19);
  page.drawImage(qrImage, {
    x: cardSize[0] - qrDims.width - 15,
    y: 26,
    width: qrDims.width,
    height: qrDims.height,
  });
}

export async function generateHospitalCard(patientInfo: Patient) {
  const pdfDoc = await PDFDocument.create();
  const cardSize: [number, number] = [242.65, 153]; // ATM card size in pt
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const qrImage = await generateQRCodeImage(patientInfo, pdfDoc);

  const frontTemplate =
    process.env.NODE_ENV === 'production' ? `ehmrs-api/public/PC3.pdf` : 'src/public/PC3.pdf';
  const backTemplate =
    process.env.NODE_ENV === 'production' ? `ehmrs-api/public/PC4.pdf` : 'src/public/PC4.pdf';
  const frontBg = await embedPage(pdfDoc, frontTemplate);
  const backBg = await embedPage(pdfDoc, backTemplate);

  // FRONT
  const front = pdfDoc.addPage(cardSize);
  front.drawPage(frontBg, { x: 0, y: 0, width: cardSize[0], height: cardSize[1] });
  drawFrontContent(front, font, boldFont, patientInfo);

  // BACK
  const back = pdfDoc.addPage(cardSize);
  back.setRotation(degrees(180));
  back.drawPage(backBg, { x: 0, y: 0, width: cardSize[0], height: cardSize[1] });
  drawBackContent(back, cardSize, font, qrImage);

  logger.info(`✅ Hospital card generated!`);
  return await pdfDoc.save();
}
