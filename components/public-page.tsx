import Link from "next/link";
import { Brand } from "@/components/brand";

export function PublicPage({
  eyebrow,
  title,
  intro,
  children
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <main className="public-page">
      <div className="public-nav">
        <nav className="nav shell">
          <Brand />
          <div className="nav-links"><Link href="/#produto">Produto</Link><Link href="/pricing">Preços</Link><Link href="/docs">Docs</Link><Link href="/status">Status</Link></div>
          <div className="nav-actions"><Link className="link-button" href="/login">Entrar</Link><Link className="button button-small" href="/login">Criar conta ↗</Link></div>
        </nav>
      </div>
      <header className="public-hero shell">
        <div className="eyebrow"><i /> {eyebrow}</div>
        <h1>{title}</h1>
        <p>{intro}</p>
      </header>
      <section className="public-content shell">{children}</section>
    </main>
  );
}
