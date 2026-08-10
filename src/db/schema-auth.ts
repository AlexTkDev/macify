import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const adminLoginAttempts = sqliteTable("admin_login_attempts", {
  id: text("id").primaryKey(),
  attempts: integer("attempts").notNull().default(0),
  expiresAt: integer("expires_at").notNull(),
}, (table) => [index("admin_login_attempts_expires_idx").on(table.expiresAt)]);
