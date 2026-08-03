CREATE TABLE `app_categories` (
	`app_id` text NOT NULL,
	`category_id` text NOT NULL,
	`is_primary` integer DEFAULT false NOT NULL,
	PRIMARY KEY(`app_id`, `category_id`),
	FOREIGN KEY (`app_id`) REFERENCES `apps`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `app_categories_category_idx` ON `app_categories` (`category_id`,`app_id`);--> statement-breakpoint
CREATE TABLE `app_relationships` (
	`id` text PRIMARY KEY NOT NULL,
	`source_app_id` text NOT NULL,
	`target_app_id` text NOT NULL,
	`relationship_type` text DEFAULT 'related' NOT NULL,
	`confidence` real DEFAULT 1 NOT NULL,
	`origin` text DEFAULT 'manual' NOT NULL,
	`reviewed_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`source_app_id`) REFERENCES `apps`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`target_app_id`) REFERENCES `apps`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_relationships_pair_type_unique` ON `app_relationships` (`source_app_id`,`target_app_id`,`relationship_type`);--> statement-breakpoint
CREATE INDEX `app_relationships_target_idx` ON `app_relationships` (`target_app_id`,`relationship_type`);--> statement-breakpoint
CREATE TABLE `app_tags` (
	`app_id` text NOT NULL,
	`tag_id` text NOT NULL,
	PRIMARY KEY(`app_id`, `tag_id`),
	FOREIGN KEY (`app_id`) REFERENCES `apps`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `app_tags_tag_idx` ON `app_tags` (`tag_id`,`app_id`);--> statement-breakpoint
CREATE TABLE `apps` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`website_url` text NOT NULL,
	`tagline` text NOT NULL,
	`summary` text NOT NULL,
	`description` text NOT NULL,
	`pricing_type` text NOT NULL,
	`pricing_details` text,
	`source_type` text NOT NULL,
	`source_url` text,
	`minimum_macos` text,
	`apple_silicon` integer DEFAULT true NOT NULL,
	`intel` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`editorial_note` text,
	`seo_title` text,
	`seo_description` text,
	`published_at` integer,
	`deleted_at` integer,
	`created_by` text,
	`updated_by` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `apps_slug_unique` ON `apps` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `apps_website_url_unique` ON `apps` (`website_url`);--> statement-breakpoint
CREATE INDEX `apps_status_published_idx` ON `apps` (`status`,`published_at`);--> statement-breakpoint
CREATE INDEX `apps_name_idx` ON `apps` (`name`);--> statement-breakpoint
CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`parent_id` text,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_slug_unique` ON `categories` (`slug`);--> statement-breakpoint
CREATE INDEX `categories_parent_order_idx` ON `categories` (`parent_id`,`sort_order`);--> statement-breakpoint
CREATE TABLE `import_jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`file_name` text NOT NULL,
	`storage_key` text NOT NULL,
	`format` text NOT NULL,
	`status` text DEFAULT 'uploaded' NOT NULL,
	`total_rows` integer DEFAULT 0 NOT NULL,
	`valid_rows` integer DEFAULT 0 NOT NULL,
	`invalid_rows` integer DEFAULT 0 NOT NULL,
	`duplicate_rows` integer DEFAULT 0 NOT NULL,
	`column_mapping` text,
	`error_summary` text,
	`created_by` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`completed_at` integer
);
--> statement-breakpoint
CREATE INDEX `import_jobs_status_created_idx` ON `import_jobs` (`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `import_rows` (
	`id` text PRIMARY KEY NOT NULL,
	`import_job_id` text NOT NULL,
	`row_number` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`source_data` text NOT NULL,
	`normalized_data` text,
	`errors` text,
	`app_id` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`import_job_id`) REFERENCES `import_jobs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`app_id`) REFERENCES `apps`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `import_rows_job_row_unique` ON `import_rows` (`import_job_id`,`row_number`);--> statement-breakpoint
CREATE INDEX `import_rows_job_status_idx` ON `import_rows` (`import_job_id`,`status`);--> statement-breakpoint
CREATE TABLE `media_assets` (
	`id` text PRIMARY KEY NOT NULL,
	`app_id` text,
	`role` text NOT NULL,
	`storage_key` text NOT NULL,
	`mime_type` text NOT NULL,
	`byte_size` integer NOT NULL,
	`width` integer,
	`height` integer,
	`duration_ms` integer,
	`checksum` text NOT NULL,
	`source_url` text,
	`alt_text` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`app_id`) REFERENCES `apps`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `media_assets_storage_key_unique` ON `media_assets` (`storage_key`);--> statement-breakpoint
CREATE INDEX `media_assets_app_role_idx` ON `media_assets` (`app_id`,`role`);--> statement-breakpoint
CREATE INDEX `media_assets_checksum_idx` ON `media_assets` (`checksum`);--> statement-breakpoint
CREATE TABLE `redirects` (
	`id` text PRIMARY KEY NOT NULL,
	`source_path` text NOT NULL,
	`destination_path` text NOT NULL,
	`status_code` integer DEFAULT 308 NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `redirects_source_path_unique` ON `redirects` (`source_path`);--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_slug_unique` ON `tags` (`slug`);