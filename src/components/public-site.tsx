import type { ReactNode } from "react";
import Link from "next/link";
import Script from "next/script";
import { Plus, Shuffle, Star } from "lucide-react";
import { InlineAppSearch } from "@/components/inline-app-search";
import { LiveVisitorCount } from "@/components/live-visitor-count";
import { PublicFooter } from "@/components/public-footer";

const contributionGuideUrl = "https://github.com/Beingpax/macify/blob/main/CONTRIBUTING.md";

function PublicHeader() {
  return (
    <header className="public-header">
      <div className="public-header-inner">
        <div className="public-community-links">
          <div className="public-brand-pill">
            <LiveVisitorCount />
          </div>
          <a
            className="public-brand-pill public-github-link"
            href="https://github.com/Beingpax/macify"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Star Macify on GitHub (opens in a new tab)"
          >
            <Star size={15} aria-hidden="true" />
            <span>Star on GitHub</span>
          </a>
        </div>
        <nav className="public-navigation" aria-label="Primary navigation">
          <Link className="public-home-link" href="/">Home</Link>
          <Link className="public-deals-link" href="/deals">Deals</Link>
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

export async function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="public-site">
      <Script
        data-domain="macify.app"
        data-website-id="dfid_Moyh2sl29BQAIQp2E4BmV"
        src="/js/script.js"
        strategy="afterInteractive"
      />
      <a className="skip-link" href="#main-content">Skip to content</a>
      <PublicHeader />
      <div className="public-page-content">{children}</div>
      <PublicFooter />
    </div>
  );
}
