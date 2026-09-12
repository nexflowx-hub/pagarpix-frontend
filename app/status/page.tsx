import type { Metadata } from "next";
import { PublicPage } from "@/components/public-page";

export const metadata: Metadata = { title: "Status" };

export default function StatusPage() {
  return (
    <PublicPage eyebrow="STATUS DA PLATAFORMA" title="Transparência operacional." intro="Esta página distingue a experiência PagarPIX dos serviços canónicos do XPayments Core.">
      <article className="content-card">
        <h2>Componentes</h2>
        <div className="status-line"><span><i /> Site PagarPIX</span><em>Configurado</em></div>
        <div className="status-line"><span><i /> XPayments Core API</span><a href="https://api.xpayments.digital/api/health" target="_blank" rel="noreferrer"><em>Ver health ↗</em></a></div>
        <div className="status-line"><span><i /> Checkout XPayments</span><a href="https://checkout.xpayments.digital" target="_blank" rel="noreferrer"><em>Serviço canónico ↗</em></a></div>
        <p>Incidentes operacionais e manutenção programada deverão ser publicados aqui quando o sistema de status dedicado estiver ativo.</p>
      </article>
    </PublicPage>
  );
}
