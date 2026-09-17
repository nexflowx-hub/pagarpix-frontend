"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "./routing.module.css";

type Connection = {
  id: string;
  storeId: string;
  alias: string;
  provider: string;
  environment: string;
  mode: string;
  status: string;
  shadowMode: boolean;
  ledgerEnabled: boolean;
  health?: { status?: string; latencyMs?: number | null; successRate?: number | null; observedAt?: string | null };
};

type Policy = {
  id: string;
  storeId: string;
  method: string;
  currency: string;
  strategy: string;
  activationMode: string;
  status: string;
  version: number;
  candidates?: unknown[];
};

type Decision = {
  id: string;
  storeId: string;
  amountMinor?: number;
  selectedAlias?: string | null;
  selectedProvider?: string | null;
  activationMode?: string;
  strategy?: string;
  reason?: string | null;
  createdAt?: string;
};

function brlMinor(value?: number) {
  if (!Number.isFinite(Number(value))) return "R$ —";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value) / 100);
}

export default function RoutingClient() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "partial" | "signed-out">("loading");

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/core/routing/connections", { cache: "no-store" }),
      fetch("/api/core/routing/policies", { cache: "no-store" }),
      fetch("/api/core/routing/decisions?limit=25", { cache: "no-store" })
    ]).then(async responses => {
      if (!active) return;
      if (responses.some(response => response.status === 401)) { setState("signed-out"); return; }
      const payloads = await Promise.all(responses.map(response => response.json().catch(() => null)));
      const [c, p, d] = payloads;
      setConnections(Array.isArray(c?.data) ? c.data : []);
      setPolicies(Array.isArray(p?.data) ? p.data : []);
      setDecisions(Array.isArray(d?.data) ? d.data : []);
      setState(responses.every(response => response.ok) ? "ready" : "partial");
    }).catch(() => active && setState("partial"));
    return () => { active = false; };
  }, []);

  const shadowPolicies = useMemo(() => policies.filter(policy => policy.activationMode === "shadow"), [policies]);

  return (
    <main className={styles.shell}>
      <header className={styles.topbar}>
        <div>
          <span className={styles.eyebrow}>SMART ROUTING · READ-ONLY</span>
          <h1>Roteamento PIX</h1>
          <p>Visão operacional das conexões, políticas e decisões observadas. A seleção real de provider continua inalterada.</p>
        </div>
        <div className={styles.actions}><Link href="/dashboard">Visão geral</Link><Link href="/dashboard/payouts">Solicitar saída</Link></div>
      </header>

      {state === "signed-out" ? <section className={styles.notice}>Sessão necessária. <Link href="/login">Entrar no PagarPIX</Link></section> : null}
      {state === "partial" ? <section className={styles.notice}>Parte dos dados de routing ainda não está disponível no runtime produtivo.</section> : null}

      <section className={styles.metrics}>
        <article><span>CONEXÕES</span><strong>{state === "loading" ? "—" : connections.length}</strong><small>Providers BRL visíveis</small></article>
        <article><span>POLÍTICAS</span><strong>{state === "loading" ? "—" : policies.length}</strong><small>{shadowPolicies.length} em shadow</small></article>
        <article><span>DECISÕES</span><strong>{state === "loading" ? "—" : decisions.length}</strong><small>Últimas observações carregadas</small></article>
      </section>

      <section className={styles.grid}>
        <article className={styles.panel}>
          <header><div><span>PROVIDERS</span><h2>Conexões PIX</h2></div><em>Somente leitura</em></header>
          <div className={styles.list}>
            {connections.length ? connections.map(connection => (
              <div className={styles.row} key={connection.id}>
                <div><strong>{connection.alias}</strong><span>{connection.provider} · {connection.environment}</span></div>
                <div><b>{connection.health?.status ?? "unknown"}</b><span>{connection.health?.latencyMs != null ? `${connection.health.latencyMs} ms` : "sem latência"}</span></div>
                <div><b>{connection.status}</b><span>{connection.shadowMode ? "shadow" : connection.mode}</span></div>
              </div>
            )) : <p className={styles.empty}>{state === "loading" ? "Carregando conexões…" : "Nenhuma conexão BRL retornada."}</p>}
          </div>
        </article>

        <article className={styles.panel}>
          <header><div><span>POLÍTICAS</span><h2>Estratégia configurada</h2></div><em>Sem edição</em></header>
          <div className={styles.list}>
            {policies.length ? policies.map(policy => (
              <div className={styles.policy} key={policy.id}>
                <div><strong>{policy.method.toUpperCase()} · {policy.currency}</strong><span>Store {policy.storeId.slice(0, 8)}…</span></div>
                <div><b>{policy.strategy}</b><span>{policy.activationMode} · v{policy.version}</span></div>
              </div>
            )) : <p className={styles.empty}>{state === "loading" ? "Carregando políticas…" : "Nenhuma política retornada."}</p>}
          </div>
        </article>
      </section>

      <section className={styles.panel}>
        <header><div><span>OBSERVABILIDADE</span><h2>Decisões recentes</h2></div><em>Não executa failover</em></header>
        <div className={styles.decisions}>
          {decisions.length ? decisions.map(decision => (
            <div className={styles.decision} key={decision.id}>
              <div><strong>{decision.selectedAlias ?? "Sem seleção"}</strong><span>{decision.selectedProvider ?? "provider não informado"}</span></div>
              <div><b>{brlMinor(decision.amountMinor)}</b><span>{decision.strategy ?? "—"} · {decision.activationMode ?? "—"}</span></div>
              <div><span>{decision.reason ?? "Sem motivo registrado"}</span><small>{decision.createdAt ? new Date(decision.createdAt).toLocaleString("pt-BR") : ""}</small></div>
            </div>
          )) : <p className={styles.empty}>{state === "loading" ? "Carregando decisões…" : "Ainda não há decisões observadas para exibir."}</p>}
        </div>
      </section>
    </main>
  );
}
