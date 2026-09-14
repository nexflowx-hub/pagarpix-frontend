import Link from "next/link";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link className="brand" href="/" aria-label="PagarPIX, página inicial">
      <svg className="brand-mark" viewBox="0 0 40 40" aria-hidden="true">
        <path d="M20 2.5 29 11.5 20 20.5 11 11.5 20 2.5Z" />
        <path d="m20 19.5 9 9-9 9-9-9 9-9Z" />
        <path d="m10.5 12 8 8-8 8-8-8 8-8Z" />
        <path d="m29.5 12 8 8-8 8-8-8 8-8Z" />
      </svg>
      {!compact && (
        <span className="brand-name">
          Pagar<span>PIX</span>
        </span>
      )}
    </Link>
  );
}
