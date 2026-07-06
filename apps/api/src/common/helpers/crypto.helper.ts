import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH_BYTES = 12;
const KEY_LENGTH_BYTES = 32;

const PRIMARY_KEY_ENV = 'AI_CREDENTIALS_SECRET';
// Khoá cũ dùng khi xoay khoá: đặt khoá base64 32 byte trước đó vào biến này để
// giải mã được các ciphertext cũ; sau lần đọc đầu chúng sẽ được mã hoá lại bằng
// khoá chính (xem AiProvidersService.resolveApiKey). Bỏ trống khi không xoay.
const OLD_KEY_ENV = 'AI_CREDENTIALS_SECRET_OLD';

export interface EncryptedSecret {
  cipherText: string;
  iv: string;
  authTag: string;
}

export interface DecryptedSecret {
  value: string;
  /** true nếu phải giải mã bằng đường cũ (không AAD hoặc khoá cũ) → nên mã hoá lại. */
  legacy: boolean;
}

function loadKey(envVar: string): Buffer | null {
  const secret = process.env[envVar];
  if (!secret) {
    return null;
  }

  const key = Buffer.from(secret, 'base64');
  if (key.length !== KEY_LENGTH_BYTES) {
    throw new Error(
      `${envVar} phải là chuỗi base64 mã hoá đúng ${KEY_LENGTH_BYTES} byte`,
    );
  }

  return key;
}

function getPrimaryKey(): Buffer {
  const key = loadKey(PRIMARY_KEY_ENV);
  if (!key) {
    throw new Error(`${PRIMARY_KEY_ENV} không tồn tại`);
  }
  return key;
}

/**
 * Kiểm tra khoá mã hoá đã cấu hình hợp lệ — gọi lúc khởi động khi AI đang được
 * dùng để lỗi cấu hình (vd: thiếu AI_CREDENTIALS_SECRET ở production) bộc lộ
 * ngay thay vì tới lúc gọi model đầu tiên mới phát hiện.
 */
export function assertEncryptionSecretConfigured(): void {
  getPrimaryKey();
}

export function encryptSecret(
  plainText: string,
  aad?: string,
): EncryptedSecret {
  const key = getPrimaryKey();
  const iv = randomBytes(IV_LENGTH_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  if (aad) {
    cipher.setAAD(Buffer.from(aad, 'utf8'));
  }

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

/**
 * Giải mã kèm metadata. Thử lần lượt: (khoá chính + AAD) → hiện đại; rồi các tổ
 * hợp cũ (không AAD, hoặc khoá cũ) để tương thích ngược với dữ liệu đã mã hoá
 * trước khi bật AAD/trước khi xoay khoá. Trả về `legacy=true` nếu không khớp
 * đường hiện đại để caller mã hoá lại.
 */
export function decryptSecretWithMeta(
  cipherText: string,
  iv: string,
  authTag: string,
  aad?: string,
): DecryptedSecret {
  const ivBuf = Buffer.from(iv, 'base64');
  const tagBuf = Buffer.from(authTag, 'base64');
  const dataBuf = Buffer.from(cipherText, 'base64');

  const keys: Array<{ key: Buffer; isOld: boolean }> = [
    { key: getPrimaryKey(), isOld: false },
  ];
  const oldKey = loadKey(OLD_KEY_ENV);
  if (oldKey) {
    keys.push({ key: oldKey, isOld: true });
  }

  for (const { key, isOld } of keys) {
    // Với mỗi khoá thử "có AAD" trước (nếu caller cung cấp), rồi "không AAD".
    const aadOptions = aad ? [aad, undefined] : [undefined];
    for (const useAad of aadOptions) {
      try {
        const decipher = createDecipheriv(ALGORITHM, key, ivBuf);
        decipher.setAuthTag(tagBuf);
        if (useAad) {
          decipher.setAAD(Buffer.from(useAad, 'utf8'));
        }
        const decrypted = Buffer.concat([
          decipher.update(dataBuf),
          decipher.final(),
        ]);
        const legacy = isOld || (Boolean(aad) && !useAad);
        return { value: decrypted.toString('utf8'), legacy };
      } catch {
        // thử tổ hợp tiếp theo
      }
    }
  }

  throw new Error('Không thể giải mã API key (khoá hoặc AAD không khớp)');
}

export function decryptSecret(
  cipherText: string,
  iv: string,
  authTag: string,
  aad?: string,
): string {
  return decryptSecretWithMeta(cipherText, iv, authTag, aad).value;
}
