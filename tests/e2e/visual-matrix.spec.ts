import { expect, test } from "@playwright/test";
import { mockDashboard } from "./fixtures";

const viewports = [
  { name: "desktop-1440", width: 1440, height: 1000 },
  { name: "tablet-1024", width: 1024, height: 900 },
  { name: "tablet-768", width: 768, height: 900 },
  { name: "mobile-390", width: 390, height: 844 },
];

for (const viewport of viewports) {
  test(`captura visual landing e dashboard em ${viewport.name}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/");
    await expect(page.locator("main")).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath(`after-landing-${viewport.name}.png`), fullPage: true });

    await mockDashboard(page);
    await page.goto("/dashboard");
    await expect(page.getByText("Disponível para saque")).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath(`after-dashboard-${viewport.name}.png`), fullPage: true });
  });
}
