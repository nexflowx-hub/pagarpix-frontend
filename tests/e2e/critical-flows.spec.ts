import { expect, test } from "@playwright/test";
import { mockCoreUnavailable, mockDashboard } from "./fixtures";

test("links públicos e CTAs principais têm destinos funcionais", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Infraestrutura PIX para operações/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Criar conta/i }).first()).toHaveAttribute("href", "/signup");
  await expect(page.getByRole("link", { name: /Solicitar acesso/i }).first()).toHaveAttribute("href", "/request-access");
  await expect(page.getByRole("link", { name: /Explorar (a )?API/i }).first()).toHaveAttribute("href", "/docs");
  await page.getByRole("link", { name: /Criar conta/i }).first().click();
  await expect(page).toHaveURL(/\/signup$/);
  await expect(page.getByRole("heading", { name: /Comece a operar em BRL/i })).toBeVisible();
});

test("signup PagarPIX cria sessão e entra no dashboard", async ({ page }) => {
  await page.route("**/api/auth/register", (route) => route.fulfill({
    status: 201,
    contentType: "application/json",
    body: JSON.stringify({
      success: true,
      data: {
        account: { product: "pagarpix", activation: "awaiting_activation" },
        merchant: { id: "merchant-1", name: "Empresa Piloto", email: "pilot@example.com" },
        wallet: { id: "wallet-1", currency: "BRL" },
        store: { id: "store-1", name: "Loja Brasil", currency: "BRL", status: "draft" }
      }
    })
  }));

  await page.goto("/signup");
  await page.getByLabel("Nome do responsável").fill("Responsável Piloto");
  await page.getByLabel("Empresa / projeto").fill("Empresa Piloto");
  await page.getByLabel("Nome da primeira Store").fill("Loja Brasil");
  await page.getByLabel("E-mail empresarial").fill("pilot@example.com");
  await page.getByLabel("Senha", { exact: true }).fill("senha-forte-123");
  await page.getByLabel("Confirmar senha").fill("senha-forte-123");
  await page.getByRole("button", { name: /Criar conta PagarPIX/i }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
});

test("signup PagarPIX orienta conta existente para o login", async ({ page }) => {
  await page.route("**/api/auth/register", (route) => route.fulfill({
    status: 409,
    contentType: "application/json",
    body: JSON.stringify({
      success: false,
      error: {
        code: "ACCOUNT_EXISTS",
        message: "Já existe uma conta com este e-mail. Entre no PagarPIX com as credenciais existentes."
      }
    })
  }));

  await page.goto("/signup");
  await page.getByLabel("Nome do responsável").fill("Cliente Existente");
  await page.getByLabel("E-mail empresarial").fill("existing@example.com");
  await page.getByLabel("Senha", { exact: true }).fill("senha-forte-123");
  await page.getByLabel("Confirmar senha").fill("senha-forte-123");
  await page.getByRole("button", { name: /Criar conta PagarPIX/i }).click();
  await expect(page.locator(".form-error")).toContainText("Entre no PagarPIX com as credenciais existentes");
});

test("login exibe erro do Core e conclui o redirecionamento com resposta válida", async ({ page }) => {
  await page.route("**/api/auth/login", (route) => route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ success: false, error: { message: "Core temporariamente indisponível." } }) }));
  await page.goto("/login");
  await page.getByLabel("E-mail empresarial").fill("merchant@example.com");
  await page.getByLabel("Senha").fill("secret");
  await page.getByRole("button", { name: /Entrar no PagarPIX/i }).click();
  await expect(page.locator(".form-error")).toContainText("Core temporariamente indisponível");

  await page.unroute("**/api/auth/login");
  await page.route("**/api/auth/login", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, data: { merchant: { id: "merchant-1" } } }) }));
  await page.getByRole("button", { name: /Entrar no PagarPIX/i }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
});

test("dashboard signed-out não apresenta dados financeiros simulados", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Conecte-se ao XPayments Core." })).toBeVisible();
  await expect(page.getByText(/Nenhum dado financeiro é simulado/i)).toBeVisible();
});

test("dashboard distingue Core indisponível, dados completos e dados parciais", async ({ page }) => {
  await mockCoreUnavailable(page);
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Não foi possível validar os dados." })).toBeVisible();

  await page.unroute("**/api/core/**");
  await mockDashboard(page);
  await page.getByRole("button", { name: "Tentar novamente" }).click();
  await expect(page.getByText("Disponível para saque")).toBeVisible();
  await expect(page.getByText("R$ 5.000,00")).toBeVisible();
  await expect(page.getByText(/Nenhum saldo contábil foi usado como fallback/i)).toHaveCount(0);

  await page.unroute("**/api/core/**");
  await mockDashboard(page, "/api/core/treasury/overview");
  await page.reload();
  await expect(page.locator(".partial-data")).toContainText("Dados parciais");
  await expect(page.getByText("Indisponível", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/Nenhum saldo contábil foi usado como fallback/i)).toBeVisible();
});

test("cashflow mostra somente PIX confirmado e navegação mobile é funcional", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockDashboard(page);
  await page.goto("/dashboard/pix");
  await expect(page.getByText("BRL + succeeded + method pix")).toBeVisible();
  const mobileNav = page.getByRole("navigation", { name: "Navegação mobile" });
  await expect(mobileNav).toBeVisible();
  await mobileNav.getByRole("button", { name: /Mais/i }).click();
  const drawer = page.getByRole("dialog", { name: "Mais áreas" });
  await expect(drawer).toBeVisible();
  await expect(drawer.getByText("Em preparação").first()).toBeVisible();
  const operations = page.getByRole("navigation", { name: "Operações rápidas" });
  await expect(operations.getByRole("link", { name: "Solicitar saída" })).toBeVisible();
  await expect(operations.getByRole("link", { name: "Smart Routing" })).toBeVisible();
});

test("logout termina a sessão e volta ao login", async ({ page }) => {
  await mockDashboard(page);
  await page.route("**/api/auth/logout", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) }));
  await page.goto("/dashboard");
  await page.getByRole("button", { name: /Sair/i }).click();
  await expect(page).toHaveURL(/\/login$/);
});
