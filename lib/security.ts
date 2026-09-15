import type { NextRequest } from "next/server";

export function hasTrustedOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const source = new URL(origin);
    const forwardedHost = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    const requestHost = forwardedHost?.split(",")[0].trim().toLowerCase();
    return source.host.toLowerCase() === requestHost;
  } catch {
    return false;
  }
}
