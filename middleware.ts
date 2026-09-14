import { type NextRequest, NextResponse } from "next/server";

const APP_HOSTS = new Set(["app.pagarpix.org", "www.app.pagarpix.org"]);

export function middleware(request: NextRequest) {
  const hostname = (request.headers.get("host") ?? "").split(":")[0].toLowerCase();

  if (APP_HOSTS.has(hostname) && request.nextUrl.pathname === "/") {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    return NextResponse.rewrite(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon.svg|manifest.webmanifest).*)"]
};
