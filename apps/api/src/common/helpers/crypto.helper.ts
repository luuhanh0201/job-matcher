import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH_BYTES = 12;
const KEY_LENGTH_BYTES = 32;

export interface EncryptedSecret {
  cipherText: string;
  iv: string;
  authTag: string;
}

function getEncryptionKey(): Buffer {
  const secret = process.env.AI_CREDENTIALS_SECRET;
  if (!secret) {
    throw new Error('AI_CREDENTIALS_SECRET không tồn tại');
  }

  const key = Buffer.from(secret, 'base64');
  if (key.length !== KEY_LENGTH_BYTES) {
    throw new Error(
      `AI_CREDENTIALS_SECRET phải là chuỗi base64 mã hoá đúng ${KEY_LENGTH_BYTES} byte`,
    );
  }

  return key;
}

export function encryptSecret(plainText: string): EncryptedSecret {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plainText, 'utf8'),
    cipher.final(),
  ]);

  return {
    cipherText: encrypted.toString('base64'),
    iv: iv.toString('base64'),
    authTag: cipher.getAuthTag().toString('base64'),
  };
}

export function maskSecret(plainText: string): string {
  if (plainText.length <= 8) {
    return '****';
  }

  return `${plainText.slice(0, 6)}...${plainText.slice(-4)}`;
}

export function decryptSecret(
  cipherText: string,
  iv: string,
  authTag: string,
): string {
  const key = getEncryptionKey();
  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(authTag, 'base64'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(cipherText, 'base64')),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}
