import type { Metadata } from "next";
import { PublicPage } from "@/components/public-page";

export const metadata: Metadata = { title: "Contato" };

export default function ContactPage() {
  return (
    <PublicPage eyebrow="FALE COM A PAGARPIX" title="Vamos desenhar o seu fluxo PIX." intro="Conte-nos o volume esperado, o tipo de integração, as Stores envolvidas e os recursos de routing necessários.">
      <div className="public-grid">
        <article className="content-card"><h2>Comercial</h2><p>Planos, tarifas, volumes e desenho da solução.</p><p>Canal comercial em configuração para o lançamento público.</p></article>
        <article className="content-card"><h2>Integração</h2><p>API, checkout, links, webhooks e migração de fluxos.</p><p>Consulte desde já a documentação canónica XPayments.</p></article>
        <article className="content-card"><h2>Suporte</h2><p>O suporte autenticado será disponibilizado dentro do dashboard empresarial.</p></article>
      </div>
    </PublicPage>
  );
}
