import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://macify.app"),
  title: {
    default: "Macify — Useful macOS apps, carefully selected",
    template: "%s · Macify",
  },
  description:
    "A curated directory of useful macOS applications, with clear pricing, compatibility, alternatives, and editorial context.",
  applicationName: "Macify",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Macify",
    title: "Macify — Useful macOS apps, carefully selected",
    description:
      "Find useful Mac applications with clear pricing, compatibility, and alternatives.",
    url: "https://macify.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "Macify — Useful macOS apps, carefully selected",
    description:
      "Find useful Mac applications with clear pricing, compatibility, and alternatives.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html data-scroll-behavior="smooth" lang="en">
      <body>{children}</body>
    </html>
  );
}
