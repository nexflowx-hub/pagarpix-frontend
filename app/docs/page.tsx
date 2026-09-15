import type { Metadata } from "next";
import { PublicPage } from "@/components/public-page";
import { Icon } from "@/components/icons";

export const metadata: Metadata = { title: "Documentação PIX", description: "Guia inicial da API PIX PagarPIX e referência canônica do XPayments Core.", alternates: { canonical: "/docs" } };

export default function DocsPage() {
  return (
    <PublicPage eyebrow="DESENVOLVEDORES" title="PIX simples de integrar." intro="Esta é a visão simplificada do produto PagarPIX. O contrato canônico, a autenticação e a execução financeira pertencem ao XPayments Core.">
      <div className="docs-layout">
        <aside className="docs-index"><span>COMEÇAR</span><a href="#quickstart">Visão geral</a><a href="#request">Criar cobrança</a><a href="#security">Segurança</a><a href="#canonical">Referência canônica</a><em>Esta página não substitui o contrato técnico do Core.</em></aside>
        <article className="content-card docs-card" id="quickstart">
          <span className="section-label">QUICKSTART</span><h2>Crie uma cobrança PIX no servidor.</h2><p>O endpoint canônico pertence ao XPayments Core. O PagarPIX organiza a experiência de produto, mas não replica o processamento financeiro.</p>
          <div className="endpoint" id="request"><b>POST</b><code>/api/v1/payments/charge</code></div>
          <pre className="code-card"><code>{`{
  "amount": 1000,
  "currency": "BRL",
  "payment_method_types": ["pix"],
  "metadata": { "order_id": "ORDER-001" }
}`}</code></pre>
          <div className="docs-callout"><Icon name="shield" /><div><b>Unidade de valor</b><p>Confirme a unidade monetária aplicável no contrato canônico antes da integração. Não inferimos conversões no frontend.</p></div></div>
          <h3 id="security">Regras de segurança</h3>
          <ul className="check-list"><li><Icon name="check" /> Faça chamadas server-to-server.</li><li><Icon name="check" /> Nunca coloque API keys no browser.</li><li><Icon name="check" /> Valide a assinatura dos webhooks.</li><li><Icon name="check" /> Use idempotência quando prevista no contrato do Core.</li></ul>
          <h3 id="canonical">Contrato canônico</h3><p>Autenticação, respostas, webhooks e comportamento financeiro devem ser validados na documentação oficial do XPayments.</p><a className="ds-button ds-button-secondary is-compact" href="https://docs.xpayments.digital" target="_blank" rel="noreferrer">Abrir docs.xpayments.digital ↗</a>
        </article>
      </div>
    </PublicPage>
  );
}
