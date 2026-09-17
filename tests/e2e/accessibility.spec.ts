import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { mockDashboard } from "./fixtures";

for (const path of ["/", "/pricing", "/docs", "/contact", "/request-access", "/login", "/signup"]) {
  test(`${path} sem violações críticas ou sérias de acessibilidade`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((violation) => ["critical", "serious"].includes(violation.impact ?? ""))).toEqual([]);
  });
}

test("dashboard autenticado sem violações críticas ou sérias", async ({ page }) => {
  await mockDashboard(page);
  await page.goto("/dashboard");
  await expect(page.getByText("Disponível para saque")).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ["critical", "serious"].includes(violation.impact ?? ""))).toEqual([]);
});
