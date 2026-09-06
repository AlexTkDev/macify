CREATE TABLE `catalogue_revisions` (
	`id` text PRIMARY KEY NOT NULL,
	`app_id` text,
	`app_slug` text NOT NULL,
	`change_type` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`source_repository` text NOT NULL,
	`source_path` text NOT NULL,
	`source_commit_sha` text NOT NULL,
	`manifest_hash` text NOT NULL,
	`manifest` text,
	`prepared_media` text DEFAULT '[]' NOT NULL,
	`errors` text DEFAULT '[]' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`reviewed_at` integer,
	FOREIGN KEY (`app_id`) REFERENCES `apps`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `catalogue_revisions_commit_path_unique` ON `catalogue_revisions` (`source_commit_sha`,`source_path`);--> statement-breakpoint
CREATE INDEX `catalogue_revisions_status_created_idx` ON `catalogue_revisions` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `catalogue_revisions_app_slug_idx` ON `catalogue_revisions` (`app_slug`,`created_at`);--> statement-breakpoint
CREATE TABLE `deals` (
	`id` text PRIMARY KEY NOT NULL,
	`app_id` text NOT NULL,
	`discount_percent` integer NOT NULL,
	`code` text,
	`url` text NOT NULL,
	`starts_at` integer NOT NULL,
	`ends_at` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`app_id`) REFERENCES `apps`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `deals_app_unique` ON `deals` (`app_id`);--> statement-breakpoint
CREATE INDEX `deals_active_window_idx` ON `deals` (`starts_at`,`ends_at`);--> statement-breakpoint
ALTER TABLE `apps` ADD `is_featured` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `apps` ADD `featured_at` integer;