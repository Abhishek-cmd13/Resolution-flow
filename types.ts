
export enum Intent {
  // Closure / Action
  MAKE_PAYMENT = 'make_payment',
  REQUEST_SETTLEMENT = 'request_settlement',
  
  // Struggle / Time
  NEED_TIME = 'need_time',
  FINANCIAL_HARDSHIP = 'financial_hardship', // "Liable but broke", "Uncertainty"
  
  // Confusion / Verification
  ALREADY_PAID = 'already_paid',
  UNKNOWN_LOAN = 'unknown_loan', // "What loan is this?"
  FRAUD_CONCERN = 'fraud_concern',
  
  // Administrative / Contact
  TALK_TO_ADVISOR = 'talk_to_someone', // "Want to be heard"
  DOCUMENTS = 'documents', // "NOC"
}

export interface FormData {
  // Make Payment
  payAmountType?: 'full' | 'emi' | 'custom';
  payCustomAmount?: string;
  payMode?: 'upi' | 'card' | 'netbanking';
  
  // Settlement
  settlementIdea?: 'yes' | 'no';
  settlementAmount?: string;
  settlementDate?: string;
  
  // Already Paid
  paidAmount?: string;
  paidDate?: string;
  paidUtr?: string;
  
  // Need Time (Flow V2)
  needTimeReason?: string;
  ptpDate?: string; // Calculated or Selected Date
  ptpAmount?: string; // Committed Amount
  
  // Not Sure Path
  notSureChoice?: 'advisor' | 'no_talk';
  callbackTime?: string;

  // Hardship
  hardshipType?: string;
  hardshipNote?: string;
  
  // Talk to Advisor
  talkTopic?: string;
  talkSlot?: string;
  
  // Documents
  docType?: string;
  docEmail?: string;
  
  // Fraud
  fraudChannel?: string;
  fraudText?: string;
}

export interface BorrowerProfile {
  name?: string;
  phone?: string;
  email?: string;
  amount?: string;
  lender?: string;
  account?: string;
  min_settlement?: string;
  max_settlement?: string; // Total maximum settlement amount
}

export type Step = 1 | 2 | 3;
