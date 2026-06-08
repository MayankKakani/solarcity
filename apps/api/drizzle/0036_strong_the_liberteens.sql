ALTER TABLE "label" ADD COLUMN "site_id" text;--> statement-breakpoint
ALTER TABLE "label" ADD COLUMN "contact_id" text;--> statement-breakpoint
ALTER TABLE "label" ADD CONSTRAINT "label_site_id_site_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."site"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "label" ADD CONSTRAINT "label_contact_id_site_contact_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."site_contact"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "label_site_id_idx" ON "label" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX "label_contact_id_idx" ON "label" USING btree ("contact_id");--> statement-breakpoint
ALTER TABLE "label" ADD CONSTRAINT "label_site_name_unique" UNIQUE("site_id","name");--> statement-breakpoint
ALTER TABLE "label" ADD CONSTRAINT "label_contact_name_unique" UNIQUE("contact_id","name");