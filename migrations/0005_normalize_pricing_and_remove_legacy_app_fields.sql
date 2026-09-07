ALTER TABLE `apps` ADD `billing_type` text;--> statement-breakpoint
UPDATE `apps`
SET `billing_type` = CASE
  WHEN `pricing_type` = 'paid_once' THEN 'one_time'
  WHEN `pricing_type` IN ('subscription', 'enterprise', 'freemium') THEN 'subscription'
  ELSE NULL
END;--> statement-breakpoint
UPDATE `apps`
SET `pricing_type` = CASE
  WHEN `pricing_type` IN ('paid_once', 'subscription', 'enterprise') THEN 'paid'
  WHEN `pricing_type` = 'open_source' THEN 'free'
  ELSE `pricing_type`
END;--> statement-breakpoint
ALTER TABLE `apps` DROP COLUMN `summary`;--> statement-breakpoint
ALTER TABLE `apps` DROP COLUMN `source_url`;--> statement-breakpoint
ALTER TABLE `apps` DROP COLUMN `minimum_macos`;
