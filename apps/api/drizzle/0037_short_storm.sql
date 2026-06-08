ALTER TABLE "issue_type" ADD COLUMN "cost" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "issue_type" ADD COLUMN "cost_unit" text;--> statement-breakpoint
ALTER TABLE "task" ADD COLUMN "cost_snapshot" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "task" ADD COLUMN "cost_unit_snapshot" text;--> statement-breakpoint
ALTER TABLE "workspace" ADD COLUMN "currency" text DEFAULT 'USD' NOT NULL;