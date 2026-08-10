import { ApplicationDirectory } from "@/components/home/application-directory";
import { HomeHero } from "@/components/home/home-hero";
import { PublicShell } from "@/components/public-site";
import { getHomepageDirectoryData } from "@/lib/apps-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { applications, heroApplications } = await getHomepageDirectoryData();
  return (
    <PublicShell>
      <main id="main-content">
        <HomeHero applications={heroApplications} />
        <ApplicationDirectory applications={applications} />
      </main>
    </PublicShell>
  );
}
