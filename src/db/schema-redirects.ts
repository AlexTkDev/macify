import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { timestamp } from "@/db/schema-helpers";

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
