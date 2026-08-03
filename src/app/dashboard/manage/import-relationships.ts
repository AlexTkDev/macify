import { getDatabase } from "@/db/client";
import { appRelationships } from "@/db/schema";

type Database = Awaited<ReturnType<typeof getDatabase>>;

export async function commitImportedRelationships(
  database: Database,
  pending: Array<{ appId: string; slugs: string[] }>,
  appIdsBySlug: Map<string, string>,
) {
  for (const relationship of pending) {
    for (const targetSlug of [...new Set(relationship.slugs)]) {
      const targetAppId = appIdsBySlug.get(targetSlug);
      if (!targetAppId || targetAppId === relationship.appId) continue;
      const [sourceAppId, targetId] = [relationship.appId, targetAppId].sort();
      await database
        .insert(appRelationships)
        .values({
          id: crypto.randomUUID(),
          sourceAppId,
          targetAppId: targetId,
          relationshipType: "related",
          confidence: 1,
          origin: "import",
          reviewedAt: new Date(),
          createdAt: new Date(),
        })
        .onConflictDoNothing();
    }
  }
}
