CREATE TABLE "task_assignment" (
	"id" text PRIMARY KEY NOT NULL,
	"task_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"assigned_by" text,
	CONSTRAINT "task_assignment_task_user_unique" UNIQUE("task_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "zone_assignment" (
	"id" text PRIMARY KEY NOT NULL,
	"zone_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" text,
	CONSTRAINT "zone_assignment_zone_user_unique" UNIQUE("zone_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "user_notification_workspace_project" RENAME TO "user_notification_workspace_zone";--> statement-breakpoint
ALTER TABLE "project" RENAME TO "zone";--> statement-breakpoint
ALTER TABLE "asset" RENAME COLUMN "project_id" TO "zone_id";--> statement-breakpoint
ALTER TABLE "column" RENAME COLUMN "project_id" TO "zone_id";--> statement-breakpoint
ALTER TABLE "github_integration" RENAME COLUMN "project_id" TO "zone_id";--> statement-breakpoint
ALTER TABLE "integration" RENAME COLUMN "project_id" TO "zone_id";--> statement-breakpoint
ALTER TABLE "task" RENAME COLUMN "project_id" TO "zone_id";--> statement-breakpoint
ALTER TABLE "user_notification_workspace_zone" RENAME COLUMN "project_id" TO "zone_id";--> statement-breakpoint
ALTER TABLE "user_notification_workspace_rule" RENAME COLUMN "project_mode" TO "zone_mode";--> statement-breakpoint
ALTER TABLE "workflow_rule" RENAME COLUMN "project_id" TO "zone_id";--> statement-breakpoint
ALTER TABLE "github_integration" DROP CONSTRAINT "github_integration_project_id_unique";--> statement-breakpoint
ALTER TABLE "integration" DROP CONSTRAINT "integration_project_type_unique";--> statement-breakpoint
ALTER TABLE "user_notification_workspace_zone" DROP CONSTRAINT "user_notification_workspace_project_workspace_id_project_id_project_workspace_id_id_fk";--> statement-breakpoint
ALTER TABLE "zone" DROP CONSTRAINT "project_workspace_id_id_unique";--> statement-breakpoint
ALTER TABLE "task" DROP CONSTRAINT "task_project_number_unique";--> statement-breakpoint
ALTER TABLE "user_notification_workspace_zone" DROP CONSTRAINT "user_notification_workspace_project_rule_project_unique";--> statement-breakpoint
ALTER TABLE "asset" DROP CONSTRAINT "asset_project_id_project_id_fk";
--> statement-breakpoint
ALTER TABLE "column" DROP CONSTRAINT "column_project_id_project_id_fk";
--> statement-breakpoint
ALTER TABLE "github_integration" DROP CONSTRAINT "github_integration_project_id_project_id_fk";
--> statement-breakpoint
ALTER TABLE "integration" DROP CONSTRAINT "integration_project_id_project_id_fk";
--> statement-breakpoint
ALTER TABLE "zone" DROP CONSTRAINT "project_workspace_id_workspace_id_fk";
--> statement-breakpoint
ALTER TABLE "task" DROP CONSTRAINT "task_project_id_project_id_fk";
--> statement-breakpoint
ALTER TABLE "task" DROP CONSTRAINT "task_assignee_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "user_notification_workspace_zone" DROP CONSTRAINT "user_notification_workspace_project_workspace_id_workspace_id_fk";
--> statement-breakpoint
ALTER TABLE "user_notification_workspace_zone" DROP CONSTRAINT "user_notification_workspace_project_workspace_id_workspace_rule_id_user_notification_workspace_rule_workspace_id_id_fk";
--> statement-breakpoint
-- ALTER TABLE "user_notification_workspace_zone" DROP CONSTRAINT "user_notification_workspace_project_workspace_id_project_id_project_workspace_id_id_fk";
--> statement-breakpoint
ALTER TABLE "workflow_rule" DROP CONSTRAINT "workflow_rule_project_id_project_id_fk";
--> statement-breakpoint
DROP INDEX "asset_projectId_idx";--> statement-breakpoint
DROP INDEX "column_projectId_idx";--> statement-breakpoint
DROP INDEX "integration_projectId_idx";--> statement-breakpoint
DROP INDEX "task_projectId_idx";--> statement-breakpoint
DROP INDEX "user_notification_workspace_project_ruleId_idx";--> statement-breakpoint
DROP INDEX "user_notification_workspace_project_projectId_idx";--> statement-breakpoint
DROP INDEX "workflow_rule_projectId_idx";--> statement-breakpoint
-- ALTER TABLE "notification" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
-- ALTER TABLE "time_entry" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "task_assignment" ADD CONSTRAINT "task_assignment_task_id_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."task"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "task_assignment" ADD CONSTRAINT "task_assignment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "task_assignment" ADD CONSTRAINT "task_assignment_assigned_by_user_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "zone_assignment" ADD CONSTRAINT "zone_assignment_zone_id_zone_id_fk" FOREIGN KEY ("zone_id") REFERENCES "public"."zone"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "zone_assignment" ADD CONSTRAINT "zone_assignment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "zone_assignment" ADD CONSTRAINT "zone_assignment_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "task_assignment_taskId_idx" ON "task_assignment" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "task_assignment_userId_idx" ON "task_assignment" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "task_assignment_role_idx" ON "task_assignment" USING btree ("role");--> statement-breakpoint
CREATE INDEX "zone_assignment_zoneId_idx" ON "zone_assignment" USING btree ("zone_id");--> statement-breakpoint
CREATE INDEX "zone_assignment_userId_idx" ON "zone_assignment" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "asset" ADD CONSTRAINT "asset_zone_id_zone_id_fk" FOREIGN KEY ("zone_id") REFERENCES "public"."zone"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "column" ADD CONSTRAINT "column_zone_id_zone_id_fk" FOREIGN KEY ("zone_id") REFERENCES "public"."zone"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "github_integration" ADD CONSTRAINT "github_integration_zone_id_zone_id_fk" FOREIGN KEY ("zone_id") REFERENCES "public"."zone"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "integration" ADD CONSTRAINT "integration_zone_id_zone_id_fk" FOREIGN KEY ("zone_id") REFERENCES "public"."zone"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "zone" ADD CONSTRAINT "zone_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_zone_id_zone_id_fk" FOREIGN KEY ("zone_id") REFERENCES "public"."zone"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_notification_workspace_zone" ADD CONSTRAINT "user_notification_workspace_zone_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_notification_workspace_zone" ADD CONSTRAINT "user_notification_workspace_zone_workspace_id_workspace_rule_id_user_notification_workspace_rule_workspace_id_id_fk" FOREIGN KEY ("workspace_id","workspace_rule_id") REFERENCES "public"."user_notification_workspace_rule"("workspace_id","id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "zone" ADD CONSTRAINT "zone_workspace_id_id_unique" UNIQUE("workspace_id","id");--> statement-breakpoint
ALTER TABLE "user_notification_workspace_zone" ADD CONSTRAINT "user_notification_workspace_zone_workspace_id_zone_id_zone_workspace_id_id_fk" FOREIGN KEY ("workspace_id","zone_id") REFERENCES "public"."zone"("workspace_id","id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "workflow_rule" ADD CONSTRAINT "workflow_rule_zone_id_zone_id_fk" FOREIGN KEY ("zone_id") REFERENCES "public"."zone"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
-- CREATE INDEX "activity_userId_idx" ON "activity" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "asset_zoneId_idx" ON "asset" USING btree ("zone_id");--> statement-breakpoint
-- CREATE INDEX "asset_createdBy_idx" ON "asset" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "column_zoneId_idx" ON "column" USING btree ("zone_id");--> statement-breakpoint
CREATE INDEX "integration_zoneId_idx" ON "integration" USING btree ("zone_id");--> statement-breakpoint
-- CREATE INDEX "invitation_inviterId_idx" ON "invitation" USING btree ("inviter_id");--> statement-breakpoint
-- CREATE INDEX "notification_userId_idx" ON "notification" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "task_zoneId_idx" ON "task" USING btree ("zone_id");--> statement-breakpoint
-- CREATE INDEX "task_columnId_idx" ON "task" USING btree ("column_id");--> statement-breakpoint
-- CREATE INDEX "time_entry_taskId_idx" ON "time_entry" USING btree ("task_id");--> statement-breakpoint
-- CREATE INDEX "time_entry_userId_idx" ON "time_entry" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_notification_workspace_zone_ruleId_idx" ON "user_notification_workspace_zone" USING btree ("workspace_rule_id");--> statement-breakpoint
CREATE INDEX "user_notification_workspace_zone_zoneId_idx" ON "user_notification_workspace_zone" USING btree ("zone_id");--> statement-breakpoint
CREATE INDEX "user_notification_workspace_zone_workspaceId_zoneId_idx" ON "user_notification_workspace_zone" USING btree ("workspace_id","zone_id");--> statement-breakpoint
-- CREATE INDEX "unwp_workspaceId_workspaceRuleId_idx" ON "user_notification_workspace_zone" USING btree ("workspace_id","workspace_rule_id");--> statement-breakpoint
CREATE INDEX "workflow_rule_zoneId_idx" ON "workflow_rule" USING btree ("zone_id");--> statement-breakpoint
-- CREATE INDEX "workflow_rule_columnId_idx" ON "workflow_rule" USING btree ("column_id");--> statement-breakpoint
ALTER TABLE "task" DROP COLUMN "assignee_id";--> statement-breakpoint
ALTER TABLE "github_integration" ADD CONSTRAINT "github_integration_zone_id_unique" UNIQUE("zone_id");--> statement-breakpoint
ALTER TABLE "integration" ADD CONSTRAINT "integration_zone_type_unique" UNIQUE("zone_id","type");--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_zone_number_unique" UNIQUE("zone_id","number");--> statement-breakpoint
ALTER TABLE "user_notification_workspace_zone" ADD CONSTRAINT "user_notification_workspace_zone_rule_zone_unique" UNIQUE("workspace_rule_id","zone_id");