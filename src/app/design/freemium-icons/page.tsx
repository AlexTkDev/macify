import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { BadgePlus, CircleDollarSign, Coins, Gem, Layers3, MousePointer2, TicketCheck, type LucideIcon } from "lucide-react";
import { PublicShell } from "@/components/public-site";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Freemium icon options",
  robots: { follow: false, index: false },
};

const options: Array<{ description: string; icon: LucideIcon; name: string }> = [
  { name: "Coins", description: "Free access with additional value available for purchase.", icon: Coins },
  { name: "Layers", description: "A base tier with more capable tiers above it.", icon: Layers3 },
  { name: "Dollar circle", description: "Access is free, with pricing available inside the product.", icon: CircleDollarSign },
  { name: "Upgrade badge", description: "The free product can be expanded with a paid upgrade.", icon: BadgePlus },
  { name: "Gem", description: "A free core experience with premium features available.", icon: Gem },
];

function Fact({ children, icon: Icon, tone }: { children: React.ReactNode; icon: LucideIcon; tone: "blue" | "green" | "violet" }) {
  return (
    <span className={styles.fact}>
      <span className={`${styles.icon} ${styles[tone]}`} aria-hidden="true"><Icon size={19} strokeWidth={2.15} /></span>
      <span>{children}</span>
    </span>
  );
}

export default async function FreemiumIconOptionsPage() {
  const { env } = await getCloudflareContext({ async: true });
  if (env.APP_ENV !== "local") notFound();

  return (
    <PublicShell>
      <main className={styles.page} id="main-content">
        <header className={styles.header}>
          <p>Freemium fact icon</p>
          <h1>Five clearer options.</h1>
          <span>Only the Freemium icon changes. Pricing and visits stay exactly as they will appear on an application page.</span>
        </header>

        <div className={styles.options}>
          {options.map((option, index) => {
            const Icon = option.icon;
            return (
              <section className={styles.option} key={option.name}>
                <div className={styles.optionCopy}>
                  <span>{index + 1}</span>
                  <div><h2>{option.name}</h2><p>{option.description}</p></div>
                </div>
                <div className={styles.preview}>
                  <Fact icon={Icon} tone="blue"><strong>Freemium</strong></Fact>
                  <Fact icon={TicketCheck} tone="green"><span>€15 one-time purchase</span></Fact>
                  <Fact icon={MousePointer2} tone="violet"><strong>1,284</strong><span> visits</span></Fact>
                </div>
              </section>
            );
          })}
        </div>
      </main>
    </PublicShell>
  );
}
