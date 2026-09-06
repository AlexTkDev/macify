import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  Activity,
  BadgeCheck,
  BadgeDollarSign,
  BarChart3,
  CircleDollarSign,
  Coins,
  Gift,
  MousePointer2,
  ReceiptText,
  RefreshCw,
  Sparkles,
  Tag,
  TicketCheck,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { PublicShell } from "@/components/public-site";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Application fact styles",
  robots: { follow: false, index: false },
};

type Fact = {
  icon: LucideIcon;
  label: string;
  tone: "blue" | "green" | "orange" | "violet" | "yellow";
};

const paidFacts: Fact[] = [
  { icon: BadgeDollarSign, label: "Paid", tone: "orange" },
  { icon: TicketCheck, label: "$29 once", tone: "green" },
  { icon: Activity, label: "1,284 visits", tone: "violet" },
];

const freeFacts: Fact[] = [
  { icon: Gift, label: "Free", tone: "green" },
  { icon: Activity, label: "8,742 visits", tone: "violet" },
];

const directions: Array<{
  description: string;
  icons: [LucideIcon, LucideIcon, LucideIcon];
  name: string;
  style: string;
}> = [
  { name: "Soft tiles", description: "Calm color fields with crisp line icons.", style: "softTiles", icons: [Tag, BadgeCheck, BarChart3] },
  { name: "Ticket strip", description: "Compact, tactile labels with clipped corners.", style: "ticketStrip", icons: [BadgeDollarSign, TicketCheck, Activity] },
  { name: "Editorial marks", description: "Typography first, with small illustrated cues.", style: "editorialMarks", icons: [CircleDollarSign, ReceiptText, TrendingUp] },
  { name: "Mini panels", description: "A clear label and value hierarchy for quick scanning.", style: "miniPanels", icons: [Coins, BadgeCheck, BarChart3] },
  { name: "Color tabs", description: "Playful folded tabs anchored to a quiet baseline.", style: "colorTabs", icons: [Tag, TicketCheck, Activity] },
  { name: "Orbit", description: "Soft circular symbols with a light, airy rhythm.", style: "orbit", icons: [CircleDollarSign, BadgeCheck, TrendingUp] },
  { name: "Mac labels", description: "Compact utility labels inspired by native controls.", style: "macLabels", icons: [BadgeDollarSign, ReceiptText, BarChart3] },
  { name: "Highlight blocks", description: "Small colored shapes sit behind the key values.", style: "highlightBlocks", icons: [Tag, TicketCheck, MousePointer2] },
  { name: "Signal line", description: "Minimal information with a colorful activity signal.", style: "signalLine", icons: [Coins, BadgeCheck, Activity] },
  { name: "Friendly stamps", description: "A soft stamped quality with restrained rotation.", style: "friendlyStamps", icons: [BadgeDollarSign, Sparkles, RefreshCw] },
];

function PreviewRow({ facts, icons, variant }: { facts: Fact[]; icons: [LucideIcon, LucideIcon, LucideIcon]; variant: string }) {
  return (
    <div className={`${styles.factRow} ${styles[variant]}`}>
      {facts.map((fact, index) => {
        const Icon = icons[index === facts.length - 1 ? 2 : index];
        const [primary, ...rest] = fact.label.split(" ");
        return (
          <span className={`${styles.fact} ${styles[fact.tone]}`} key={fact.label}>
            <span className={styles.icon} aria-hidden="true"><Icon size={16} strokeWidth={2} /></span>
            <span className={styles.copy}><strong>{primary}</strong>{rest.length > 0 && <span> {rest.join(" ")}</span>}</span>
          </span>
        );
      })}
    </div>
  );
}

export default async function ApplicationFactsDesignPage() {
  const { env } = await getCloudflareContext({ async: true });
  if (env.APP_ENV !== "local") notFound();

  return (
    <PublicShell>
      <main className={styles.page} id="main-content">
        <header className={styles.header}>
          <p className={styles.context}>Application detail facts</p>
          <h1>Ten ways to make the numbers feel alive.</h1>
          <p>Every direction uses meaningful symbols for access, payment, and visits. Compare the same paid and free examples before choosing one for every application page.</p>
        </header>

        <div className={styles.variants}>
          {directions.map((direction, index) => (
            <section className={styles.variant} key={direction.name}>
              <header className={styles.variantHeader}>
                <span className={styles.number}>{String(index + 1).padStart(2, "0")}</span>
                <div><h2>{direction.name}</h2><p>{direction.description}</p></div>
              </header>
              <div className={styles.samples}>
                <div><span className={styles.sampleLabel}>Paid example</span><PreviewRow facts={paidFacts} icons={direction.icons} variant={direction.style} /></div>
                <div><span className={styles.sampleLabel}>Free example</span><PreviewRow facts={freeFacts} icons={direction.icons} variant={direction.style} /></div>
              </div>
            </section>
          ))}
        </div>
      </main>
    </PublicShell>
  );
}
