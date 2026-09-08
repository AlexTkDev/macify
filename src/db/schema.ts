import { sql } from "drizzle-orm";
import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const timestamp = (name: string) => integer(name, { mode: "timestamp_ms" })
  .notNull()
  .default(sql`(unixepoch() * 1000)`);

export const apps = sqliteTable("apps", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  websiteUrl: text("website_url").notNull(),
  tagline: text("tagline").notNull(),
  description: text("description").notNull(),
  pricingType: text("pricing_type", { enum: ["free", "freemium", "paid"] }).notNull(),
  billingType: text("billing_type", { enum: ["one_time", "subscription"] }),
  pricingDetails: text("pricing_details"),
  sourceType: text("source_type", { enum: ["open_source", "closed_source"] }).notNull(),
  youtubeUrl: text("youtube_url"),
  status: text("status", { enum: ["draft", "published", "archived"] }).notNull().default("draft"),
  isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(false),
  isEditorsPick: integer("is_editors_pick", { mode: "boolean" }).notNull().default(false),
  featuredAt: integer("featured_at", { mode: "timestamp_ms" }),
  publishedAt: integer("published_at", { mode: "timestamp_ms" }),
  deletedAt: integer("deleted_at", { mode: "timestamp_ms" }),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
}, (table) => [
  uniqueIndex("apps_slug_unique").on(table.slug),
  uniqueIndex("apps_website_url_unique").on(table.websiteUrl),
  index("apps_status_published_idx").on(table.status, table.publishedAt),
  index("apps_name_idx").on(table.name),
]);

export const adminLoginAttempts = sqliteTable("admin_login_attempts", {
  id: text("id").primaryKey(),
  attempts: integer("attempts").notNull().default(0),
  expiresAt: integer("expires_at").notNull(),
}, (table) => [index("admin_login_attempts_expires_idx").on(table.expiresAt)]);

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at"),
}, (table) => [uniqueIndex("categories_slug_unique").on(table.slug)]);

export const appCategories = sqliteTable("app_categories", {
  appId: text("app_id").notNull().references(() => apps.id, { onDelete: "cascade" }),
  categoryId: text("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
}, (table) => [
  primaryKey({ columns: [table.appId, table.categoryId] }),
  index("app_categories_category_idx").on(table.categoryId, table.appId),
]);

export const appRelationships = sqliteTable("app_relationships", {
  id: text("id").primaryKey(),
  sourceAppId: text("source_app_id").notNull().references(() => apps.id, { onDelete: "cascade" }),
  targetAppId: text("target_app_id").notNull().references(() => apps.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at"),
}, (table) => [
  uniqueIndex("app_relationships_pair_unique").on(table.sourceAppId, table.targetAppId),
  index("app_relationships_target_idx").on(table.targetAppId),
]);

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

export const catalogueRevisions = sqliteTable("catalogue_revisions", {
  id: text("id").primaryKey(),
  appId: text("app_id").references(() => apps.id, { onDelete: "set null" }),
  appSlug: text("app_slug").notNull(),
  changeType: text("change_type", { enum: ["create", "update", "archive"] }).notNull(),
  status: text("status", { enum: ["pending", "published", "rejected", "failed", "resolved", "dismissed", "superseded"] }).notNull().default("pending"),
  sourceRepository: text("source_repository").notNull(),
  sourcePath: text("source_path").notNull(),
  sourceCommitSha: text("source_commit_sha").notNull(),
  manifestHash: text("manifest_hash").notNull(),
  manifest: text("manifest", { mode: "json" }).$type<Record<string, unknown> | null>(),
  preparedMedia: text("prepared_media", { mode: "json" }).$type<CataloguePreparedMedia[]>().notNull().default([]),
  errors: text("errors", { mode: "json" }).$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at"),
  reviewedAt: integer("reviewed_at", { mode: "timestamp_ms" }),
}, (table) => [
  uniqueIndex("catalogue_revisions_commit_path_unique").on(table.sourceCommitSha, table.sourcePath),
  index("catalogue_revisions_status_created_idx").on(table.status, table.createdAt),
  index("catalogue_revisions_app_slug_idx").on(table.appSlug, table.createdAt),
]);

export const deals = sqliteTable("deals", {
  id: text("id").primaryKey(),
  appId: text("app_id").notNull().references(() => apps.id, { onDelete: "cascade" }),
  discountPercent: integer("discount_percent").notNull(),
  code: text("code"),
  url: text("url").notNull(),
  startsAt: integer("starts_at", { mode: "timestamp_ms" }).notNull(),
  endsAt: integer("ends_at", { mode: "timestamp_ms" }).notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
}, (table) => [
  uniqueIndex("deals_app_unique").on(table.appId),
  index("deals_active_window_idx").on(table.startsAt, table.endsAt),
]);

export const mediaAssets = sqliteTable("media_assets", {
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
}, (table) => [
  uniqueIndex("media_assets_storage_key_unique").on(table.storageKey),
  index("media_assets_app_role_idx").on(table.appId, table.role),
  index("media_assets_checksum_idx").on(table.checksum),
]);
