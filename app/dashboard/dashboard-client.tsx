"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Brand } from "@/components/brand";
import type {
  CoreEnvelope,
  Store,
  Transaction,
  TreasuryOverview,
  Wallet
} from "@/lib/types";

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
  const [treasury, setTreasury] = useState<TreasuryOverview | null>(null);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setState("loading");

    const responses = await Promise.all([
      fetch("/api/core/wallets", { cache: "no-store" }),
      fetch("/api/core/merchant/stores", { cache: "no-store" }),
      fetch("/api/core/transactions?currency=BRL&limit=6", { cache: "no-store" }),
      fetch("/api/core/treasury/overview", { cache: "no-store" })
    ]).catch(() => null);

    if (!responses) {
      setState("error");
      return;
    }

    if (responses.slice(0, 3).some((response) => response.status === 401)) {
      setState("signed-out");
      return;
    }

    const [walletResponse, storesResponse, transactionResponse, treasuryResponse] = responses;

    const [walletPayload, storesPayload, transactionPayload, treasuryPayload] = await Promise.all([
      walletResponse.json().catch(() => null),
      storesResponse.json().catch(() => null),
      transactionResponse.json().catch(() => null),
      treasuryResponse.json().catch(() => null)
    ]) as [
      CoreEnvelope<{ wallets: Wallet[] }> | null,
      CoreEnvelope<Store[]> | null,
      CoreEnvelope<Transaction[]> | null,
      CoreEnvelope<TreasuryOverview> | null
    ];

    if (!walletPayload?.success || !storesPayload?.success || !transactionPayload?.success) {
      setState("error");
      return;
    }

    setWallets(walletPayload.data.wallets ?? []);
    setStores(storesPayload.data ?? []);
    setTransactions(transactionPayload.data ?? []);

    // Treasury is intentionally optional during rollout. The accounting
    // dashboard remains usable even before the physical-wallet API is live.
    setTreasury(treasuryPayload?.success ? treasuryPayload.data : null);
    setState("ready");
  }, []);

  useEffect(() => { void load(); }, [load]);

  const brlAccounting = useMemo(
    () => wallets.find((wallet) => wallet.currency.toUpperCase() === "BRL"),
    [wallets]
  );

  const brlPhysical = useMemo(
    () => treasury?.physicalWallets?.find(
      (wallet) => wallet.code === "WALLET-BRL" && wallet.currency.toUpperCase() === "BRL"
    ),
    [treasury]
  );

  function plannedAction(label: string) {
    setMessage(`${label}: operação física sujeita à validação manual da XPayments.`);
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
            <div><p>CONTA EMPRESARIAL BRL</p><h1>Visão geral</h1><span>Saldo físico, ledger contabilístico e operação PIX em visões separadas.</span></div>
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
            <article
              className="main-wallet physical-wallet"
              style={{
                borderColor: "rgba(34, 197, 94, 0.34)",
                boxShadow: "0 0 0 1px rgba(34, 197, 94, 0.12), 0 0 38px rgba(34, 197, 94, 0.14)"
              }}
            >
              <div className="wallet-label">
                <span className="brazil-dot">BR</span>
                <div>
                  <small>WALLET BANCÁRIA FÍSICA</small>
                  <b>Wallet-BRL</b>
                </div>
                <em>{brlPhysical?.status === "active" ? "ATIVA" : "AGUARDA TREASURY"}</em>
              </div>
              <p>Saldo físico</p>
              <h2>{state === "ready" && brlPhysical ? money(brlPhysical.balance) : "R$ —"}</h2>
              <div className="balance-detail">
                <span>Disponível <b>{state === "ready" && brlPhysical ? money(brlPhysical.available) : "—"}</b></span>
                <span>Reservado <b>{state === "ready" && brlPhysical ? money(brlPhysical.reserved) : "—"}</b></span>
              </div>
              <div className="routing-note">
                PagarPIX.org · Liquidação física controlada pela XPayments · FX manual
              </div>
              <div className="wallet-actions">
                <button onClick={() => plannedAction("Depositar")}><i>＋</i><span>Depositar</span></button>
                <button onClick={() => plannedAction("Transferir")}><i>↗</i><span>Transferir</span></button>
                <button onClick={() => plannedAction("Levantar")}><i>↙</i><span>Levantar</span></button>
              </div>
            </article>

            <article className="metric-card">
              <div className="metric-icon incoming">◎</div>
              <small>SALDO CONTABILÍSTICO BRL</small>
              <h3>{state === "ready" && brlAccounting ? money(brlAccounting.balance) : "R$ —"}</h3>
              <span>Ledger XPayments · não é saldo bancário físico</span>
            </article>

            <article className="metric-card">
              <div className="metric-icon pending">◷</div>
              <small>CONTABILÍSTICO RESERVADO</small>
              <h3>{state === "ready" && brlAccounting ? money(brlAccounting.reserved) : "R$ —"}</h3>
              <span>Valores reservados no ledger do Core</span>
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
                    <span className="core-required">Ledger contabilístico</span>
                  </div>
                )) : (
                  <div className="empty-state"><span>▦</span><b>Nenhuma Store carregada</b><small>As contas por Store serão apresentadas quando o Core devolver dados.</small></div>
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
