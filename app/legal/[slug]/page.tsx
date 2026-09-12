import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicPage } from "@/components/public-page";

const pages = {
  terms: {
    label: "TERMOS DE USO",
    title: "Termos claros para uma infraestrutura crítica.",
    intro: "Condições gerais preliminares para utilização dos sites e interfaces PagarPIX.",
    body: [
      ["Natureza do serviço", "PagarPIX é uma camada tecnológica de produto e experiência sobre a infraestrutura XPayments. As funcionalidades financeiras disponíveis dependem do contrato, onboarding, análise de risco, providers habilitados e jurisdição aplicável."],
      ["Conta e segurança", "O utilizador é responsável por manter credenciais seguras, autorizar apenas operadores legítimos e comunicar qualquer suspeita de acesso indevido. Credenciais de API devem permanecer exclusivamente em ambiente server-side."],
      ["Operações", "Pagamentos, saldos, reservas, liquidações, estornos e outras movimentações são registados pelo XPayments Core. A interface PagarPIX não constitui um ledger financeiro independente."],
      ["Disponibilidade", "Manutenções, dependências externas, instituições participantes e providers podem afetar a disponibilidade. Níveis de serviço específicos serão definidos em contrato."],
      ["Versão final", "Os termos comerciais e regulatórios completos devem ser publicados antes da abertura pública e prevalecerão sobre este texto institucional preliminar."]
    ]
  },
  privacy: {
    label: "PRIVACIDADE",
    title: "Dados tratados com propósito e controlo.",
    intro: "Resumo preliminar de como os dados podem circular entre o PagarPIX e o XPayments Core.",
    body: [
      ["Dados tratados", "Podem ser tratados dados cadastrais de merchants, utilizadores autorizados, compradores, transações, dispositivos, logs técnicos e informações necessárias à prevenção de fraude e ao cumprimento legal."],
      ["Finalidades", "Autenticação, prestação do serviço, processamento de pagamentos, conciliação, segurança, suporte, auditoria e atendimento de obrigações legais."],
      ["Arquitetura", "O frontend não armazena credenciais de providers nem mantém um banco financeiro paralelo. Dados financeiros canónicos pertencem ao XPayments Core."],
      ["Direitos", "Pedidos de acesso, correção, eliminação ou oposição serão tratados conforme a legislação aplicável e os prazos de retenção obrigatórios."],
      ["Versão final", "A política definitiva deverá identificar controlador, operadores, base legal, retenção, transferências internacionais e canal do encarregado antes do lançamento público."]
    ]
  },
  cookies: {
    label: "COOKIES",
    title: "Cookies essenciais, primeiro.",
    intro: "A plataforma utiliza o mínimo necessário para segurança, sessão e funcionamento.",
    body: [
      ["Sessão", "A autenticação utiliza cookie HttpOnly, Secure em produção e SameSite Lax, reduzindo a exposição do token ao código executado no browser."],
      ["Preferências", "Cookies ou armazenamento local de preferências só devem ser utilizados quando necessários à experiência."],
      ["Analytics", "Ferramentas não essenciais de medição ou marketing deverão depender da configuração e do consentimento exigido pela legislação aplicável."],
      ["Controlo", "O utilizador poderá gerir cookies não essenciais através do painel de preferências quando essas tecnologias forem ativadas."]
    ]
  }
} as const;

export function generateStaticParams() {
  return Object.keys(pages).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = pages[slug as keyof typeof pages];
  return page ? { title: page.label } : {};
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = pages[slug as keyof typeof pages];
  if (!page) notFound();
  return (
    <PublicPage eyebrow={page.label} title={page.title} intro={page.intro}>
      <article className="content-card">
        {page.body.map(([title, text]) => <section key={title}><h2>{title}</h2><p>{text}</p></section>)}
      </article>
    </PublicPage>
  );
}
