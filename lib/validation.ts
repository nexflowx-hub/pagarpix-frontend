import type {
  FinanceOverview,
  FinanceRelease,
  FinanceReleases,
  FinanceStore,
  FinanceStores,
  PhysicalWallet,
  Store,
  Transaction,
  TreasuryOverview,
  Wallet
} from "@/lib/types";

type UnknownRecord = Record<string, unknown>;

function record(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as UnknownRecord
    : null;
}

function text(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function numeric(value: unknown): number | null {
  const parsed = typeof value === "number" || typeof value === "string" ? Number(value) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : null;
}

function envelope(payload: unknown): UnknownRecord | null {
  const root = record(payload);
  if (!root || root.success !== true) return null;
  return record(root.data);
}

function wallet(value: unknown): Wallet | null {
  const item = record(value);
  const currency = text(item?.currency);
  const balance = numeric(item?.balance);
  const available = numeric(item?.available);
  const reserved = numeric(item?.reserved);
  if (!item || !currency || balance === null || available === null || reserved === null) return null;
  return {
    id: text(item.id) ?? undefined,
    currency,
    label: text(item.label),
    balance,
    available,
    reserved,
    type: text(item.type) ?? undefined
  };
}

export function parseWallets(payload: unknown): Wallet[] | null {
  const data = envelope(payload);
  if (!data || !Array.isArray(data.wallets)) return null;
  return data.wallets.map(wallet).filter((item): item is Wallet => item !== null);
}

function store(value: unknown): Store | null {
  const item = record(value);
  const id = text(item?.id);
  const name = text(item?.name);
  const storeCode = text(item?.storeCode) ?? text(item?.store_code);
  const status = text(item?.status);
  const currency = text(item?.currency);
  if (!item || !id || !name || !storeCode || !status || !currency) return null;
  return { id, name, storeCode, status, currency, domain: text(item.domain) };
}

export function parseStores(payload: unknown): Store[] | null {
  const root = record(payload);
  if (!root || root.success !== true || !Array.isArray(root.data)) return null;
  return root.data.map(store).filter((item): item is Store => item !== null);
}

function transaction(value: unknown): Transaction | null {
  const item = record(value);
  const id = text(item?.id);
  const reference = text(item?.reference);
  const amount = numeric(item?.amount);
  const currency = text(item?.currency);
  const status = text(item?.status);
  const createdAt = text(item?.createdAt);
  if (!item || !id || !reference || amount === null || !currency || !status || !createdAt) return null;
  return {
    id,
    reference,
    amount,
    currency,
    status,
    method: text(item.method),
    gateway: text(item.gateway) ?? undefined,
    storeId: text(item.storeId),
    createdAt
  };
}

export function parseTransactions(payload: unknown): Transaction[] | null {
  const root = record(payload);
  if (!root || root.success !== true) return null;
  const direct = Array.isArray(root.data) ? root.data : null;
  const paginated = record(root.data);
  const items = direct ?? (Array.isArray(paginated?.data) ? paginated.data : Array.isArray(paginated?.items) ? paginated.items : null);
  if (!items) return null;
  return items.map(transaction).filter((item): item is Transaction => item !== null);
}

function physicalWallet(value: unknown): PhysicalWallet | null {
  const item = record(value);
  const id = text(item?.id);
  const code = text(item?.code);
  const label = text(item?.label);
  const currency = text(item?.currency);
  const role = text(item?.role);
  const status = text(item?.status);
  const balance = numeric(item?.balance);
  const available = numeric(item?.available);
  const reserved = numeric(item?.reserved);
  if (!item || !id || !code || !label || !currency || !role || !status || balance === null || available === null || reserved === null || item.physical !== true) return null;
  return {
    id, code, label, currency, role, status, balance, available, reserved, physical: true,
    ecosystem: text(item.ecosystem),
    manualSettlement: item.manualSettlement === true,
    autoFx: item.autoFx === true,
    updatedAt: text(item.updatedAt) ?? undefined
  };
}

export function parseTreasuryOverview(payload: unknown): TreasuryOverview | null {
  const data = envelope(payload);
  if (!data || !Array.isArray(data.physicalWallets)) return null;
  return {
    physicalWallets: data.physicalWallets.map(physicalWallet).filter((item): item is PhysicalWallet => item !== null),
    accountingByCurrency: Array.isArray(data.accountingByCurrency) ? data.accountingByCurrency.flatMap((value) => {
      const item = record(value);
      const currency = text(item?.currency);
      const balance = numeric(item?.balance);
      const available = numeric(item?.available);
      const reserved = numeric(item?.reserved);
      const reconciliationHold = numeric(item?.reconciliationHold);
      return currency && balance !== null && available !== null && reserved !== null && reconciliationHold !== null
        ? [{ currency, balance, available, reserved, reconciliationHold }]
        : [];
    }) : [],
    financialMetrics: text(data.financialMetrics) ?? undefined,
    legacyCrossCurrencyTotalsDeprecated: data.legacyCrossCurrencyTotalsDeprecated === true,
    generatedAt: text(data.generatedAt) ?? undefined
  };
}

export function parseFinanceOverview(payload: unknown): FinanceOverview | null {
  const data = envelope(payload);
  const walletData = record(data?.wallet);
  const payoutsData = record(data?.payouts);
  const currency = text(data?.currency);
  const timezone = text(data?.timezone);
  const generatedAt = text(data?.generatedAt);
  if (!data || !walletData || !payoutsData || !currency || !timezone || !generatedAt) return null;
  const walletValues = [numeric(walletData.balance), numeric(walletData.pending), numeric(walletData.available), numeric(walletData.reserved)];
  const payoutValues = [numeric(payoutsData.scheduled), numeric(payoutsData.scheduledCount), numeric(payoutsData.paid), numeric(payoutsData.paidCount)];
  if ([...walletValues, ...payoutValues].some((value) => value === null)) return null;
  const next = record(data.nextRelease);
  return {
    currency,
    timezone,
    wallet: {
      id: text(walletData.id),
      balance: walletValues[0]!, pending: walletValues[1]!, available: walletValues[2]!, reserved: walletValues[3]!
    },
    payouts: {
      scheduled: payoutValues[0]!, scheduledCount: payoutValues[1]!, paid: payoutValues[2]!, paidCount: payoutValues[3]!
    },
    projectedAvailable: numeric(data.projectedAvailable) ?? 0,
    nextRelease: next ? {
      date: text(next.date), amount: numeric(next.amount) ?? 0, movementCount: numeric(next.movementCount) ?? 0,
      status: text(next.status) ?? "expected"
    } : null,
    generatedAt
  };
}

function financeStore(value: unknown): FinanceStore | null {
  const item = record(value);
  const storeId = text(item?.storeId);
  const storeCode = text(item?.storeCode);
  const storeName = text(item?.storeName);
  const status = text(item?.status);
  const currency = text(item?.currency);
  if (!item || !storeId || !storeCode || !storeName || !status || !currency) return null;
  const values = ["transactions", "gross", "fees", "net", "pending", "released", "paidPayouts", "scheduledPayouts", "operationalBalance", "availableAfterPayouts"].map((key) => numeric(item[key]));
  if (values.some((entry) => entry === null)) return null;
  return {
    storeId, storeCode, storeName, status, currency,
    transactions: values[0]!, gross: values[1]!, fees: values[2]!, net: values[3]!, pending: values[4]!,
    released: values[5]!, paidPayouts: values[6]!, scheduledPayouts: values[7]!, operationalBalance: values[8]!, availableAfterPayouts: values[9]!
  };
}

export function parseFinanceStores(payload: unknown): FinanceStores | null {
  const data = envelope(payload);
  const currency = text(data?.currency);
  const generatedAt = text(data?.generatedAt);
  if (!data || !currency || !generatedAt || !Array.isArray(data.stores)) return null;
  return { currency, generatedAt, stores: data.stores.map(financeStore).filter((item): item is FinanceStore => item !== null) };
}

function release(value: unknown): FinanceRelease | null {
  const item = record(value);
  if (!item) return null;
  const gross = numeric(item.gross);
  const fees = numeric(item.fees);
  const net = numeric(item.net);
  const movementCount = numeric(item.movementCount);
  if (gross === null || fees === null || net === null || movementCount === null) return null;
  return {
    date: text(item.date), storeId: text(item.storeId), storeCode: text(item.storeCode), storeName: text(item.storeName),
    gross, fees, net, movementCount, status: text(item.status) ?? "expected"
  };
}

export function parseFinanceReleases(payload: unknown): FinanceReleases | null {
  const data = envelope(payload);
  const summary = record(data?.summary);
  const currency = text(data?.currency);
  const timezone = text(data?.timezone);
  const generatedAt = text(data?.generatedAt);
  if (!data || !summary || !currency || !timezone || !generatedAt || !Array.isArray(data.items)) return null;
  const totalNet = numeric(summary.totalNet);
  const movementCount = numeric(summary.movementCount);
  const overdueNet = numeric(summary.overdueNet);
  if (totalNet === null || movementCount === null || overdueNet === null) return null;
  return {
    currency, timezone, generatedAt,
    items: data.items.map(release).filter((item): item is FinanceRelease => item !== null),
    summary: { totalNet, movementCount, overdueNet }
  };
}
