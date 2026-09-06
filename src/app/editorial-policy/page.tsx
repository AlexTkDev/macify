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
    <PolicyLayout title="Editorial policy" description="How applications are chosen, researched, and described on Macify.">
      <section id="selection"><h2>What we include</h2><p>Macify features useful software built for macOS or offering a meaningful Mac experience. We look for applications with a clear purpose, a working official website, understandable pricing, and enough reliable information to evaluate them properly.</p><p>Popularity or a developer request does not guarantee inclusion. We may leave out or remove software that is abandoned, unsafe, misleading, or no longer meets the directory’s standards.</p></section>
      <section id="research"><h2>How we research</h2><p>We check official websites, documentation, release notes, pricing pages, public repositories, and reputable independent sources. Facts that change often, such as pricing, compatibility, licensing, and feature availability, are checked against current official information.</p></section>
      <section id="writing"><h2>How listings are written</h2><p>Each listing explains what the application does, who it is useful for, and any important limitation or tradeoff. We write in our own words, avoid unsupported marketing claims, and keep pricing, tags, and related-app labels consistent across the directory.</p><p>Product taglines and artwork may come from the developer and remain the property of their respective owners. Their use does not imply that the developer endorses Macify.</p></section>
      <section id="independence"><h2>Independence</h2><p>Macify does not sell rankings, favorable descriptions, or placement in related recommendations. Any future sponsorship, referral relationship, free product access, or other material benefit that could influence a listing will be disclosed clearly.</p></section>
      <section id="corrections"><h2>Corrections</h2><p>Applications change, so information can become outdated. If you notice an error, send the application name, the detail that needs correction, and a current source when possible. Credible safety, copyright, trademark, or availability concerns will also be reviewed.</p><p>For information about site data and analytics, read the <Link href="/privacy">privacy notice</Link>.</p></section>
    </PolicyLayout>
  );
}
