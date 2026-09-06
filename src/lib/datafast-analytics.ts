import { getCloudflareContext } from "@opennextjs/cloudflare";

const pagesAnalyticsUrl = "https://datafa.st/api/v1/analytics/pages";
const applicationLimit = 30;

type DataFastEnv = CloudflareEnv & {
  DATAFAST_API_KEY?: string;
};

type DataFastPageAnalyticsResponse = {
  status?: string;
  data?: Array<{
    path?: string;
    visitors?: number;
  }>;
};

export type ApplicationVisit = {
  slug: string;
  visitors: number;
};

function utcDate(daysAgo: number) {
  const today = new Date();
  return new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - daysAgo))
    .toISOString().slice(0, 10);
}

function applicationSlugFromPath(path: string) {
  let decodedPath: string;
  try {
    decodedPath = decodeURIComponent(path);
  } catch {
    return null;
  }

  const match = /^\/apps\/([^/?#]+)\/?$/.exec(decodedPath);
  const slug = match?.[1]?.toLowerCase();
  return slug && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ? slug : null;
}

async function getApplicationVisits(startAt: string, endAt: string): Promise<ApplicationVisit[]> {
  const { env } = await getCloudflareContext({ async: true });
  const apiKey = (env as DataFastEnv).DATAFAST_API_KEY;
  if (!apiKey) return [];

  const query = new URLSearchParams({
    fields: "path,visitors",
    filter_page: "contains:/apps/",
    limit: "250",
    startAt,
    endAt,
    timezone: "UTC",
  });

  try {
    const response = await fetch(`${pagesAnalyticsUrl}?${query}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) return [];

    const payload = await response.json() as DataFastPageAnalyticsResponse;
    if (payload.status !== "success" || !Array.isArray(payload.data)) return [];

    const visitsBySlug = new Map<string, number>();
    for (const row of payload.data) {
      if (typeof row.path !== "string" || !Number.isFinite(row.visitors) || row.visitors === undefined) continue;
      const slug = applicationSlugFromPath(row.path);
      if (!slug) continue;
      visitsBySlug.set(slug, (visitsBySlug.get(slug) ?? 0) + Math.max(0, row.visitors));
    }

    return [...visitsBySlug]
      .map(([slug, visitors]) => ({ slug, visitors }))
      .sort((left, right) => right.visitors - left.visitors || left.slug.localeCompare(right.slug))
      .slice(0, 250);
  } catch {
    return [];
  }
}

export async function getHotApplicationVisits() {
  return (await getApplicationVisits(utcDate(6), utcDate(0))).slice(0, applicationLimit);
}

export async function getTrendingApplicationVisits() {
  const [current, previous] = await Promise.all([
    getApplicationVisits(utcDate(2), utcDate(0)),
    getApplicationVisits(utcDate(5), utcDate(3)),
  ]);
  const previousBySlug = new Map(previous.map(({ slug, visitors }) => [slug, visitors]));
  return current
    .map(({ slug, visitors }) => ({
      slug,
      visitors,
      score: (visitors - (previousBySlug.get(slug) ?? 0)) * Math.sqrt(visitors + 1),
    }))
    .sort((left, right) => right.score - left.score || right.visitors - left.visitors || left.slug.localeCompare(right.slug))
    .slice(0, applicationLimit);
}
