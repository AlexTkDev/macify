import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatPricing, type BillingType, type PricingType } from "@/lib/pricing";

export type PublicAppSummary = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  pricingType: PricingType;
  billingType: BillingType;
  pricingDetails: string | null;
  category?: string;
  icon: { storageKey: string; altText: string | null } | null;
};

export function mediaUrl(storageKey: string) {
  return `/media/${storageKey.split("/").map(encodeURIComponent).join("/")}`;
}

type AppIconSize = 50 | 56 | 58 | 60 | 66 | 76;

export function PublicAppIcon({ app, size = 56 }: { app: Pick<PublicAppSummary, "name" | "icon">; size?: AppIconSize }) {
  const className = `public-app-icon public-app-icon-${size}`;
  return app.icon ? (
    <Image
      alt={app.icon.altText ?? `${app.name} icon`}
      className={className}
      height={size}
      src={mediaUrl(app.icon.storageKey)}
      unoptimized
      width={size}
    />
  ) : (
    <span className={`${className} public-app-icon-fallback`} aria-hidden="true">
      {app.name.slice(0, 2).toUpperCase()}
    </span>
  );
}

export function PublicAppCard({ app, index }: { app: PublicAppSummary; index?: number }) {
  return (
    <Link className="app-list-card" href={`/apps/${app.slug}`}>
      {typeof index === "number" && <span className="app-list-index">{String(index + 1).padStart(2, "0")}</span>}
      <PublicAppIcon app={app} />
      <span className="app-list-copy">
        <strong>{app.name}</strong>
        <small>{app.tagline}</small>
      </span>
      <span className="app-list-price">{formatPricing(app)}</span>
      <ArrowUpRight aria-hidden="true" size={16} />
    </Link>
  );
}
