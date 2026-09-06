import { ApplicationDirectory } from "@/components/home/application-directory";
import { HomeHero } from "@/components/home/home-hero";
import { PublicShell } from "@/components/public-site";
import { getHomepageDirectoryData } from "@/lib/apps-data";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const requestedView = (await searchParams).view;
  const view = requestedView === "trending" || requestedView === "latest" ? requestedView : "hot";
  const { applications, heroApplications } = await getHomepageDirectoryData(undefined, view);
  return (
    <PublicShell>
      <main id="main-content">
        <HomeHero applications={heroApplications} />
        <ApplicationDirectory activeView={view} applications={applications} />
      </main>
    </PublicShell>
  );
}
