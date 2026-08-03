import { sql } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

const timestamp = (name: string) =>
  integer(name, { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`);

export const apps = sqliteTable(
  "apps",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    websiteUrl: text("website_url").notNull(),
    tagline: text("tagline").notNull(),
    description: text("description").notNull(),
    pricingType: text("pricing_type", {
      enum: ["free", "freemium", "paid"],
    }).notNull(),
    billingType: text("billing_type", { enum: ["one_time", "subscription"] }),
    pricingDetails: text("pricing_details"),
    sourceType: text("source_type", { enum: ["open_source", "closed_source"] }).notNull(),
    youtubeUrl: text("youtube_url"),
    appleSilicon: integer("apple_silicon", { mode: "boolean" }).notNull().default(true),
    intel: integer("intel", { mode: "boolean" }).notNull().default(false),
    status: text("status", { enum: ["draft", "published", "archived"] })
      .notNull()
      .default("draft"),
    editorialNote: text("editorial_note"),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    publishedAt: integer("published_at", { mode: "timestamp_ms" }),
    deletedAt: integer("deleted_at", { mode: "timestamp_ms" }),
    createdBy: text("created_by"),
    updatedBy: text("updated_by"),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
  },
  (table) => [
    uniqueIndex("apps_slug_unique").on(table.slug),
    uniqueIndex("apps_website_url_unique").on(table.websiteUrl),
    index("apps_status_published_idx").on(table.status, table.publishedAt),
    index("apps_name_idx").on(table.name),
  ],
);

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
    durationMs: integer("duration_ms"),
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

export const appRelationships = sqliteTable(
  "app_relationships",
  {
    id: text("id").primaryKey(),
    sourceAppId: text("source_app_id").notNull().references(() => apps.id, { onDelete: "cascade" }),
    targetAppId: text("target_app_id").notNull().references(() => apps.id, { onDelete: "cascade" }),
    relationshipType: text("relationship_type").notNull().default("related"),
    confidence: real("confidence").notNull().default(1),
    origin: text("origin").notNull().default("manual"),
    reviewedAt: integer("reviewed_at", { mode: "timestamp_ms" }),
    createdAt: timestamp("created_at"),
  },
  (table) => [
    uniqueIndex("app_relationships_pair_type_unique").on(
      table.sourceAppId,
      table.targetAppId,
      table.relationshipType,
    ),
    index("app_relationships_target_idx").on(table.targetAppId, table.relationshipType),
  ],
);

export const importJobs = sqliteTable(
  "import_jobs",
  {
    id: text("id").primaryKey(),
    fileName: text("file_name").notNull(),
    storageKey: text("storage_key").notNull(),
    format: text("format").notNull(),
    status: text("status").notNull().default("uploaded"),
    totalRows: integer("total_rows").notNull().default(0),
    validRows: integer("valid_rows").notNull().default(0),
    invalidRows: integer("invalid_rows").notNull().default(0),
    duplicateRows: integer("duplicate_rows").notNull().default(0),
    columnMapping: text("column_mapping", { mode: "json" }),
    errorSummary: text("error_summary", { mode: "json" }),
    createdBy: text("created_by"),
    createdAt: timestamp("created_at"),
    completedAt: integer("completed_at", { mode: "timestamp_ms" }),
  },
  (table) => [index("import_jobs_status_created_idx").on(table.status, table.createdAt)],
);

export const importRows = sqliteTable(
  "import_rows",
  {
    id: text("id").primaryKey(),
    importJobId: text("import_job_id").notNull().references(() => importJobs.id, { onDelete: "cascade" }),
    rowNumber: integer("row_number").notNull(),
    status: text("status").notNull().default("pending"),
    sourceData: text("source_data", { mode: "json" }).notNull(),
    normalizedData: text("normalized_data", { mode: "json" }),
    errors: text("errors", { mode: "json" }),
    appId: text("app_id").references(() => apps.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at"),
  },
  (table) => [
    uniqueIndex("import_rows_job_row_unique").on(table.importJobId, table.rowNumber),
    index("import_rows_job_status_idx").on(table.importJobId, table.status),
  ],
);

export const redirects = sqliteTable(
  "redirects",
  {
    id: text("id").primaryKey(),
    sourcePath: text("source_path").notNull(),
    destinationPath: text("destination_path").notNull(),
    statusCode: integer("status_code").notNull().default(308),
    createdAt: timestamp("created_at"),
  },
  (table) => [uniqueIndex("redirects_source_path_unique").on(table.sourcePath)],
);
