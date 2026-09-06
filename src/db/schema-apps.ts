import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { timestamp } from "@/db/schema-helpers";

export const apps = sqliteTable(
  "apps",
  {
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
    featuredAt: integer("featured_at", { mode: "timestamp_ms" }),
    publishedAt: integer("published_at", { mode: "timestamp_ms" }),
    deletedAt: integer("deleted_at", { mode: "timestamp_ms" }),
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
