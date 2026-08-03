import Link from "next/link";

export function MacifyLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link className="brand" href="/" aria-label="Macify home">
      <span className="brand-mark" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </span>
      {!compact && <span className="brand-word">Macify</span>}
    </Link>
  );
}

