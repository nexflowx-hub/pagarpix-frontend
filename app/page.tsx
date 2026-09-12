import Link from "next/link";
import { Brand } from "@/components/brand";

const pillars = [
  {
    number: "01",
    title: "Aceite PIX",
    text: "API, QR Code dinâmico, Copia e Cola, links e checkout com confirmação em tempo real."
  },
  {
    number: "02",
    title: "Roteie melhor",
    text: "Orquestração multi-provider, prioridades, health checks e failover no XPayments Core."
  },
  {
    number: "03",
    title: "Opere em BRL",
    text: "Visão empresarial de saldo disponível, reservado, movimentações e liquidações."
  },
  {
    number: "04",
    title: "Automatize",
    text: "Webhooks, metadados, reconciliação e integrações server-to-server seguras."
  }
];

export default function Home() {
  return (
    <main className="marketing">
      <nav className="nav shell">
        <Brand />
        <div className="nav-links">
          <a href="#produto">Produto</a>
          <a href="#conta">Conta BRL</a>
          <a href="#desenvolvedores">Desenvolvedores</a>
          <a href="/docs">Docs</a>
        </div>
        <div className="nav-actions">
          <Link className="link-button" href="/login">Entrar</Link>
          <Link className="button button-small" href="/login">Criar conta <span>↗</span></Link>
        </div>
      </nav>

      <section className="hero shell">
        <div className="hero-glow" />
        <div className="eyebrow"><i /> Infraestrutura de pagamentos em tempo real</div>
        <h1>O PIX da sua empresa,<br /><em>sem limites.</em></h1>
        <p>
          Aceite, roteie e concilie pagamentos PIX. Uma experiência fintech completa,
          sustentada pelo motor financeiro XPayments.
        </p>
        <div className="hero-actions">
          <Link className="button" href="/login">Começar agora <span>→</span></Link>
          <a className="ghost-button" href="#desenvolvedores"><b>⌁</b> Explorar a API</a>
        </div>

        <div className="product-stage" aria-label="Prévia da plataforma PagarPIX">
          <div className="stage-orbit orbit-one" />
          <div className="stage-orbit orbit-two" />
          <div className="demo-window">
            <div className="demo-topbar">
              <Brand compact />
              <span>Visão geral</span>
              <div className="demo-profile">PP</div>
            </div>
            <div className="demo-body">
              <aside className="demo-sidebar">
                {["⌂", "◫", "⇄", "⌁", "⚙"].map((icon, index) => (
                  <i className={index === 0 ? "active" : ""} key={icon}>{icon}</i>
                ))}
              </aside>
              <div className="demo-content">
                <div className="demo-heading">
                  <div><small>CONTA EMPRESARIAL</small><h3>Wallet BRL</h3></div>
                  <span className="live-pill"><i /> Core conectado</span>
                </div>
                <div className="balance-grid">
                  <div className="balance-card primary">
                    <small>SALDO DISPONÍVEL</small>
                    <strong>R$ —</strong>
                    <p>Carregado a partir do ledger XPayments</p>
                  </div>
                  <div className="balance-card">
                    <small>EM PROCESSAMENTO</small>
                    <strong>R$ —</strong>
                    <p>Liquidações e reservas</p>
                  </div>
                </div>
                <div className="demo-lower">
                  <div className="activity-card">
                    <div className="card-title"><b>Fluxo PIX</b><span>Tempo real</span></div>
                    <div className="chart">
                      {[32, 51, 39, 74, 62, 86, 58, 92, 72, 99].map((height, index) => (
                        <i key={index} style={{ height: height + "%" }} />
                      ))}
                    </div>
                  </div>
                  <div className="qr-card">
                    <div className="mini-qr" aria-hidden="true">
                      {Array.from({ length: 49 }).map((_, i) => <i key={i} className={i % 3 === 0 || i % 7 === 0 ? "dark" : ""} />)}
                    </div>
                    <b>PIX Express</b>
                    <small>QR dinâmico</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="proof-strip">
        <div className="shell proof-inner">
          <span><i /> Confirmação em tempo real</span>
          <span><i /> Arquitetura multi-provider</span>
          <span><i /> Segurança server-to-server</span>
          <span><i /> Ledger centralizado</span>
        </div>
      </section>

      <section className="section shell" id="produto">
        <div className="section-kicker">UMA PLATAFORMA. TODO O FLUXO.</div>
        <div className="section-lead">
          <h2>De um QR Code a uma<br />operação financeira completa.</h2>
          <p>
            PagarPIX combina a simplicidade que o seu cliente espera com a
            infraestrutura e o controlo que a sua empresa precisa.
          </p>
        </div>
        <div className="pillar-grid">
          {pillars.map((pillar) => (
            <article className="pillar" key={pillar.number}>
              <span>{pillar.number}</span>
              <div className="pillar-icon">⌁</div>
              <h3>{pillar.title}</h3>
              <p>{pillar.text}</p>
              <a href="/login" aria-label={"Conhecer " + pillar.title}>Explorar <b>↗</b></a>
            </article>
          ))}
        </div>
      </section>

      <section className="account-section" id="conta">
        <div className="shell account-grid">
          <div>
            <div className="section-kicker mint">CONTA EMPRESARIAL BRL</div>
            <h2>Dinheiro e pagamentos<br />na mesma visão.</h2>
            <p>
              Uma Wallet BRL consolidada para a empresa, com separação operacional por Store,
              movimentos rastreáveis e liquidação governada pelo Core.
            </p>
            <ul className="feature-list">
              <li><i>✓</i><span><b>Wallet principal</b><small>Saldo total, disponível e reservado</small></span></li>
              <li><i>✓</i><span><b>Visão por Store</b><small>Contas operacionais em BRL sem duplicar o ledger</small></span></li>
              <li><i>✓</i><span><b>Movimentações seguras</b><small>Depósitos, transferências e levantamentos via Core</small></span></li>
            </ul>
          </div>
          <div className="account-visual">
            <div className="wallet-card">
              <div className="wallet-top"><Brand compact /><span>EMPRESARIAL</span></div>
              <small>WALLET BRL</small>
              <strong>R$ ••••••</strong>
              <div className="wallet-footer"><span>PAGARPIX BUSINESS</span><span>•• 360</span></div>
            </div>
            <div className="flow-card">
              <span className="flow-icon">↙</span>
              <div><b>PIX recebido</b><small>Confirmação em tempo real</small></div>
              <strong>BRL</strong>
            </div>
            <div className="routing-card">
              <small>SMART ROUTING</small>
              <div><i className="ok" /> Rota principal <b>Saudável</b></div>
              <div><i /> Failover <b>Pronto</b></div>
            </div>
          </div>
        </div>
      </section>

      <section className="developer-section" id="desenvolvedores">
        <div className="shell developer-grid">
          <div>
            <div className="section-kicker mint">FEITO PARA DESENVOLVEDORES</div>
            <h2>Um PIX.<br />Poucas linhas.</h2>
            <p>API previsível, respostas normalizadas e credenciais sempre protegidas no servidor.</p>
            <Link className="button light" href="/login">Ver documentação <span>→</span></Link>
          </div>
          <pre className="code-card"><code><span className="muted">{"// Criar uma cobrança PIX"}</span>{"
"}<span className="purple">const</span> payment = <span className="purple">await</span> fetch({"
  "}<span className="green">&quot;/api/v1/payments/charge&quot;</span>, {"{"}{"
    "}method: <span className="green">&quot;POST&quot;</span>,{"
    "}headers: {"{"} <span className="green">&quot;x-api-key&quot;</span>: apiKey {"}"},{"
    "}body: JSON.stringify({"{"}{"
      "}amount: <span className="orange">9990</span>,{"
      "}currency: <span className="green">&quot;BRL&quot;</span>,{"
      "}payment_method_types: [<span className="green">&quot;pix&quot;</span>]{"
    }"}){"
  }"});</code></pre>
        </div>
      </section>

      <footer className="footer">
        <div className="shell footer-grid">
          <div><Brand /><p>Infraestrutura PIX para empresas modernas.<br />Tecnologia financeira powered by XPayments Core.</p></div>
          <div><b>Produto</b><a href="#produto">Soluções</a><a href="#conta">Conta BRL</a><a href="/pricing">Preços</a></div>
          <div><b>Desenvolvedores</b><a href="/docs">Documentação</a><a href="/status">Status</a><a href="/contact">Contato</a></div>
          <div><b>Legal</b><a href="/legal/terms">Termos</a><a href="/legal/privacy">Privacidade</a><a href="/legal/cookies">Cookies</a></div>
        </div>
        <div className="shell footer-bottom"><span>© 2026 PagarPIX. Todos os direitos reservados.</span><span><i /> Sistemas operacionais</span></div>
      </footer>
    </main>
  );
}
