import PDFDocument from 'pdfkit';
import fs from 'fs';
import { Patient, Staff } from '../../database/models';
import { 
  createDigitalSignature, 
  storeSignatureData, 
  generateVerificationQRData,
  createCertificateHash,
  SignatureData 
} from './digitalSignature';

export interface DeathCertificateData {
  patient: Patient;
  deathInfo: {
    date_of_death: Date;
    cause_of_death?: string;
    death_certificate_number: string;
    marked_deceased_by: number;
    marked_deceased_at: Date;
  };
  markedByStaff: Staff;
  hospitalInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  includeDigitalSignature?: boolean;
  privateKey?: string;
}

export type HospitalInfo = {
  name: string;
  address: string;
  phone: string;
  email: string;
};

export type PDFDocumentType = typeof PDFDocument;

export async function generateDeathCertificate(
  certificateData: DeathCertificateData,
  res: any
): Promise<void> {
  const { patient, deathInfo, markedByStaff, hospitalInfo } = certificateData;
  
  // Create PDF document
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, left: 50, right: 50, bottom: 50 },
  });

  // Set response headers
  const filename = `Death_Certificate_${(patient.fullname as string).replace(/\s+/g, '_')}_${deathInfo.death_certificate_number}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

  doc.pipe(res);

  // Header
  generateHeader(doc, hospitalInfo);
  
  // Title
  generateTitle(doc);
  
  // Patient Information
  generatePatientInformation(doc, patient);
  
  // Death Information
  generateDeathInformation(doc, deathInfo);
  
  // Medical Information
  generateMedicalInformation(doc, deathInfo, markedByStaff);
  
  // Digital Signature Section
  if (certificateData.includeDigitalSignature && certificateData.privateKey) {
    try {
      // Create digital signature
      const signatureData = createDigitalSignature(
        {
          certificateId: deathInfo.death_certificate_number,
          patientId: patient.id,
          patientName: patient.fullname,
          dateOfDeath: deathInfo.date_of_death,
          causeOfDeath: deathInfo.cause_of_death,
          hospitalId: patient.hospital_id,
          generatedAt: new Date().toISOString()
        },
        certificateData.privateKey,
        markedByStaff.id
      );

      // Store signature data
      await storeSignatureData(signatureData);

      // Add signature section to PDF
      doc
        .fontSize(10)
        .text('DIGITAL SIGNATURE', 50, doc.y + 100)
        .fontSize(8)
        .text(`Signature: ${signatureData.signature.substring(0, 50)}...`, 50, doc.y + 120)
        .text(`Signed by: ${markedByStaff.fullname} (ID: ${markedByStaff.id})`, 50, doc.y + 140)
        .text(`Signature Date: ${new Date(signatureData.timestamp).toLocaleString()}`, 50, doc.y + 160)
        .text(`Algorithm: ${signatureData.algorithm}`, 50, doc.y + 180)
        .text(`Certificate Hash: ${createCertificateHash({
          certificateId: deathInfo.death_certificate_number,
          patientId: patient.id,
          patientName: patient.fullname,
          dateOfDeath: deathInfo.date_of_death,
          causeOfDeath: deathInfo.cause_of_death,
          hospitalId: patient.hospital_id,
          generatedAt: new Date().toISOString()
        })}`, 50, doc.y + 200);

      // Add QR code data for verification
      const qrData = generateVerificationQRData(signatureData);
      doc
        .text('Verification QR Data:', 50, doc.y + 240)
        .text(qrData.substring(0, 100) + '...', 50, doc.y + 260);

    } catch (error) {
      console.error('Failed to create digital signature:', error);
      doc
        .fontSize(8)
        .text('Digital signature generation failed', 50, doc.y + 100);
    }
  }

  // Footer
  generateFooter(doc, hospitalInfo);

  // Finalize PDF
  return doc.end();
}

function generateHeader(doc: PDFDocumentType, hospitalInfo: HospitalInfo) {
  // Hospital Logo (if available)
  const logoPath = process.env.NODE_ENV === 'production'
    ? `ehmrs-api/public/Caroline.png`
    : 'src/public/Caroline.png';

  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 50, 50, { width: 60 });
  }

  // Hospital Information
  doc
    .fontSize(16)
    .font('Helvetica-Bold')
    .text(hospitalInfo.name, 120, 60)
    .fontSize(10)
    .font('Helvetica')
    .text(hospitalInfo.address, 120, 80)
    .text(`Phone: ${hospitalInfo.phone}`, 120, 95)
    .text(`Email: ${hospitalInfo.email}`, 120, 110);

  // Certificate Number and Date
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('CERTIFICATE OF DEATH', 400, 60, { align: 'right' })
    .fontSize(10)
    .font('Helvetica')
    .text(`Date Issued: ${new Date().toLocaleDateString()}`, 400, 80, { align: 'right' });

  // Line separator
  doc
    .moveTo(50, 130)
    .lineTo(550, 130)
    .stroke();
}

function generateTitle(doc: PDFDocumentType) {
  doc
    .fontSize(18)
    .font('Helvetica-Bold')
    .text('CERTIFICATE OF DEATH', { align: 'center' })
    .moveDown(1)
    .fontSize(12)
    .font('Helvetica')
    .text('This is to certify that the person named below has been pronounced dead', { align: 'center' })
    .moveDown(2);
}

function generatePatientInformation(doc: PDFDocumentType, patient: Patient) {
  doc
    .fontSize(14)
    .font('Helvetica-Bold')
    .text('PATIENT INFORMATION', { underline: true })
    .moveDown(0.5)
    .fontSize(12)
    .font('Helvetica');

  const patientInfo = [
    ['Full Name:', patient.fullname || 'N/A'],
    ['Hospital Number:', patient.hospital_id || 'N/A'],
    ['Date of Birth:', patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : 'N/A'],
    ['Gender:', patient.gender || 'N/A'],
    ['Phone Number:', patient.phone || 'N/A'],
    ['Address:', patient.address || 'N/A'],
    ['Patient Type:', patient.patient_type || 'N/A'],
  ];

  patientInfo.forEach(([label, value]) => {
    doc
      .text(label as string, { continued: true })
      .font('Helvetica-Bold')
      .text(` ${value}`)
      .font('Helvetica')
      .moveDown(0.3);
  });

  doc.moveDown(1);
}

function generateDeathInformation(doc: PDFDocumentType, deathInfo: any) {
  doc
    .fontSize(14)
    .font('Helvetica-Bold')
    .text('DEATH INFORMATION', { underline: true })
    .moveDown(0.5)
    .fontSize(12)
    .font('Helvetica');

  const deathData = [
    ['Date of Death:', new Date(deathInfo.date_of_death).toLocaleDateString()],
    ['Time of Death:', new Date(deathInfo.date_of_death).toLocaleTimeString()],
    ['Cause of Death:', deathInfo.cause_of_death || 'Not specified'],
    ['Certificate Number:', deathInfo.death_certificate_number],
    ['Date Marked Deceased:', new Date(deathInfo.marked_deceased_at).toLocaleDateString()],
  ];

  deathData.forEach(([label, value]) => {
    doc
      .text(label, { continued: true })
      .font('Helvetica-Bold')
      .text(` ${value}`)
      .font('Helvetica')
      .moveDown(0.3);
  });

  doc.moveDown(1);
}

function generateMedicalInformation(doc: PDFDocumentType, deathInfo: any, markedByStaff: Staff) {
  doc
    .fontSize(14)
    .font('Helvetica-Bold')
    .text('MEDICAL INFORMATION', { underline: true })
    .moveDown(0.5)
    .fontSize(12)
    .font('Helvetica');

  const medicalData = [
    ['Pronounced by:', markedByStaff.fullname || 'N/A'],
    ['Staff ID:', markedByStaff.id?.toString() || 'N/A'],
    ['Staff Role:', markedByStaff.role || 'N/A'],
    ['Department:', markedByStaff.department || 'N/A'],
  ];

  medicalData.forEach(([label, value]) => {
    doc
      .text(label as string, { continued: true })
      .font('Helvetica-Bold')
      .text(` ${value}`)
      .font('Helvetica')
      .moveDown(0.3);
  });

  doc.moveDown(2);

  // Signature section
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('Medical Officer Signature:', 50, doc.y)
    .moveDown(2)
    .text('_________________________', 50, doc.y)
    .text(markedByStaff.fullname as string || 'N/A', 50, doc.y + 20)
    .text('Medical Officer', 50, doc.y + 40);

  doc.moveDown(3);
}

function generateFooter(doc: PDFDocumentType, hospitalInfo: HospitalInfo) {
  // Official stamp area
  doc
    .fontSize(10)
    .font('Helvetica')
    .text('This certificate is issued by:', 50, doc.y)
    .text(hospitalInfo.name, 50, doc.y + 20)
    .text(hospitalInfo.address, 50, doc.y + 40)
    .text(`Phone: ${hospitalInfo.phone}`, 50, doc.y + 60)
    .text(`Email: ${hospitalInfo.email}`, 50, doc.y + 80);

  // Disclaimer
  doc
    .fontSize(8)
    .text('This certificate is issued for official purposes only.', 50, doc.y + 100)
    .text('Any unauthorized use or reproduction is prohibited.', 50, doc.y + 120)
    .text(`Generated on: ${new Date().toLocaleString()}`, 50, doc.y + 140);
}
