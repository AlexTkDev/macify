import type { ReactNode } from "react";
import Link from "next/link";
import { Shuffle } from "lucide-react";
import { InlineAppSearch } from "@/components/inline-app-search";
import { MacifyLogo } from "@/components/macify-logo";

export function PublicHeader() {
  return (
    <header className="public-header">
      <div className="public-header-inner">
        <div className="public-brand-pill">
          {/* Future: replace this Macify placeholder with a DataFast-powered live current-visitors indicator. Keep Macify visible until that analytics integration is ready. */}
          <MacifyLogo showMark={false} />
        </div>
        <nav className="public-navigation" aria-label="Primary navigation">
          <Link className="public-home-link" href="/">Home</Link>
          <a className="public-surprise-link" href="/surprise">
            <span className="public-surprise-icon" aria-hidden="true"><Shuffle size={15} /></span>
            <span className="public-surprise-label">Surprise me</span>
          </a>
          <Link className="public-blog-link" href="/blog">Blog</Link>
          <Link className="public-submit-link" href="/submit">Submit app</Link>
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
      <div className="public-footer-panel">
        <div className="public-footer-main">
          <div className="public-footer-identity">
            <MacifyLogo />
            <p>Useful Mac applications, selected carefully and explained clearly.</p>
          </div>
          <div className="public-footer-links">
            <nav aria-label="Explore Macify">
              <p>Explore</p>
              <Link href="/">Home</Link>
              <Link href="/#all-apps">Browse apps</Link>
              <a href="/surprise">Surprise me</a>
            </nav>
            <nav aria-label="About Macify">
              <p>About</p>
              <Link href="/editorial-policy">Editorial policy</Link>
              <Link href="/privacy">Privacy</Link>
            </nav>
          </div>
          <div className="public-footer-reserve" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>
        <div className="public-footer-bottom">
          <p>© 2026 Macify. Independent, carefully maintained, and made for Mac users.</p>
          <p>Product names and artwork belong to their respective owners.</p>
        </div>
      </div>
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
