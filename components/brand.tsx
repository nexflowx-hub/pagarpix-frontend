import Link from "next/link";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link className="brand" href="/" aria-label="PagarPIX, página inicial">
      <span className="brand-mark" aria-hidden="true">
        <span />
        <span />
      </span>
      {!compact && (
        <span className="brand-name">
          Pagar<span>PIX</span>
        </span>
      )}
    </Link>
  );
}
