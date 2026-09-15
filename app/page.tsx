import Link from "next/link";
import Image from "next/image";
import { Brand } from "@/components/brand";
import { Icon, type IconName } from "@/components/icons";
import { MarketingMotion } from "@/components/marketing-motion";
import { PublicFooter, PublicHeader } from "@/components/public-layout";

const capabilities: Array<{ icon: IconName; title: string; text: string }> = [
  { icon: "code", title: "PIX API", text: "Integração server-to-server." },
  { icon: "pix", title: "Checkout", text: "Uma jornada clara para pagar." },
  { icon: "link", title: "Links", text: "Receba em qualquer canal." },
  { icon: "routing", title: "Smart Routing", text: "Preparado para políticas do Core." },
  { icon: "wallet", title: "Wallet BRL", text: "Veja recursos realmente liberados." },
  { icon: "webhook", title: "Webhooks", text: "Eventos assinados pelo Core." }
];

const platform = [
  { icon: "pix" as IconName, index: "01", label: "ACCEPT", title: "Aceite PIX em todos os canais.", text: "API, QR Code dinâmico, Copia e Cola, links de pagamento e checkout responsivo." },
  { icon: "routing" as IconName, index: "02", label: "ROUTE", title: "Prepare cada pagamento para a melhor rota.", text: "Orquestração multi-provider, prioridade e failover serão exibidos quando o contrato canônico estiver disponível no Core." },
  { icon: "wallet" as IconName, index: "03", label: "MOVE", title: "Separe o disponível do que ainda será liberado.", text: "Acompanhe a Wallet BRL física e os recebíveis; depósitos, transferências e saques serão ativados após os endpoints do Core." },
  { icon: "chart" as IconName, index: "04", label: "RECONCILE", title: "Reconcilie a operação por Store.", text: "Recebíveis, taxas, previsões de liberação e movimentações numa visão auditável." }
];

const qrCells = [
  1,1,1,1,1,0,1,0,1,1,1,1,1, 1,0,0,0,1,0,0,1,1,0,0,0,1,
  1,0,1,0,1,1,1,0,1,0,1,0,1, 1,0,0,0,1,0,1,1,1,0,0,0,1,
  1,1,1,1,1,0,1,0,1,1,1,1,1, 0,0,0,0,0,1,0,1,0,0,0,0,0,
  1,1,0,1,1,0,1,1,1,0,1,0,1, 0,1,1,0,0,1,1,0,0,1,0,1,0,
  1,0,1,1,0,0,1,1,1,0,1,1,1, 1,1,0,0,1,1,0,0,1,1,0,0,1,
  1,0,1,0,1,0,1,1,0,0,1,1,0, 0,1,0,1,0,1,0,1,1,1,0,1,1,
  1,1,1,0,1,0,1,0,0,1,1,0,1
];

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "PagarPIX",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: "Camada de produto PIX para empresas, integrada ao XPayments Core.",
    url: "https://www.pagarpix.org",
    provider: { "@type": "Organization", name: "XPayments", url: "https://xpayments.digital" }
  };
  return (
    <main className="marketing v2-marketing">
      <MarketingMotion />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <section className="v2-hero">
        <div className="hero-city" aria-hidden="true"><Image alt="" className="hero-city-image" fill priority sizes="100vw" src="/images/hero-city-v2.webp" /></div>
        <div className="hero-vignette" aria-hidden="true" />
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-rail rail-a" aria-hidden="true" />
        <div className="hero-rail rail-b" aria-hidden="true" />

        <PublicHeader />

        <div className="v2-hero-layout shell">
          <div className="v2-hero-copy">
            <div className="v2-eyebrow"><i /> INFRAESTRUTURA PIX PARA EMPRESAS</div>
            <h1><span>Infraestrutura PIX</span>{" "}<br /><span>para operações que</span>{" "}<br /><em>não podem parar.</em></h1>
            <p>Receba PIX, aplique políticas de roteamento e concilie cada Store sem tirar a lógica financeira do XPayments Core.</p>
            <div className="v2-hero-actions"><Link className="v2-button" href="/request-access">Solicitar acesso empresarial <Icon name="arrow" /></Link><Link className="v2-secondary-button" href="/docs">Explorar a API</Link></div>
            <div className="v2-trust-row">
              <span><Icon name="code" /> Integração server-to-server</span><span><Icon name="shield" /> Credenciais fora do browser</span><span><Icon name="chart" /> Dados canônicos do Core</span>
            </div>
          </div>

          <div className="v2-product-scene" aria-label="Demonstração conceitual da plataforma PagarPIX" role="img">
            <div className="scene-glow" />
            <article className="scene-card payment-card">
              <div className="scene-step">01 · COBRANÇA CRIADA</div>
              <div className="scene-card-head"><div><Icon name="pix" /><span><b>Pagar com PIX</b><small>QR e Copia e Cola gerados pelo Core</small></span></div><em>PIX</em></div>
              <div className="qr-code" aria-hidden="true">{qrCells.map((active, index) => <i className={active ? "filled" : ""} key={index} />)}<span><Icon name="pix" /></span></div>
              <div className="scene-copy-action"><Icon name="link" /> Copiar código PIX</div>
              <div className="pix-confirmation"><Icon name="check" /><span><b>Pagamento confirmado</b><small>Status recebido do Core</small></span></div>
              <footer><span><i /> Aguardando confirmação</span><span><Icon name="shield" /> Fluxo protegido</span></footer>
            </article>

            <article className="scene-card scene-wallet">
              <div className="scene-step">05 · WALLET ATUALIZADA</div>
              <header><div><Icon name="wallet" /><span><small>WALLET BRL FÍSICA</small><b>Conta empresarial</b></span></div><span className="scene-status"><i /> APÓS LIBERAÇÃO</span></header>
              <p>Disponível para saque</p><strong>R$ —</strong>
              <div className="scene-wallet-actions"><span><Icon name="withdraw" /> Solicitar saque</span><span><Icon name="transfer" /> Movimentar</span></div>
              <div className="scene-wallet-feed"><header><span>FLUXO FINANCEIRO</span><b>Sem valores simulados</b></header><div><i><Icon name="clock" /></i><span><b>Recebível da Store</b><small>Aguardando liberação</small></span><em>PENDENTE</em></div><div><i><Icon name="wallet" /></i><span><b>Wallet física</b><small>Atualizada após liquidação</small></span><em>BRL</em></div></div>
            </article>

            <article className="scene-card route-card">
              <div className="scene-step">03 · ROTEAMENTO PROCESSADO</div>
              <header><div><Icon name="routing" /><span><b>Smart Routing</b><small>Política e failover no XPayments Core</small></span></div><em><i /> CORE</em></header>
              <div className="route-nodes"><div><span>P1</span><small>Rota principal</small></div><i /><div className="active"><span>P2</span><small>Melhor rota</small></div><i /><div><span>P3</span><small>Failover</small></div></div>
              <div className="route-result"><Icon name="check" /> Decisão server-side e auditável</div>
            </article>

            <aside className="scene-rail" aria-hidden="true"><b>PIX</b><p>Uma jornada.<br />Cinco estados.<br />Uma fonte de verdade.</p><div className="brazil-signal"><svg viewBox="0 0 190 210"><path d="M68 5 101 20l18 29 33 18 26 43-25 19-11 39-35 8-23 30-24-23-30-5-15-31 9-29-13-25 31-24 7-34Z"/><circle cx="103" cy="112" r="4"/><path d="m103 112 42-22M103 112l-38-38M103 112l-20 54"/></svg></div><small>CRIAR<br />CONFIRMAR<br />ROTEAR<br />LIBERAR<br />MOVIMENTAR</small></aside>
          </div>
        </div>

        <div className="capability-bar"><div className="shell capability-grid">{capabilities.map((item) => <div className="capability" key={item.title}><span><Icon name={item.icon} /></span><div><b>{item.title}</b><small>{item.text}</small></div></div>)}</div></div>
      </section>

      <section className="trust-v25" aria-labelledby="trust-title" data-reveal>
        <div className="shell trust-v25-grid"><div><div className="v2-kicker light">ARQUITETURA EXPLÍCITA</div><h2 id="trust-title">Confiança construída no desenho do produto.</h2></div><div className="trust-facts"><article><Icon name="shield" /><div><b>Credenciais protegidas</b><p>API keys e tokens de providers permanecem no servidor.</p></div></article><article><Icon name="transactions" /><div><b>Fonte financeira única</b><p>Wallets, ledger e transações continuam no XPayments Core.</p></div></article><article><Icon name="wallet" /><div><b>Saldos segregados</b><p>Recebíveis, reservas e saldo físico são apresentados separadamente.</p></div></article><article><Icon name="webhook" /><div><b>Operação auditável</b><p>Status, webhooks e documentação apontam para contratos canônicos.</p></div></article></div></div>
      </section>

      <section className="v2-section shell" id="plataforma" data-reveal>
        <div className="v2-section-intro"><div><div className="v2-kicker">UMA PLATAFORMA. TODO O FLUXO.</div><h2>Do primeiro PIX ao<br />último centavo conciliado.</h2></div><p>Uma camada de produto própria sobre o XPayments Core: simples para o merchant, robusta para a operação e segura para o dinheiro.</p></div>
        <div className="platform-grid">{platform.map((item) => <article key={item.index} data-reveal><div className="platform-top"><span>{item.index}</span><Icon name={item.icon} /></div><small>{item.label}</small><h3>{item.title}</h3><p>{item.text}</p><Link href="/docs">Explorar <Icon name="arrow" /></Link></article>)}</div>
      </section>

      <section className="wallet-story" id="wallet" data-reveal>
        <div className="shell wallet-story-grid">
          <div className="wallet-story-copy">
            <div className="v2-kicker light">CONTA EMPRESARIAL BRL</div><h2>O dinheiro só fica disponível quando pode ser movimentado.</h2><p>Pagamentos confirmados permanecem ligados às Stores durante o ciclo de liberação. Depois de liquidados, entram na Wallet BRL Empresarial e ficam disponíveis para saque.</p>
            <div className="wallet-flow-list">
              <div><span>01</span><Icon name="store" /><p><b>Recebíveis por Store</b><small>Bruto, taxas, líquido e previsão de liberação.</small></p></div>
              <div><span>02</span><Icon name="clock" /><p><b>Liberação controlada</b><small>Processamento conforme provider e regras do Core.</small></p></div>
              <div><span>03</span><Icon name="wallet" /><p><b>Wallet BRL Empresarial</b><small>Saldo realmente disponível para movimentação.</small></p></div>
              <div><span>04</span><Icon name="withdraw" /><p><b>Operações futuras</b><small>Depósito, transferência e saque dependem dos endpoints do Core.</small></p></div>
            </div>
          </div>
          <div className="wallet-story-visual">
            <div className="story-orbit orbit-one" /><div className="story-orbit orbit-two" />
            <article className="story-wallet-card"><header><Brand compact /><span>EMPRESARIAL</span></header><p>WALLET BRL</p><strong>R$ ••••••</strong><small>DISPONÍVEL PARA SAQUE</small><footer><span>PAGARPIX BUSINESS</span><Icon name="pix" /></footer></article>
            <div className="story-float release"><Icon name="clock" /><span><b>Liberação concluída</b><small>Recursos disponíveis</small></span><em>BRL</em></div>
            <div className="story-float security"><Icon name="shield" /><span><b>Ledger protegido</b><small>Fonte única: XPayments Core</small></span></div>
          </div>
        </div>
      </section>

      <section className="developer-v2" id="developers" data-reveal>
        <div className="shell developer-v2-grid">
          <div><div className="v2-kicker light">FEITO PARA DESENVOLVEDORES</div><h2>Um PIX.<br />Poucas linhas.</h2><p>API previsível, respostas normalizadas e credenciais sempre protegidas no servidor.</p><Link className="v2-button" href="/docs">Abrir documentação <Icon name="arrow" /></Link></div>
          <div className="terminal-card"><header><span><i /><i /><i /></span><small>POST /api/v1/payments/charge</small><em>BRL</em></header><pre><code><span>{"// Criar uma cobrança PIX"}</span>{`\nconst payment = await fetch("/api/v1/payments/charge", {\n  method: "POST",\n  headers: { "x-api-key": apiKey },\n  body: JSON.stringify({\n    amount: 9990,\n    currency: "BRL",\n    payment_method_types: ["pix"]\n  })\n});`}</code></pre><footer><span><i /> Server-to-server</span><span>Credenciais protegidas</span></footer></div>
        </div>
      </section>

      <section className="final-cta" data-reveal><div className="final-cta-grid" aria-hidden="true" /><div className="shell"><Icon name="pix" /><h2>Receba PIX. Roteie melhor.<br />Concilie tudo.</h2><p>Converse com a equipe sobre o seu volume, integração e arquitetura.</p><Link className="v2-button" href="/request-access">Solicitar avaliação <Icon name="arrow" /></Link></div></section>

      <PublicFooter />
    </main>
  );
}
