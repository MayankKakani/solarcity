CREATE TABLE "amc_auto_task" (
	"id" text PRIMARY KEY NOT NULL,
	"amc_service_id" text NOT NULL,
	"period_key" text NOT NULL,
	"task_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "amc_bundle_service" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"bundle_id" text NOT NULL,
	"service_master_id" text NOT NULL,
	"frequency" text NOT NULL,
	"annual_limit" integer NOT NULL,
	"price" numeric(12, 2) NOT NULL,
	"price_unit" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "amc_bundle_service_unique" UNIQUE("bundle_id","service_master_id")
);
--> statement-breakpoint
CREATE TABLE "amc_bundle" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "amc_renewal_reminder_sent" (
	"id" text PRIMARY KEY NOT NULL,
	"amc_id" text NOT NULL,
	"reminder_type" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "amc_service" (
	"id" text PRIMARY KEY NOT NULL,
	"amc_id" text NOT NULL,
	"service_master_id" text NOT NULL,
	"frequency" text NOT NULL,
	"annual_limit" integer NOT NULL,
	"price" numeric(12, 2) NOT NULL,
	"price_unit" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "amc" (
	"id" text PRIMARY KEY NOT NULL,
	"site_id" text NOT NULL,
	"bundle_id" text,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"duration_years" integer DEFAULT 1 NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"contract_reference" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_master" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"default_price" numeric(12, 2),
	"currency" text,
	"labels" text[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "task" ADD COLUMN "amc_service_id" text;--> statement-breakpoint
ALTER TABLE "task" ADD COLUMN "out_of_amc" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "amc_auto_task" ADD CONSTRAINT "amc_auto_task_amc_service_id_amc_service_id_fk" FOREIGN KEY ("amc_service_id") REFERENCES "public"."amc_service"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "amc_auto_task" ADD CONSTRAINT "amc_auto_task_task_id_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."task"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "amc_bundle_service" ADD CONSTRAINT "amc_bundle_service_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "amc_bundle_service" ADD CONSTRAINT "amc_bundle_service_bundle_id_amc_bundle_id_fk" FOREIGN KEY ("bundle_id") REFERENCES "public"."amc_bundle"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "amc_bundle_service" ADD CONSTRAINT "amc_bundle_service_service_master_id_service_master_id_fk" FOREIGN KEY ("service_master_id") REFERENCES "public"."service_master"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "amc_bundle" ADD CONSTRAINT "amc_bundle_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "amc_renewal_reminder_sent" ADD CONSTRAINT "amc_renewal_reminder_sent_amc_id_amc_id_fk" FOREIGN KEY ("amc_id") REFERENCES "public"."amc"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "amc_service" ADD CONSTRAINT "amc_service_amc_id_amc_id_fk" FOREIGN KEY ("amc_id") REFERENCES "public"."amc"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "amc_service" ADD CONSTRAINT "amc_service_service_master_id_service_master_id_fk" FOREIGN KEY ("service_master_id") REFERENCES "public"."service_master"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "amc" ADD CONSTRAINT "amc_site_id_site_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."site"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "amc" ADD CONSTRAINT "amc_bundle_id_amc_bundle_id_fk" FOREIGN KEY ("bundle_id") REFERENCES "public"."amc_bundle"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "service_master" ADD CONSTRAINT "service_master_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "amc_auto_task_unique" ON "amc_auto_task" USING btree ("amc_service_id","period_key");--> statement-breakpoint
CREATE INDEX "amc_bundle_service_bundleId_idx" ON "amc_bundle_service" USING btree ("bundle_id");--> statement-breakpoint
CREATE INDEX "amc_bundle_workspaceId_idx" ON "amc_bundle" USING btree ("workspace_id");--> statement-breakpoint
CREATE UNIQUE INDEX "amc_renewal_reminder_unique" ON "amc_renewal_reminder_sent" USING btree ("amc_id","reminder_type");--> statement-breakpoint
CREATE INDEX "amc_service_amcId_idx" ON "amc_service" USING btree ("amc_id");--> statement-breakpoint
CREATE INDEX "amc_siteId_idx" ON "amc" USING btree ("site_id");--> statement-breakpoint
CREATE UNIQUE INDEX "amc_site_active_unique" ON "amc" USING btree ("site_id") WHERE "amc"."status" = 'active';--> statement-breakpoint
CREATE INDEX "service_master_workspaceId_idx" ON "service_master" USING btree ("workspace_id");--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_amc_service_id_amc_service_id_fk" FOREIGN KEY ("amc_service_id") REFERENCES "public"."amc_service"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "task_amcServiceId_idx" ON "task" USING btree ("amc_service_id");