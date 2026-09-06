import { and, asc, desc, eq, isNull } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import { apps, deals } from "@/db/schema";

const dealFields = {
  id: deals.id,
  appId: deals.appId,
  discountPercent: deals.discountPercent,
  code: deals.code,
  url: deals.url,
  startsAt: deals.startsAt,
  endsAt: deals.endsAt,
  updatedAt: deals.updatedAt,
  appName: apps.name,
  appSlug: apps.slug,
  appStatus: apps.status,
};

export async function getDealsDashboardData() {
  const database = await getDatabase();
  const [records, availableApps] = await Promise.all([
    database.select(dealFields).from(deals)
      .innerJoin(apps, eq(apps.id, deals.appId))
      .where(isNull(apps.deletedAt))
      .orderBy(desc(deals.startsAt)),
    database.select({ id: apps.id, name: apps.name, slug: apps.slug }).from(apps)
      .leftJoin(deals, eq(deals.appId, apps.id))
      .where(and(eq(apps.status, "published"), isNull(apps.deletedAt), isNull(deals.id)))
      .orderBy(asc(apps.name)),
  ]);
  const now = Date.now();
  return {
    deals: records,
    availableApps,
    referenceTime: now,
    stats: {
      active: records.filter((deal) => deal.startsAt.getTime() <= now && deal.endsAt.getTime() > now).length,
      scheduled: records.filter((deal) => deal.startsAt.getTime() > now).length,
      expired: records.filter((deal) => deal.endsAt.getTime() <= now).length,
      total: records.length,
    },
  };
}

export async function getDealEditorData(id: string) {
  const database = await getDatabase();
  const rows = await database.select(dealFields).from(deals)
    .innerJoin(apps, eq(apps.id, deals.appId))
    .where(and(eq(deals.id, id), isNull(apps.deletedAt))).limit(1);
  return rows[0] ?? null;
}
