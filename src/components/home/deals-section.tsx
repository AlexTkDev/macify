import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { DealCodeButton } from "@/components/deal-code-button";
import { PublicAppIcon } from "@/components/public-app-card";
import type { getActiveDeals } from "@/lib/deals-data";

type ActiveDeal = Awaited<ReturnType<typeof getActiveDeals>>[number];
const heroDiscounts = [25, 40, 65, 55, 30];

export function DealsSection({ deals }: { deals: ActiveDeal[] }) {
  if (!deals.length) return null;
  const heroDeals = deals.slice(0, 3);

  return (
    <section aria-labelledby="deals-title" className="deals-section">
      <header className="deals-hero">
        <div className="deals-hero-stage">
          <div aria-hidden="true" className="deals-hero-art">
            {heroDeals.map((deal, index) => (
              <span className={`deals-orbit-icon deals-orbit-icon-${index + 1}`} key={`icon-${deal.id}`}>
                <PublicAppIcon app={deal} decorative priority={index === 0} size={96} />
              </span>
            ))}
            {heroDiscounts.map((discount, index) => (
              <span className={`deals-coupon deals-coupon-${index + 1}`} key={discount}>
                <span><b>{discount}%</b><small>off</small></span>
              </span>
            ))}
          </div>
          <div className="deals-hero-copy">
            <h1 id="deals-title">
              <span>Great Mac apps.</span>
              <span>Now for less.</span>
            </h1>
            <p>A curated shelf of worthwhile macOS deals. No bundles, no detours—just useful Mac apps at friendlier prices.</p>
            <a className="deals-hero-action" href="#handpicked-deals">View deals</a>
          </div>
        </div>
        <div className="deals-featured" aria-label="Featured deals">
          {heroDeals.map((deal) => (
            <Link className="deals-featured-app" href={`/apps/${deal.slug}`} key={deal.id} prefetch={false}>
              <span className="deals-featured-identity">
                <PublicAppIcon app={deal} decorative size={60} />
                <span><b>{deal.name}</b><small>{deal.tagline}</small></span>
              </span>
              <strong><span>{deal.discountPercent}% off</span></strong>
            </Link>
          ))}
        </div>
      </header>
      <div className="deals-heading" id="handpicked-deals">
        <h2><span>Handpicked deals.</span><em>At a friendlier price.</em></h2>
      </div>
      <div className="deals-grid">
        {deals.map((deal) => (
          <article className="deal-card" key={deal.id}>
            <div className="deal-card-app">
              <PublicAppIcon app={deal} decorative size={60} />
              <div>
                <Link href={`/apps/${deal.slug}`} prefetch={false}>{deal.name}</Link>
                <span className="deal-card-pricing">{deal.pricingDetails}</span>
              </div>
            </div>
            <p className="deal-card-description">{deal.tagline}</p>
            <div className="deal-card-offer">
              <strong><span>{deal.discountPercent}% off</span></strong>
            </div>
            <div className="deal-card-actions">
              {deal.code && <DealCodeButton code={deal.code} />}
              <a className="deal-card-action" href={deal.url} rel="noopener noreferrer" target="_blank">
                Visit site <ArrowUpRight aria-hidden="true" size={17} />
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
