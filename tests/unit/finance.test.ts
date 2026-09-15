import { describe, expect, it } from "vitest";
import {
  aggregatePixCashflow,
  getPhysicalBrlWallet,
  getWithdrawableBrl,
  isConfirmedPix,
  transactionStatusLabel,
} from "@/lib/finance";
import type { Transaction, TreasuryOverview } from "@/lib/types";

const treasury: TreasuryOverview = {
  physicalWallets: [
    {
      id: "wallet-usd",
      code: "WALLET-USD",
      label: "USD",
      currency: "USD",
      role: "BANK_SETTLEMENT",
      status: "active",
      balance: 999,
      available: 900,
      reserved: 99,
      physical: true,
    },
    {
      id: "wallet-brl",
      code: "WALLET-BRL",
      label: "Conta de liquidação BRL",
      currency: "BRL",
      role: "BANK_SETTLEMENT",
      status: "active",
      balance: 1200,
      available: 1000,
      reserved: 200,
      physical: true,
    },
  ],
  accountingByCurrency: [
    { currency: "BRL", balance: 9000, available: 8000, reserved: 1000, reconciliationHold: 0 },
  ],
};

function transaction(overrides: Partial<Transaction>): Transaction {
  return {
    id: crypto.randomUUID(),
    reference: "PIX-001",
    amount: 125.5,
    currency: "BRL",
    status: "succeeded",
    method: "pix",
    storeId: null,
    createdAt: "2026-09-14T15:00:00.000Z",
    ...overrides,
  };
}

describe("semântica financeira da Wallet BRL", () => {
  it("usa apenas a Wallet física BRL de liquidação para saque", () => {
    expect(getPhysicalBrlWallet(treasury)?.id).toBe("wallet-brl");
    expect(getWithdrawableBrl(treasury)).toBe(1000);
  });

  it("não usa o saldo contábil como fallback", () => {
    const withoutPhysical = { ...treasury, physicalWallets: [] };
    expect(getWithdrawableBrl(withoutPhysical)).toBeNull();
  });

  it("rejeita Wallet física inativa como saldo movimentável", () => {
    const inactive = {
      ...treasury,
      physicalWallets: treasury.physicalWallets!.map((wallet) => ({ ...wallet, status: "inactive" })),
    };
    expect(getWithdrawableBrl(inactive)).toBeNull();
  });
});

describe("cashflow PIX", () => {
  it("aceita apenas BRL + succeeded + pix", () => {
    expect(isConfirmedPix(transaction({}))).toBe(true);
    expect(isConfirmedPix(transaction({ currency: "USD" }))).toBe(false);
    expect(isConfirmedPix(transaction({ status: "pending" }))).toBe(false);
    expect(isConfirmedPix(transaction({ method: "card" }))).toBe(false);
  });

  it("agrega por dia e ignora transações fora do contrato", () => {
    const result = aggregatePixCashflow([
      transaction({ amount: 100 }),
      transaction({ amount: 25 }),
      transaction({ amount: 800, status: "pending" }),
      transaction({ amount: 900, method: "card" }),
    ], 7, new Date("2026-09-15T12:00:00.000Z"));

    expect(result).toHaveLength(7);
    expect(result.reduce((sum, point) => sum + point.value, 0)).toBe(125);
    expect(result.reduce((sum, point) => sum + point.count, 0)).toBe(2);
  });
});

it("localiza statuses sem alterar o valor canônico", () => {
  expect(transactionStatusLabel("succeeded")).toBe("Confirmado");
  expect(transactionStatusLabel("pending")).toBe("Pendente");
  expect(transactionStatusLabel("unknown_core_value")).toBe("Em análise");
});
