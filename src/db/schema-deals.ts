import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { apps } from "@/db/schema-apps";
import { timestamp } from "@/db/schema-helpers";

export const deals = sqliteTable(
  "deals",
  {
    id: text("id").primaryKey(),
    appId: text("app_id").notNull().references(() => apps.id, { onDelete: "cascade" }),
    discountPercent: integer("discount_percent").notNull(),
    code: text("code"),
    url: text("url").notNull(),
    startsAt: integer("starts_at", { mode: "timestamp_ms" }).notNull(),
    endsAt: integer("ends_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
  },
  (table) => [
    uniqueIndex("deals_app_unique").on(table.appId),
    index("deals_active_window_idx").on(table.startsAt, table.endsAt),
  ],
);
