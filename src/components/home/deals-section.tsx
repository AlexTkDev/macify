import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { DealCodeButton } from "@/components/deal-code-button";
import { PublicAppIcon } from "@/components/public-app-card";
import type { getActiveDeals } from "@/lib/deals-data";

type ActiveDeal = Awaited<ReturnType<typeof getActiveDeals>>[number];
const heroTicketSlugs = ["cleanshot-x", "bettertouchtool", "daisydisk"];

export function DealsSection({ deals }: { deals: ActiveDeal[] }) {
  if (!deals.length) return null;
  const heroDeals = deals.slice(0, 3);
  const preferredTicketDeals = heroTicketSlugs
    .map((slug) => deals.find((deal) => deal.slug === slug))
    .filter((deal): deal is ActiveDeal => Boolean(deal));
  const ticketDeals = preferredTicketDeals.length === 3 ? preferredTicketDeals : heroDeals;

  return (
    <section aria-labelledby="deals-title" className="deals-section">
      <header className="deals-hero">
        <div className="deals-hero-stage">
          <div className="deals-hero-copy">
            <h1 id="deals-title">
              <span>Great Mac apps.</span>
              <span>Now for less.</span>
            </h1>
            <p>A curated shelf of worthwhile macOS deals. No bundles, no detours, just useful Mac apps at friendlier prices.</p>
            <a className="deals-hero-action" href="#handpicked-deals">
              Browse deals <ArrowRight aria-hidden="true" size={19} />
            </a>
            <p className="deals-hero-disclaimer">
              <span aria-hidden="true">✳</span>
              Discounts and terms should be confirmed on the developer website.
            </p>
          </div>
          <div className="deals-ticket-stage" aria-label="Highlighted deals">
            {ticketDeals.map((deal, index) => (
              <Link className={`deals-ticket deals-ticket-${index + 1}`} href={`/apps/${deal.slug}`} key={deal.id} prefetch={false}>
                <PublicAppIcon app={deal} decorative priority={index === 0} size={96} />
                <span className="deals-ticket-copy">
                  <b>{deal.name}</b>
                  <small>{deal.tagline}</small>
                </span>
                <span aria-hidden="true" className="deals-ticket-perforation" />
                <strong className="deals-ticket-discount">
                  <span>{deal.discountPercent}% <small>off</small></span>
                </strong>
              </Link>
            ))}
            <span aria-hidden="true" className="deals-ticket-arrow">
              <svg viewBox="0 0 88 72">
                <path d="M76 8 C82 31 68 46 45 47 C30 48 17 54 10 65" />
                <path d="M12 49 L9 66 L26 61" />
              </svg>
            </span>
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
