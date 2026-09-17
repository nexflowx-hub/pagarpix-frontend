import { NextRequest, NextResponse } from "next/server";
import { CORE_API_URL, SESSION_COOKIE, isAllowedCorePath } from "@/lib/core";

type Context = { params: Promise<{ path: string[] }> };
type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function onlyBrl(items: unknown[]) {
  return items.filter((item) =>
    isRecord(item) && String(item.currency ?? "").toUpperCase() === "BRL"
  );
}

function brlScopedPayload(path: string, payload: unknown) {
  if (!isRecord(payload)) return payload;
  const data = payload.data;

  if ((path === "merchant/stores" || path === "wallets") && Array.isArray(data)) {
    return { ...payload, data: onlyBrl(data) };
  }

  if (path === "merchant/profile" && isRecord(data)) {
    return {
      ...payload,
      data: {
        ...data,
        ...(Array.isArray(data.stores) ? { stores: onlyBrl(data.stores) } : {}),
        ...(Array.isArray(data.wallets) ? { wallets: onlyBrl(data.wallets) } : {})
      }
    };
  }

  return payload;
}

export async function GET(request: NextRequest, context: Context) {
  const { path: segments } = await context.params;
  const path = segments.join("/");
  if (!isAllowedCorePath(path)) {
    return NextResponse.json(
      { success: false, error: { code: "PATH_NOT_ALLOWED", message: "Recurso não permitido." } },
      { status: 403 }
    );
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Sessão necessária." } },
      { status: 401 }
    );
  }

  const url = new URL(`${CORE_API_URL}/${path}`);
  request.nextUrl.searchParams.forEach((value, key) => url.searchParams.append(key, value));

  const upstream = await fetch(url, {
    headers: { authorization: `Bearer ${token}`, accept: "application/json" },
    cache: "no-store"
  }).catch(() => null);

  if (!upstream) {
    return NextResponse.json(
      { success: false, error: { code: "CORE_UNAVAILABLE", message: "Core temporariamente indisponível." } },
      { status: 503 }
    );
  }

  const rawPayload = await upstream.json().catch(() => ({
    success: false,
    error: { code: "INVALID_CORE_RESPONSE", message: "Resposta inválida do Core." }
  }));
  const payload = upstream.ok ? brlScopedPayload(path, rawPayload) : rawPayload;

  return NextResponse.json(payload, {
    status: upstream.status,
    headers: { "Cache-Control": "no-store, max-age=0", "CDN-Cache-Control": "no-store" }
  });
}
