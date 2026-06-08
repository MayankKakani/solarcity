CREATE EXTENSION IF NOT EXISTS postgis;
--> statement-breakpoint
CREATE TABLE "issue_type" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "issue_type_workspace_name_unique" UNIQUE("workspace_id","name")
);
--> statement-breakpoint
CREATE TABLE "site_contact" (
	"id" text PRIMARY KEY NOT NULL,
	"site_id" text NOT NULL,
	"name" text NOT NULL,
	"role" text DEFAULT 'caretaker' NOT NULL,
	"phone" text,
	"email" text,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"site_code" text NOT NULL,
	"site_type" text DEFAULT 'commercial' NOT NULL,
	"location" geometry,
	"address" text,
	"system_capacity_kwp" numeric(10, 2),
	"installation_date" date,
	"panel_count" integer,
	"inverter_model" text,
	"grid_connection_type" text DEFAULT 'on_grid',
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "site_workspace_code_unique" UNIQUE("workspace_id","site_code")
);
--> statement-breakpoint
ALTER TABLE "task" ADD COLUMN "site_id" text;--> statement-breakpoint
ALTER TABLE "task" ADD COLUMN "site_contact_id" text;--> statement-breakpoint
ALTER TABLE "task" ADD COLUMN "raised_by_executive_id" text;--> statement-breakpoint
ALTER TABLE "task" ADD COLUMN "issue_type_id" text;--> statement-breakpoint
ALTER TABLE "zone" ADD COLUMN "bounding_box" geometry;--> statement-breakpoint
ALTER TABLE "issue_type" ADD CONSTRAINT "issue_type_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "site_contact" ADD CONSTRAINT "site_contact_site_id_site_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."site"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "site" ADD CONSTRAINT "site_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "issue_type_workspaceId_idx" ON "issue_type" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "site_contact_siteId_idx" ON "site_contact" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX "site_workspaceId_idx" ON "site" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "site_siteCode_idx" ON "site" USING btree ("site_code");--> statement-breakpoint
CREATE INDEX "site_location_gist_idx" ON "site" USING gist ("location");--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_site_id_site_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."site"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_site_contact_id_site_contact_id_fk" FOREIGN KEY ("site_contact_id") REFERENCES "public"."site_contact"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_raised_by_executive_id_user_id_fk" FOREIGN KEY ("raised_by_executive_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_issue_type_id_issue_type_id_fk" FOREIGN KEY ("issue_type_id") REFERENCES "public"."issue_type"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "task_siteId_idx" ON "task" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX "zone_boundingBox_gist_idx" ON "zone" USING gist ("bounding_box");