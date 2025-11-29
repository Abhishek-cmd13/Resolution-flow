import mixpanel from 'mixpanel-browser';

const MIXPANEL_TOKEN = 'fbf7b18da88c0c5740b3ee4009a8d8fd';

// Helper to get current page URL
const getCurrentPageUrl = (): string => {
  if (typeof window !== 'undefined') {
    return window.location.href;
  }
  return 'unknown';
};

// Initialize Mixpanel
export const initMixpanel = () => {
  if (typeof window !== 'undefined') {
    mixpanel.init(MIXPANEL_TOKEN, {
      autocapture: true,
      record_sessions_percent: 100,
      ignore_dnt: true, // Respect user privacy but still track
    });
    console.log('[Mixpanel] Initialized with token:', MIXPANEL_TOKEN);
  }
};

// Track page views / step changes
export const trackPageView = (page: string, properties?: Record<string, any>) => {
  mixpanel.track('Page View', {
    page,
    page_url: getCurrentPageUrl(),
    ...properties,
  });
  console.log('[Mixpanel] Tracked: Page View', { page, page_url: getCurrentPageUrl(), ...properties });
};

// Track intent selection
export const trackIntentSelection = (intent: string, borrower?: any) => {
  mixpanel.track('Intent Selected', {
    intent,
    page_url: getCurrentPageUrl(),
    borrower_id: borrower?.account || borrower?.phone || 'unknown',
    borrower_name: borrower?.name || 'unknown',
    amount: borrower?.amount || null,
  });
  console.log('[Mixpanel] Tracked: Intent Selected', { intent, page_url: getCurrentPageUrl() });
};

// Track form submission
export const trackFormSubmit = (intent: string, formData: any, borrower?: any) => {
  mixpanel.track('Form Submitted', {
    intent,
    page_url: getCurrentPageUrl(),
    ...formData,
    borrower_id: borrower?.account || borrower?.phone || 'unknown',
  });
  console.log('[Mixpanel] Tracked: Form Submitted', { intent, page_url: getCurrentPageUrl() });
};

// Track external link clicks
export const trackExternalLink = (linkType: string, intent?: string, borrower?: any) => {
  mixpanel.track('External Link Clicked', {
    link_type: linkType, // 'whatsapp', 'phone', 'calendar'
    intent: intent || 'unknown',
    page_url: getCurrentPageUrl(),
    borrower_id: borrower?.account || borrower?.phone || 'unknown',
  });
  console.log('[Mixpanel] Tracked: External Link Clicked', { link_type: linkType, intent, page_url: getCurrentPageUrl() });
};

// Track settlement amount changes
export const trackSettlementChange = (amount: number, isClosure: boolean, borrower?: any) => {
  mixpanel.track('Settlement Amount Changed', {
    amount,
    is_closure: isClosure,
    page_url: getCurrentPageUrl(),
    borrower_id: borrower?.account || borrower?.phone || 'unknown',
  });
};

// Track payment type selection
export const trackPaymentType = (paymentType: string, amount?: string, borrower?: any) => {
  mixpanel.track('Payment Type Selected', {
    payment_type: paymentType,
    amount: amount || null,
    page_url: getCurrentPageUrl(),
    borrower_id: borrower?.account || borrower?.phone || 'unknown',
  });
};

// Track step navigation
export const trackStepChange = (step: number, intent?: string, borrower?: any) => {
  mixpanel.track('Step Changed', {
    step,
    intent: intent || 'none',
    page_url: getCurrentPageUrl(),
    borrower_id: borrower?.account || borrower?.phone || 'unknown',
  });
};

// Track borrower data loaded
export const trackBorrowerLoaded = (borrower: any) => {
  mixpanel.track('Borrower Data Loaded', {
    borrower_id: borrower?.account || borrower?.phone || 'unknown',
    has_name: !!borrower?.name,
    has_amount: !!borrower?.amount,
    has_settlement_range: !!(borrower?.min_settlement && borrower?.max_settlement),
    page_url: getCurrentPageUrl(),
  });
};

// Identify user (optional, for better tracking)
export const identifyUser = (borrower?: any) => {
  if (borrower?.account || borrower?.phone) {
    mixpanel.identify(borrower.account || borrower.phone);
    mixpanel.people.set({
      name: borrower.name || 'Unknown',
      phone: borrower.phone || null,
      email: borrower.email || null,
      amount: borrower.amount || null,
    });
  }
};

