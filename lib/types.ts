export type Wallet = {
  id?: string;
  currency: string;
  label?: string | null;
  balance: number;
  available: number;
  reserved: number;
  type?: string;
};

export type PhysicalWallet = {
  id: string;
  code: string;
  label: string;
  currency: string;
  role: "BANK_SETTLEMENT" | "CRYPTO_SETTLEMENT" | "BLOCKED" | string;
  ecosystem?: string | null;
  status: string;
  balance: number;
  available: number;
  reserved: number;
  physical: true;
  manualSettlement?: boolean;
  autoFx?: boolean;
  updatedAt?: string;
};

export type TreasuryOverview = {
  physicalWallets?: PhysicalWallet[];
  accountingByCurrency?: Array<{
    currency: string;
    balance: number;
    available: number;
    reserved: number;
    reconciliationHold: number;
  }>;
  financialMetrics?: "currency_scoped" | string;
  legacyCrossCurrencyTotalsDeprecated?: boolean;
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
