import { DealSignupCard } from "@/components/deals/deal-signup-card";
import { DealsHeading } from "@/components/deals/deals-heading";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { DealCards } from "@/components/deals/deal-cards";
import { PublicAppIcon } from "@/components/site/public-app-card";
import type { getActiveDeals } from "@/lib/deals/deals-data";

type ActiveDeal = Awaited<ReturnType<typeof getActiveDeals>>[number];
const heroTicketSlugs = ["cleanshot-x", "bettertouchtool", "daisydisk"];

export function DealsSection({ deals }: { deals: ActiveDeal[] }) {
  if (!deals.length) {
    return (
      <section aria-labelledby="deals-title" className="deals-section deals-section-empty">
        <div className="deals-empty-state">
          <div className="deals-empty-copy">
            <h1 id="deals-title">No deals right now.</h1>
            <p>Macify only lists offers that are current and verified. The shelf is empty today, but the app collection is always open.</p>
            <div className="deals-empty-actions">
              <Link data-ui-button="" data-variant="primary" data-size="md" className="deals-hero-action site-action site-action--primary" href="/#all-apps">
                Browse Mac apps <ArrowRight aria-hidden="true" size={19} />
              </Link>
              <a data-ui-button="" data-variant="secondary" data-size="md" className="deals-empty-surprise site-action site-action--secondary" href="/surprise">Surprise me</a>
            </div>
            <Link className="deals-empty-explainer" href="/deals/how-it-works">How Macify deals work <ArrowUpRight aria-hidden="true" size={16} /></Link>
          </div>
          <div aria-hidden="true" className="deals-empty-art">
            <span className="deals-empty-ticket deals-empty-ticket-1"><i /></span>
            <span className="deals-empty-ticket deals-empty-ticket-2"><i /></span>
            <span className="deals-empty-ticket deals-empty-ticket-3"><i /></span>
            <span className="deals-empty-star deals-empty-star-1">✦</span>
            <span className="deals-empty-star deals-empty-star-2">✦</span>
            <span className="deals-empty-loop">↝</span>
          </div>
        </div>
      </section>
    );
  }
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
            <p>Current discounts on worthwhile macOS apps. Compare the offers here, then buy directly from the developers.</p>
            <a data-ui-button="" data-variant="primary" data-size="md" className="deals-hero-action site-action site-action--primary" href="#handpicked-deals">
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
                <PublicAppIcon app={deal} decorative size={96} />
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
      <p className="black-friday-deals-link"><Link href="/deals">Get notified about Black Friday deals <ArrowRight aria-hidden="true" size={17} /></Link></p>
      <DealsHeading />
      <div className="deals-grid">
        <DealCards deals={deals} />
        <DealSignupCard />
      </div>
    </section>
  );
}
