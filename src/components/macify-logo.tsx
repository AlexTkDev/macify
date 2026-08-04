import Link from "next/link";

export function MacifyLogo({ compact = false, href = "/" }: { compact?: boolean; href?: string }) {
  return (
    <Link className="brand" href={href} aria-label={href === "/dashboard" ? "Macify dashboard" : "Macify home"}>
      <span className="brand-mark" aria-hidden="true">
        <span>M</span>
      </span>
      {!compact && <span className="brand-word">Macify</span>}
    </Link>
  );
}
