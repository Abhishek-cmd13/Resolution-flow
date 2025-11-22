import { BorrowerProfile } from '../types';

/**
 * Decrypts a token from URL
 * Handles URL-safe Base64 encoding with proper padding
 */
export function decryptToken(token: string): string | null {
  if (!token) return null;

  try {
    // Handle URL-safe Base64 encoding
    // Replace URL-safe characters with standard Base64 characters
    let base64Token = token.replace(/-/g, '+').replace(/_/g, '/');
    
    // Add back missing padding
    base64Token += '='.repeat((4 - base64Token.length % 4) % 4);
    
    // Decode Base64
    const decoded = atob(base64Token);
    
    return decoded;
  } catch (error) {
    console.error('[Token Decrypt] Error decrypting token:', error);
    return null;
  }
}

/**
 * Parses decrypted token string into BorrowerProfile
 * Expects JSON format with borrower information
 * Supports the exact format: { name, email, phone, maxSettlement, principalOutstanding }
 */
export function parseBorrowerData(decryptedData: string): BorrowerProfile | null {
  if (!decryptedData) return null;

  try {
    // Parse as JSON
    const data = JSON.parse(decryptedData);
    
    return {
      name: data.name || data.borrowerName || data.borrower_name,
      phone: data.phone || data.phoneNumber || data.phone_number || data.mobile,
      email: data.email || data.emailId || data.email_id || data.registeredEmail,
      // principalOutstanding is the pending amount
      amount: data.principalOutstanding?.toString() || data.amount || data.pendingAmount || data.pending_amount || data.totalDue,
      lender: data.lender || data.lenderName,
      account: data.account || data.accountNumber || data.account_number,
      min_settlement: data.min_settlement || data.minSettlement || data.minimumSettlement,
      // maxSettlement is the maximum settlement amount
      max_settlement: data.maxSettlement?.toString() || data.max_settlement || data.maximumSettlement || data.totalMaxSettlement,
    };
  } catch (error) {
    console.error('[Token Decrypt] Error parsing borrower data:', error);
    return null;
  }
}

/**
 * Extracts and decrypts borrower information from URL
 * Supports multiple URL formats:
 * - ?token=ENCRYPTED_TOKEN
 * - ?data=ENCRYPTED_DATA
 * - ?borrower=ENCRYPTED_BORROWER
 * - Multiple tokens: ?token1=...&token2=...
 */
export function extractBorrowerFromURL(): BorrowerProfile | null {
  const urlParams = new URLSearchParams(window.location.search);
  
  // Try different parameter names
  const token = urlParams.get('token') || 
                urlParams.get('data') || 
                urlParams.get('borrower') ||
                urlParams.get('t');

  if (!token) {
    // Try hash-based tokens (#token=...)
    const hash = window.location.hash.substring(1);
    const hashParams = new URLSearchParams(hash);
    const hashToken = hashParams.get('token') || 
                      hashParams.get('data') || 
                      hashParams.get('borrower');
    
    if (hashToken) {
      const decrypted = decryptToken(hashToken);
      if (decrypted) {
        return parseBorrowerData(decrypted);
      }
    }
    
    // If no token found, try to extract individual fields directly from URL params
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

  // Decrypt the token
  const decrypted = decryptToken(token);
  if (!decrypted) {
    return null;
  }

  // Parse the decrypted data
  return parseBorrowerData(decrypted);
}


