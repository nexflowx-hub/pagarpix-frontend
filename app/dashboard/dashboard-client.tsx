"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Brand } from "@/components/brand";
import type { CoreEnvelope, Store, Transaction, Wallet } from "@/lib/types";

type LoadState = "loading" | "ready" | "signed-out" | "error";

const nav = [
  ["⌂", "Visão geral"],
  ["◉", "Conta BRL"],
  ["▦", "Wallets por Store"],
  ["⌁", "Pagamentos PIX"],
  ["⇄", "Transações"],
  ["↗", "Links de pagamento"],
  ["◇", "Liquidações"],
  ["⚡", "Desenvolvedores"],
  ["⚙", "Definições"]
];

function money(value?: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(Number(value ?? 0));
}

function date(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export default function DashboardClient() {
  const [state, setState] = useState<LoadState>("loading");
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setState("loading");
    const responses = await Promise.all([
      fetch("/api/core/wallets", { cache: "no-store" }),
      fetch("/api/core/merchant/stores", { cache: "no-store" }),
      fetch("/api/core/transactions?currency=BRL&limit=6", { cache: "no-store" })
    ]).catch(() => null);

    if (!responses) {
      setState("error");
      return;
    }
    if (responses.some((response) => response.status === 401)) {
      setState("signed-out");
      return;
    }

    const [walletPayload, storesPayload, transactionPayload] = await Promise.all(
      responses.map((response) => response.json().catch(() => null))
    ) as [
      CoreEnvelope<{ wallets: Wallet[] }>,
      CoreEnvelope<Store[]>,
      CoreEnvelope<Transaction[]>
    ];

    if (!walletPayload?.success || !storesPayload?.success || !transactionPayload?.success) {
      setState("error");
      return;
    }
    setWallets(walletPayload.data.wallets ?? []);
    setStores(storesPayload.data ?? []);
    setTransactions(transactionPayload.data ?? []);
    setState("ready");
  }, []);

  useEffect(() => { void load(); }, [load]);

  const brl = useMemo(
    () => wallets.find((wallet) => wallet.currency.toUpperCase() === "BRL"),
    [wallets]
  );

  function plannedAction(label: string) {
    setMessage(`${label}: integração operacional ainda precisa ser criada no XPayments Core.`);
    window.setTimeout(() => setMessage(""), 4200);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <main className="dashboard">
      <aside className="dash-sidebar">
        <div className="dash-logo"><Brand /></div>
        <div className="workspace-switch"><span>PB</span><div><b>PagarPIX Business</b><small>Conta empresarial</small></div><i>⌄</i></div>
        <nav>
          <small>OPERAÇÃO</small>
          {nav.slice(0, 7).map(([icon, label], index) => (
            <button className={index === 0 ? "selected" : ""} key={label}><i>{icon}</i>{label}{label === "Wallets por Store" && <em>CORE</em>}</button>
          ))}
          <small>PLATAFORMA</small>
          {nav.slice(7).map(([icon, label]) => <button key={label}><i>{icon}</i>{label}</button>)}
        </nav>
        <div className="core-badge"><i /><div><b>XPayments Core</b><small>{state === "ready" ? "Conectado" : "A verificar"}</small></div></div>
      </aside>

      <section className="dash-main">
        <header className="dash-header">
          <button className="mobile-brand"><Brand compact /></button>
          <div className="dash-search">⌕ <span>Pesquisar transação, referência...</span><kbd>⌘ K</kbd></div>
          <div className="header-actions"><button>?</button><button>♢</button><button className="avatar" onClick={logout}>PP</button></div>
        </header>

        <div className="dash-content">
          <div className="welcome-row">
            <div><p>CONTA EMPRESARIAL BRL</p><h1>Visão geral</h1><span>O seu dinheiro e a sua operação PIX numa única visão.</span></div>
            <div className="period"><button className="active">Hoje</button><button>7 dias</button><button>30 dias</button></div>
          </div>

          {state === "signed-out" && (
            <div className="state-banner"><div><b>Ligue a sua conta ao XPayments Core</b><span>Entre para consultar saldos e movimentações reais. Nenhum dado financeiro é simulado.</span></div><Link className="button button-small" href="/login">Entrar</Link></div>
          )}
          {state === "error" && (
            <div className="state-banner error"><div><b>Não foi possível carregar o Core</b><span>Os seus dados permanecem seguros. Tente novamente.</span></div><button className="button button-small" onClick={load}>Tentar novamente</button></div>
          )}
          {message && <div className="toast" role="status">{message}</div>}

          <div className="wallet-overview">
            <article className="main-wallet">
              <div className="wallet-label"><span className="brazil-dot">BR</span><div><small>WALLET PRINCIPAL</small><b>Conta empresarial BRL</b></div><em>{brl ? "ATIVA" : "AGUARDA CORE"}</em></div>
              <p>Saldo total</p>
              <h2>{state === "ready" && brl ? money(brl.balance) : "R$ —"}</h2>
              <div className="balance-detail"><span>Disponível <b>{state === "ready" && brl ? money(brl.available) : "—"}</b></span><span>Reservado <b>{state === "ready" && brl ? money(brl.reserved) : "—"}</b></span></div>
              <div className="wallet-actions">
                <button onClick={() => plannedAction("Depositar")}><i>＋</i><span>Depositar</span></button>
                <button onClick={() => plannedAction("Transferir")}><i>↗</i><span>Transferir</span></button>
                <button onClick={() => plannedAction("Levantar")}><i>↙</i><span>Levantar</span></button>
              </div>
            </article>

            <article className="metric-card">
              <div className="metric-icon incoming">↙</div><small>ENTRADAS PIX</small><h3>{state === "ready" ? money(transactions.filter(t => t.status === "succeeded").reduce((sum, t) => sum + Number(t.amount), 0)) : "R$ —"}</h3><span>Lista BRL atualmente carregada</span>
            </article>
            <article className="metric-card">
              <div className="metric-icon pending">◷</div><small>EM PROCESSAMENTO</small><h3>{state === "ready" && brl ? money(brl.reserved) : "R$ —"}</h3><span>Saldo reservado no Core</span>
            </article>
          </div>

          <div className="dashboard-grid">
            <article className="panel stores-panel">
              <div className="panel-head"><div><p>CONTAS OPERACIONAIS</p><h3>Wallets por Store</h3></div><button>Ver todas →</button></div>
              <div className="store-list">
                {state === "ready" && stores.length > 0 ? stores.slice(0, 4).map((store) => (
                  <div className="store-row" key={store.id}>
                    <span className="store-icon">{store.name.slice(0, 2).toUpperCase()}</span>
                    <div><b>{store.name}</b><small>{store.storeCode} · {store.currency}</small></div>
                    <span className="core-required">Wallet por Store requer Core</span>
                  </div>
                )) : (
                  <div className="empty-state"><span>▦</span><b>Nenhuma Store carregada</b><small>As contas por Store serão apresentadas quando o modelo financeiro existir no Core.</small></div>
                )}
              </div>
            </article>

            <article className="panel routing-panel">
              <div className="panel-head"><div><p>GATEWAY PIX</p><h3>Saúde do roteamento</h3></div><span className="live-pill"><i /> Core</span></div>
              <div className="routing-visual"><div className="route-origin">PIX</div><div className="route-line"><i /></div><div className="route-destinations"><span><i /> Rota principal <b>Gerida pelo Core</b></span><span><i /> Failover <b>Configuração futura</b></span></div></div>
              <div className="routing-note">Credenciais e decisões de routing nunca são expostas neste frontend.</div>
            </article>
          </div>

          <article className="panel transaction-panel">
            <div className="panel-head"><div><p>ATIVIDADE</p><h3>Transações PIX recentes</h3></div><button>Ver todas →</button></div>
            <div className="transaction-table">
              <div className="table-row table-head"><span>Referência</span><span>Data</span><span>Estado</span><span>Valor</span></div>
              {state === "ready" && transactions.length ? transactions.slice(0, 6).map((transaction) => (
                <div className="table-row" key={transaction.id}>
                  <span><b>{transaction.reference}</b><small>{transaction.method ?? "pix"}</small></span>
                  <span>{date(transaction.createdAt)}</span>
                  <span><em className={"status " + transaction.status}>{transaction.status}</em></span>
                  <span><b>{transaction.currency === "BRL" ? money(transaction.amount) : transaction.amount + " " + transaction.currency}</b></span>
                </div>
              )) : <div className="table-empty">Sem transações reais para apresentar.</div>}
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
