import { ApplicationDirectorySwitcher } from "@/components/home/application-directory-switcher";
import { HomeHero } from "@/components/home/home-hero";
import { PublicShell } from "@/components/public-site";
import { Suspense } from "react";
import { getHomepageDirectoryData, getHomepageHeroData } from "@/lib/directory-search-data";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const requestedView = (await searchParams).view;
  const view = requestedView === "trending" || requestedView === "latest" ? requestedView : "hot";
  const heroApplications = await getHomepageHeroData();
  return (
    <PublicShell>
      <main id="main-content">
        <HomeHero applications={heroApplications} />
        <Suspense fallback={<ApplicationDirectorySwitcher initialView={view} applications={[]} loading />}>
          <HomepageDirectory view={view} />
        </Suspense>
      </main>
    </PublicShell>
  );
}

async function HomepageDirectory({ view }: {
  view: "hot" | "trending" | "latest";
}) {
  const directory = await getHomepageDirectoryData(undefined, view);
  return <ApplicationDirectorySwitcher initialView={view} applications={directory.applications} />;
}
