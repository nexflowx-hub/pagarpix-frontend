import type { Metadata } from "next";
import Link from "next/link";
import styles from "./dashboard-ops-nav.module.css";

export const metadata: Metadata = {
  title: "Conta empresarial",
  robots: { index: false, follow: false, nocache: true }
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <nav className={styles.nav} aria-label="Operações rápidas">
        <Link href="/dashboard/payouts">Solicitar saída</Link>
        <Link href="/dashboard/routing">Smart Routing</Link>
      </nav>
    </>
  );
}
