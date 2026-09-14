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

export type FinanceOverview = {
  currency: string;
  timezone: string;
  wallet: {
    id: string | null;
    balance: number;
    pending: number;
    available: number;
    reserved: number;
  };
  payouts: {
    scheduled: number;
    scheduledCount: number;
    paid: number;
    paidCount: number;
  };
  projectedAvailable: number;
  nextRelease: {
    date: string | null;
    amount: number;
    movementCount: number;
    status: "expected" | "overdue" | string;
  } | null;
  generatedAt: string;
};

export type FinanceStore = {
  storeId: string;
  storeCode: string;
  storeName: string;
  status: string;
  currency: string;
  transactions: number;
  gross: number;
  fees: number;
  net: number;
  pending: number;
  released: number;
  paidPayouts: number;
  scheduledPayouts: number;
  operationalBalance: number;
  availableAfterPayouts: number;
};

export type FinanceStores = {
  currency: string;
  stores: FinanceStore[];
  generatedAt: string;
};

export type FinanceRelease = {
  date: string | null;
  storeId: string | null;
  storeCode: string | null;
  storeName: string | null;
  gross: number;
  fees: number;
  net: number;
  movementCount: number;
  status: "expected" | "overdue" | string;
};

export type FinanceReleases = {
  currency: string;
  timezone: string;
  items: FinanceRelease[];
  summary: {
    totalNet: number;
    movementCount: number;
    overdueNet: number;
  };
  generatedAt: string;
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
  gateway?: string;
  storeId?: string | null;
  createdAt: string;
};

export type CoreEnvelope<T> = {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
  error?: { code?: string; message?: string };
};
