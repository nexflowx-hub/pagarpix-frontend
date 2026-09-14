"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Brand } from "@/components/brand";
import { Icon, type IconName } from "@/components/icons";
import type {
  CoreEnvelope,
  FinanceOverview,
  FinanceReleases,
  FinanceStore,
  FinanceStores,
  Store,
  Transaction,
  TreasuryOverview,
  Wallet
} from "@/lib/types";

type LoadState = "loading" | "ready" | "signed-out" | "error";

const primaryNav: Array<{ icon: IconName; label: string }> = [
  { icon: "home", label: "Visão geral" },
  { icon: "wallet", label: "Wallet BRL" },
  { icon: "store", label: "Stores" },
  { icon: "pix", label: "Pagamentos PIX" },
  { icon: "transactions", label: "Transações" },
  { icon: "link", label: "Links de pagamento" },
  { icon: "calendar", label: "Liberações" },
  { icon: "payout", label: "Payouts" },
  { icon: "routing", label: "Routing" }
];

const secondaryNav: Array<{ icon: IconName; label: string }> = [
  { icon: "code", label: "Desenvolvedores" },
  { icon: "settings", label: "Definições" }
];

function money(value?: number | null) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return "R$ —";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value));
}

function shortDate(value?: string | null) {
  if (!value) return "Sem previsão";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value}T12:00:00Z`));
}

function dateTime(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function initials(value: string) {
  return value.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "ST";
}

export default function DashboardClient() {
  const [state, setState] = useState<LoadState>("loading");
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [treasury, setTreasury] = useState<TreasuryOverview | null>(null);
  const [finance, setFinance] = useState<FinanceOverview | null>(null);
  const [financeStores, setFinanceStores] = useState<FinanceStore[]>([]);
  const [releases, setReleases] = useState<FinanceReleases | null>(null);
  const [message, setMessage] = useState("");
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    setState("loading");
    const paths = [
      "/api/core/wallets",
      "/api/core/merchant/stores",
      "/api/core/transactions?currency=BRL&limit=50",
      "/api/core/treasury/overview",
      "/api/core/finance/overview?currency=BRL",
      "/api/core/finance/stores?currency=BRL",
      "/api/core/finance/releases?currency=BRL"
    ];

    const responses = await Promise.all(paths.map((path) => fetch(path, { cache: "no-store" }))).catch(() => null);
    if (!responses) { setState("error"); return; }
    if (responses.slice(0, 3).some((response) => response.status === 401)) { setState("signed-out"); return; }

    const payloads = await Promise.all(responses.map((response) => response.json().catch(() => null)));
    const walletPayload = payloads[0] as CoreEnvelope<{ wallets: Wallet[] }> | null;
    const storePayload = payloads[1] as CoreEnvelope<Store[]> | null;
    const transactionPayload = payloads[2] as CoreEnvelope<Transaction[]> | null;
    const treasuryPayload = payloads[3] as CoreEnvelope<TreasuryOverview> | null;
    const financePayload = payloads[4] as CoreEnvelope<FinanceOverview> | null;
    const financeStoresPayload = payloads[5] as CoreEnvelope<FinanceStores> | null;
    const releasesPayload = payloads[6] as CoreEnvelope<FinanceReleases> | null;

    if (!walletPayload?.success || !storePayload?.success || !transactionPayload?.success) { setState("error"); return; }

    setWallets(walletPayload.data.wallets ?? []);
    setStores(storePayload.data ?? []);
    setTransactions(transactionPayload.data ?? []);
    setTreasury(treasuryPayload?.success ? treasuryPayload.data : null);
    setFinance(financePayload?.success ? financePayload.data : null);
    setFinanceStores(financeStoresPayload?.success ? financeStoresPayload.data.stores ?? [] : []);
    setReleases(releasesPayload?.success ? releasesPayload.data : null);
    setState("ready");
  }, []);

  useEffect(() => {
    void load();
    return () => { if (noticeTimer.current) clearTimeout(noticeTimer.current); };
  }, [load]);

  const accountingBrl = wallets.find((wallet) => wallet.currency.toUpperCase() === "BRL");
  const physicalBrl = treasury?.physicalWallets?.find((wallet) => wallet.code === "WALLET-BRL" && wallet.currency.toUpperCase() === "BRL");

  const available = physicalBrl?.available ?? finance?.wallet.available ?? accountingBrl?.available;
  const reserved = finance?.wallet.reserved ?? physicalBrl?.reserved ?? accountingBrl?.reserved;
  const pending = releases?.summary.totalNet ?? finance?.wallet.pending ?? financeStores.reduce((total, store) => total + store.pending, 0);
  const generatedAt = finance?.generatedAt ?? releases?.generatedAt ?? physicalBrl?.updatedAt;

  const releaseByStore = useMemo(() => {
    const map = new Map<string, FinanceReleases["items"][number]>();
    for (const item of releases?.items ?? []) {
      if (item.storeId && !map.has(item.storeId)) map.set(item.storeId, item);
    }
    return map;
  }, [releases]);

  const storeRows = useMemo(() => {
    if (financeStores.length) return financeStores.slice(0, 5);
    return stores.slice(0, 5).map((store): FinanceStore => ({
      storeId: store.id, storeCode: store.storeCode, storeName: store.name, status: store.status,
      currency: store.currency, transactions: 0, gross: 0, fees: 0, net: 0, pending: 0,
      released: 0, paidPayouts: 0, scheduledPayouts: 0, operationalBalance: 0, availableAfterPayouts: 0
    }));
  }, [financeStores, stores]);

  const chartBars = useMemo(() => {
    const succeeded = transactions.filter((transaction) => transaction.status.toLowerCase() === "succeeded");
    const values = succeeded.slice(0, 14).reverse().map((transaction) => Math.max(Number(transaction.amount), 0));
    const max = Math.max(...values, 1);
    return values.map((value) => Math.max(10, Math.round((value / max) * 100)));
  }, [transactions]);

  const chartPoints = useMemo(() => {
    if (!chartBars.length) return "";
    return chartBars.map((height, index) => {
      const x = chartBars.length === 1 ? 140 : (index / (chartBars.length - 1)) * 280;
      return `${x.toFixed(1)},${(96 - height * 0.78).toFixed(1)}`;
    }).join(" ");
  }, [chartBars]);

  function plannedAction(label: string) {
    setMessage(`${label}: solicitação registada apenas quando o respetivo fluxo estiver ativo no XPayments Core.`);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setMessage(""), 4300);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <main className="app-v2">
      <aside className="app-sidebar">
        <div className="app-brand"><Brand /></div>
        <button className="merchant-switch" type="button" onClick={() => plannedAction("Alternar conta")}><span>PB</span><div><b>PagarPIX Business</b><small>Conta empresarial</small></div><i>⌄</i></button>
        <nav className="app-nav" aria-label="Navegação principal">
          <small>OPERAÇÃO</small>
          {primaryNav.map((item, index) => <button className={index === 0 ? "active" : ""} aria-current={index === 0 ? "page" : undefined} key={item.label} onClick={() => index > 0 && plannedAction(item.label)} type="button"><Icon name={item.icon} /><span>{item.label}</span>{item.label === "Liberações" && pending ? <em>•</em> : null}</button>)}
          <small>PLATAFORMA</small>
          {secondaryNav.map((item) => <button key={item.label} onClick={() => plannedAction(item.label)} type="button"><Icon name={item.icon} /><span>{item.label}</span></button>)}
        </nav>
        <div className="sidebar-promo"><Icon name="pix" /><b>PIX que impulsiona o seu negócio.</b><p>Mais vendas.<br />Mais liberdade.<br />Mais possibilidades.</p><i /></div>
        <div className="core-status"><i /><div><b>XPayments Core</b><small>{state === "ready" ? "Conectado" : "A verificar"}</small></div></div>
      </aside>

      <section className="app-workspace">
        <header className="app-topbar">
          <div className="mobile-app-brand"><Brand compact /></div>
          <button className="app-search" type="button" onClick={() => plannedAction("Pesquisa")}><Icon name="search" /><span>Buscar transações, Stores, referências...</span><kbd>Ctrl K</kbd></button>
          <div className="topbar-actions"><button type="button" aria-label="Ajuda" onClick={() => plannedAction("Ajuda")}><Icon name="help" /></button><button type="button" aria-label="Notificações" onClick={() => plannedAction("Notificações")}><Icon name="bell" /><i /></button><button className="user-menu" type="button" onClick={logout}><span>PP</span><div><b>Minha conta</b><small>PagarPIX Business</small></div><i>⌄</i></button></div>
        </header>

        <div className="app-content">
          <header className="app-heading"><div><small>CONTA EMPRESARIAL BRL</small><h1>Visão geral financeira</h1><p>Recursos disponíveis, recebíveis por Store e operação PIX.</p></div><div className="app-updated"><Icon name="clock" /><span>Atualização do Core<b>{generatedAt ? dateTime(generatedAt) : "Aguardando dados"}</b></span></div></header>

          {state === "signed-out" ? <div className="app-notice"><div><b>Ligue a sua conta ao XPayments Core</b><span>Entre para consultar saldos e movimentações reais. Nenhum dado financeiro é simulado.</span></div><Link className="v2-button compact" href="/login">Entrar <Icon name="arrow" /></Link></div> : null}
          {state === "error" ? <div className="app-notice error"><div><b>Não foi possível carregar os dados financeiros</b><span>Os seus dados permanecem seguros. Tente novamente.</span></div><button className="v2-button compact" type="button" onClick={load}>Tentar novamente</button></div> : null}
          {message ? <div className="app-toast" role="status"><Icon name="shield" />{message}</div> : null}

          <section className="financial-summary">
            <article className="available-wallet">
              <div className="available-wallet-main">
                <header><span><Icon name="wallet" /></span><div><small>WALLET BRL EMPRESARIAL</small><b>Disponível para saque</b></div><em><i /> {physicalBrl?.status === "active" || finance?.wallet.id ? "ATIVA" : "AGUARDA CORE"}</em></header>
                <strong>{state === "ready" ? money(available) : "R$ —"}</strong>
                <div className="wallet-buttons"><button type="button" onClick={() => plannedAction("Depositar")}><Icon name="deposit" />Depositar</button><button type="button" onClick={() => plannedAction("Transferir")}><Icon name="transfer" />Transferir</button><button type="button" onClick={() => plannedAction("Solicitar saque")}><Icon name="withdraw" />Solicitar saque</button></div>
              </div>
              <aside><Icon name="shield" /><p><b>Payouts saem apenas desta Wallet.</b><span>Recebíveis das Stores entram após a liberação confirmada.</span></p></aside>
            </article>

            <article className="summary-card pending"><header><span><Icon name="clock" /></span><Icon name="arrow" /></header><small>A LIBERAR</small><strong>{state === "ready" ? money(pending) : "R$ —"}</strong><p>Recebíveis líquidos das Stores em processo de liquidação.</p>{finance?.nextRelease ? <em>Próxima: {shortDate(finance.nextRelease.date)}</em> : <em>Sem previsão disponível</em>}</article>
            <article className="summary-card reserved"><header><span><Icon name="shield" /></span><Icon name="arrow" /></header><small>RESERVADO</small><strong>{state === "ready" ? money(reserved) : "R$ —"}</strong><p>Valores temporariamente bloqueados, agendados ou em revisão.</p>{finance?.payouts.scheduled ? <em>{finance.payouts.scheduledCount} payout(s) em processamento</em> : <em>Sem saídas agendadas</em>}</article>
          </section>

          <section className="app-grid">
            <article className="app-panel releases-panel">
              <header className="app-panel-title"><div><span><Icon name="store" /></span><div><small>RECEBÍVEIS</small><h2>Liberações por Store</h2></div></div><button type="button" onClick={() => plannedAction("Liberações")}>Ver todas as Stores <Icon name="arrow" /></button></header>
              <div className="store-table">
                <div className="store-table-head"><span>Store</span><span>A liberar</span><span>Disponível em</span><span>Líquido acumulado</span><span>Status</span></div>
                {state === "ready" && storeRows.length ? storeRows.map((store) => {
                  const release = releaseByStore.get(store.storeId);
                  const releaseStatus = release?.status === "overdue" ? "Em revisão" : release ? "Em liberação" : store.pending > 0 ? "Aguardando" : "Sem pendências";
                  const pendingShare = store.net > 0 ? Math.min(100, Math.max(0, Math.round((store.pending / store.net) * 100))) : 0;
                  return <div className="store-table-row" key={store.storeId}><span><i>{initials(store.storeName)}</i><b>{store.storeName}<small>{store.storeCode}</small></b></span><span><b>{money(store.pending)}</b><small>{store.transactions} transações</small><span className="release-meter" aria-label={`${pendingShare}% do líquido permanece pendente`}><i style={{ width: `${pendingShare}%` }} /></span></span><span>{shortDate(release?.date)}</span><span><b>{money(store.net)}</b><small>Após taxas</small></span><span><em className={release?.status === "overdue" ? "review" : store.pending > 0 ? "waiting" : "clear"}>{releaseStatus}</em></span></div>;
                }) : <div className="store-table-empty"><Icon name="store" /><b>Sem recebíveis para apresentar</b><span>As Stores serão carregadas diretamente do XPayments Core.</span></div>}
              </div>
            </article>

            <article className="app-panel gateway-panel">
              <header className="app-panel-title"><div><span><Icon name="routing" /></span><div><small>GATEWAY PIX</small><h2>Roteamento protegido</h2></div></div><span className="gateway-state"><i /> CORE</span></header>
              <p>Providers, credenciais e decisões permanecem protegidos no XPayments Core.</p>
              <div className="gateway-flow"><div><span>P1</span><b>Rota primária</b><small>Conexão protegida</small></div><i /><div className="engine"><Icon name="routing" /><b>Routing Engine</b><small>Decisão server-side</small></div><i /><div><span>P2</span><b>Failover</b><small>Quando configurado</small></div></div>
              <footer><Icon name="shield" /><span><b>Nenhuma credencial exposta</b><small>O browser recebe apenas dados necessários à experiência.</small></span></footer>
            </article>
          </section>

          <section className="app-grid bottom-grid">
            <article className="app-panel movements-panel">
              <header className="app-panel-title"><div><span><Icon name="transactions" /></span><div><small>ATIVIDADE</small><h2>Movimentações recentes</h2></div></div><button type="button" onClick={() => plannedAction("Transações")}>Ver todas <Icon name="arrow" /></button></header>
              <div className="movement-table"><div className="movement-head"><span>Referência</span><span>Origem</span><span>Tipo</span><span>Estado</span><span>Valor</span></div>{state === "ready" && transactions.length ? transactions.slice(0, 6).map((transaction) => <div className="movement-row" key={transaction.id}><span><b>{transaction.reference}</b><small>{dateTime(transaction.createdAt)}</small></span><span>{transaction.storeId ? "Store" : "Wallet BRL"}</span><span>{transaction.method?.toLowerCase() === "pix" ? "Recebimento PIX" : transaction.method ?? "Pagamento"}</span><span><em className={`tx-${transaction.status.toLowerCase()}`}>{transaction.status}</em></span><span><b>{transaction.currency === "BRL" ? money(transaction.amount) : `${transaction.amount} ${transaction.currency}`}</b></span></div>) : <div className="movement-empty">Sem movimentações reais para apresentar.</div>}</div>
            </article>

            <article className="app-panel cashflow-panel">
              <header className="app-panel-title"><div><span><Icon name="chart" /></span><div><small>FLUXO</small><h2>Entradas PIX recentes</h2></div></div></header>
              <div className="chart-total"><span>Volume carregado</span><b>{state === "ready" ? money(transactions.filter((tx) => tx.status.toLowerCase() === "succeeded" && tx.currency === "BRL").reduce((sum, tx) => sum + Number(tx.amount), 0)) : "R$ —"}</b></div>
              <div className="chart-legend"><span><i className="mint" /> Entradas PIX</span><span><i className="line" /> Tendência</span></div>
              <div className="cash-chart">{chartBars.length ? chartBars.map((height, index) => <i key={`${height}-${index}`} style={{ height: `${height}%` }} />) : Array.from({ length: 12 }).map((_, index) => <i className="placeholder" key={index} />)}{chartPoints ? <svg viewBox="0 0 280 100" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="cashLine" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#00a978" /><stop offset="1" stopColor="#00e6a1" /></linearGradient></defs><polyline points={chartPoints} /></svg> : null}<span /></div>
              <footer><span><i /> Entradas confirmadas</span><small>Baseado nas transações carregadas do Core</small></footer>
            </article>
          </section>
        </div>
      </section>
    </main>
  );
}
