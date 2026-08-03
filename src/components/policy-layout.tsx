import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PublicShell } from "@/components/public-site";

export function PolicyLayout({
  children,
  description,
  eyebrow,
  title,
}: {
  children: ReactNode;
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <PublicShell>
      <main className="policy-page" id="main-content">
        <Link className="back-link" href="/"><ArrowLeft size={14} /> Back to Macify</Link>
        <header className="policy-intro"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p><small>Last updated August 3, 2026</small></header>
        <article className="policy-content">{children}</article>
      </main>
    </PublicShell>
  );
}
