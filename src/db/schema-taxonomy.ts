import { index, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { apps } from "@/db/schema-apps";
import { timestamp } from "@/db/schema-helpers";

export const tags = sqliteTable(
  "tags",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at"),
  },
  (table) => [uniqueIndex("tags_slug_unique").on(table.slug)],
);

export const appTags = sqliteTable(
  "app_tags",
  {
    appId: text("app_id").notNull().references(() => apps.id, { onDelete: "cascade" }),
    tagId: text("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.appId, table.tagId] }),
    index("app_tags_tag_idx").on(table.tagId, table.appId),
  ],
);
