import type { PixCashflowPoint, PhysicalWallet, Transaction, TreasuryOverview } from "@/lib/types";

const PIX_STATUS = "succeeded";
const PIX_METHOD = "pix";
const PIX_CURRENCY = "BRL";
const BRAZIL_TIMEZONE = "America/Sao_Paulo";

export function getPhysicalBrlWallet(treasury: TreasuryOverview | null): PhysicalWallet | null {
  return treasury?.physicalWallets?.find((wallet) =>
    wallet.physical === true &&
    wallet.code.toUpperCase() === "WALLET-BRL" &&
    wallet.currency.toUpperCase() === PIX_CURRENCY &&
    wallet.role.toUpperCase() === "BANK_SETTLEMENT"
  ) ?? null;
}

export function getWithdrawableBrl(treasury: TreasuryOverview | null): number | null {
  const wallet = getPhysicalBrlWallet(treasury);
  if (!wallet || wallet.status.toLowerCase() !== "active" || !Number.isFinite(wallet.available)) {
    return null;
  }
  return wallet.available;
}

export function isConfirmedPix(transaction: Transaction): boolean {
  return transaction.currency.toUpperCase() === PIX_CURRENCY &&
    transaction.status.toLowerCase() === PIX_STATUS &&
    transaction.method?.toLowerCase() === PIX_METHOD;
}

function dateKey(value: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BRAZIL_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(value);
}

export function aggregatePixCashflow(
  transactions: Transaction[],
  days = 7,
  now = new Date()
): PixCashflowPoint[] {
  const safeDays = Math.max(1, Math.min(31, Math.trunc(days)));
  const points = new Map<string, PixCashflowPoint>();

  for (let offset = safeDays - 1; offset >= 0; offset -= 1) {
    const day = new Date(now);
    day.setUTCDate(day.getUTCDate() - offset);
    const key = dateKey(day);
    points.set(key, {
      date: key,
      label: new Intl.DateTimeFormat("pt-BR", {
        timeZone: BRAZIL_TIMEZONE,
        day: "2-digit",
        month: "short"
      }).format(day).replace(".", ""),
      value: 0,
      count: 0
    });
  }

  for (const transaction of transactions) {
    if (!isConfirmedPix(transaction)) continue;
    const createdAt = new Date(transaction.createdAt);
    if (Number.isNaN(createdAt.getTime())) continue;
    const point = points.get(dateKey(createdAt));
    if (!point) continue;
    const amount = Number(transaction.amount);
    if (!Number.isFinite(amount) || amount < 0) continue;
    point.value += amount;
    point.count += 1;
  }

  return Array.from(points.values()).map((point) => ({
    ...point,
    value: Number(point.value.toFixed(2))
  }));
}

const STATUS_LABELS: Record<string, string> = {
  succeeded: "Confirmado",
  approved: "Confirmado",
  paid: "Confirmado",
  captured: "Confirmado",
  completed: "Concluído",
  pending: "Pendente",
  processing: "Em processamento",
  authorized: "Autorizado",
  failed: "Falhou",
  canceled: "Cancelado",
  cancelled: "Cancelado",
  reversed: "Estornado"
};

export function transactionStatusLabel(status: string): string {
  return STATUS_LABELS[status.toLowerCase()] ?? "Em análise";
}

export function transactionStatusTone(status: string): "success" | "warning" | "danger" | "info" {
  const normalized = status.toLowerCase();
  if (["succeeded", "approved", "paid", "captured", "completed"].includes(normalized)) return "success";
  if (["failed", "canceled", "cancelled", "reversed"].includes(normalized)) return "danger";
  if (["pending", "processing", "authorized"].includes(normalized)) return "warning";
  return "info";
}
