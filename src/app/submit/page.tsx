import type { Metadata } from "next";

import { SubmissionPage } from "@/components/submission/submission-page";
import { PublicShell } from "@/components/site/public-site";
import "@/styles/public/pages/submission-page.css";

export const metadata: Metadata = {
  title: "Submit an app",
  description:
    "Built a useful Mac app? Submit it to Macify through GitHub, or let your AI agent prepare the listing. Read our eligibility and editorial standards.",
  alternates: { canonical: "/submit" },
  openGraph: {
    title: "Submit an app to Macify",
    description:
      "Good Mac apps deserve good company. Propose yours through GitHub or with help from your AI agent.",
    url: "/submit",
  },
};

export default function SubmitApplicationPage() {
  return (
    <PublicShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Submit an app to Macify",
            url: "https://macify.app/submit",
            description:
              "Eligibility, agent instructions, and GitHub submission guidance for proposing a Mac application to Macify.",
            isPartOf: { "@id": "https://macify.app/#website" },
          }).replace(/</g, "\\u003c"),
        }}
      />
      <SubmissionPage />
    </PublicShell>
  );
}
