import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { CORE_API_URL, SESSION_COOKIE } from "@/lib/core";
import { getWithdrawableBrl } from "@/lib/finance";
import { hasTrustedOrigin } from "@/lib/security";
import { parseTreasuryOverview } from "@/lib/validation";

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function ticketId() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `PP-OUT-${date}-${randomBytes(4).toString("hex").toUpperCase()}`;
}

function cleanText(value: unknown, max = 500) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

async function notifyDiscord(message: string) {
  const url = process.env.PAGARPIX_DISCORD_PAYOUT_WEBHOOK_URL?.trim();
  if (!url) return { configured: false, sent: false };
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ content: message.slice(0, 1900), allowed_mentions: { parse: [] } }),
    cache: "no-store"
  }).catch(() => null);
  return { configured: true, sent: Boolean(response?.ok) };
}

async function notifyTelegram(message: string) {
  const token = process.env.PAGARPIX_TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.PAGARPIX_TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatId) return { configured: false, sent: false };
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: message.slice(0, 3900), disable_web_page_preview: true }),
    cache: "no-store"
  }).catch(() => null);
  return { configured: true, sent: Boolean(response?.ok) };
}

export async function POST(request: NextRequest) {
  if (!hasTrustedOrigin(request)) {
    return NextResponse.json({ success: false, error: { code: "INVALID_ORIGIN", message: "Origem não permitida." } }, { status: 403 });
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Sessão necessária." } }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const amount = Number(body?.amount);
  const storeId = cleanText(body?.storeId, 64);
  const pixKey = cleanText(body?.pixKey, 140);
  const holderName = cleanText(body?.holderName, 120);
  const notes = cleanText(body?.notes, 500);

  if (!Number.isFinite(amount) || amount <= 0 || amount > 10_000_000) {
    return NextResponse.json({ success: false, error: { code: "INVALID_AMOUNT", message: "Informe um valor de saída válido." } }, { status: 400 });
  }
  if (!/^[0-9a-f-]{36}$/i.test(storeId)) {
    return NextResponse.json({ success: false, error: { code: "INVALID_STORE", message: "Selecione uma Store BRL válida." } }, { status: 400 });
  }
  if (pixKey.length < 3 || holderName.length < 2) {
    return NextResponse.json({ success: false, error: { code: "INVALID_DESTINATION", message: "Informe titular e chave PIX de destino." } }, { status: 400 });
  }

  const headers = { authorization: `Bearer ${token}`, accept: "application/json" };
  const [profileResponse, storesResponse, treasuryResponse] = await Promise.all([
    fetch(`${CORE_API_URL}/merchant/profile`, { headers, cache: "no-store" }).catch(() => null),
    fetch(`${CORE_API_URL}/merchant/stores`, { headers, cache: "no-store" }).catch(() => null),
    fetch(`${CORE_API_URL}/treasury/overview`, { headers, cache: "no-store" }).catch(() => null)
  ]);

  if (!profileResponse || !storesResponse || !treasuryResponse) {
    return NextResponse.json({ success: false, error: { code: "CORE_UNAVAILABLE", message: "Não foi possível validar a conta agora." } }, { status: 503 });
  }
  if ([profileResponse.status, storesResponse.status, treasuryResponse.status].includes(401)) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Sessão expirada." } }, { status: 401 });
  }
  if (!profileResponse.ok || !storesResponse.ok || !treasuryResponse.ok) {
    return NextResponse.json({ success: false, error: { code: "CORE_VALIDATION_FAILED", message: "O Core não confirmou os dados necessários para a solicitação." } }, { status: 409 });
  }

  const [profilePayload, storesPayload, treasuryPayload] = await Promise.all([
    profileResponse.json().catch(() => null), storesResponse.json().catch(() => null), treasuryResponse.json().catch(() => null)
  ]);

  const stores = Array.isArray(storesPayload?.data) ? storesPayload.data : [];
  const store = stores.find((item: unknown) => isRecord(item) && String(item.id ?? "") === storeId && String(item.currency ?? "").toUpperCase() === "BRL");
  if (!store || !isRecord(store)) {
    return NextResponse.json({ success: false, error: { code: "STORE_NOT_AVAILABLE", message: "A Store selecionada não pertence à conta BRL." } }, { status: 409 });
  }

  const treasury = parseTreasuryOverview(treasuryPayload);
  const withdrawable = getWithdrawableBrl(treasury);
  if (withdrawable === null) {
    return NextResponse.json({ success: false, error: { code: "PHYSICAL_WALLET_UNAVAILABLE", message: "A Wallet física BRL ainda não está disponível para saída." } }, { status: 409 });
  }
  if (amount > withdrawable + 0.001) {
    return NextResponse.json({ success: false, error: { code: "INSUFFICIENT_PHYSICAL_BALANCE", message: "O valor solicitado excede o saldo físico disponível." }, data: { available: withdrawable } }, { status: 409 });
  }

  const profile = isRecord(profilePayload?.data) ? profilePayload.data : {};
  const id = ticketId();
  const merchantName = cleanText(profile.name ?? profile.companyName ?? "Merchant PagarPIX", 160);
  const merchantEmail = cleanText(profile.email ?? "", 254);
  const storeName = cleanText(store.name ?? store.storeName ?? "Store BRL", 160);
  const storeCode = cleanText(store.storeCode ?? store.code ?? "", 80);
  const createdAt = new Date().toISOString();
  const formattedAmount = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount);
  const formattedAvailable = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(withdrawable);

  const message = [
    "💸 PAGARPIX — PEDIDO MANUAL DE SAÍDA",
    `Ticket: ${id}`,
    `Merchant: ${merchantName || "—"}${merchantEmail ? ` <${merchantEmail}>` : ""}`,
    `Store: ${storeName}${storeCode ? ` (${storeCode})` : ""}`,
    `Valor solicitado: ${formattedAmount}`,
    `Saldo físico validado: ${formattedAvailable}`,
    `Titular destino: ${holderName}`,
    `Chave PIX: ${pixKey}`,
    notes ? `Observações: ${notes}` : "Observações: —",
    `Criado em: ${createdAt}`,
    "",
    "⚠️ Ticket operacional: nenhum fundo foi movimentado automaticamente. Exige revisão e execução manual."
  ].join("\n");

  const [discord, telegram] = await Promise.all([notifyDiscord(message), notifyTelegram(message)]);
  const configured = discord.configured || telegram.configured;
  const sent = discord.sent || telegram.sent;

  if (!configured) {
    return NextResponse.json({ success: false, error: { code: "TICKET_CHANNEL_NOT_CONFIGURED", message: "Os canais operacionais ainda não estão configurados." } }, { status: 503 });
  }
  if (!sent) {
    return NextResponse.json({ success: false, error: { code: "TICKET_DELIVERY_FAILED", message: "Não foi possível entregar o ticket aos canais operacionais." } }, { status: 502 });
  }

  return NextResponse.json({
    success: true,
    data: {
      ticketId: id,
      status: "awaiting_manual_review",
      amount,
      currency: "BRL",
      storeId,
      createdAt,
      channels: { discord: discord.sent, telegram: telegram.sent },
      automaticTransferExecuted: false
    }
  }, { status: 201, headers: { "Cache-Control": "no-store, max-age=0" } });
}
