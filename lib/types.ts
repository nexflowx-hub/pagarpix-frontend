export type Wallet = {
  id?: string;
  currency: string;
  label?: string | null;
  balance: number;
  available: number;
  reserved: number;
  type?: string;
};

export type Store = {
  id: string;
  name: string;
  storeCode: string;
  status: string;
  currency: string;
  domain?: string | null;
  paymentMethods?: string[];
};

export type Transaction = {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  method?: string;
  createdAt: string;
};

export type CoreEnvelope<T> = {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
  error?: { code?: string; message?: string };
};
