import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { DealsSection } from "@/components/home/deals-section";
import { PublicShell } from "@/components/public-site";
import { getActiveDeals } from "@/lib/deals-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Deals",
  description: "Limited-time offers on selected macOS applications.",
  robots: { index: false, follow: false },
};

export default async function DealsPage() {
  const { env } = await getCloudflareContext({ async: true });
  if (env.APP_ENV !== "local") notFound();
  const deals = await getActiveDeals();

  return (
    <PublicShell>
      <main className="deals-page" id="main-content">
        <DealsSection deals={deals} />
      </main>
    </PublicShell>
  );
}
