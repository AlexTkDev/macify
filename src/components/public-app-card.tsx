import Image from "next/image";
import type { BillingType, PricingType } from "@/lib/pricing";

export type PublicAppSummary = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  pricingType: PricingType;
  billingType: BillingType;
  pricingDetails: string | null;
  icon: { storageKey: string; altText: string | null } | null;
};

export function mediaUrl(storageKey: string) {
  return `/media/${storageKey.split("/").map(encodeURIComponent).join("/")}`;
}

type AppIconSize = 50 | 56 | 58 | 60 | 66 | 76 | 96;

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
