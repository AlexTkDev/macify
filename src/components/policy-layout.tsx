import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PublicShell } from "@/components/public-site";

export function PolicyLayout({
  children,
  description,
  title,
  updatedAt = "September 7, 2026",
}: {
  children: ReactNode;
  description: string;
  title: string;
  updatedAt?: string;
}) {
  return (
    <PublicShell>
      <main className="policy-page" id="main-content">
        <Link className="back-link" href="/"><ArrowLeft size={14} /> Back to Macify</Link>
        <header className="policy-intro">
          <h1>{title}</h1>
          <p>{description}</p>
          <small>Last updated {updatedAt}</small>
        </header>
        <article className="policy-content">{children}</article>
      </main>
    </PublicShell>
  );
}
