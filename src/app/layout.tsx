import type { Metadata } from "next";
import { Caprasimo, Caveat, Urbanist } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import "../styles/tokens.css";
import "../styles/base.css";
import "../styles/public-shell.css";
import "../styles/public-components.css";
import "../styles/public-home.css";
import "../styles/public-home-sections.css";
import "../styles/public-application.css";
import "../styles/public-markdown.css";
import "../styles/public-policy.css";
import "../styles/dashboard-shell.css";
import "../styles/dashboard-content.css";
import "../styles/dashboard-management.css";
import "../styles/dashboard-forms.css";
import "../styles/dashboard-form-widgets.css";
import "../styles/dashboard-media.css";
import "../styles/editor-login.css";
import "../styles/responsive.css";
import "../styles/responsive-small.css";

const urbanist = Urbanist({
  subsets: ["latin"],
  variable: "--font-urbanist",
});

const caprasimo = Caprasimo({
  subsets: ["latin"],
  variable: "--font-caprasimo",
  weight: "400",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  weight: "500",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://macify.app"),
  title: {
    default: "Macify — Useful macOS apps, carefully selected",
    template: "%s · Macify",
  },
  description:
    "A considered directory of useful macOS applications, with clear pricing, related alternatives, and practical editorial context.",
  applicationName: "Macify",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Macify",
    title: "Mac apps worth making room for. | Macify",
    description: "A curated list of the most useful macOS applications.",
    url: "https://macify.app",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Mac apps worth making room for. — Macify",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mac apps worth making room for. | Macify",
    description: "A curated list of the most useful macOS applications.",
    images: ["/opengraph-image.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html data-scroll-behavior="smooth" lang="en">
      <head>
        <Script
          data-domain="macify.app"
          data-website-id="dfid_Moyh2sl29BQAIQp2E4BmV"
          src="/js/script.js"
          strategy="afterInteractive"
        />
      </head>
      <body className={`${urbanist.variable} ${caprasimo.variable} ${caveat.variable}`}>{children}</body>
    </html>
  );
}
