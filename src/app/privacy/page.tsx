import type { Metadata } from "next";
import Link from "next/link";
import { PolicyLayout } from "@/components/policy-layout";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What data the current version of Macify handles and why.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <PolicyLayout eyebrow="Plain-language notice" title="Privacy" description="The current version of Macify is a public application directory. It does not offer user accounts, subscriptions, or payments.">
      <section><h2>Information you provide</h2><p>The public directory does not currently collect profile information or accept public submissions. The editorial dashboard is a private management surface and is not intended for public use.</p></section>
      <section><h2>Technical information</h2><p>When Macify is deployed, its hosting provider may process standard request information such as IP address, browser details, requested pages, timestamps, and security signals. This information is used to deliver the site, prevent abuse, and diagnose reliability problems.</p></section>
      <section><h2>Cookies and analytics</h2><p>Macify does not currently include advertising trackers or a product analytics service. If analytics, accounts, authentication, or payments are added, this notice will be updated before those features are made public.</p></section>
      <section><h2>Application links</h2><p>Application profiles link to external developer websites and may link to YouTube. Those services operate under their own privacy policies. Macify does not control information they collect after you leave this site.</p></section>
      <section><h2>Storage and service providers</h2><p>Application records and media are designed to use Cloudflare D1 and R2. Cloudflare Workers may deliver pages and media. Service-provider access is limited to what is needed to operate, secure, and maintain the directory.</p></section>
      <section><h2>Changes and questions</h2><p>Material changes will be reflected on this page with a new update date. Before launch, the site owner should add a working privacy contact address here.</p><p>For how listings are selected, read the <Link href="/editorial-policy">editorial policy</Link>.</p></section>
    </PolicyLayout>
  );
}
