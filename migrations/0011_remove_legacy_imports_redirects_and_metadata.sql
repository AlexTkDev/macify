DROP TABLE `import_rows`;--> statement-breakpoint
DROP TABLE `import_jobs`;--> statement-breakpoint
DROP TABLE `redirects`;--> statement-breakpoint
DROP INDEX `app_relationships_pair_type_unique`;--> statement-breakpoint
DROP INDEX `app_relationships_target_idx`;--> statement-breakpoint
CREATE UNIQUE INDEX `app_relationships_pair_unique` ON `app_relationships` (`source_app_id`,`target_app_id`);--> statement-breakpoint
CREATE INDEX `app_relationships_target_idx` ON `app_relationships` (`target_app_id`);--> statement-breakpoint
ALTER TABLE `app_relationships` DROP COLUMN `relationship_type`;--> statement-breakpoint
ALTER TABLE `app_relationships` DROP COLUMN `confidence`;--> statement-breakpoint
ALTER TABLE `app_relationships` DROP COLUMN `origin`;--> statement-breakpoint
ALTER TABLE `app_relationships` DROP COLUMN `reviewed_at`;--> statement-breakpoint
ALTER TABLE `apps` DROP COLUMN `editorial_note`;--> statement-breakpoint
ALTER TABLE `apps` DROP COLUMN `seo_title`;--> statement-breakpoint
ALTER TABLE `apps` DROP COLUMN `seo_description`;--> statement-breakpoint
ALTER TABLE `apps` DROP COLUMN `created_by`;--> statement-breakpoint
ALTER TABLE `apps` DROP COLUMN `updated_by`;--> statement-breakpoint
ALTER TABLE `media_assets` DROP COLUMN `duration_ms`;
