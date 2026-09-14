import Link from "next/link";
import { Brand } from "@/components/brand";
import { Icon, type IconName } from "@/components/icons";

const capabilities: Array<{ icon: IconName; title: string; text: string }> = [
  { icon: "code", title: "PIX API", text: "Integre e escale com simplicidade." },
  { icon: "pix", title: "Checkout", text: "Converta pagamentos com mais controlo." },
  { icon: "link", title: "Links", text: "Receba em qualquer canal." },
  { icon: "routing", title: "Smart Routing", text: "Mais estabilidade para o seu PIX." },
  { icon: "wallet", title: "Wallet BRL", text: "Movimente recursos liberados." },
  { icon: "webhook", title: "Webhooks", text: "Eventos em tempo real." }
];

const platform = [
  { icon: "pix" as IconName, index: "01", label: "ACCEPT", title: "Aceite PIX em todos os canais.", text: "API, QR Code dinâmico, Copia e Cola, links de pagamento e checkout responsivo." },
  { icon: "routing" as IconName, index: "02", label: "ROUTE", title: "Roteie cada pagamento com inteligência.", text: "Orquestração multi-provider, prioridade, monitorização de saúde e failover no Core." },
  { icon: "wallet" as IconName, index: "03", label: "MOVE", title: "Movimente apenas recursos disponíveis.", text: "Uma Wallet BRL empresarial para depósitos, transferências e solicitações de saque." },
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
  return (
    <main className="marketing v2-marketing">
      <section className="v2-hero">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-rail rail-a" aria-hidden="true" />
        <div className="hero-rail rail-b" aria-hidden="true" />

        <nav className="v2-nav shell">
          <Brand />
          <div className="v2-nav-links">
            <a href="#plataforma">Produtos</a><a href="#wallet">Soluções</a><a href="#developers">Desenvolvedores</a><Link href="/pricing">Preços</Link>
          </div>
          <div className="v2-nav-actions"><Link className="v2-login" href="/login">Entrar</Link><Link className="v2-button compact" href="/login">Começar <Icon name="arrow" /></Link></div>
        </nav>

        <div className="v2-hero-layout shell">
          <div className="v2-hero-copy">
            <div className="v2-eyebrow"><i /> INFRAESTRUTURA PIX PARA EMPRESAS</div>
            <h1>Seu PIX. Mais rápido,<br />inteligente e preparado<br /><em>para crescer.</em></h1>
            <p>Aceite, roteie, concilie e movimente recursos em uma única plataforma.</p>
            <div className="v2-hero-actions"><Link className="v2-button" href="/login">Criar conta empresarial <Icon name="arrow" /></Link><Link className="v2-secondary-button" href="/docs">Explorar a API</Link></div>
            <div className="v2-trust-row">
              <span><Icon name="pix" /> Pagamentos em tempo real</span><span><Icon name="shield" /> Segurança server-to-server</span><span><Icon name="chart" /> Infraestrutura para escalar</span>
            </div>
          </div>

          <div className="v2-product-scene" aria-label="Demonstração conceptual da plataforma PagarPIX">
            <div className="scene-glow" />
            <article className="scene-card payment-card">
              <div className="scene-card-head"><div><Icon name="pix" /><span><b>Pagar com PIX</b><small>Escaneie no app do seu banco</small></span></div><em>PIX</em></div>
              <div className="qr-code" aria-hidden="true">{qrCells.map((active, index) => <i className={active ? "filled" : ""} key={index} />)}<span><Icon name="pix" /></span></div>
              <button type="button"><Icon name="link" /> Copiar código PIX</button>
              <footer><span><i /> Confirmação em tempo real</span><span><Icon name="shield" /> Ambiente seguro</span></footer>
            </article>

            <article className="scene-card scene-wallet">
              <header><div><Icon name="wallet" /><span><small>WALLET BRL</small><b>Conta empresarial</b></span></div><span className="scene-status"><i /> DISPONÍVEL</span></header>
              <p>Disponível para saque</p><strong>R$ —</strong>
              <div className="scene-wallet-actions"><span><Icon name="withdraw" /> Solicitar saque</span><span><Icon name="transfer" /> Movimentar</span></div>
              <small>Os valores só entram aqui após a liberação.</small>
            </article>

            <article className="scene-card route-card">
              <header><div><Icon name="routing" /><span><b>Smart Routing</b><small>Failover automático no XPayments Core</small></span></div><em><i /> ATIVO</em></header>
              <div className="route-nodes"><div><span>P1</span><small>Rota principal</small></div><i /><div className="active"><span>P2</span><small>Melhor rota</small></div><i /><div><span>P3</span><small>Failover</small></div></div>
              <div className="route-result"><Icon name="check" /> Decisão protegida e auditável</div>
            </article>

            <div className="brazil-signal" aria-hidden="true"><svg viewBox="0 0 190 210"><path d="M68 5 101 20l18 29 33 18 26 43-25 19-11 39-35 8-23 30-24-23-30-5-15-31 9-29-13-25 31-24 7-34Z"/><circle cx="103" cy="112" r="4"/><path d="m103 112 42-22M103 112l-38-38M103 112l-20 54"/></svg></div>
          </div>
        </div>

        <div className="capability-bar"><div className="shell capability-grid">{capabilities.map((item) => <div className="capability" key={item.title}><span><Icon name={item.icon} /></span><div><b>{item.title}</b><small>{item.text}</small></div></div>)}</div></div>
      </section>

      <section className="v2-section shell" id="plataforma">
        <div className="v2-section-intro"><div><div className="v2-kicker">UMA PLATAFORMA. TODO O FLUXO.</div><h2>Do primeiro PIX ao<br />último centavo conciliado.</h2></div><p>Uma camada de produto própria sobre o XPayments Core: simples para o merchant, robusta para a operação e segura para o dinheiro.</p></div>
        <div className="platform-grid">{platform.map((item) => <article key={item.index}><div className="platform-top"><span>{item.index}</span><Icon name={item.icon} /></div><small>{item.label}</small><h3>{item.title}</h3><p>{item.text}</p><Link href="/docs">Explorar <Icon name="arrow" /></Link></article>)}</div>
      </section>

      <section className="wallet-story" id="wallet">
        <div className="shell wallet-story-grid">
          <div className="wallet-story-copy">
            <div className="v2-kicker light">CONTA EMPRESARIAL BRL</div><h2>O dinheiro só fica disponível quando pode ser movimentado.</h2><p>Pagamentos confirmados permanecem ligados às Stores durante o ciclo de liberação. Depois de liquidados, entram na Wallet BRL Empresarial e ficam disponíveis para saque.</p>
            <div className="wallet-flow-list">
              <div><span>01</span><Icon name="store" /><p><b>Recebíveis por Store</b><small>Bruto, taxas, líquido e previsão de liberação.</small></p></div>
              <div><span>02</span><Icon name="clock" /><p><b>Liberação controlada</b><small>Processamento conforme provider e regras do Core.</small></p></div>
              <div><span>03</span><Icon name="wallet" /><p><b>Wallet BRL Empresarial</b><small>Saldo realmente disponível para movimentação.</small></p></div>
              <div><span>04</span><Icon name="withdraw" /><p><b>Solicitação de saque</b><small>Saída protegida, rastreável e sujeita a validação.</small></p></div>
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

      <section className="developer-v2" id="developers">
        <div className="shell developer-v2-grid">
          <div><div className="v2-kicker light">FEITO PARA DESENVOLVEDORES</div><h2>Um PIX.<br />Poucas linhas.</h2><p>API previsível, respostas normalizadas e credenciais sempre protegidas no servidor.</p><Link className="v2-button" href="/docs">Abrir documentação <Icon name="arrow" /></Link></div>
          <div className="terminal-card"><header><span><i /><i /><i /></span><small>POST /api/v1/payments/charge</small><em>BRL</em></header><pre><code><span>{"// Criar uma cobrança PIX"}</span>{`\nconst payment = await fetch("/api/v1/payments/charge", {\n  method: "POST",\n  headers: { "x-api-key": apiKey },\n  body: JSON.stringify({\n    amount: 9990,\n    currency: "BRL",\n    payment_method_types: ["pix"]\n  })\n});`}</code></pre><footer><span><i /> Server-to-server</span><span>Credenciais protegidas</span></footer></div>
        </div>
      </section>

      <section className="final-cta"><div className="final-cta-grid" aria-hidden="true" /><div className="shell"><Icon name="pix" /><h2>O próximo PIX da sua empresa<br />começa aqui.</h2><p>Infraestrutura pronta para aceitar, rotear, conciliar e crescer.</p><Link className="v2-button" href="/login">Criar conta empresarial <Icon name="arrow" /></Link></div></section>

      <footer className="v2-footer"><div className="shell footer-main"><div><Brand /><p>Infraestrutura PIX para empresas modernas.<br />Powered by XPayments Core.</p></div><div><b>Produto</b><a href="#plataforma">Soluções</a><a href="#wallet">Wallet BRL</a><Link href="/pricing">Preços</Link></div><div><b>Desenvolvedores</b><Link href="/docs">Documentação</Link><Link href="/status">Status</Link><Link href="/contact">Contato</Link></div><div><b>Legal</b><Link href="/legal/terms">Termos</Link><Link href="/legal/privacy">Privacidade</Link><Link href="/legal/cookies">Cookies</Link></div></div><div className="shell footer-base"><span>© 2026 PagarPIX. Todos os direitos reservados.</span><span><i /> XPayments Core operacional</span></div></footer>
    </main>
  );
}
