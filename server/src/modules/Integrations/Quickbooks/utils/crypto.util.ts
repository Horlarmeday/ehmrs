import { createCipheriv, createDecipheriv, createHmac, randomBytes } from 'crypto';
import { BadException } from '../../../../common/util/api-error';
import { StatusCodes } from '../../../../core/helpers/helper';
import { QuickbooksStatePayload } from '../interfaces/quickbooks.interface';

const ENCRYPTION_KEY_ENV = 'QB_ENCRYPTION_KEY';
const STATE_SECRET_ENV = 'QB_STATE_SECRET';

const BASE64_URL_REGEX = /^[A-Za-z0-9\-_]+$/;

function getEncryptionKey(): Buffer {
  const key = process.env[ENCRYPTION_KEY_ENV];
  if (!key) {
    throw new BadException(
      'QUICKBOOKS_CONFIG_ERROR',
      StatusCodes.SERVER_ERROR,
      'QuickBooks encryption key is not configured'
    );
  }

  const buffer = Buffer.from(key, 'base64');

  if (buffer.length !== 32) {
    throw new BadException(
      'QUICKBOOKS_CONFIG_ERROR',
      StatusCodes.SERVER_ERROR,
      'QuickBooks encryption key must be a 32-byte base64 value'
    );
  }

  return buffer;
}

function encodeBase64Url(input: Buffer): string {
  return input
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/u, '');
}

function decodeBase64Url(input: string): Buffer {
  if (!BASE64_URL_REGEX.test(input)) {
    throw new BadException(
      'QUICKBOOKS_STATE_INVALID',
      StatusCodes.BAD_REQUEST,
      'Invalid QuickBooks state encoding'
    );
  }

  const padding = 4 - (input.length % 4 || 4);
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/').concat('='.repeat(padding % 4));
  return Buffer.from(base64, 'base64');
}

function getStateSecret(): Buffer {
  const secret = process.env[STATE_SECRET_ENV];
  if (!secret) {
    throw new BadException(
      'QUICKBOOKS_CONFIG_ERROR',
      StatusCodes.SERVER_ERROR,
      'QuickBooks state secret is not configured'
    );
  }

  const buffer = Buffer.from(secret, 'base64');
  if (buffer.length < 32) {
    throw new BadException(
      'QUICKBOOKS_CONFIG_ERROR',
      StatusCodes.SERVER_ERROR,
      'QuickBooks state secret must be at least 32 bytes in base64'
    );
  }

  return buffer;
}

export function encryptSecret(plainText: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [iv, authTag, encrypted].map(encodeBase64Url).join('.');
}

export function decryptSecret(encryptedValue: string): string {
  const key = getEncryptionKey();
  const parts = encryptedValue.split('.');

  if (parts.length !== 3) {
    throw new BadException(
      'QUICKBOOKS_DECRYPTION_ERROR',
      StatusCodes.SERVER_ERROR,
      'Stored QuickBooks credential is malformed'
    );
  }

  const [ivEncoded, authTagEncoded, cipherTextEncoded] = parts;

  const iv = decodeBase64Url(ivEncoded);
  const authTag = decodeBase64Url(authTagEncoded);
  const cipherText = decodeBase64Url(cipherTextEncoded);

  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(cipherText), decipher.final()]);
  return decrypted.toString('utf8');
}

export function createState(userId: number): string {
  const secret = getStateSecret();
  const payload: QuickbooksStatePayload = {
    userId,
    issuedAt: Date.now(),
    nonce: randomBytes(8).toString('hex'),
  };
  const payloadBuffer = Buffer.from(JSON.stringify(payload), 'utf8');
  const signature = createHmac('sha256', secret).update(payloadBuffer).digest();

  return `${encodeBase64Url(payloadBuffer)}.${encodeBase64Url(signature)}`;
}

export function verifyState(state: string, maxAgeMs = 10 * 60 * 1000): QuickbooksStatePayload {
  const secret = getStateSecret();
  const parts = state.split('.');

  if (parts.length !== 2) {
    throw new BadException(
      'QUICKBOOKS_STATE_INVALID',
      StatusCodes.BAD_REQUEST,
      'Invalid QuickBooks state parameter'
    );
  }

  const [payloadEncoded, signatureEncoded] = parts;
  const payloadBuffer = decodeBase64Url(payloadEncoded);
  const signatureBuffer = decodeBase64Url(signatureEncoded);

  const expectedSignature = createHmac('sha256', secret).update(payloadBuffer).digest();

  if (!expectedSignature.equals(signatureBuffer)) {
    throw new BadException(
      'QUICKBOOKS_STATE_INVALID',
      StatusCodes.BAD_REQUEST,
      'QuickBooks state verification failed'
    );
  }

  const payload = JSON.parse(payloadBuffer.toString('utf8')) as QuickbooksStatePayload;

  if (Date.now() - payload.issuedAt > maxAgeMs) {
    throw new BadException(
      'QUICKBOOKS_STATE_EXPIRED',
      StatusCodes.BAD_REQUEST,
      'QuickBooks authorization has expired. Please initiate a new connection.'
    );
  }

  return payload;
}

