import { index, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { apps } from "@/db/schema-apps";
import { timestamp } from "@/db/schema-helpers";

export const appRelationships = sqliteTable(
  "app_relationships",
  {
    id: text("id").primaryKey(),
    sourceAppId: text("source_app_id").notNull().references(() => apps.id, { onDelete: "cascade" }),
    targetAppId: text("target_app_id").notNull().references(() => apps.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at"),
  },
  (table) => [
    uniqueIndex("app_relationships_pair_unique").on(
      table.sourceAppId,
      table.targetAppId,
    ),
    index("app_relationships_target_idx").on(table.targetAppId),
  ],
);
