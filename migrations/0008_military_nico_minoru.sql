ALTER TABLE `app_tags` RENAME TO `app_categories`;--> statement-breakpoint
ALTER TABLE `tags` RENAME TO `categories`;--> statement-breakpoint
ALTER TABLE `app_categories` RENAME COLUMN "tag_id" TO "category_id";--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_app_categories` (
	`app_id` text NOT NULL,
	`category_id` text NOT NULL,
	PRIMARY KEY(`app_id`, `category_id`),
	FOREIGN KEY (`app_id`) REFERENCES `apps`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_app_categories`("app_id", "category_id") SELECT "app_id", "category_id" FROM `app_categories`;--> statement-breakpoint
DROP TABLE `app_categories`;--> statement-breakpoint
ALTER TABLE `__new_app_categories` RENAME TO `app_categories`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `app_categories_category_idx` ON `app_categories` (`category_id`,`app_id`);--> statement-breakpoint
DROP INDEX `tags_slug_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `categories_slug_unique` ON `categories` (`slug`);