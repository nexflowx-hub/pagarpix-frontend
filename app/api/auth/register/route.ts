import { NextRequest, NextResponse } from "next/server";
import { CORE_API_URL, SESSION_COOKIE } from "@/lib/core";
import { hasTrustedOrigin } from "@/lib/security";

export async function POST(request: NextRequest) {
  if (!hasTrustedOrigin(request)) {
    return NextResponse.json(
      { success: false, error: { code: "INVALID_ORIGIN", message: "Origem não permitida." } },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const companyName = typeof body?.companyName === "string" ? body.companyName.trim() : "";
  const storeName = typeof body?.storeName === "string" ? body.storeName.trim() : "";

  if (!email || !name || password.length < 10 || email.length > 254 || password.length > 256) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_REGISTRATION",
          message: "Informe nome, e-mail válido e uma senha com pelo menos 10 caracteres."
        }
      },
      { status: 400 }
    );
  }

  const upstream = await fetch(`${CORE_API_URL}/auth/pagarpix/register`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ email, password, name, companyName, storeName }),
    cache: "no-store"
  }).catch(() => null);

  if (!upstream) {
    return NextResponse.json(
      { success: false, error: { code: "CORE_UNAVAILABLE", message: "Serviço temporariamente indisponível." } },
      { status: 503 }
    );
  }

  const payload = await upstream.json().catch(() => null);
  const token = payload?.data?.token;

  if (!upstream.ok || !token) {
    return NextResponse.json(
      payload ?? { success: false, error: { code: "REGISTRATION_FAILED", message: "Não foi possível criar a conta." } },
      { status: upstream.status }
    );
  }

  const response = NextResponse.json({
    success: true,
    data: {
      account: payload.data.account,
      merchant: payload.data.merchant,
      wallet: payload.data.wallet,
      store: payload.data.store
    }
  }, { status: 201 });

  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
    priority: "high"
  });
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}
