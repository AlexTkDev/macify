import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PublicShell } from "@/components/public-site";

export function PolicyLayout({
  children,
  description,
  sections,
  title,
}: {
  children: ReactNode;
  description: string;
  sections: Array<{ id: string; label: string }>;
  title: string;
}) {
  return (
    <PublicShell>
      <main className="policy-page" id="main-content">
        <Link className="back-link" href="/"><ArrowLeft size={14} /> Back to Macify</Link>
        <header className="policy-intro">
          <h1>{title}</h1>
          <p>{description}</p>
          <small>Last updated September 7, 2026</small>
        </header>
        <nav className="policy-navigation" aria-label="On this page">
          <p>On this page</p>
          <ol>
            {sections.map((section) => (
              <li key={section.id}><a href={`#${section.id}`}>{section.label}</a></li>
            ))}
          </ol>
        </nav>
        <article className="policy-content">{children}</article>
      </main>
    </PublicShell>
  );
}
