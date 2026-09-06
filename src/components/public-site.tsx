import type { ReactNode } from "react";
import Link from "next/link";
import { Plus, Shuffle } from "lucide-react";
import { InlineAppSearch } from "@/components/inline-app-search";
import { LiveVisitorCount } from "@/components/live-visitor-count";
import { MacifyLogo } from "@/components/macify-logo";

const contributionGuideUrl = "https://github.com/Beingpax/macify/blob/main/CONTRIBUTING.md";

function PublicHeader() {
  return (
    <header className="public-header">
      <div className="public-header-inner">
        <div className="public-brand-pill">
          <LiveVisitorCount />
        </div>
        <nav className="public-navigation" aria-label="Primary navigation">
          <Link className="public-home-link" href="/">Home</Link>
          <Link className="public-categories-link" href="/categories">Categories</Link>
          <a className="public-surprise-link" href="/surprise" aria-label="Surprise me with an app">
            <span className="public-navigation-icon" aria-hidden="true"><Shuffle size={15} /></span>
            <span className="public-navigation-label">Surprise me</span>
          </a>
          <a
            className="public-submit-link"
            href={contributionGuideUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Submit an app on GitHub (opens in a new tab)"
          >
            <span className="public-navigation-icon" aria-hidden="true"><Plus size={15} /></span>
            <span className="public-navigation-label">Submit app</span>
          </a>
        </nav>
        <div className="public-header-actions">
          <InlineAppSearch />
        </div>
      </div>
    </header>
  );
}

function PublicFooter() {
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
              <Link href="/categories">Categories</Link>
              <a href="/surprise">Surprise me</a>
              <a href={contributionGuideUrl} target="_blank" rel="noreferrer">Submit an app</a>
            </nav>
            <nav aria-label="About Macify">
              <p>About</p>
              <Link href="/editorial-policy">Editorial policy</Link>
              <Link href="/privacy">Privacy</Link>
            </nav>
          </div>
        </div>
        <p className="public-footer-affiliate">
          Macify may earn a commission from qualifying purchases made through affiliate links on this website. <Link href="/privacy#affiliate-links">Learn about affiliate links</Link>.
        </p>
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
      <div className="public-page-content">{children}</div>
      <PublicFooter />
    </div>
  );
}
