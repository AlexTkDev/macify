import type { Metadata } from "next";
import Link from "next/link";
import { PolicyLayout } from "@/components/policy-layout";

export const metadata: Metadata = {
  title: "Editorial policy",
  description: "How Macify selects, researches, and maintains application listings.",
  alternates: { canonical: "/editorial-policy" },
};

const sections = [
  { id: "selection", label: "What we include" },
  { id: "research", label: "How we research and write" },
  { id: "meaning", label: "What a listing means" },
  { id: "independence", label: "Commercial independence" },
  { id: "corrections", label: "Corrections and concerns" },
];

export default function EditorialPolicyPage() {
  return (
    <PolicyLayout
      title="Editorial policy"
      description="How applications earn and keep a place in the Macify directory."
      sections={sections}
    >
      <aside className="policy-summary" aria-labelledby="editorial-summary-title">
        <h2 id="editorial-summary-title">The short version</h2>
        <ul>
          <li>Macify chooses what to publish and does not sell rankings or favorable coverage.</li>
          <li>Listings are researched descriptions, not hands-on reviews unless clearly labeled.</li>
          <li>Developers and readers can report errors, but they cannot buy or control editorial decisions.</li>
        </ul>
      </aside>
      <section id="selection">
        <h2>What we include</h2>
        <p>Macify features useful software built for macOS or offering a meaningful Mac experience. We look for a clear purpose, a trustworthy source, understandable pricing, and enough reliable information to explain the application properly.</p>
        <p>This is a curated directory, not a complete catalogue. Popularity, a developer request, or a merged contribution does not guarantee publication. Macify may edit, decline, unpublish, or remove a listing when it is outdated, unsafe, misleading, unavailable, or no longer meets the directory’s standards.</p>
      </section>
      <section id="research">
        <h2>How we research and write</h2>
        <p>We use official websites, documentation, release notes, pricing pages, public repositories, and credible independent sources. Facts that change often, including price, compatibility, licensing, privacy, and availability, are checked against current sources.</p>
        <p>Listings explain what an application does, where it fits, and any important tradeoffs in Macify’s own words. A listing is a researched description, not a hands-on review unless it explicitly says otherwise.</p>
      </section>
      <section id="meaning">
        <h2>What a listing means</h2>
        <p>Inclusion means Macify considers the application useful enough to feature. It is not a warranty, security certification, or promise that the application will suit every person or workflow. Check the developer’s current terms, privacy information, system requirements, and pricing before relying on an application.</p>
        <p>Product names, trademarks, and artwork belong to their respective owners. Their appearance on Macify does not imply that the developer endorses or sponsors Macify.</p>
      </section>
      <section id="independence">
        <h2>Commercial independence</h2>
        <p>Rankings, favorable wording, featured placement, and related-application placement cannot be bought. Material sponsorships, affiliate relationships, or free access that could affect how a listing is understood will be disclosed clearly.</p>
        <p>Macify may earn a commission from some outbound links. That does not increase the price paid by the visitor or give a developer control over the listing.</p>
      </section>
      <section id="corrections">
        <h2>Corrections and concerns</h2>
        <p>Applications change, so listings can become outdated. Report an error with the application name, the detail that needs correction, and a current source when possible through the <a href="https://github.com/Beingpax/macify">Macify GitHub repository</a>.</p>
        <p>Credible safety, copyright, trademark, and availability concerns will be reviewed. Macify keeps final control over whether and how a listing changes. For site data and analytics, read the <Link href="/privacy">privacy notice</Link>.</p>
      </section>
    </PolicyLayout>
  );
}
