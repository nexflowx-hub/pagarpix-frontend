import { describe, expect, it } from "vitest";
import { parseTransactions, parseTreasuryOverview, parseWallets } from "@/lib/validation";

describe("validação runtime do Core", () => {
  it("aceita o envelope paginado real de transações", () => {
    const result = parseTransactions({
      success: true,
      data: {
        data: [{
          id: "tx-1",
          reference: "PIX-100",
          amount: "99.90",
          currency: "BRL",
          status: "succeeded",
          method: "pix",
          storeId: null,
          createdAt: "2026-09-15T10:00:00.000Z",
        }],
        meta: { page: 1, limit: 50 },
      },
    });

    expect(result).toHaveLength(1);
    expect(result?.[0].amount).toBe(99.9);
  });

  it("rejeita envelopes e linhas incompatíveis sem inventar campos", () => {
    expect(parseTransactions({ success: false, data: [] })).toBeNull();
    expect(parseWallets({ success: true, data: { wallets: [{ currency: "BRL" }] } })).toEqual([]);
  });

  it("mantém apenas Wallets explicitamente físicas", () => {
    const result = parseTreasuryOverview({
      success: true,
      data: {
        physicalWallets: [
          {
            id: "physical",
            code: "WALLET-BRL",
            label: "Wallet BRL",
            currency: "BRL",
            role: "BANK_SETTLEMENT",
            status: "active",
            balance: 10,
            available: 8,
            reserved: 2,
            physical: true,
          },
          {
            id: "accounting",
            code: "WALLET-BRL",
            label: "Ledger BRL",
            currency: "BRL",
            role: "BANK_SETTLEMENT",
            status: "active",
            balance: 999,
            available: 999,
            reserved: 0,
            physical: false,
          },
        ],
        accountingByCurrency: [],
      },
    });

    expect(result?.physicalWallets?.map((wallet) => wallet.id)).toEqual(["physical"]);
  });
});
