import type { Metadata } from "next";
import { Caprasimo, Urbanist } from "next/font/google";
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
    title: "Macify — Useful macOS apps, carefully selected",
    description:
      "Discover useful, beautifully made Mac applications with clear pricing and practical editorial context.",
    url: "https://macify.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "Macify — Useful macOS apps, carefully selected",
    description:
      "Discover useful, beautifully made Mac applications with clear pricing and practical editorial context.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html data-scroll-behavior="smooth" lang="en">
      <body className={`${urbanist.variable} ${caprasimo.variable}`}>{children}</body>
    </html>
  );
}
