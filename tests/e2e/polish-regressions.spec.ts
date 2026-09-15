import { expect, test } from "@playwright/test";
import { mockDashboard } from "./fixtures";

const landingWidths = [1024, 1440];

for (const width of landingWidths) {
  test(`landing mantém cards e CTAs legíveis em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");

    const cards = page.locator(".platform-grid article");
    await expect(cards).toHaveCount(4);

    for (let index = 0; index < 4; index += 1) {
      const card = cards.nth(index);
      const paragraph = card.locator("p");
      const cta = card.locator("a");
      const paragraphBox = await paragraph.boundingBox();
      const ctaBox = await cta.boundingBox();

      expect(paragraphBox).not.toBeNull();
      expect(ctaBox).not.toBeNull();
      expect(
        ctaBox!.y - (paragraphBox!.y + paragraphBox!.height),
        `CTA do card ${index + 1} não deve colidir com a descrição`
      ).toBeGreaterThanOrEqual(8);
    }

    for (const selector of [".scene-wallet", ".route-card"]) {
      const box = await page.locator(selector).boundingBox();
      expect(box, `${selector} deve estar renderizado`).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width, `${selector} deve permanecer dentro do viewport`).toBeLessThanOrEqual(width + 8);
    }
  });
}

test("hero preserva janela inicial de render antes de iniciar motion decorativo", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const hero = page.locator(".v2-hero");
  await expect(hero).toBeVisible();
  await expect(hero).not.toHaveClass(/is-playing/);
  await expect(hero).toHaveClass(/is-playing/, { timeout: 1800 });
});

test("prefers-reduced-motion mantém narrativa animada pausada", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const hero = page.locator(".v2-hero");
  await expect(hero).toBeVisible();
  await page.waitForTimeout(1100);
  await expect(hero).not.toHaveClass(/is-playing/);
});

test("topbar mobile mantém busca dentro do próprio campo", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockDashboard(page);
  await page.goto("/dashboard");

  const brandMark = page.locator(".mobile-app-brand .brand-mark");
  const search = page.locator(".app-search");
  const userMenu = page.locator(".user-menu");

  await expect(brandMark).toBeVisible();
  await expect(search).toBeVisible();
  await expect(userMenu).toBeHidden();

  const brandBox = await brandMark.boundingBox();
  const searchBox = await search.boundingBox();
  expect(brandBox).not.toBeNull();
  expect(searchBox).not.toBeNull();
  expect(searchBox!.x).toBeGreaterThanOrEqual(brandBox!.x + brandBox!.width + 8);
  expect(searchBox!.width).toBeGreaterThan(240);

  const positioning = await search.evaluate((element) => ({
    position: getComputedStyle(element).position,
    pseudoLeft: getComputedStyle(element, "::after").left
  }));
  expect(positioning.position).toBe("relative");
  expect(positioning.pseudoLeft).toBe("42px");
});
