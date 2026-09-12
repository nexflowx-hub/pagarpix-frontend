import type { Metadata } from "next";
import { PublicPage } from "@/components/public-page";
import Link from "next/link";

export const metadata: Metadata = { title: "Preços" };

export default function PricingPage() {
  return (
    <PublicPage eyebrow="PREÇOS TRANSPARENTES" title="Uma estrutura que cresce com o seu PIX." intro="A precificação final depende do volume, perfil operacional, providers habilitados e recursos contratados. Nenhuma tarifa é apresentada como definitiva antes da proposta comercial.">
      <div className="public-grid">
        <article className="content-card price-card"><span>START</span><strong>Sob consulta</strong><p>API PIX, checkout, links e webhooks para começar a operar.</p><Link className="button button-small" href="/contact">Falar com vendas →</Link></article>
        <article className="content-card price-card"><span>GROWTH</span><strong>Personalizado</strong><p>Mais volume, múltiplas Stores, conciliação e regras comerciais específicas.</p><Link className="button button-small" href="/contact">Solicitar proposta →</Link></article>
        <article className="content-card price-card"><span>INFRASTRUCTURE</span><strong>Enterprise</strong><p>Routing multi-provider, failover, suporte técnico e operação de alta disponibilidade.</p><Link className="button button-small" href="/contact">Desenhar solução →</Link></article>
      </div>
    </PublicPage>
  );
}
