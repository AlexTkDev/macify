import type { ReactNode } from "react";
import Link from "next/link";
import { Shuffle } from "lucide-react";
import { InlineAppSearch } from "@/components/inline-app-search";
import { MacifyLogo } from "@/components/macify-logo";

export function PublicHeader() {
  return (
    <header className="public-header">
      <div className="public-header-inner">
        <MacifyLogo />
        <nav className="public-navigation" aria-label="Primary navigation">
          <a className="public-surprise-link" href="/surprise">
            <Shuffle aria-hidden="true" size={15} />
            Surprise me
          </a>
        </nav>
        <div className="public-header-actions">
          <InlineAppSearch />
        </div>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="public-footer">
      <MacifyLogo />
      <p className="public-footer-description">Useful Mac applications, selected carefully and explained clearly.</p>
      <nav aria-label="Macify information">
        <Link href="/editorial-policy">Editorial policy</Link>
        <Link href="/privacy">Privacy</Link>
      </nav>
      <p className="public-footer-note">Macify is an independent directory. Product names and artwork belong to their respective owners.</p>
    </footer>
  );
}

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="public-site">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <PublicHeader />
      {children}
      <PublicFooter />
    </div>
  );
}
