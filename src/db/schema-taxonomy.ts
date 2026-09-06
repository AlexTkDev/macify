import { index, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { apps } from "@/db/schema-apps";
import { timestamp } from "@/db/schema-helpers";

export const categories = sqliteTable(
  "categories",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at"),
  },
  (table) => [uniqueIndex("categories_slug_unique").on(table.slug)],
);

export const appCategories = sqliteTable(
  "app_categories",
  {
    appId: text("app_id").notNull().references(() => apps.id, { onDelete: "cascade" }),
    categoryId: text("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.appId, table.categoryId] }),
    index("app_categories_category_idx").on(table.categoryId, table.appId),
  ],
);
