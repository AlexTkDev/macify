import type { Metadata } from "next";
import Link from "next/link";
import { PolicyLayout } from "@/components/policy-layout";

const description = "Bring your macOS application to people looking for their next useful tool.";
export const metadata: Metadata = {
  title: "Get Featured",
  description,
  alternates: { canonical: "/get-featured" },
  openGraph: { title: "Get Featured on Macify", description, url: "/get-featured" },
};

export default function GetFeaturedPage() {
  return (
    <PolicyLayout title="Get Featured" description={description} updatedAt="September 8, 2026">
      <section>
        <h2>A place in the spotlight</h2>
        <p>Featured applications appear first in the Hot view of Apps worth trying, followed by Editor’s Picks and the remaining curated applications. Trending remains ordered by measured interest, and Latest remains chronological. A gold check seal beside the application name identifies each featured listing.</p>
        <p>The seal indicates featured placement. It is not a security certification or a guarantee of performance.</p>
      </section>
      <section>
        <h2>What makes a good fit</h2>
        <p>Macify looks for useful, reliable macOS applications with a clear purpose, a trustworthy source, transparent pricing, and ongoing support.</p>
        <p>Every application is reviewed before inclusion. Featured placements follow the same <Link href="/editorial-policy">editorial standards</Link> as the rest of the directory.</p>
      </section>
      <section>
        <h2>Request consideration</h2>
        <p>Share your application’s name, official website, and Macify listing if it already has one. Include a short explanation of what it does, who it helps, and what makes it worth discovering.</p>
        <p>Provide current screenshots, pricing, supported macOS versions, and a way to contact you. Mention any preferred timing for the placement.</p>
        <p><a href="https://github.com/Beingpax/macify/issues/new?title=Featured%20application%20request">Request a featured placement on GitHub</a></p>
      </section>
      <section>
        <h2>What happens next</h2>
        <p>Macify reviews the application and the request before confirming any placement. Availability, timing, and any commercial terms are agreed before a placement goes live.</p>
        <p>A request does not guarantee acceptance. Paid placements and sponsorships are disclosed separately from editorial selections.</p>
      </section>
    </PolicyLayout>
  );
}
