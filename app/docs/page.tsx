import type { Metadata } from "next";
import { PublicPage } from "@/components/public-page";

export const metadata: Metadata = { title: "Documentação PIX" };

export default function DocsPage() {
  return (
    <PublicPage eyebrow="DEVELOPERS" title="PIX simples de integrar." intro="Esta é a visão simplificada do produto PagarPIX. O contrato canónico, autenticação e execução financeira pertencem ao XPayments Core.">
      <article className="content-card">
        <h2>Criar uma cobrança PIX</h2>
        <div className="endpoint"><b>POST</b><code>/api/v1/payments/charge</code></div>
        <pre className="code-card"><code>{`{
  "amount": 1000,
  "currency": "BRL",
  "payment_method_types": ["pix"],
  "metadata": { "order_id": "ORDER-001" }
}`}</code></pre>
        <h3>Regras de segurança</h3>
        <ul><li>Faça chamadas server-to-server.</li><li>Nunca coloque API keys no browser.</li><li>Valide a assinatura dos webhooks.</li><li>Use referências únicas e idempotência quando disponível no Core.</li></ul>
        <p>Documentação canónica atual: <a href="https://docs.xpayments.digital" target="_blank" rel="noreferrer"><b>docs.xpayments.digital ↗</b></a></p>
      </article>
    </PublicPage>
  );
}
