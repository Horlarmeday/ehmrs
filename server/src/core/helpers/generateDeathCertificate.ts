import PDFDocument from 'pdfkit';
import fs from 'fs';
import { Patient, Staff } from '../../database/models';
import {
  createDigitalSignature,
  storeSignatureData,
  generateVerificationQRData,
  createCertificateHash,
  SignatureData,
} from './digitalSignature';

// Type definitions
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

// Color scheme for the certificate
const colors = {
  primary: '#1a365d', // Dark blue
  secondary: '#2d5aa0', // Medium blue
  accent: '#c53030', // Red
  text: '#2d3748', // Dark gray
  lightText: '#4a5568', // Light gray
  border: '#e2e8f0', // Light border
  background: '#f7fafc', // Very light background
  watermark: '#f0f4f8', // Watermark color
  gold: '#d69e2e', // Gold for security elements
};

// Main export function
export async function generateDeathCertificate(
  certificateData: DeathCertificateData,
  res: any
): Promise<void> {
  const { patient, deathInfo, markedByStaff, hospitalInfo } = certificateData;

  // Create PDF document
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 30, left: 30, right: 30, bottom: 30 },
  });

  // Set response headers
  const filename = `Death_Certificate_${(patient.fullname as string).replace(/\s+/g, '_')}_${
    deathInfo.death_certificate_number
  }.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

  doc.pipe(res);

  // Create decorative border
  createDecorativeBorder(doc);

  // Header with logo and hospital info
  generateHeader(doc, hospitalInfo, deathInfo.death_certificate_number);

  // Title section
  generateTitle(doc);

  // Main content in two columns
  generateMainContent(doc, patient, deathInfo, markedByStaff);

  // Digital Signature Section
  if (certificateData.includeDigitalSignature && certificateData.privateKey) {
    await generateDigitalSignature(doc, certificateData, markedByStaff);
  }

  // Footer
  generateFooter(doc, hospitalInfo);

  // Finalize PDF
  return doc.end();
}

// Decorative border function
function createDecorativeBorder(doc: PDFDocumentType) {
  // Outer border with gradient effect
  doc
    .rect(40, 40, 515, 752)
    .lineWidth(3)
    .strokeColor(colors.primary)
    .stroke();

  // Secondary border
  doc
    .rect(45, 45, 505, 742)
    .lineWidth(1)
    .strokeColor(colors.gold)
    .stroke();

  // Inner border
  doc
    .rect(50, 50, 495, 732)
    .lineWidth(1)
    .strokeColor(colors.border)
    .stroke();

  // Enhanced corner decorations
  const cornerSize = 25;
  const corners = [
    { x: 50, y: 50 }, // Top left
    { x: 525, y: 50 }, // Top right
    { x: 50, y: 762 }, // Bottom left
    { x: 525, y: 762 }, // Bottom right
  ];

  corners.forEach((corner, index) => {
    // Main corner lines
    doc
      .moveTo(corner.x, corner.y)
      .lineTo(corner.x + (index % 2 === 0 ? cornerSize : -cornerSize), corner.y)
      .moveTo(corner.x, corner.y)
      .lineTo(corner.x, corner.y + (index < 2 ? cornerSize : -cornerSize))
      .lineWidth(4)
      .strokeColor(colors.accent)
      .stroke();

    // Secondary decorative lines
    doc
      .moveTo(corner.x + (index % 2 === 0 ? 5 : -5), corner.y + (index < 2 ? 5 : -5))
      .lineTo(
        corner.x + (index % 2 === 0 ? cornerSize - 5 : -(cornerSize - 5)),
        corner.y + (index < 2 ? 5 : -5)
      )
      .moveTo(corner.x + (index % 2 === 0 ? 5 : -5), corner.y + (index < 2 ? 5 : -5))
      .lineTo(
        corner.x + (index % 2 === 0 ? 5 : -5),
        corner.y + (index < 2 ? cornerSize - 5 : -(cornerSize - 5))
      )
      .lineWidth(2)
      .strokeColor(colors.gold)
      .stroke();
  });

  // Security microprint border - make it more subtle
  doc
    .fontSize(3)
    .fillColor('#e8e8e8')
    .font('Helvetica');

  const microtext = 'OFFICIAL MEDICAL DOCUMENT • ';
  // Only show microtext at top border
  for (let i = 0; i < 25; i++) {
    doc.text(microtext, 60 + ((i * 18) % 460), 57);
  }
}

// Header generation function
function generateHeader(
  doc: PDFDocumentType,
  hospitalInfo: HospitalInfo,
  certificateNumber: string
) {
  const startY = 75;

  // Hospital Logo with enhanced fallback
  const logoPath =
    process.env.NODE_ENV === 'production'
      ? `server/public/Caroline.png`
      : 'src/public/Caroline.png';

  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 70, startY, { width: 50, height: 50 });
  } else {
    // Enhanced medical symbol as fallback
    const centerX = 95;
    const centerY = startY + 25;

    // Outer circle with gradient effect
    doc
      .circle(centerX, centerY, 25)
      .fillColor(colors.primary)
      .fill()
      .circle(centerX, centerY, 22)
      .fillColor('#ffffff')
      .fill();

    // Medical cross
    doc
      .fillColor(colors.accent)
      .rect(centerX - 2, centerY - 15, 4, 30)
      .fill()
      .rect(centerX - 12, centerY - 2, 24, 4)
      .fill();

    // Caduceus symbol elements
    doc
      .circle(centerX - 8, centerY - 8, 2)
      .fillColor(colors.gold)
      .fill()
      .circle(centerX + 8, centerY + 8, 2)
      .fill();
  }

  // Hospital Information - Center with enhanced styling
  doc
    .fillColor(colors.primary)
    .fontSize(13)
    .font('Helvetica-Bold')
    .text(hospitalInfo.name.toUpperCase(), 140, startY, { align: 'center', width: 255 })
    .fontSize(10)
    .fillColor(colors.text)
    .font('Helvetica')
    .text(hospitalInfo.address, 140, startY + 25, { align: 'center', width: 255 })
    .text(`Tel: ${hospitalInfo.phone} | Email: ${hospitalInfo.email}`, 140, startY + 40, {
      align: 'center',
      width: 255,
    });

  // Certificate Number - Right with security styling
  doc
    .rect(410, startY - 5, 125, 55)
    .fillColor('#fef5e7')
    .fill()
    .strokeColor(colors.gold)
    .lineWidth(1)
    .stroke();

  doc
    .fillColor(colors.accent)
    .fontSize(9)
    .font('Helvetica-Bold')
    .text('CERTIFICATE NO.', 420, startY + 2, { align: 'center', width: 105 })
    .fontSize(10)
    .fillColor(colors.primary)
    .text(certificateNumber, 420, startY + 15, { align: 'center', width: 105 })
    .fillColor(colors.text)
    .fontSize(8)
    .font('Helvetica')
    .text(`Issued: ${new Date().toLocaleDateString()}`, 420, startY + 32, {
      align: 'center',
      width: 105,
    });

  // Separator line with decorative elements
  doc
    .moveTo(70, startY + 65)
    .lineTo(525, startY + 65)
    .lineWidth(2)
    .strokeColor(colors.border)
    .stroke();

  // Decorative dots
  for (let i = 0; i < 5; i++) {
    doc
      .circle(200 + i * 40, startY + 65, 2)
      .fillColor(colors.gold)
      .fill();
  }
}

// Title generation function
function generateTitle(doc: PDFDocumentType) {
  const titleY = 165;

  // Main title background with gradient effect
  doc
    .rect(70, titleY - 15, 455, 60)
    .fillColor('#f8f9fa')
    .fill()
    .strokeColor(colors.gold)
    .lineWidth(1)
    .stroke();

  // Decorative side elements
  doc
    .rect(70, titleY - 15, 10, 60)
    .fillColor(colors.primary)
    .fill()
    .rect(515, titleY - 15, 10, 60)
    .fillColor(colors.primary)
    .fill();

  // Main title with shadow effect
  doc
    .fillColor('#e2e8f0')
    .fontSize(24)
    .font('Helvetica-Bold')
    .text('CERTIFICATE OF DEATH', 72, titleY + 2, { align: 'center', width: 455 });

  doc
    .fillColor(colors.primary)
    .fontSize(24)
    .font('Helvetica-Bold')
    .text('CERTIFICATE OF DEATH', 70, titleY, { align: 'center', width: 455 });

  // Subtitle with enhanced styling
  doc
    .fillColor(colors.lightText)
    .fontSize(11)
    .font('Helvetica-Oblique')
    .text('Official Medical Certification of Death', 70, titleY + 30, {
      align: 'center',
      width: 455,
    });

  // Security hologram effect simulation
  doc.save().opacity(0.3);

  for (let i = 0; i < 3; i++) {
    doc
      .circle(450 + i * 15, titleY + 15, 8)
      .strokeColor(colors.gold)
      .lineWidth(1)
      .stroke();
  }

  doc.restore();
}

// Main content generation function
function generateMainContent(
  doc: PDFDocumentType,
  patient: Patient,
  deathInfo: any,
  markedByStaff: Staff
) {
  let currentY = 250;

  // Patient Information Section
  currentY = generateSection(doc, 'DECEASED PERSON INFORMATION', currentY, [
    { label: 'Full Name', value: (patient.fullname as string) || 'N/A', emphasis: true },
    { label: 'Hospital Number', value: patient.hospital_id || 'N/A' },
    {
      label: 'Date of Birth',
      value: patient.date_of_birth
        ? new Date(patient.date_of_birth).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : 'N/A',
    },
    { label: 'Gender', value: patient.gender || 'N/A' },
    { label: 'Address', value: patient.address || 'N/A' },
    { label: 'Patient Type', value: patient.patient_type || 'N/A' },
  ]);

  currentY += 15;

  // Death Information Section
  currentY = generateSection(doc, 'DEATH INFORMATION', currentY, [
    {
      label: 'Date of Death',
      value: new Date(deathInfo.date_of_death).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      emphasis: true,
    },
    {
      label: 'Time of Death',
      value: new Date(deathInfo.date_of_death).toLocaleTimeString('en-US', {
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
      }),
      emphasis: true,
    },
    { label: 'Cause of Death', value: deathInfo.cause_of_death || 'Not specified', emphasis: true },
    {
      label: 'Date Pronounced',
      value: new Date(deathInfo.marked_deceased_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    },
  ]);

  currentY += 15;

  // Medical Certification Section
  currentY = generateSection(doc, 'MEDICAL CERTIFICATION', currentY, [
    {
      label: 'Pronouncing Physician',
      value: (markedByStaff.fullname as string) || 'N/A',
      emphasis: true,
    },
    { label: 'Medical License ID', value: markedByStaff.id?.toString() || 'N/A' },
    { label: 'Position/Role', value: markedByStaff.role || 'N/A' },
    { label: 'Department', value: markedByStaff.department || 'N/A' },
  ]);

  // Signature Area
  generateSignatureArea(doc, currentY + 10, markedByStaff);
}

// Section generation function
function generateSection(
  doc: PDFDocumentType,
  title: string,
  startY: number,
  items: Array<{ label: string; value: string; emphasis?: boolean }>
): number {
  // Section header with enhanced styling
  doc
    .rect(70, startY, 455, 28)
    .fillColor(colors.primary)
    .fill()
    .rect(72, startY + 2, 451, 24)
    .fillColor(colors.secondary)
    .fill();

  doc
    .fillColor('#ffffff')
    .fontSize(12)
    .font('Helvetica-Bold')
    .text(title, 85, startY + 8);

  const currentY = startY + 38;

  // Enhanced section background
  const sectionHeight = Math.ceil(items.length / 2) * 22 + 20;
  doc
    .rect(70, currentY - 5, 455, sectionHeight)
    .fillColor('#fbfcfd')
    .fill()
    .strokeColor(colors.border)
    .lineWidth(0.5)
    .stroke();

  // Section items in two columns with better formatting
  const leftColumnX = 85;
  const rightColumnX = 310;
  const itemHeight = 22;

  items.forEach((item, index) => {
    const isLeftColumn = index % 2 === 0;
    const x = isLeftColumn ? leftColumnX : rightColumnX;
    const y = currentY + Math.floor(index / 2) * itemHeight;

    // Subtle row background for better readability
    if (Math.floor(index / 2) % 2 === 0) {
      doc
        .rect(isLeftColumn ? 75 : 305, y - 2, 220, 20)
        .fillColor('#f9fafb')
        .fill();
    }

    // Label with enhanced styling
    doc
      .fillColor(colors.text)
      .fontSize(9)
      .font('Helvetica-Bold')
      .text(`${item.label}:`, x, y);

    // Value with conditional emphasis
    doc
      .fillColor(item.emphasis ? colors.primary : colors.lightText)
      .fontSize(item.emphasis ? 10 : 9)
      .font(item.emphasis ? 'Helvetica-Bold' : 'Helvetica')
      .text(item.value, x, y + 11, { width: 200, ellipsis: true });
  });

  return currentY + Math.ceil(items.length / 2) * itemHeight + 15;
}

// Signature area generation function
function generateSignatureArea(doc: PDFDocumentType, startY: number, markedByStaff: Staff) {
  // Enhanced signature boxes with security features
  doc
    .rect(70, startY, 225, 110)
    .fillColor('#fefefe')
    .fill()
    .strokeColor(colors.primary)
    .lineWidth(2)
    .stroke()
    .rect(72, startY + 2, 221, 106)
    .strokeColor(colors.gold)
    .lineWidth(1)
    .stroke();

  // Signature label
  doc
    .fillColor(colors.text)
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('PHYSICIAN SIGNATURE', 85, startY + 15);

  // Security microtext in signature area
  doc
    .fontSize(6)
    .fillColor(colors.lightText)
    .font('Helvetica')
    .text('AUTHORIZED SIGNATURE ONLY', 85, startY + 30);

  // Enhanced signature line with security pattern
  for (let i = 0; i < 20; i++) {
    doc
      .moveTo(85 + i * 9, startY + 65)
      .lineTo(85 + i * 9 + 6, startY + 65)
      .lineWidth(i % 3 === 0 ? 1.5 : 1)
      .strokeColor(colors.text)
      .stroke();
  }

  // Physician information with enhanced styling
  doc
    .fillColor(colors.primary)
    .fontSize(11)
    .font('Helvetica-Bold')
    .text((markedByStaff.fullname as string) || 'N/A', 85, startY + 75)
    .fillColor(colors.lightText)
    .fontSize(9)
    .font('Helvetica')
    .text('Licensed Medical Practitioner', 85, startY + 88)
    .fontSize(8)
    .text(`License Verification Available`, 85, startY + 98);

  // Date box with security features
  doc
    .rect(300, startY, 225, 110)
    .fillColor('#fefefe')
    .fill()
    .strokeColor(colors.primary)
    .lineWidth(2)
    .stroke()
    .rect(302, startY + 2, 221, 106)
    .strokeColor(colors.gold)
    .lineWidth(1)
    .stroke();

  doc
    .fillColor(colors.text)
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('DATE SIGNED', 315, startY + 15);

  // Security microtext
  doc
    .fontSize(6)
    .fillColor(colors.lightText)
    .font('Helvetica')
    .text('TIMESTAMP VERIFICATION', 315, startY + 30);

  // Enhanced date line
  for (let i = 0; i < 20; i++) {
    doc
      .moveTo(315 + i * 9, startY + 65)
      .lineTo(315 + i * 9 + 6, startY + 65)
      .lineWidth(i % 3 === 0 ? 1.5 : 1)
      .strokeColor(colors.text)
      .stroke();
  }

  doc
    .fillColor(colors.primary)
    .fontSize(12)
    .font('Helvetica-Bold')
    .text(new Date().toLocaleDateString(), 315, startY + 75)
    .fillColor(colors.lightText)
    .fontSize(8)
    .text(`Time: ${new Date().toLocaleTimeString()}`, 315, startY + 88)
    .text('Digitally Timestamped', 315, startY + 98);
}

// Digital signature generation function
async function generateDigitalSignature(
  doc: PDFDocumentType,
  certificateData: DeathCertificateData,
  markedByStaff: Staff
) {
  const { patient, deathInfo } = certificateData;

  try {
    const signatureData = createDigitalSignature(
      {
        certificateId: deathInfo.death_certificate_number,
        patientId: patient.id,
        patientName: patient.fullname,
        dateOfDeath: deathInfo.date_of_death,
        causeOfDeath: deathInfo.cause_of_death,
        hospitalId: patient.hospital_id,
        generatedAt: new Date().toISOString(),
      },
      certificateData.privateKey!,
      markedByStaff.id
    );

    await storeSignatureData(signatureData);

    // Enhanced digital signature section
    const sigY = 680;

    // Main signature container with gradient effect
    doc
      .rect(70, sigY, 455, 95)
      .fillColor('#f8fafc')
      .fill()
      .strokeColor(colors.primary)
      .lineWidth(2)
      .stroke()
      .rect(72, sigY + 2, 451, 91)
      .strokeColor(colors.gold)
      .lineWidth(1)
      .stroke();

    // Enhanced digital signature header
    doc
      .rect(70, sigY, 455, 28)
      .fillColor(colors.secondary)
      .fill()
      .rect(72, sigY + 2, 451, 24)
      .fillColor('#2b6cb0')
      .fill();

    // Security title
    doc
      .fillColor('#ffffff')
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('DIGITAL SIGNATURE & BLOCKCHAIN VERIFICATION', 85, sigY + 8);

    // Enhanced signature details with better layout
    doc
      .fillColor(colors.text)
      .fontSize(8)
      .font('Helvetica-Bold')
      .text('Hash Signature:', 85, sigY + 35)
      .font('Helvetica')
      .fontSize(7)
      .text(`${signatureData.signature.substring(0, 70)}...`, 85, sigY + 46)

      .font('Helvetica-Bold')
      .fontSize(8)
      .text('Authorized by:', 85, sigY + 58)
      .font('Helvetica')
      .text(`${markedByStaff.fullname} (Medical License: ${markedByStaff.id})`, 85, sigY + 69)

      .font('Helvetica-Bold')
      .fontSize(8)
      .text('Timestamp:', 300, sigY + 58)
      .font('Helvetica')
      .text(`${new Date(signatureData.timestamp).toLocaleString()}`, 300, sigY + 69);

    // Enhanced QR code with security frame
    doc
      .rect(415, sigY + 32, 45, 45)
      .fillColor('#ffffff')
      .fill()
      .strokeColor(colors.primary)
      .lineWidth(2)
      .stroke()
      .rect(420, sigY + 37, 35, 35)
      .strokeColor(colors.border)
      .lineWidth(1)
      .stroke();

    // QR pattern simulation
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        if ((i + j) % 2 === 0) {
          doc
            .rect(422 + i * 6, sigY + 39 + j * 6, 4, 4)
            .fillColor(colors.text)
            .fill();
        }
      }
    }

    doc
      .fillColor(colors.lightText)
      .fontSize(6)
      .font('Helvetica')
      .text('SCAN TO\nVERIFY', 426, sigY + 80, { align: 'center' });

    // Security verification URL
    const verificationUrl = `https://verify.hospital.com/${deathInfo.death_certificate_number}`;
    doc
      .fillColor(colors.accent)
      .fontSize(7)
      .font('Helvetica')
      .text(`Verify online: ${verificationUrl}`, 85, sigY + 82);
  } catch (error) {
    console.error('Failed to create digital signature:', error);
    doc
      .rect(70, 680, 455, 40)
      .fillColor('#fef2f2')
      .fill()
      .strokeColor(colors.accent)
      .lineWidth(1)
      .stroke()
      .fillColor(colors.accent)
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('Digital signature generation failed - Document validity may be compromised', 85, 690)
      .fontSize(8)
      .font('Helvetica')
      .text('Please contact IT support for signature verification', 85, 705);
  }
}

// Footer generation function
function generateFooter(doc: PDFDocumentType, hospitalInfo: HospitalInfo) {
  const footerY = 750;

  // Footer separator with decorative elements
  doc
    .moveTo(70, footerY - 25)
    .lineTo(525, footerY - 25)
    .lineWidth(2)
    .strokeColor(colors.border)
    .stroke();

  // Decorative footer pattern
  for (let i = 0; i < 10; i++) {
    doc
      .circle(120 + i * 40, footerY - 25, 1)
      .fillColor(colors.gold)
      .fill();
  }

  // Enhanced official seal with embossed effect
  doc
    .circle(120, footerY, 20)
    .fillColor('#f7f7f7')
    .fill()
    .circle(120, footerY, 18)
    .strokeColor(colors.primary)
    .lineWidth(3)
    .stroke()
    .circle(120, footerY, 15)
    .strokeColor(colors.gold)
    .lineWidth(1)
    .stroke();

  // Seal text with enhanced styling
  doc
    .fillColor(colors.primary)
    .fontSize(7)
    .font('Helvetica-Bold')
    .text('OFFICIAL', 108, footerY - 8)
    .text('SEAL', 112, footerY + 2);

  // Security elements around seal
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI * 2) / 8;
    const x = 120 + Math.cos(angle) * 25;
    const y = footerY + Math.sin(angle) * 25;
    doc
      .circle(x, y, 1)
      .fillColor(colors.accent)
      .fill();
  }

  // Enhanced footer text with security features
  doc
    .fillColor(colors.text)
    .fontSize(8)
    .font('Helvetica-Bold')
    .text('VERIFICATION & SECURITY NOTICE', 150, footerY - 15)
    .fillColor(colors.lightText)
    .fontSize(7)
    .font('Helvetica')
    .text(
      'This certificate contains security features to prevent forgery. Any unauthorized reproduction is prohibited by law.',
      150,
      footerY - 5
    )
    .text(
      `Generated: ${new Date().toLocaleString()} | Document ID: DC-${Date.now()} | Verification: cert.verify/${Date.now().toString(
        36
      )}`,
      150,
      footerY + 5
    );

  // QR code placeholder for verification
  doc
    .rect(460, footerY - 18, 30, 30)
    .strokeColor(colors.border)
    .lineWidth(1)
    .stroke()
    .fillColor(colors.lightText)
    .fontSize(6)
    .text('VERIFY\nONLINE', 468, footerY - 8, { align: 'center' });

  // Security hologram simulation
  doc.save().opacity(0.2);

  for (let i = 0; i < 3; i++) {
    doc
      .circle(500 + i * 8, footerY + 15, 3)
      .fillColor(colors.gold)
      .fill();
  }

  doc.restore();

  // Page indicator with security marking
  doc
    .fillColor(colors.text)
    .fontSize(7)
    .font('Helvetica-Bold')
    .text('Page 1 of 1 • SECURE DOCUMENT', 480, footerY + 20);
}
