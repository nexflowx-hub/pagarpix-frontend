import { NextResponse } from "next/server";
import type { PlatformStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

async function probe(id: PlatformStatus["id"], name: string, url: string): Promise<PlatformStatus> {
  const startedAt = Date.now();
  try {
    const response = await fetch(url, {
      cache: "no-store",
      redirect: "follow",
      signal: AbortSignal.timeout(6500),
      headers: { accept: "text/html,application/json" }
    });
    const latencyMs = Date.now() - startedAt;
    if (response.ok) return { id, name, status: latencyMs > 3000 ? "degraded" : "available", latencyMs, detail: latencyMs > 3000 ? "Resposta válida, acima do tempo esperado." : "Resposta HTTP válida recebida." };
    return { id, name, status: response.status >= 500 ? "unavailable" : "degraded", latencyMs, detail: `Resposta HTTP ${response.status}.` };
  } catch {
    return { id, name, status: "unavailable", latencyMs: null, detail: "Sem resposta dentro do limite de verificação." };
  }
}

export async function GET() {
  const startedAt = Date.now();
  const external = await Promise.all([
    probe("core", "XPayments Core API", "https://api.xpayments.digital/api/health"),
    probe("checkout", "Checkout XPayments", "https://checkout.xpayments.digital"),
    probe("docs", "Documentação XPayments", "https://docs.xpayments.digital")
  ]);
  const components: PlatformStatus[] = [
    { id: "web", name: "PagarPIX Web", status: "available", latencyMs: Date.now() - startedAt, detail: "A verificação do frontend respondeu corretamente." },
    ...external
  ];
  return NextResponse.json({ success: true, data: { checkedAt: new Date().toISOString(), components } }, {
    headers: { "Cache-Control": "no-store, max-age=0", "CDN-Cache-Control": "no-store" }
  });
}
