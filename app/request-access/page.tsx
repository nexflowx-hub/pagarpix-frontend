import type { Metadata } from "next";
import { AccessRequestForm } from "@/components/access-request-form";
import { Icon } from "@/components/icons";
import { PublicPage } from "@/components/public-page";

export const metadata: Metadata = {
  title: "Solicitar acesso",
  description: "Solicite uma avaliação comercial para integrar o PagarPIX à sua operação.",
  alternates: { canonical: "/request-access" }
};

export default function RequestAccessPage() {
  return (
    <PublicPage eyebrow="ONBOARDING COMERCIAL" title="Vamos entender a sua operação PIX." intro="O acesso ainda é avaliado pela equipe. Preencha o briefing e prepare uma solicitação — sem prometer cadastro instantâneo enquanto o Core não oferece self-service signup.">
      <div className="request-layout">
        <aside><span className="section-label">PRÓXIMOS PASSOS</span><ol><li><b>01</b><div><strong>Contexto</strong><p>Volume, integração e objetivo.</p></div></li><li><b>02</b><div><strong>Avaliação</strong><p>Aderência técnica e comercial.</p></div></li><li><b>03</b><div><strong>Onboarding</strong><p>Contrato, credenciais e Store no Core.</p></div></li></ol><div className="request-security"><Icon name="shield" /><p><b>Credenciais somente após onboarding.</b><span>Nunca inclua chaves, tokens ou dados de clientes neste formulário.</span></p></div></aside>
        <div className="content-card request-card"><h2>Solicitação empresarial</h2><p>Ao finalizar, você poderá revisar o briefing no seu aplicativo de e-mail antes de enviá-lo à equipe.</p><AccessRequestForm /></div>
      </div>
    </PublicPage>
  );
}
