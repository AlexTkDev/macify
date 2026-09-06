import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { apps } from "@/db/schema-apps";
import { timestamp } from "@/db/schema-helpers";

export type CataloguePreparedMedia = {
  id: string;
  role: "icon" | "preview_image" | "screenshot";
  storageKey: string;
  mimeType: string;
  byteSize: number;
  width: number | null;
  height: number | null;
  checksum: string;
  sourceUrl: string;
  altText: string;
};

export const catalogueRevisions = sqliteTable(
  "catalogue_revisions",
  {
    id: text("id").primaryKey(),
    appId: text("app_id").references(() => apps.id, { onDelete: "set null" }),
    appSlug: text("app_slug").notNull(),
    changeType: text("change_type", { enum: ["create", "update", "archive"] }).notNull(),
    status: text("status", { enum: ["pending", "published", "rejected", "failed"] }).notNull().default("pending"),
    sourceRepository: text("source_repository").notNull(),
    sourcePath: text("source_path").notNull(),
    sourceCommitSha: text("source_commit_sha").notNull(),
    manifestHash: text("manifest_hash").notNull(),
    manifest: text("manifest", { mode: "json" }).$type<Record<string, unknown> | null>(),
    preparedMedia: text("prepared_media", { mode: "json" }).$type<CataloguePreparedMedia[]>().notNull().default([]),
    errors: text("errors", { mode: "json" }).$type<string[]>().notNull().default([]),
    createdAt: timestamp("created_at"),
    reviewedAt: integer("reviewed_at", { mode: "timestamp_ms" }),
  },
  (table) => [
    uniqueIndex("catalogue_revisions_commit_path_unique").on(table.sourceCommitSha, table.sourcePath),
    index("catalogue_revisions_status_created_idx").on(table.status, table.createdAt),
    index("catalogue_revisions_app_slug_idx").on(table.appSlug, table.createdAt),
  ],
);
