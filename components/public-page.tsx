import type { ReactNode } from "react";
import { PublicLayout } from "@/components/public-layout";

export function PublicPage({
  eyebrow,
  title,
  intro,
  children,
  notice
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
  notice?: ReactNode;
}) {
  return (
    <PublicLayout>
      <main className="public-page">
        <header className="public-hero">
          <div className="public-hero-grid" aria-hidden="true" />
          <div className="shell public-hero-inner">
            <div className="v2-eyebrow"><i /> {eyebrow}</div>
            <h1>{title}</h1>
            <p>{intro}</p>
          </div>
        </header>
        {notice ? <div className="shell public-notice">{notice}</div> : null}
        <section className="public-content shell">{children}</section>
      </main>
    </PublicLayout>
  );
}
