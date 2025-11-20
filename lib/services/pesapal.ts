import crypto from 'crypto';

const PESAPAL_BASE_URL = process.env.PESAPAL_ENVIRONMENT === 'live'
  ? 'https://pay.pesapal.com/v3'
  : 'https://cybqa.pesapal.com/pesapalv3';

const CONSUMER_KEY = process.env.PESAPAL_CONSUMER_KEY!;
const CONSUMER_SECRET = process.env.PESAPAL_CONSUMER_SECRET!;

interface PesapalAuthResponse {
  token: string;
  expiryDate: string;
  error?: string;
  message?: string;
}

interface PesapalOrderRequest {
  id: string;
  currency: string;
  amount: number;
  description: string;
  callback_url: string;
  notification_id: string;
  billing_address: {
    email_address: string;
    phone_number?: string;
    country_code?: string;
    first_name?: string;
    middle_name?: string;
    last_name?: string;
    line_1?: string;
    line_2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    zip_code?: string;
  };
}

interface PesapalOrderResponse {
  order_tracking_id: string;
  merchant_reference: string;
  redirect_url: string;
  error?: string;
  message?: string;
}

interface PesapalTransactionStatus {
  payment_method: string;
  amount: number;
  created_date: string;
  confirmation_code: string;
  payment_status_description: string;
  description: string;
  message: string;
  payment_account: string;
  call_back_url: string;
  status_code: number;
  merchant_reference: string;
  payment_status_code: string;
  currency: string;
  error?: string;
}

let cachedToken: { token: string; expiryDate: Date } | null = null;

export async function getPesapalToken(): Promise<string> {
  if (cachedToken && cachedToken.expiryDate > new Date()) {
    return cachedToken.token;
  }

  const response = await fetch(`${PESAPAL_BASE_URL}/api/Auth/RequestToken`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      consumer_key: CONSUMER_KEY,
      consumer_secret: CONSUMER_SECRET,
    }),
  });

  const data: PesapalAuthResponse = await response.json();

  if (data.error || !data.token) {
    throw new Error(data.message || 'Failed to get Pesapal token');
  }

  cachedToken = {
    token: data.token,
    expiryDate: new Date(data.expiryDate),
  };

  return data.token;
}

export async function registerIPN(url: string): Promise<string> {
  const token = await getPesapalToken();

  const response = await fetch(`${PESAPAL_BASE_URL}/api/URLSetup/RegisterIPN`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      url,
      ipn_notification_type: 'GET',
    }),
  });

  const data = await response.json();

  if (data.error || !data.ipn_id) {
    throw new Error(data.message || 'Failed to register IPN');
  }

  return data.ipn_id;
}

export async function submitOrder(orderData: PesapalOrderRequest): Promise<PesapalOrderResponse> {
  const token = await getPesapalToken();

  const response = await fetch(`${PESAPAL_BASE_URL}/api/Transactions/SubmitOrderRequest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(orderData),
  });

  const data: PesapalOrderResponse = await response.json();

  if (data.error) {
    throw new Error(data.message || 'Failed to submit order');
  }

  return data;
}

export async function getTransactionStatus(orderTrackingId: string): Promise<PesapalTransactionStatus> {
  const token = await getPesapalToken();

  const response = await fetch(
    `${PESAPAL_BASE_URL}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
    {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  const data: PesapalTransactionStatus = await response.json();

  if (data.error) {
    throw new Error(data.message || 'Failed to get transaction status');
  }

  return data;
}

export const PLAN_PRICES = {
  starter: {
    monthly: { amount: 15, currency: 'USD' },
    annual: { amount: 144, currency: 'USD' },
  },
  growth: {
    monthly: { amount: 35, currency: 'USD' },
    annual: { amount: 336, currency: 'USD' },
  },
  pro: {
    monthly: { amount: 75, currency: 'USD' },
    annual: { amount: 720, currency: 'USD' },
  },
} as const;

export function getPlanPrice(tier: string, billingCycle: 'monthly' | 'annual' = 'monthly') {
  const normalizedTier = tier.toLowerCase() as keyof typeof PLAN_PRICES;

  if (!PLAN_PRICES[normalizedTier]) {
    throw new Error(`Invalid plan tier: ${tier}`);
  }

  return PLAN_PRICES[normalizedTier][billingCycle];
}

export function calculateTrialEndDate(): Date {
  const trialDate = new Date();
  trialDate.setDate(trialDate.getDate() + 14);
  return trialDate;
}
