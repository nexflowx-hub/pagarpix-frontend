import type { Metadata } from "next";
import { PublicPage } from "@/components/public-page";
import { StatusPanel } from "@/components/status-panel";

export const metadata: Metadata = { title: "Status", description: "Verificação sob demanda dos componentes públicos PagarPIX e XPayments.", alternates: { canonical: "/status" } };

export default function StatusPage() {
  return (
    <PublicPage eyebrow="STATUS DA PLATAFORMA" title="Disponibilidade sem estado presumido." intro="Cada componente abaixo é verificado no momento da consulta. Se uma resposta não puder ser confirmada, ela não será apresentada como operacional.">
      <StatusPanel />
      <section className="status-methodology"><div><span className="section-label">METODOLOGIA</span><h2>O que esta página verifica.</h2></div><p>São feitas verificações HTTP ao frontend PagarPIX, à API pública de health do XPayments Core, ao checkout e à documentação. Este painel não mede providers privados, filas internas, webhooks individuais ou SLAs contratuais.</p></section>
    </PublicPage>
  );
}
