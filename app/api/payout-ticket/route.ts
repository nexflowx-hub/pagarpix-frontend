import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { CORE_API_URL, SESSION_COOKIE } from "@/lib/core";

type JsonRecord = Record<string, unknown>;

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === request.nextUrl.host;
  } catch {
    return false;
  }
}

function moneyBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function ticketId() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `PP-${date}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

async function merchantContext(token: string) {
  const response = await fetch(`${CORE_API_URL}/merchant/profile`, {
    headers: { authorization: `Bearer ${token}`, accept: "application/json" },
    cache: "no-store"
  }).catch(() => null);
  if (!response?.ok) return null;
  const payload = (await response.json().catch(() => null)) as JsonRecord | null;
  return payload && typeof payload.data === "object" && payload.data ? payload.data as JsonRecord : null;
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ success: false, error: { code: "INVALID_ORIGIN", message: "Origem inválida." } }, { status: 403 });
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Sessão necessária." } }, { status: 401 });
  }

  const body = await request.json().catch(() => null) as JsonRecord | null;
  const amount = Number(body?.amount ?? 0);
  const pixKey = text(body?.pixKey, 180);
  const holder = text(body?.holder, 160);
  const taxId = text(body?.taxId, 32);
  const notes = text(body?.notes, 800);

  if (!Number.isFinite(amount) || amount <= 0 || amount > 100000000) {
    return NextResponse.json({ success: false, error: { code: "INVALID_AMOUNT", message: "Informe um valor válido." } }, { status: 400 });
  }
  if (pixKey.length < 3) {
    return NextResponse.json({ success: false, error: { code: "INVALID_PIX_KEY", message: "Informe a chave PIX de destino." } }, { status: 400 });
  }
  if (holder.length < 2) {
    return NextResponse.json({ success: false, error: { code: "INVALID_HOLDER", message: "Informe o titular do destino." } }, { status: 400 });
  }

  const merchant = await merchantContext(token);
  const id = ticketId();
  const merchantName = text(merchant?.name ?? merchant?.companyName, 160) || "Merchant autenticado";
  const merchantId = text(merchant?.id, 80) || "não informado";
  const createdAt = new Date().toISOString();
  const message = [
    "💸 PagarPIX — Solicitação manual de saída",
    `Ticket: ${id}`,
    `Merchant: ${merchantName}`,
    `Merchant ID: ${merchantId}`,
    `Valor: ${moneyBRL(amount)}`,
    `Titular: ${holder}`,
    `Chave PIX: ${pixKey}`,
    taxId ? `CPF/CNPJ: ${taxId}` : null,
    notes ? `Observações: ${notes}` : null,
    `Criado em: ${createdAt}`,
    "Status inicial: AGUARDANDO ANÁLISE MANUAL",
    "Nenhuma transferência foi executada automaticamente."
  ].filter(Boolean).join("\n");

  const deliveries: string[] = [];
  const errors: string[] = [];
  const discordWebhook = process.env.DISCORD_PAYOUT_WEBHOOK_URL?.trim();
  const telegramToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const telegramChatId = process.env.TELEGRAM_CHAT_ID?.trim();

  if (discordWebhook) {
    const response = await fetch(discordWebhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ content: message.slice(0, 1900), allowed_mentions: { parse: [] } }),
      cache: "no-store"
    }).catch(() => null);
    if (response?.ok) deliveries.push("discord"); else errors.push("discord");
  }

  if (telegramToken && telegramChatId) {
    const response = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: telegramChatId, text: message, disable_web_page_preview: true }),
      cache: "no-store"
    }).catch(() => null);
    if (response?.ok) deliveries.push("telegram"); else errors.push("telegram");
  }

  if (!deliveries.length) {
    return NextResponse.json({
      success: false,
      error: {
        code: "PAYOUT_CHANNEL_UNAVAILABLE",
        message: "Canal operacional de saída ainda não configurado."
      }
    }, { status: 503 });
  }

  return NextResponse.json({
    success: true,
    data: {
      ticketId: id,
      status: "awaiting_manual_review",
      amount,
      currency: "BRL",
      deliveredTo: deliveries,
      partialDelivery: errors.length > 0,
      createdAt
    }
  }, { status: 202, headers: { "Cache-Control": "no-store" } });
}
