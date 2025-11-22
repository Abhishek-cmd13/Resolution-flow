import { BorrowerProfile } from '../types';

// ================================
// CONSTANTS
// ================================
const DELTA = 0x9E3779B9;
const ROUNDS = 32;
const BASE62 = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const SECRET_KEY = "RiverlineUltraShortKey"; // Must match Python script

// ================================
// BASE62 DECODE
// ================================
function base62Decode(str: string): Uint8Array {
  let num = 0n;
  for (const ch of str) {
    num = num * 62n + BigInt(BASE62.indexOf(ch));
  }
  // convert bigint → 16-byte array (128 bits)
  let hex = num.toString(16);
  if (hex.length % 2 === 1) hex = "0" + hex;
  hex = hex.padStart(32, "0"); // force 16 bytes
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

// ================================
// SHA-256 → 128-bit TEA key
// ================================
async function deriveKey(secret: string): Promise<number[]> {
  const data = new TextEncoder().encode(secret);
  const hash = await crypto.subtle.digest("SHA-256", data);
  const keyBytes = new Uint8Array(hash).slice(0, 16);
  const key: number[] = [];
  for (let i = 0; i < 16; i += 4) {
    key.push(
      (keyBytes[i] << 24) |
      (keyBytes[i + 1] << 16) |
      (keyBytes[i + 2] << 8) |
      (keyBytes[i + 3])
    );
  }
  return key;
}

// ================================
// TEA DECRYPT 64-BIT BLOCK
// ================================
function teaDecryptBlock(v0: number, v1: number, key: number[]): [number, number] {
  let sum = (DELTA * ROUNDS) >>> 0;
  for (let i = 0; i < ROUNDS; i++) {
    v1 = (v1 - ((((v0 << 4) >>> 0) + key[2]) ^
                (v0 + sum) ^
                (((v0 >>> 5) + key[3]) >>> 0))) >>> 0;
    v0 = (v0 - ((((v1 << 4) >>> 0) + key[0]) ^
                (v1 + sum) ^
                (((v1 >>> 5) + key[1]) >>> 0))) >>> 0;
    sum = (sum - DELTA) >>> 0;
  }
  return [v0 >>> 0, v1 >>> 0];
}

// ================================
// MAIN DECODE FUNCTION
// ================================
interface DecodedTokenData {
  number: string;
  settlement_amount: number;
  pending_amount: number;
}

async function decodeToken(token: string, secretKey: string): Promise<DecodedTokenData | null> {
  try {
    const key = await deriveKey(secretKey);
    const bytes = base62Decode(token);
    
    // split into 2 × 64-bit blocks
    const v0  = (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];
    const v1  = (bytes[4] << 24) | (bytes[5] << 16) | (bytes[6] << 8) | bytes[7];
    const v0b = (bytes[8] << 24) | (bytes[9] << 16) | (bytes[10] << 8) | bytes[11];
    const v1b = (bytes[12] << 24) | (bytes[13] << 16) | (bytes[14] << 8) | bytes[15];
    
    // decrypt both blocks
    const [dv0, dv1]   = teaDecryptBlock(v0,  v1,  key);
    const [dv0b, dv1b] = teaDecryptBlock(v0b, v1b, key);
    
    // combine into a single 128-bit BigInt
    const big = (
      (BigInt(dv0)  << 96n) |
      (BigInt(dv1)  << 64n) |
      (BigInt(dv0b) << 32n) |
      (BigInt(dv1b))
    );
    
    // extract bit fields:
    const number            = big >> 60n;
    const settlement_amount = (big >> 30n) & ((1n << 30n) - 1n);
    const pending_amount    = big & ((1n << 30n) - 1n);
    
    return {
      number: number.toString(),
      settlement_amount: Number(settlement_amount),
      pending_amount: Number(pending_amount)
    };
  } catch (error) {
    console.error('[Token Decrypt] Error decoding token:', error);
    return null;
  }
}

// ================================
// MAP DECODED DATA TO BORROWER PROFILE
// ================================
function mapDecodedDataToBorrowerProfile(decoded: DecodedTokenData): BorrowerProfile {
  return {
    // number is the phone number
    phone: decoded.number,
    // pending_amount is the total outstanding (also used for display)
    amount: decoded.pending_amount.toString(),
    // pending_amount is the maximum/closure amount
    max_settlement: decoded.pending_amount.toString(),
    // settlement_amount is the minimum settlement amount
    min_settlement: decoded.settlement_amount.toString(),
  };
}

// ================================
// EXTRACT BORROWER FROM URL
// ================================
export async function extractBorrowerFromURL(): Promise<BorrowerProfile | null> {
  // Try to get token from URL path (e.g., /cT7LmLvimyoUef76D9eJrK)
  let token = '';
  const pathname = window.location.pathname;
  
  // Extract token from path (remove leading slash and any trailing slashes)
  if (pathname && pathname !== '/') {
    token = pathname.replace(/^\/+|\/+$/g, ''); // Remove leading and trailing slashes
  }
  
  console.log('[Token Extract] Pathname:', pathname, 'Extracted token:', token);
  
  // If no token in path, try hash
  if (!token) {
    const hash = window.location.hash.replace(/^#\/?/, '').replace(/^#/, '');
    if (hash && !hash.includes('=')) {
      // If hash doesn't look like query params, treat as token
      token = hash;
    }
    console.log('[Token Extract] Hash:', window.location.hash, 'Extracted token:', token);
  }
  
  // If no token in path/hash, try query params
  if (!token) {
    const urlParams = new URLSearchParams(window.location.search);
    token = urlParams.get('token') || 
            urlParams.get('data') || 
            urlParams.get('borrower') ||
            urlParams.get('t') ||
            '';
    console.log('[Token Extract] Query params token:', token);
  }
  
  // If still no token, try hash params
  if (!token) {
    const hash = window.location.hash.substring(1);
    const hashParams = new URLSearchParams(hash);
    token = hashParams.get('token') || 
            hashParams.get('data') || 
            hashParams.get('borrower') ||
            '';
    console.log('[Token Extract] Hash params token:', token);
  }
  
  if (!token) {
    // If no token found, try to extract individual fields directly from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const directData: BorrowerProfile = {
      name: urlParams.get('name') || undefined,
      phone: urlParams.get('phone') || urlParams.get('phoneNumber') || undefined,
      email: urlParams.get('email') || urlParams.get('emailId') || undefined,
      amount: urlParams.get('amount') || urlParams.get('pendingAmount') || undefined,
      lender: urlParams.get('lender') || undefined,
      account: urlParams.get('account') || undefined,
      min_settlement: urlParams.get('min_settlement') || undefined,
      max_settlement: urlParams.get('max_settlement') || urlParams.get('maxSettlement') || undefined,
    };
    
    // Return if at least one field is present
    if (Object.values(directData).some(v => v !== undefined)) {
      return directData;
    }
    
    return null;
  }

  // Decrypt the token using TEA
  console.log('[Token Extract] Attempting to decode token:', token);
  const decoded = await decodeToken(token, SECRET_KEY);
  console.log('[Token Extract] Decoded data:', decoded);
  
  if (!decoded) {
    console.log('[Token Extract] Failed to decode token');
    return null;
  }

  // Map decoded data to borrower profile
  const borrowerProfile = mapDecodedDataToBorrowerProfile(decoded);
  console.log('[Token Extract] Mapped borrower profile:', borrowerProfile);
  return borrowerProfile;
}
