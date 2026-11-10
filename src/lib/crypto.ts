/**
 * Client-Side Zero-Knowledge Encryption Utilities using Web Crypto API.
 * Uses AES-GCM 256-bit with PBKDF2 key derivation (100,000 iterations).
 * Nothing leaves the browser unencrypted.
 */

const PBKDF2_ITERATIONS = 100000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

export interface EncryptedPayload {
  salt: string; // Base64
  iv: string;   // Base64
  ciphertext: string; // Base64
  version: number;
}

// Helper to convert ArrayBuffer to Base64
function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper to convert Base64 to Uint8Array
function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Derives an AES-GCM CryptoKey from a user passphrase and salt using PBKDF2.
 */
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts an arbitrary object/string using the user's master passphrase.
 */
export async function encryptData(data: unknown, passphrase: string): Promise<EncryptedPayload> {
  const jsonString = JSON.stringify(data);
  const enc = new TextEncoder();
  const encodedData = enc.encode(jsonString);

  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await deriveKey(passphrase, salt);

  const ciphertextBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as unknown as BufferSource,
    },
    key,
    encodedData
  );

  return {
    salt: bufferToBase64(salt),
    iv: bufferToBase64(iv),
    ciphertext: bufferToBase64(ciphertextBuffer),
    version: 1,
  };
}

/**
 * Decrypts an EncryptedPayload using the user's master passphrase.
 */
export async function decryptData<T = unknown>(payload: EncryptedPayload, passphrase: string): Promise<T> {
  try {
    const salt = base64ToBuffer(payload.salt);
    const iv = base64ToBuffer(payload.iv);
    const ciphertext = base64ToBuffer(payload.ciphertext);

    const key = await deriveKey(passphrase, salt);

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as unknown as BufferSource,
      },
      key,
      ciphertext as unknown as BufferSource
    );

    const dec = new TextDecoder();
    const jsonString = dec.decode(decryptedBuffer);
    return JSON.parse(jsonString) as T;
  } catch (err) {
    throw new Error('Invalid master passphrase or corrupted vault data.');
  }
}

/**
 * Computes a verification token hash to verify password correctness quickly.
 */
export async function createPasswordVerifier(passphrase: string): Promise<{ salt: string; hash: string }> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: 50000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  return {
    salt: bufferToBase64(salt),
    hash: bufferToBase64(bits),
  };
}

export async function verifyPassword(passphrase: string, saltBase64: string, expectedHashBase64: string): Promise<boolean> {
  try {
    const salt = base64ToBuffer(saltBase64);
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(passphrase),
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );

    const bits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt as unknown as BufferSource,
        iterations: 50000,
        hash: 'SHA-256',
      },
      keyMaterial,
      256
    );

    const actualHash = bufferToBase64(bits);
    return actualHash === expectedHashBase64;
  } catch {
    return false;
  }
}

/**
 * Generates a high-entropy random password.
 */
export function generateStrongPassword(options: {
  length?: number;
  useUpper?: boolean;
  useLower?: boolean;
  useDigits?: boolean;
  useSymbols?: boolean;
} = {}): string {
  const {
    length = 20,
    useUpper = true,
    useLower = true,
    useDigits = true,
    useSymbols = true,
  } = options;

  let chars = '';
  if (useUpper) chars += 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  if (useLower) chars += 'abcdefghijkmnopqrstuvwxyz';
  if (useDigits) chars += '23456789';
  if (useSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

  if (!chars) chars = 'abcdefghijkmnopqrstuvwxyz23456789';

  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);

  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }
  return result;
}
