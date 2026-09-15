import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { POST as login } from "@/app/api/auth/login/route";
import { POST as logout } from "@/app/api/auth/logout/route";

function request(path: string, body?: unknown, origin = "http://localhost:3000") {
  return new NextRequest(`http://localhost:3000${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", host: "localhost:3000", origin },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

afterEach(() => vi.unstubAllGlobals());

describe("sessão BFF", () => {
  it("normaliza o e-mail e guarda apenas o token em cookie HttpOnly", async () => {
    const upstream = vi.fn(async (_url: string, init?: RequestInit) => {
      expect(JSON.parse(String(init?.body))).toEqual({ email: "merchant@example.com", password: "secret" });
      return new Response(JSON.stringify({
        success: true,
        data: { token: "server-only-token", merchant: { id: "merchant-1", name: "Merchant" } },
      }), { status: 200, headers: { "content-type": "application/json" } });
    });
    vi.stubGlobal("fetch", upstream);

    const response = await login(request("/api/auth/login", {
      email: " Merchant@Example.COM ",
      password: "secret",
    }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data.token).toBeUndefined();
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
    expect(response.headers.get("set-cookie")).toContain("pagarpix_session=server-only-token");
    expect(response.headers.get("cache-control")).toContain("no-store");
  });

  it("expõe estado de Core indisponível sem criar sessão", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const response = await login(request("/api/auth/login", { email: "merchant@example.com", password: "secret" }));
    expect(response.status).toBe(503);
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("recusa login cross-site e limpa a sessão no logout", async () => {
    const rejected = await login(request("/api/auth/login", { email: "merchant@example.com", password: "secret" }, "https://evil.example"));
    expect(rejected.status).toBe(403);

    const response = await logout(request("/api/auth/logout"));
    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toContain("pagarpix_session=");
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
  });
});
