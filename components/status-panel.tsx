"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/icons";
import { StatusBadge } from "@/components/ui/primitives";
import type { PlatformStatusResponse } from "@/lib/types";

type StatusState = "loading" | "ready" | "error";

export function StatusPanel() {
  const [state, setState] = useState<StatusState>("loading");
  const [result, setResult] = useState<PlatformStatusResponse["data"] | null>(null);

  const check = useCallback(async () => {
    setState("loading");
    const response = await fetch("/api/status", { cache: "no-store" }).catch(() => null);
    const payload = await response?.json().catch(() => null) as PlatformStatusResponse | null;
    if (!response?.ok || !payload?.success || !Array.isArray(payload.data?.components)) {
      setState("error");
      return;
    }
    setResult(payload.data);
    setState("ready");
  }, []);

  useEffect(() => { void check(); }, [check]);

  if (state === "loading") {
    return <div className="status-loading" role="status"><span className="status-spinner" /> Verificando os componentes em tempo real…</div>;
  }
  if (state === "error" || !result) {
    return <div className="status-error"><Icon name="shield" /><div><strong>Verificação indisponível</strong><p>Não foi possível consultar os componentes agora. Nenhum estado operacional será presumido.</p></div><button onClick={check} type="button">Tentar novamente</button></div>;
  }

  const unavailable = result.components.some((component) => component.status === "unavailable");
  const degraded = result.components.some((component) => component.status === "degraded");
  return (
    <div className="status-console">
      <header><div><span className={`status-orb ${unavailable ? "is-danger" : degraded ? "is-warning" : ""}`}><Icon name="check" /></span><div><strong>{unavailable ? "Há componentes indisponíveis" : degraded ? "Operação com degradação" : "Componentes verificados"}</strong><p>Resultado de verificações HTTP executadas agora, sem estado presumido.</p></div></div><button onClick={check} type="button">Verificar novamente</button></header>
      <div className="status-list">
        {result.components.map((component) => <article key={component.id}><span className="status-component-icon"><Icon name={component.id === "core" ? "routing" : component.id === "checkout" ? "pix" : component.id === "docs" ? "code" : "check"} /></span><div><strong>{component.name}</strong><p>{component.detail}</p></div><small>{component.latencyMs === null ? "Sem resposta" : `${component.latencyMs} ms`}</small><StatusBadge tone={component.status === "available" ? "success" : component.status === "degraded" ? "warning" : "danger"}>{component.status === "available" ? "Disponível" : component.status === "degraded" ? "Degradado" : "Indisponível"}</StatusBadge></article>)}
      </div>
      <footer>Última verificação: {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "medium" }).format(new Date(result.checkedAt))}</footer>
    </div>
  );
}
