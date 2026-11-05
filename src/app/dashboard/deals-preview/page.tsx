import type { Metadata } from "next";
import { DealsSection } from "@/components/deals/deals-section";
import { getActiveDeals } from "@/lib/deals/deals-data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Previous deals layout",
  robots: { index: false, follow: false, nocache: true },
};

// Access is protected by the dashboard layout's existing admin authentication.
export default async function DealsPreviewPage() {
  const deals = await getActiveDeals();
  return (
    <div className="public-site">
      <main className="deals-page" id="main-content">
        <DealsSection deals={deals} />
      </main>
    </div>
  );
}
