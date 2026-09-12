import { NextRequest, NextResponse } from "next/server";
import { CORE_API_URL, SESSION_COOKIE } from "@/lib/core";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.email || !body?.password) {
    return NextResponse.json(
      { success: false, error: { code: "INVALID_CREDENTIALS", message: "Informe e-mail e senha." } },
      { status: 400 }
    );
  }

  const upstream = await fetch(`${CORE_API_URL}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ email: body.email, password: body.password }),
    cache: "no-store"
  }).catch(() => null);

  if (!upstream) {
    return NextResponse.json(
      { success: false, error: { code: "CORE_UNAVAILABLE", message: "Core temporariamente indisponível." } },
      { status: 503 }
    );
  }

  const payload = await upstream.json().catch(() => null);
  const token = payload?.data?.token;
  if (!upstream.ok || !token) {
    return NextResponse.json(
      payload ?? { success: false, error: { message: "Credenciais inválidas." } },
      { status: upstream.status }
    );
  }

  const response = NextResponse.json({
    success: true,
    data: { merchant: payload.data.merchant }
  });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12
  });
  return response;
}
