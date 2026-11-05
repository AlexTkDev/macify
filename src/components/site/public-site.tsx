import type { ReactNode } from "react";
import Script from "next/script";
import { GitHubStarCount } from "@/components/site/github-star-count";
import { PublicHeaderNavigation } from "@/components/site/public-header-navigation";
import { PublicFooter } from "@/components/site/public-footer";
import { BlackFridaySheet } from "@/components/site/black-friday-sheet";

function PublicHeader() {
  return (
    <header className="public-header">
      <div className="public-header-inner">
        <PublicHeaderNavigation />
        <div className="public-header-actions">
          <GitHubStarCount />
        </div>
      </div>
    </header>
  );
}

type PromotionIcon = { slug: string; name: string; storageKey: string };

export function PublicShell({ children, showFooter = true, promotionIcons }: {
  children: ReactNode;
  showFooter?: boolean;
  promotionIcons?: PromotionIcon[];
}) {
  return (
    <div className="public-site">
      <Script
        data-domain="macify.app"
        data-website-id="dfid_Moyh2sl29BQAIQp2E4BmV"
        src="/js/script.js"
        strategy="afterInteractive"
      />
      <a className="skip-link" href="#main-content">Skip to content</a>
      {promotionIcons && <BlackFridaySheet icons={promotionIcons} />}
      <PublicHeader />
      <div className="public-page-content">{children}</div>
      {showFooter && <PublicFooter />}
    </div>
  );
}
