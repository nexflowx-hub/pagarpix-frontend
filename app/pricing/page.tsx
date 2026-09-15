import type { Metadata } from "next";
import { PublicPage } from "@/components/public-page";
import Link from "next/link";
import { Icon } from "@/components/icons";

export const metadata: Metadata = { title: "Preços", description: "Planos PagarPIX definidos conforme volume, integração, Stores e capacidade de roteamento.", alternates: { canonical: "/pricing" } };

export default function PricingPage() {
  return (
    <PublicPage eyebrow="PREÇOS TRANSPARENTES" title="Uma estrutura que cresce com o seu PIX." intro="A precificação final depende do volume, perfil operacional, providers habilitados e recursos contratados. Nenhuma tarifa é apresentada como definitiva antes da proposta comercial.">
      <div className="public-grid pricing-grid">
        <article className="content-card price-card"><span>START</span><strong>Sob consulta</strong><p>Para validar a integração PIX com uma operação enxuta.</p><ul><li><Icon name="check" /> API e checkout PIX</li><li><Icon name="check" /> Links de pagamento</li><li><Icon name="check" /> Webhooks do Core</li></ul><Link className="ds-button ds-button-secondary is-compact" href="/request-access">Solicitar avaliação →</Link></article>
        <article className="content-card price-card is-featured"><span>GROWTH</span><strong>Personalizado</strong><p>Para operações com múltiplas Stores e conciliação centralizada.</p><ul><li><Icon name="check" /> Tudo do Start</li><li><Icon name="check" /> Visão financeira por Store</li><li><Icon name="check" /> Políticas de routing contratadas</li></ul><Link className="ds-button ds-button-primary is-compact" href="/request-access">Desenhar proposta →</Link></article>
        <article className="content-card price-card"><span>INFRASTRUCTURE</span><strong>Enterprise</strong><p>Para arquiteturas que exigem operação e suporte sob medida.</p><ul><li><Icon name="check" /> Desenho técnico dedicado</li><li><Icon name="check" /> Estratégia multi-provider</li><li><Icon name="check" /> Condições contratuais específicas</li></ul><Link className="ds-button ds-button-secondary is-compact" href="/contact">Falar com especialista →</Link></article>
      </div>
      <section className="public-section split-section"><div><span className="section-label">COMO PRECIFICAMOS</span><h2>Sem promessas genéricas ou tarifas escondidas.</h2></div><div className="factor-list"><p><b>Volume processado</b><span>Faixa mensal, ticket e perfil da operação.</span></p><p><b>Arquitetura</b><span>API, checkout, links, Stores e providers necessários.</span></p><p><b>Operação</b><span>Suporte, conciliação, routing e requisitos contratuais.</span></p></div></section>
    </PublicPage>
  );
}
