import type { Metadata } from "next";
import { PublicPage } from "@/components/public-page";
import { AccessRequestForm } from "@/components/access-request-form";
import { Icon } from "@/components/icons";

export const metadata: Metadata = { title: "Contato", description: "Converse com a equipe sobre API PIX, checkout, routing, Stores e conciliação.", alternates: { canonical: "/contact" } };

export default function ContactPage() {
  return (
    <PublicPage eyebrow="FALE COM A PAGARPIX" title="Vamos desenhar o seu fluxo PIX." intro="Conte-nos o volume esperado, o tipo de integração, as Stores envolvidas e os recursos de routing necessários.">
      <div className="contact-layout">
        <div><article className="contact-method"><span><Icon name="transactions" /></span><div><small>E-MAIL</small><h2>Fale com a equipe</h2><p>Solicitações comerciais e de integração são atendidas pelo canal do ecossistema XPayments.</p><a href="mailto:contact@xpayments.digital">contact@xpayments.digital ↗</a></div></article><article className="contact-method"><span><Icon name="pix" /></span><div><small>WHATSAPP</small><h2>Conversa direta</h2><p>Envie uma mensagem com o nome da empresa e o objetivo da integração.</p><a href="https://wa.me/5562992887416?text=Ol%C3%A1%2C%20gostaria%20de%20falar%20sobre%20o%20PagarPIX." target="_blank" rel="noreferrer">+55 62 99288-7416 ↗</a></div></article><div className="contact-trust"><Icon name="shield" /><p><b>Não envie credenciais.</b><span>Nunca compartilhe API keys, tokens de provider ou dados financeiros sensíveis por estes canais.</span></p></div></div>
        <div className="content-card contact-form-card"><span className="section-label">SOLICITAÇÃO ESTRUTURADA</span><h2>Prepare o briefing da operação.</h2><p>O formulário abre o seu aplicativo de e-mail; este frontend não armazena os dados.</p><AccessRequestForm compact /></div>
      </div>
    </PublicPage>
  );
}
