import Link from "next/link";
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons";

export function ButtonLink({
  href,
  children,
  variant = "primary",
  compact = false
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "quiet";
  compact?: boolean;
}) {
  return (
    <Link className={`ds-button ds-button-${variant}${compact ? " is-compact" : ""}`} href={href}>
      {children}
    </Link>
  );
}

export function StatusBadge({
  children,
  tone = "neutral"
}: {
  children: ReactNode;
  tone?: "success" | "warning" | "danger" | "info" | "neutral";
}) {
  return <span className={`status-badge status-${tone}`}>{children}</span>;
}

export function MoneyDisplay({ value, unavailableLabel = "Indisponível" }: { value: number | null; unavailableLabel?: string }) {
  if (value === null || !Number.isFinite(value)) {
    return <span className="money-unavailable">{unavailableLabel}</span>;
  }
  return (
    <span className="money-display">
      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)}
    </span>
  );
}

export function EmptyState({ icon, title, text }: { icon: IconName; title: string; text: string }) {
  return (
    <div className="empty-state">
      <span><Icon name={icon} /></span>
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  );
}

export function LoadingPanel({ lines = 3 }: { lines?: number }) {
  return (
    <div className="loading-panel" aria-label="Carregando dados" role="status">
      <span className="skeleton skeleton-title" />
      {Array.from({ length: lines }).map((_, index) => <span className="skeleton" key={index} />)}
    </div>
  );
}
