ALTER TABLE "issue_type" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "issue_type" CASCADE;--> statement-breakpoint
ALTER TABLE "task" RENAME COLUMN "issue_type_id" TO "service_master_id";--> statement-breakpoint
ALTER TABLE "task" DROP CONSTRAINT "task_issue_type_id_issue_type_id_fk";
--> statement-breakpoint
ALTER TABLE "service_master" ADD COLUMN "is_active" boolean NOT NULL;--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_service_master_id_service_master_id_fk" FOREIGN KEY ("service_master_id") REFERENCES "public"."service_master"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "service_master" DROP COLUMN "labels";