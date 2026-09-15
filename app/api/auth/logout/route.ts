import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/core";
import { hasTrustedOrigin } from "@/lib/security";

export async function POST(request: NextRequest) {
  if (!hasTrustedOrigin(request)) {
    return NextResponse.json({ success: false, error: { code: "INVALID_ORIGIN", message: "Origem não permitida." } }, { status: 403 });
  }
  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}
