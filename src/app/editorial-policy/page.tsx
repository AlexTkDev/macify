import type { Metadata } from "next";
import Link from "next/link";
import { PolicyLayout } from "@/components/policy-layout";

export const metadata: Metadata = {
  title: "Editorial policy",
  description: "How Macify selects, describes, and maintains application listings.",
  alternates: { canonical: "/editorial-policy" },
};

export default function EditorialPolicyPage() {
  return (
    <PolicyLayout eyebrow="How the directory works" title="Editorial policy" description="Macify exists to make choosing Mac software easier. This policy explains what belongs in the directory and how each listing is prepared.">
      <section><h2>Selection</h2><p>Macify focuses on applications that run on macOS and solve a clear problem. Popularity can bring an app to our attention, but it does not guarantee inclusion. We value focused products, thoughtful interaction design, and software that explains its pricing and ownership clearly.</p></section>
      <section><h2>Listing information</h2><p>Each profile uses publicly available product information, official artwork, and direct links to the developer’s website. We aim to preserve an application’s official tagline and describe what a person can actually do with it. Pricing labels are kept short and are checked against the developer’s published pricing when a listing is prepared.</p></section>
      <section><h2>Tags and relationships</h2><p>Tags help people understand an application and discover similar tools. Related applications are selected to provide useful alternatives or complementary software, and those relationships work in both directions.</p></section>
      <section><h2>Independence</h2><p>A listing is not an endorsement from the application developer. Macify does not currently sell placement or accept payment for a more favorable description. If sponsored placement is introduced later, it will be labeled clearly and kept separate from editorial selections.</p></section>
      <section><h2>Corrections</h2><p>Applications change. Pricing, availability, and product details can become outdated. If you notice an error, contact the site owner with the application name, the incorrect detail, and a link to the current official information.</p><p><Link href="/privacy">Read the privacy notice</Link> for information about data handled by the site.</p></section>
    </PolicyLayout>
  );
}
