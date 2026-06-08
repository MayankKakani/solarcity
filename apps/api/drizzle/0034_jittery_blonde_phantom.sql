ALTER TABLE "invitation" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "invitation" ALTER COLUMN "role" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "invitation" ADD COLUMN "phone_number" text NOT NULL;--> statement-breakpoint
ALTER TABLE "invitation" ADD COLUMN "zone_ids" text NOT NULL;