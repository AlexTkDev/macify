import type { ReactNode } from "react";
import Link from "next/link";
import { InlineAppSearch } from "@/components/inline-app-search";
import { MacifyLogo } from "@/components/macify-logo";

export function PublicHeader() {
  return (
    <header className="public-header">
      <div className="public-header-inner">
        <MacifyLogo />
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
      <div className="public-footer-lead">
        <MacifyLogo />
        <p>Useful Mac applications, selected carefully and explained clearly.</p>
      </div>
      <div className="public-footer-links">
        <nav aria-label="Explore Macify">
          <strong>Explore</strong>
          <Link href="/">Discover</Link>
        </nav>
        <nav aria-label="Macify policies">
          <strong>About</strong>
          <Link href="/editorial-policy">Editorial policy</Link>
          <Link href="/privacy">Privacy</Link>
        </nav>
      </div>
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
