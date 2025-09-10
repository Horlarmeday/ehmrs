import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

/**
 * Digital Signature Helper for Death Certificates
 * Provides cryptographic signing and verification capabilities
 */

export interface SignatureData {
  certificateId: string;
  patientId: number;
  signedBy: number; // Staff ID
  signature: string;
  timestamp: string;
  publicKey: string;
  algorithm: string;
}

export interface KeyPair {
  privateKey: string;
  publicKey: string;
}

/**
 * Generate RSA key pair for digital signatures
 */
export function generateKeyPair(): KeyPair {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });

  return { privateKey, publicKey };
}

/**
 * Create digital signature for death certificate
 */
export function createDigitalSignature(
  certificateData: any,
  privateKey: string,
  staffId: number
): SignatureData {
  // Create signature payload
  const payload = {
    certificateId: certificateData.certificateId,
    patientId: certificateData.patientId,
    patientName: certificateData.patientName,
    dateOfDeath: certificateData.dateOfDeath,
    causeOfDeath: certificateData.causeOfDeath,
    hospitalId: certificateData.hospitalId,
    timestamp: new Date().toISOString(),
    staffId: staffId
  };

  // Convert payload to string
  const payloadString = JSON.stringify(payload, Object.keys(payload).sort());

  // Create signature
  const signature = crypto
    .createSign('SHA256')
    .update(payloadString)
    .sign(privateKey, 'base64');

  // Generate public key from private key for verification
  const publicKey = crypto.createPublicKey(privateKey).export({
    type: 'spki',
    format: 'pem'
  }) as string;

  return {
    certificateId: certificateData.certificateId,
    patientId: certificateData.patientId,
    signedBy: staffId,
    signature,
    timestamp: payload.timestamp,
    publicKey,
    algorithm: 'RSA-SHA256'
  };
}

/**
 * Verify digital signature
 */
export function verifyDigitalSignature(
  signatureData: SignatureData,
  certificateData: any
): boolean {
  try {
    // Recreate the original payload
    const payload = {
      certificateId: certificateData.certificateId,
      patientId: certificateData.patientId,
      patientName: certificateData.patientName,
      dateOfDeath: certificateData.dateOfDeath,
      causeOfDeath: certificateData.causeOfDeath,
      hospitalId: certificateData.hospitalId,
      timestamp: signatureData.timestamp,
      staffId: signatureData.signedBy
    };

    const payloadString = JSON.stringify(payload, Object.keys(payload).sort());

    // Verify signature
    const verifier = crypto.createVerify('SHA256');
    verifier.update(payloadString);

    return verifier.verify(signatureData.publicKey, signatureData.signature, 'base64');
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
}

/**
 * Generate QR code data for certificate verification
 */
export function generateVerificationQRData(signatureData: SignatureData): string {
  const verificationData = {
    certificateId: signatureData.certificateId,
    patientId: signatureData.patientId,
    signature: signatureData.signature,
    timestamp: signatureData.timestamp,
    algorithm: signatureData.algorithm,
    verificationUrl: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/verify-certificate/${signatureData.certificateId}`
  };

  return JSON.stringify(verificationData);
}

/**
 * Create certificate hash for integrity verification
 */
export function createCertificateHash(certificateData: any): string {
  const hashData = {
    certificateId: certificateData.certificateId,
    patientId: certificateData.patientId,
    patientName: certificateData.patientName,
    dateOfDeath: certificateData.dateOfDeath,
    causeOfDeath: certificateData.causeOfDeath,
    hospitalId: certificateData.hospitalId,
    generatedAt: certificateData.generatedAt
  };

  return crypto
    .createHash('SHA256')
    .update(JSON.stringify(hashData, Object.keys(hashData).sort()))
    .digest('hex');
}

/**
 * Store signature data securely
 */
export async function storeSignatureData(signatureData: SignatureData): Promise<void> {
  const signatureDir = path.join(process.cwd(), 'signatures');
  
  // Create signatures directory if it doesn't exist
  if (!fs.existsSync(signatureDir)) {
    fs.mkdirSync(signatureDir, { recursive: true });
  }

  const signatureFile = path.join(signatureDir, `${signatureData.certificateId}.json`);
  
  // Store signature data
  fs.writeFileSync(signatureFile, JSON.stringify(signatureData, null, 2));
  
  console.log(`Signature data stored for certificate ${signatureData.certificateId}`);
}

/**
 * Retrieve signature data
 */
export async function retrieveSignatureData(certificateId: string): Promise<SignatureData | null> {
  try {
    const signatureFile = path.join(process.cwd(), 'signatures', `${certificateId}.json`);
    
    if (!fs.existsSync(signatureFile)) {
      return null;
    }

    const signatureData = fs.readFileSync(signatureFile, 'utf8');
    return JSON.parse(signatureData);
  } catch (error) {
    console.error('Failed to retrieve signature data:', error);
    return null;
  }
}

/**
 * Generate certificate verification report
 */
export function generateVerificationReport(
  certificateData: any,
  signatureData: SignatureData
): any {
  const isSignatureValid = verifyDigitalSignature(signatureData, certificateData);
  const certificateHash = createCertificateHash(certificateData);
  
  return {
    certificateId: certificateData.certificateId,
    patientId: certificateData.patientId,
    patientName: certificateData.patientName,
    dateOfDeath: certificateData.dateOfDeath,
    causeOfDeath: certificateData.causeOfDeath,
    hospitalId: certificateData.hospitalId,
    generatedAt: certificateData.generatedAt,
    signedBy: signatureData.signedBy,
    signatureTimestamp: signatureData.timestamp,
    signatureAlgorithm: signatureData.algorithm,
    signatureValid: isSignatureValid,
    certificateHash,
    verificationStatus: isSignatureValid ? 'VERIFIED' : 'INVALID',
    verificationDate: new Date().toISOString()
  };
}
