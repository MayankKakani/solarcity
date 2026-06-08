-- Step 1: drop old FK and index on task.issue_type_id
ALTER TABLE "task" DROP CONSTRAINT IF EXISTS "task_issue_type_id_issue_type_id_fk";
DROP INDEX IF EXISTS "task_issueTypeId_idx";

-- Step 2: rename column
ALTER TABLE "task" RENAME COLUMN "issue_type_id" TO "service_master_id";

-- Step 3: add new FK pointing at service_master
ALTER TABLE "task" ADD CONSTRAINT "task_service_master_id_service_master_id_fk"
  FOREIGN KEY ("service_master_id") REFERENCES "public"."service_master"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Step 4: recreate index under new name
CREATE INDEX "task_serviceMasterId_idx" ON "task" ("service_master_id");

-- Step 5: drop the issue_type table (tasks no longer reference it)
DROP TABLE IF EXISTS "issue_type";
