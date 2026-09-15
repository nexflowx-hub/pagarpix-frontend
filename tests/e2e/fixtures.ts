import type { Page, Route } from "@playwright/test";

const transaction = {
  id: "11111111-1111-4111-8111-111111111111",
  reference: "PIX-DEMO-001",
  amount: 499.9,
  currency: "BRL",
  status: "succeeded",
  method: "pix",
  storeId: "store-1",
  createdAt: new Date().toISOString(),
};

const responses: Record<string, unknown> = {
  "/api/core/wallets": { success: true, data: { wallets: [{ id: "ledger", currency: "BRL", label: "Contábil", balance: 8000, available: 7000, reserved: 1000 }] } },
  "/api/core/merchant/stores": { success: true, data: [{ id: "store-1", name: "Store Centro", storeCode: "CTR-01", status: "active", currency: "BRL", domain: null }] },
  "/api/core/treasury/overview": { success: true, data: { physicalWallets: [{ id: "physical", code: "WALLET-BRL", label: "Wallet BRL", currency: "BRL", role: "BANK_SETTLEMENT", status: "active", balance: 5200, available: 5000, reserved: 200, physical: true, updatedAt: new Date().toISOString() }], accountingByCurrency: [{ currency: "BRL", balance: 8000, available: 7000, reserved: 1000, reconciliationHold: 0 }], generatedAt: new Date().toISOString() } },
  "/api/core/finance/overview": { success: true, data: { currency: "BRL", timezone: "America/Sao_Paulo", wallet: { id: "ledger", balance: 8000, pending: 1500, available: 7000, reserved: 1000 }, payouts: { scheduled: 0, scheduledCount: 0, paid: 0, paidCount: 0 }, projectedAvailable: 8500, nextRelease: { date: "2026-09-16", amount: 1500, movementCount: 3, status: "expected" }, generatedAt: new Date().toISOString() } },
  "/api/core/finance/stores": { success: true, data: { currency: "BRL", generatedAt: new Date().toISOString(), stores: [{ storeId: "store-1", storeCode: "CTR-01", storeName: "Store Centro", status: "active", currency: "BRL", transactions: 3, gross: 1600, fees: 100, net: 1500, pending: 1500, released: 0, paidPayouts: 0, scheduledPayouts: 0, operationalBalance: 1500, availableAfterPayouts: 1500 }] } },
  "/api/core/finance/releases": { success: true, data: { currency: "BRL", timezone: "America/Sao_Paulo", generatedAt: new Date().toISOString(), items: [{ date: "2026-09-16", storeId: "store-1", storeCode: "CTR-01", storeName: "Store Centro", gross: 1600, fees: 100, net: 1500, movementCount: 3, status: "expected" }], summary: { totalNet: 1500, movementCount: 3, overdueNet: 0 } } },
};

function keyFor(route: Route) {
  const url = new URL(route.request().url());
  return url.pathname;
}

export async function mockDashboard(page: Page, partialPath?: string) {
  await page.route("**/api/core/**", async (route) => {
    const path = keyFor(route);
    if (partialPath === path) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, data: { incompatible: true } }) });
      return;
    }
    const body = path === "/api/core/transactions"
      ? { success: true, data: { data: [transaction], meta: { page: 1, limit: 100, total: 1 } } }
      : responses[path];
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body ?? { success: false }) });
  });
}

export async function mockCoreUnavailable(page: Page) {
  await page.route("**/api/core/**", (route) => route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ success: false, error: { code: "CORE_UNAVAILABLE" } }) }));
}
