import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { apps } from "@/db/schema-apps";
import { timestamp } from "@/db/schema-helpers";

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
