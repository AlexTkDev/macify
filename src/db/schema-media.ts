import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { apps } from "@/db/schema-apps";
import { timestamp } from "@/db/schema-helpers";

export const mediaAssets = sqliteTable(
  "media_assets",
  {
    id: text("id").primaryKey(),
    appId: text("app_id").references(() => apps.id, { onDelete: "cascade" }),
    role: text("role", { enum: ["icon", "preview_image", "screenshot"] }).notNull(),
    storageKey: text("storage_key").notNull(),
    mimeType: text("mime_type").notNull(),
    byteSize: integer("byte_size").notNull(),
    width: integer("width"),
    height: integer("height"),
    checksum: text("checksum").notNull(),
    sourceUrl: text("source_url"),
    altText: text("alt_text"),
    createdAt: timestamp("created_at"),
  },
  (table) => [
    uniqueIndex("media_assets_storage_key_unique").on(table.storageKey),
    index("media_assets_app_role_idx").on(table.appId, table.role),
    index("media_assets_checksum_idx").on(table.checksum),
  ],
);
