import Link from "next/link";
import type { ReactNode } from "react";
import { Brand } from "@/components/brand";
import { Icon } from "@/components/icons";
import { ButtonLink } from "@/components/ui/primitives";

const publicLinks = [
  { href: "/#plataforma", label: "Produto" },
  { href: "/pricing", label: "Preços" },
  { href: "/docs", label: "Documentação" },
  { href: "/status", label: "Status" }
];

export function PublicHeader({ dark = true }: { dark?: boolean }) {
  return (
    <header className={`public-header${dark ? " is-dark" : ""}`}>
      <nav className="public-header-inner shell" aria-label="Navegação principal">
        <Brand />
        <div className="public-header-links">
          {publicLinks.map((item) => <Link href={item.href} key={item.href}>{item.label}</Link>)}
        </div>
        <div className="public-header-actions">
          <Link className="public-login" href="/login">Entrar</Link>
          <ButtonLink compact href="/request-access">Solicitar acesso <Icon name="arrow" /></ButtonLink>
        </div>
        <details className="public-mobile-menu">
          <summary aria-label="Abrir menu"><span /><span /><span /></summary>
          <div>
            {publicLinks.map((item) => <Link href={item.href} key={item.href}>{item.label}</Link>)}
            <Link href="/login">Entrar</Link>
            <Link className="mobile-menu-cta" href="/request-access">Solicitar acesso</Link>
          </div>
        </details>
      </nav>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="v2-footer">
      <div className="shell footer-main">
        <div><Brand /><p>Infraestrutura PIX para empresas modernas.<br />Uma camada de produto sobre o XPayments Core.</p></div>
        <div><b>Produto</b><Link href="/#plataforma">Soluções</Link><Link href="/#wallet">Wallet BRL</Link><Link href="/pricing">Preços</Link></div>
        <div><b>Desenvolvedores</b><Link href="/docs">Documentação</Link><Link href="/status">Status verificável</Link><Link href="/contact">Contato</Link></div>
        <div><b>Legal</b><Link href="/legal/terms">Termos</Link><Link href="/legal/privacy">Privacidade</Link><Link href="/legal/cookies">Cookies</Link></div>
      </div>
      <div className="shell footer-base"><span>© 2026 PagarPIX. Todos os direitos reservados.</span><Link href="/status"><i /> Consultar disponibilidade dos serviços</Link></div>
    </footer>
  );
}

export function PublicLayout({ children, darkHeader = true }: { children: ReactNode; darkHeader?: boolean }) {
  return <><PublicHeader dark={darkHeader} />{children}<PublicFooter /></>;
}
