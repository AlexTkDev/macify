import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { apps } from "@/db/schema-apps";
import { timestamp } from "@/db/schema-helpers";

export const categories = sqliteTable(
  "categories",
  {
    id: text("id").primaryKey(),
    parentId: text("parent_id"),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
  },
  (table) => [
    uniqueIndex("categories_slug_unique").on(table.slug),
    index("categories_parent_order_idx").on(table.parentId, table.sortOrder),
  ],
);

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

export const appCategories = sqliteTable(
  "app_categories",
  {
    appId: text("app_id").notNull().references(() => apps.id, { onDelete: "cascade" }),
    categoryId: text("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
    isPrimary: integer("is_primary", { mode: "boolean" }).notNull().default(false),
  },
  (table) => [
    primaryKey({ columns: [table.appId, table.categoryId] }),
    index("app_categories_category_idx").on(table.categoryId, table.appId),
  ],
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
