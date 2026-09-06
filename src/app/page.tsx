import { ApplicationDirectorySwitcher } from "@/components/home/application-directory-switcher";
import { HomeHero } from "@/components/home/home-hero";
import { PublicShell } from "@/components/public-site";
import { getHomepageDirectoryData } from "@/lib/apps-data";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const requestedView = (await searchParams).view;
  const view = requestedView === "trending" || requestedView === "latest" ? requestedView : "hot";
  const [hot, trending, latest] = await Promise.all([
    getHomepageDirectoryData(undefined, "hot"),
    getHomepageDirectoryData(undefined, "trending"),
    getHomepageDirectoryData(undefined, "latest"),
  ]);
  return (
    <PublicShell>
      <main id="main-content">
        <HomeHero applications={hot.heroApplications} />
        <ApplicationDirectorySwitcher
          initialView={view}
          views={{ hot: hot.applications, trending: trending.applications, latest: latest.applications }}
        />
      </main>
    </PublicShell>
  );
}
