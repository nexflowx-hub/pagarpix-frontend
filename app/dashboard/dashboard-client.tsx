"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Brand } from "@/components/brand";
import { Icon, type IconName } from "@/components/icons";
import { EmptyState, LoadingPanel, MoneyDisplay, StatusBadge } from "@/components/ui/primitives";
import { aggregatePixCashflow, getPhysicalBrlWallet, getWithdrawableBrl, isConfirmedPix, transactionStatusLabel, transactionStatusTone } from "@/lib/finance";
import type { FinanceOverview, FinanceReleases, FinanceStore, Store, Transaction, TreasuryOverview, Wallet } from "@/lib/types";
import { parseFinanceOverview, parseFinanceReleases, parseFinanceStores, parseStores, parseTransactions, parseTreasuryOverview, parseWallets } from "@/lib/validation";

export type DashboardSection = "overview" | "wallet" | "stores" | "pix" | "movements" | "releases";
type LoadState = "loading" | "ready" | "partial" | "signed-out" | "error";
type DatasetKey = "wallets" | "stores" | "transactions" | "pixTransactions" | "treasury" | "finance" | "financeStores" | "releases";

const sectionContent: Record<DashboardSection, { eyebrow: string; title: string; description: string }> = {
  overview: { eyebrow: "CONTA EMPRESARIAL BRL", title: "Visão geral financeira", description: "Saldo físico, recebíveis por Store e operação PIX." },
  wallet: { eyebrow: "TESOURARIA", title: "Wallet BRL empresarial", description: "Separação explícita entre tesouraria física e registros contábeis." },
  stores: { eyebrow: "OPERAÇÃO", title: "Stores", description: "Recebíveis e liberação financeira por unidade operacional." },
  pix: { eyebrow: "PAGAMENTOS", title: "Pagamentos PIX", description: "Somente transações BRL comprovadamente identificadas como PIX." },
  movements: { eyebrow: "ATIVIDADE", title: "Movimentações", description: "Transações carregadas diretamente do XPayments Core." },
  releases: { eyebrow: "RECEBÍVEIS", title: "Liberações", description: "Previsões do Core, sem conversão em saldo disponível no frontend." }
};

const primaryNav: Array<{ icon: IconName; label: string; href: string; section: DashboardSection }> = [
  { icon: "home", label: "Visão geral", href: "/dashboard", section: "overview" },
  { icon: "wallet", label: "Wallet BRL", href: "/dashboard/wallet", section: "wallet" },
  { icon: "store", label: "Stores", href: "/dashboard/stores", section: "stores" },
  { icon: "pix", label: "Pagamentos PIX", href: "/dashboard/pix", section: "pix" },
  { icon: "transactions", label: "Movimentações", href: "/dashboard/movements", section: "movements" },
  { icon: "calendar", label: "Liberações", href: "/dashboard/releases", section: "releases" }
];

const coreDependencies: Array<{ icon: IconName; label: string; state: string }> = [
  { icon: "link", label: "Links de pagamento", state: "Em preparação" },
  { icon: "payout", label: "Payouts", state: "Requer Core" },
  { icon: "routing", label: "Smart Routing", state: "Requer Core" },
  { icon: "settings", label: "Configurações", state: "Em preparação" }
];

function money(value?: number | null) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return "R$ —";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value));
}

function shortDate(value?: string | null) {
  if (!value) return "Sem previsão";
  const parsed = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return "Data indisponível";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(parsed);
}

function dateTime(value?: string | null) {
  if (!value) return "Aguardando dados";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Data indisponível";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(parsed);
}

function initials(value: string) {
  return value.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "ST";
}

function methodLabel(method?: string | null) {
  return method?.toLowerCase() === "pix" ? "PIX" : method ? method.toUpperCase() : "Não informado";
}

function OperationalActions() {
  return (
    <div className="wallet-buttons" aria-label="Operações ainda dependentes do XPayments Core">
      {[
        { icon: "deposit" as IconName, label: "Depositar" },
        { icon: "transfer" as IconName, label: "Transferir" },
        { icon: "withdraw" as IconName, label: "Solicitar saque" }
      ].map((action) => <button disabled key={action.label} type="button" title="Requer endpoint operacional no XPayments Core"><Icon name={action.icon} />{action.label}<small>Requer Core</small></button>)}
    </div>
  );
}

function TransactionRows({ transactions }: { transactions: Transaction[] }) {
  if (!transactions.length) return <EmptyState icon="transactions" title="Nenhuma movimentação encontrada" text="A lista permanece vazia até o XPayments Core retornar dados compatíveis com estes filtros." />;
  return (
    <div className="movement-table responsive-rows">
      <div className="movement-head"><span>Referência</span><span>Método</span><span>Origem</span><span>Status</span><span>Valor</span></div>
      {transactions.map((transaction) => <div className="movement-row" key={transaction.id}>
        <span data-label="Referência"><b>{transaction.reference}</b><small>{dateTime(transaction.createdAt)}</small></span>
        <span data-label="Método">{methodLabel(transaction.method)}</span>
        <span data-label="Origem">{transaction.storeId ? "Store" : "Conta empresarial"}</span>
        <span data-label="Status"><StatusBadge tone={transactionStatusTone(transaction.status)}>{transactionStatusLabel(transaction.status)}</StatusBadge></span>
        <span data-label="Valor"><b>{transaction.currency.toUpperCase() === "BRL" ? money(transaction.amount) : `${transaction.amount} ${transaction.currency}`}</b></span>
      </div>)}
    </div>
  );
}

function StoreRows({ rows, releases }: { rows: FinanceStore[]; releases: FinanceReleases | null }) {
  const releaseByStore = new Map<string, FinanceReleases["items"][number]>();
  for (const item of releases?.items ?? []) if (item.storeId && !releaseByStore.has(item.storeId)) releaseByStore.set(item.storeId, item);
  if (!rows.length) return <EmptyState icon="store" title="Sem dados financeiros por Store" text="Nenhum valor será calculado no frontend enquanto o Core não retornar a visão financeira por Store." />;
  return (
    <div className="store-table responsive-rows">
      <div className="store-table-head"><span>Store</span><span>A liberar</span><span>Disponível em</span><span>Líquido acumulado</span><span>Status</span></div>
      {rows.map((store) => {
        const release = releaseByStore.get(store.storeId);
        const releaseStatus = release?.status === "overdue" ? "Em revisão" : release ? "Em liberação" : store.pending > 0 ? "Aguardando" : "Sem pendências";
        const pendingShare = store.net > 0 ? Math.min(100, Math.max(0, Math.round((store.pending / store.net) * 100))) : 0;
        return <div className="store-table-row" key={store.storeId}>
          <span data-label="Store"><i>{initials(store.storeName)}</i><b>{store.storeName}<small>{store.storeCode}</small></b></span>
          <span data-label="A liberar"><b>{money(store.pending)}</b><small>{store.transactions} transações</small><span className="release-meter" aria-label={`${pendingShare}% do líquido permanece pendente`}><i style={{ width: `${pendingShare}%` }} /></span></span>
          <span data-label="Disponível em">{shortDate(release?.date)}</span>
          <span data-label="Líquido acumulado"><b>{money(store.net)}</b><small>Após taxas registradas</small></span>
          <span data-label="Status"><StatusBadge tone={release?.status === "overdue" ? "warning" : store.pending > 0 ? "info" : "success"}>{releaseStatus}</StatusBadge></span>
        </div>;
      })}
    </div>
  );
}

export default function DashboardClient({ section = "overview" }: { section?: DashboardSection }) {
  const [state, setState] = useState<LoadState>("loading");
  const [missing, setMissing] = useState<string[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pixTransactions, setPixTransactions] = useState<Transaction[]>([]);
  const [treasury, setTreasury] = useState<TreasuryOverview | null>(null);
  const [finance, setFinance] = useState<FinanceOverview | null>(null);
  const [financeStores, setFinanceStores] = useState<FinanceStore[]>([]);
  const [releases, setReleases] = useState<FinanceReleases | null>(null);
  const [query, setQuery] = useState("");
  const [moreOpen, setMoreOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setState("loading");
    const from = new Date();
    from.setUTCDate(from.getUTCDate() - 6);
    from.setUTCHours(0, 0, 0, 0);
    const paths: Record<DatasetKey, string> = {
      wallets: "/api/core/wallets",
      stores: "/api/core/merchant/stores",
      transactions: "/api/core/transactions?currency=BRL&limit=50&sortDir=desc",
      pixTransactions: `/api/core/transactions?currency=BRL&status=succeeded&method=pix&from=${encodeURIComponent(from.toISOString())}&limit=100&sortDir=asc`,
      treasury: "/api/core/treasury/overview",
      finance: "/api/core/finance/overview?currency=BRL",
      financeStores: "/api/core/finance/stores?currency=BRL",
      releases: "/api/core/finance/releases?currency=BRL"
    };

    const results = await Promise.all(Object.entries(paths).map(async ([key, path]) => {
      const response = await fetch(path, { cache: "no-store" }).catch(() => null);
      return { key: key as DatasetKey, status: response?.status ?? 0, payload: await response?.json().catch(() => null) };
    }));

    if (results.some((result) => result.status === 401)) { setState("signed-out"); return; }
    const byKey = Object.fromEntries(results.map((result) => [result.key, result.payload])) as Record<DatasetKey, unknown>;
    const parsedWallets = parseWallets(byKey.wallets);
    const parsedStores = parseStores(byKey.stores);
    const parsedTransactions = parseTransactions(byKey.transactions);
    const parsedPix = parseTransactions(byKey.pixTransactions);
    const parsedTreasury = parseTreasuryOverview(byKey.treasury);
    const parsedFinance = parseFinanceOverview(byKey.finance);
    const parsedFinanceStores = parseFinanceStores(byKey.financeStores);
    const parsedReleases = parseFinanceReleases(byKey.releases);

    setWallets(parsedWallets ?? []);
    setStores(parsedStores ?? []);
    setTransactions(parsedTransactions ?? []);
    setPixTransactions(parsedPix ?? []);
    setTreasury(parsedTreasury);
    setFinance(parsedFinance);
    setFinanceStores(parsedFinanceStores?.stores ?? []);
    setReleases(parsedReleases);

    const invalid = [
      ["Wallets contábeis", parsedWallets], ["Stores", parsedStores], ["Transações", parsedTransactions],
      ["Transações PIX", parsedPix], ["Tesouraria física", parsedTreasury], ["Financeiro", parsedFinance],
      ["Financeiro por Store", parsedFinanceStores], ["Liberações", parsedReleases]
    ].filter(([, value]) => value === null).map(([label]) => label as string);
    setMissing(invalid);
    const validCount = 8 - invalid.length;
    setState(validCount === 0 ? "error" : invalid.length ? "partial" : "ready");
  }, []);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    function shortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);

  const physicalBrl = getPhysicalBrlWallet(treasury);
  const withdrawable = getWithdrawableBrl(treasury);
  const accountingBrl = treasury?.accountingByCurrency?.find((wallet) => wallet.currency.toUpperCase() === "BRL") ?? wallets.find((wallet) => wallet.currency.toUpperCase() === "BRL") ?? null;
  const pending = releases?.summary.totalNet ?? finance?.wallet.pending ?? null;
  const physicalReserved = physicalBrl?.reserved ?? null;
  const generatedAt = treasury?.generatedAt ?? finance?.generatedAt ?? releases?.generatedAt ?? physicalBrl?.updatedAt ?? null;
  const stale = generatedAt ? Date.now() - new Date(generatedAt).getTime() > 15 * 60 * 1000 : false;
  const cashflow = useMemo(() => aggregatePixCashflow(pixTransactions, 7), [pixTransactions]);
  const cashflowMax = Math.max(...cashflow.map((point) => point.value), 1);
  const cashflowTotal = cashflow.reduce((sum, point) => sum + point.value, 0);

  const visibleTransactions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return transactions;
    return transactions.filter((transaction) => [transaction.reference, transaction.method, transaction.status, transaction.storeId].some((value) => value?.toLowerCase().includes(normalized)));
  }, [query, transactions]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  const heading = sectionContent[section];
  const coreLabel = state === "ready" ? "Dados validados" : state === "partial" ? "Dados parciais" : state === "signed-out" ? "Sessão necessária" : state === "error" ? "Indisponível" : "Verificando";

  function renderCashflow() {
    return <article className="app-panel cashflow-panel no-hover"><header className="app-panel-title"><div><span><Icon name="chart" /></span><div><small>FLUXO PIX · 7 DIAS</small><h2>Entradas confirmadas</h2></div></div></header><div className="chart-total"><span>Volume confirmado</span><b>{money(cashflowTotal)}</b><small>{cashflow.reduce((sum, point) => sum + point.count, 0)} pagamentos</small></div><div className="cash-chart-v25" role="img" aria-label={`Entradas PIX confirmadas nos últimos 7 dias: ${money(cashflowTotal)}`}>{cashflow.map((point) => <div key={point.date}><span><i style={{ height: `${Math.max(4, (point.value / cashflowMax) * 100)}%` }} /><em>{point.value ? money(point.value) : "R$ 0"}</em></span><small>{point.label}</small></div>)}</div><footer><span><i /> BRL · succeeded · pix</span><small>Agregado por dia, horário de Brasília</small></footer></article>;
  }

  function overview() {
    return <>
      <section className="financial-summary">
        <article className="available-wallet no-hover"><div className="available-wallet-main"><header><span><Icon name="wallet" /></span><div><small>WALLET BRL FÍSICA</small><b>Disponível para saque</b></div><StatusBadge tone={withdrawable !== null ? "success" : "warning"}>{withdrawable !== null ? "ATIVA" : "AGUARDA CORE"}</StatusBadge></header><strong><MoneyDisplay value={withdrawable} unavailableLabel="Indisponível" /></strong>{withdrawable === null ? <p className="wallet-contract-note">Nenhum saldo contábil foi usado como fallback.</p> : null}<OperationalActions /></div><aside><Icon name="shield" /><p><b>Payouts saem apenas da Wallet física.</b><span>Recebíveis entram somente após a liberação confirmada pelo Core.</span></p></aside></article>
        <article className="summary-card pending no-hover"><header><span><Icon name="clock" /></span><StatusBadge tone="info">RECEBÍVEIS</StatusBadge></header><small>A LIBERAR</small><strong><MoneyDisplay value={pending} /></strong><p>Valores líquidos das Stores ainda fora do saldo físico disponível.</p><em>{finance?.nextRelease ? `Próxima previsão: ${shortDate(finance.nextRelease.date)}` : "Sem previsão disponível"}</em></article>
        <article className="summary-card reserved no-hover"><header><span><Icon name="shield" /></span><StatusBadge tone="warning">TESOURARIA</StatusBadge></header><small>RESERVADO FÍSICO</small><strong><MoneyDisplay value={physicalReserved} /></strong><p>Parcela reservada na Wallet física, quando retornada pelo Core.</p><em>{physicalBrl ? `Wallet ${physicalBrl.code}` : "Aguardando contrato físico"}</em></article>
      </section>
      <section className="app-grid"><article className="app-panel releases-panel no-hover"><header className="app-panel-title"><div><span><Icon name="store" /></span><div><small>RECEBÍVEIS</small><h2>Liberações por Store</h2></div></div><Link href="/dashboard/stores">Ver todas as Stores <Icon name="arrow" /></Link></header><StoreRows releases={releases} rows={financeStores.slice(0, 5)} /></article><article className="app-panel gateway-panel no-hover"><header className="app-panel-title"><div><span><Icon name="routing" /></span><div><small>GATEWAY PIX</small><h2>Roteamento protegido</h2></div></div><StatusBadge tone="warning">Requer Core</StatusBadge></header><p>A interface não presume providers, saúde ou política de roteamento. Esses dados só serão exibidos quando houver contrato canônico.</p><div className="gateway-flow"><div><span>P1</span><b>Conexão</b><small>Protegida</small></div><i /><div className="engine"><Icon name="routing" /><b>Routing Engine</b><small>Server-side</small></div><i /><div><span>P2</span><b>Failover</b><small>Quando configurado</small></div></div><footer><Icon name="shield" /><span><b>Nenhuma credencial exposta</b><small>O browser recebe somente dados necessários à experiência.</small></span></footer></article></section>
      <section className="app-grid bottom-grid"><article className="app-panel movements-panel no-hover"><header className="app-panel-title"><div><span><Icon name="transactions" /></span><div><small>ATIVIDADE</small><h2>Movimentações recentes</h2></div></div><Link href="/dashboard/movements">Ver todas <Icon name="arrow" /></Link></header><TransactionRows transactions={visibleTransactions.slice(0, 6)} /></article>{renderCashflow()}</section>
    </>;
  }

  function walletView() {
    return <><section className="wallet-contract-grid"><article className="wallet-physical-card"><header><span><Icon name="wallet" /></span><div><small>FONTE: TREASURY.PHYSICALWALLETS</small><h2>Wallet física WALLET-BRL</h2></div><StatusBadge tone={withdrawable !== null ? "success" : "warning"}>{withdrawable !== null ? "Movimentável" : "Indisponível"}</StatusBadge></header><div className="wallet-metrics"><div><small>Disponível para saque</small><strong><MoneyDisplay value={withdrawable} unavailableLabel="Aguardando Core" /></strong></div><div><small>Saldo físico</small><strong><MoneyDisplay value={physicalBrl?.balance ?? null} /></strong></div><div><small>Reservado físico</small><strong><MoneyDisplay value={physicalReserved} /></strong></div></div><p><Icon name="shield" /> Somente uma Wallet física BRL, `BANK_SETTLEMENT`, `active` e identificada como `WALLET-BRL` pode alimentar o valor de saque.</p><OperationalActions /></article><article className="accounting-card"><header><span><Icon name="transactions" /></span><div><small>REGISTRO CONTÁBIL</small><h2>Wallet / ledger BRL</h2></div><StatusBadge tone="info">Não é saque</StatusBadge></header><div><small>Saldo contábil</small><strong><MoneyDisplay value={accountingBrl?.balance ?? null} /></strong></div><dl><dt>Disponível contábil</dt><dd>{money(accountingBrl?.available)}</dd><dt>Reservado contábil</dt><dd>{money(accountingBrl?.reserved)}</dd><dt>Recebíveis pendentes</dt><dd>{money(pending)}</dd></dl><p>Estes números apoiam conciliação. Eles não substituem o saldo físico movimentável.</p></article></section><section className="segregation-note"><Icon name="shield" /><div><strong>Separação obrigatória preservada</strong><p>O dashboard nunca promove `finance.wallet.available` ou `/wallets.available` para “Disponível para saque”. Quando a Wallet física não é validada, o saldo de saque permanece indisponível.</p></div></section></>;
  }

  function storesView() {
    return <section className="app-panel full-panel no-hover"><header className="app-panel-title"><div><span><Icon name="store" /></span><div><small>{stores.length} STORES CADASTRADAS</small><h2>Financeiro por Store</h2></div></div><StatusBadge tone={financeStores.length ? "success" : "warning"}>{financeStores.length ? "Dados do Core" : "Sem visão financeira"}</StatusBadge></header><StoreRows releases={releases} rows={financeStores} /></section>;
  }

  function pixView() {
    const confirmed = pixTransactions.filter(isConfirmedPix);
    return <><section className="pix-metrics"><article><span><Icon name="pix" /></span><small>PIX CONFIRMADOS · 7 DIAS</small><strong>{confirmed.length}</strong><p>BRL + succeeded + method pix</p></article><article><span><Icon name="chart" /></span><small>VOLUME CONFIRMADO · 7 DIAS</small><strong>{money(cashflowTotal)}</strong><p>Sem tendência inferida</p></article><article><span><Icon name="shield" /></span><small>FONTE</small><strong>XPayments Core</strong><p>Filtro aplicado no endpoint e no cliente</p></article></section><section className="app-grid pix-grid">{renderCashflow()}<article className="app-panel no-hover"><header className="app-panel-title"><div><span><Icon name="pix" /></span><div><small>ÚLTIMOS 7 DIAS</small><h2>Pagamentos PIX confirmados</h2></div></div></header><TransactionRows transactions={confirmed.slice().reverse().slice(0, 10)} /></article></section></>;
  }

  function movementsView() {
    return <section className="app-panel full-panel no-hover"><header className="app-panel-title"><div><span><Icon name="transactions" /></span><div><small>BRL · ATÉ 50 REGISTROS</small><h2>Movimentações carregadas</h2></div></div><span className="result-count">{visibleTransactions.length} resultados</span></header><TransactionRows transactions={visibleTransactions} /></section>;
  }

  function releasesView() {
    return <section className="release-view"><div className="release-summary"><article><small>TOTAL A LIBERAR</small><strong><MoneyDisplay value={releases?.summary.totalNet ?? null} /></strong></article><article><small>MOVIMENTOS</small><strong>{releases?.summary.movementCount ?? "—"}</strong></article><article><small>EM REVISÃO</small><strong><MoneyDisplay value={releases?.summary.overdueNet ?? null} /></strong></article></div><div className="release-list">{releases?.items.length ? releases.items.map((release, index) => <article key={`${release.storeId}-${release.date}-${index}`}><span><Icon name="calendar" /></span><div><strong>{release.storeName ?? "Store não identificada"}</strong><p>{release.storeCode ?? "Sem código"} · {release.movementCount} movimentos</p></div><div><small>Previsão</small><b>{shortDate(release.date)}</b></div><div><small>Líquido</small><b>{money(release.net)}</b></div><StatusBadge tone={release.status === "overdue" ? "warning" : "info"}>{release.status === "overdue" ? "Em revisão" : "Previsto"}</StatusBadge></article>) : <EmptyState icon="calendar" title="Sem liberações previstas" text="Nenhuma previsão foi retornada pelo XPayments Core para BRL." />}</div></section>;
  }

  function content() {
    if (section === "wallet") return walletView();
    if (section === "stores") return storesView();
    if (section === "pix") return pixView();
    if (section === "movements") return movementsView();
    if (section === "releases") return releasesView();
    return overview();
  }

  return (
    <main className="app-v2">
      <aside className="app-sidebar"><div className="app-brand"><Brand /></div><div className="merchant-switch"><span>PB</span><div><b>PagarPIX Business</b><small>Conta empresarial</small></div></div><nav className="app-nav" aria-label="Navegação do dashboard"><small>OPERAÇÃO</small>{primaryNav.map((item) => <Link aria-current={section === item.section ? "page" : undefined} className={section === item.section ? "active" : ""} href={item.href} key={item.href}><Icon name={item.icon} /><span>{item.label}</span></Link>)}<small>DEPENDÊNCIAS</small>{coreDependencies.map((item) => <span className="nav-disabled" key={item.label}><Icon name={item.icon} /><span>{item.label}</span><em>{item.state}</em></span>)}</nav><div className="sidebar-trust"><Icon name="shield" /><p><b>Fonte única</b><span>XPayments Core</span></p></div><div className={`core-status state-${state}`}><i /><div><b>XPayments Core</b><small>{coreLabel}</small></div></div></aside>

      <section className="app-workspace"><header className="app-topbar"><div className="mobile-app-brand"><Brand compact /></div><label className="app-search"><Icon name="search" /><input ref={searchRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar referência, método ou status" aria-label="Buscar movimentações" /><kbd>Ctrl K</kbd></label><div className="topbar-actions"><Link aria-label="Documentação" href="/docs"><Icon name="help" /></Link><Link className="topbar-status" href="/status"><i /> Status</Link><button className="user-menu" type="button" onClick={logout}><span>PP</span><div><b>Sair</b><small>PagarPIX Business</small></div></button></div></header>

        <div className="app-content"><header className="app-heading"><div><small>{heading.eyebrow}</small><h1>{heading.title}</h1><p>{heading.description}</p></div><div className={`app-updated${stale ? " is-stale" : ""}`}><Icon name="clock" /><span>{stale ? "Dados desatualizados" : "Atualização do Core"}<b>{dateTime(generatedAt)}</b></span></div></header>
          {state === "loading" ? <section className="dashboard-loading"><LoadingPanel lines={4} /><LoadingPanel lines={4} /><LoadingPanel lines={6} /></section> : null}
          {state === "signed-out" ? <section className="dashboard-gate"><span><Icon name="shield" /></span><div><small>SESSÃO NECESSÁRIA</small><h2>Conecte-se ao XPayments Core.</h2><p>Entre para consultar saldos e movimentações reais. Nenhum dado financeiro é simulado no estado desconectado.</p><Link className="ds-button ds-button-primary" href="/login">Entrar com segurança <Icon name="arrow" /></Link></div></section> : null}
          {state === "error" ? <section className="dashboard-gate is-error"><span><Icon name="routing" /></span><div><small>CORE INDISPONÍVEL</small><h2>Não foi possível validar os dados.</h2><p>O dashboard não reutiliza cache financeiro nem inventa valores quando o Core não responde.</p><button className="ds-button ds-button-primary" type="button" onClick={load}>Tentar novamente</button></div></section> : null}
          {state === "partial" ? <div className="partial-data" role="status"><Icon name="shield" /><div><b>Dados parciais</b><span>Indisponíveis ou inválidos: {missing.join(", ")}. Os módulos válidos continuam visíveis sem preencher lacunas com valores simulados.</span></div><button type="button" onClick={load}>Atualizar</button></div> : null}
          {(state === "ready" || state === "partial") ? content() : null}
        </div>

        <nav className="mobile-bottom-nav" aria-label="Navegação mobile"><Link className={section === "overview" ? "active" : ""} href="/dashboard"><Icon name="home" /><span>Visão geral</span></Link><Link className={section === "pix" ? "active" : ""} href="/dashboard/pix"><Icon name="pix" /><span>PIX</span></Link><Link className={section === "wallet" ? "active" : ""} href="/dashboard/wallet"><Icon name="wallet" /><span>Wallet</span></Link><Link className={section === "movements" ? "active" : ""} href="/dashboard/movements"><Icon name="transactions" /><span>Movimentos</span></Link><button aria-expanded={moreOpen} aria-controls="mobile-more" onClick={() => setMoreOpen(true)} type="button"><Icon name="settings" /><span>Mais</span></button></nav>
      </section>

      {moreOpen ? <div className="mobile-drawer-backdrop" role="presentation" onClick={() => setMoreOpen(false)}><aside aria-labelledby="mobile-more-title" aria-modal="true" id="mobile-more" onClick={(event) => event.stopPropagation()} role="dialog"><header><div><small>NAVEGAÇÃO</small><h2 id="mobile-more-title">Mais áreas</h2></div><button aria-label="Fechar menu" onClick={() => setMoreOpen(false)} type="button">×</button></header><nav>{primaryNav.filter((item) => !["overview", "pix", "wallet", "movements"].includes(item.section)).map((item) => <Link href={item.href} key={item.href} onClick={() => setMoreOpen(false)}><Icon name={item.icon} /><span><b>{item.label}</b><small>Disponível</small></span><Icon name="arrow" /></Link>)}{coreDependencies.map((item) => <span className="drawer-disabled" key={item.label}><Icon name={item.icon} /><span><b>{item.label}</b><small>{item.state}</small></span></span>)}<Link href="/docs"><Icon name="code" /><span><b>Documentação</b><small>Abrir página pública</small></span><Icon name="arrow" /></Link></nav></aside></div> : null}
    </main>
  );
}
