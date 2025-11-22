import { BorrowerProfile } from '../types';

// ================================
// CONSTANTS
// ================================
const DELTA = 0x9E3779B9;
const ROUNDS = 32;
const BASE62 = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const SECRET_KEY = "RiverlineUltraShortKey"; // Must match Python script

// ================================
// BANK + NBFC LOOKUP TABLES
// ================================
const bankMapping: { [key: number]: string } = {
  1: "CRED",
  2: "Unknown",
  3: "Axio",
  4: "Propelld",
  5: "Riverlinr",
  6: "FREO",
  7: "Finnable",
  8: "Nira",
  9: "Riverline",
  10: "Jupiter",
  11: "Credit Fair"
};

const nbfcMapping: { [key: number]: string } = {
  1: "LIQUI_LOANS",
  2: "PARFAIT",
  3: "VIVRITI_CA",
  4: "CREDIT_SAISON",
  5: "NEWTAP",
  6: "Axio",
  7: "Vivriti Capital",
  8: "Poonawalla Fincorp Limited",
  9: "Aditya Birla Finance Limited PL",
  10: "Poonawalla Fincorp Ltd SP",
  11: "EDGRO",
  12: "Avanse",
  13: "ABFL",
  14: "JMF",
  15: "LiquiLoans",
  16: "Edgro-KSF",
  17: "Faircent",
  18: "ARVOG",
  19: "TAPSTART",
  20: "CHOLAMANDALAM",
  21: "LENDBOX",
  22: "KOMAC",
  23: "CREDITSAISON",
  24: "ASPIRE",
  25: "DMI",
  26: "TVS-Online",
  27: "Utkarsh",
  28: "VCPL",
  29: "Piramal",
  30: "HDB-Direct",
  31: "Northern-Arc",
  32: "HDB",
  33: "TVS",
  34: "Finnable",
  35: "HDBFS",
  36: "NAC",
  37: "PayU",
  38: "Muthoot",
  39: "KIFPL",
  40: "KSF",
  41: "AFPL",
  42: "[AFPL;KSF]",
  43: "K. M. Global Credit Private Limited",
  44: "Aditya Birla Finance Limited",
  45: "Lendbox P2P",
  46: "Avanse Financial Services Ltd.",
  47: "K. M. GLOBAL P2P FINANCE PRIVATE LIMITED",
  48: "Lendbox LSP",
  49: "JM Financial Products Ltd",
  50: "Pride Financial Services Private Limited"
};

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
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
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
  bankName: string;
  nbfcName: string;
}

async function decodeToken(token: string, secretKey: string): Promise<DecodedTokenData | null> {
  try {
    const key = await deriveKey(secretKey);
    const bytes = base62Decode(token);
    
    // first 64 bits
    const v0  = (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];
    const v1  = (bytes[4] << 24) | (bytes[5] << 16) | (bytes[6] << 8) | bytes[7];
    // second 64 bits
    const v0b = (bytes[8] << 24) | (bytes[9] << 16) | (bytes[10] << 8) | bytes[11];
    const v1b = (bytes[12] << 24) | (bytes[13] << 16) | (bytes[14] << 8) | bytes[15];
    
    // decrypt both blocks
    const [dv0, dv1]   = teaDecryptBlock(v0,  v1,  key);
    const [dv0b, dv1b] = teaDecryptBlock(v0b, v1b, key);
    
    // combine into one 128-bit integer
    const big = (
      (BigInt(dv0)  << 96n) |
      (BigInt(dv1)  << 64n) |
      (BigInt(dv0b) << 32n) |
      (BigInt(dv1b))
    );
    
    // UNPACK 120 BITS
    // Bit layout: [40 bits: number] [30 bits: settlement] [30 bits: pending] [10 bits: bank] [10 bits: nbfc]
    // Total: 40 + 30 + 30 + 10 + 10 = 120 bits
    // Positions: number (bits 120-81), settlement (bits 80-51), pending (bits 50-21), bank (bits 20-11), nbfc (bits 10-1)
    const number            = big >> 80n;  // Extract top 40 bits (phone number) - bits 120-81
    const settlement_amount = (big >> 50n) & ((1n << 30n) - 1n);  // Extract bits 80-51 (settlement) - shift right 50, mask 30 bits
    const pending_amount    = (big >> 20n) & ((1n << 30n) - 1n);  // Extract bits 50-21 (pending) - shift right 20, mask 30 bits
    const bankCode          = (big >> 10n) & 1023n;  // Extract bits 20-11 (bank) - shift right 10, mask 10 bits
    const nbfcCode          = big & 1023n;           // Extract bits 10-1 (nbfc) - mask 10 bits
    
    // Additional validation: Check if amounts are unreasonably large (likely wrong extraction)
    const settlementNum = Number(settlement_amount);
    const pendingNum = Number(pending_amount);
    
    if (settlementNum > 100000000 || pendingNum > 100000000) {
      console.warn('[Token Decrypt] WARNING: Amounts seem unreasonably large! This suggests bit extraction may be wrong.');
      console.warn('[Token Decrypt] settlement_amount:', settlementNum, 'pending_amount:', pendingNum);
    }
    
    // Debug logging - check if values look reasonable
    console.log('[Token Decrypt] Raw extracted values:', {
      number_raw: number.toString(),
      number_length: number.toString().length,
      settlement_amount_raw: settlement_amount.toString(),
      pending_amount_raw: pending_amount.toString(),
      bankCode_raw: bankCode.toString(),
      nbfcCode_raw: nbfcCode.toString(),
      big_hex: big.toString(16)
    });
    
    // Validate: phone number should be 10-12 digits, amounts should be reasonable (not phone numbers)
    const numberStr = number.toString();
    const pendingStr = pending_amount.toString();
    
    // Check if pending_amount looks like a phone number (10-12 digits starting with 9 or similar)
    if (pendingStr.length >= 10 && pendingStr.length <= 12 && (pendingStr.startsWith('9') || pendingStr.startsWith('91'))) {
      console.warn('[Token Decrypt] WARNING: pending_amount looks like a phone number! This suggests bit extraction may be wrong.');
      console.warn('[Token Decrypt] pending_amount:', pendingStr, 'number:', numberStr);
    }
    
    return {
      number: number.toString(),
      settlement_amount: Number(settlement_amount),
      pending_amount: Number(pending_amount),
      bankName: bankMapping[Number(bankCode)] || "Unknown",
      nbfcName: nbfcMapping[Number(nbfcCode)] || "Unknown"
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
  // Debug logging to verify mapping
  console.log('[Token Decrypt] Mapping decoded data to borrower profile:', {
    number: decoded.number,
    settlement_amount: decoded.settlement_amount,
    pending_amount: decoded.pending_amount,
    bankName: decoded.bankName,
    nbfcName: decoded.nbfcName
  });
  
  return {
    // number is the phone number
    phone: decoded.number,
    // pending_amount is the total outstanding (also used for display)
    amount: decoded.pending_amount.toString(),
    // pending_amount is the maximum/closure amount
    max_settlement: decoded.pending_amount.toString(),
    // settlement_amount is the minimum settlement amount
    min_settlement: decoded.settlement_amount.toString(),
    // bank and nbfc names
    bankName: decoded.bankName,
    nbfcName: decoded.nbfcName,
    // Use nbfcName as lender if available, otherwise use bankName
    lender: decoded.nbfcName !== "Unknown" ? decoded.nbfcName : decoded.bankName,
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
