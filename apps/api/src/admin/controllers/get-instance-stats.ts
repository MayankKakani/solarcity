import { count, eq } from "drizzle-orm";
import db, { schema } from "../../database";

export type InstanceStats = {
  organisationCount: number;
  userCount: number;
  zoneCount: number;
  taskCount: number;
  siteCount: number;
  activeAmcCount: number;
};

async function getInstanceStats(): Promise<InstanceStats> {
  const [[organisations], [users], [zones], [tasks], [sites], [activeAmcs]] =
    await Promise.all([
      db.select({ value: count() }).from(schema.workspaceTable),
      db.select({ value: count() }).from(schema.userTable),
      db.select({ value: count() }).from(schema.zoneTable),
      db.select({ value: count() }).from(schema.taskTable),
      db.select({ value: count() }).from(schema.siteTable),
      db
        .select({ value: count() })
        .from(schema.amcTable)
        .where(eq(schema.amcTable.status, "active")),
    ]);

  return {
    organisationCount: organisations?.value ?? 0,
    userCount: users?.value ?? 0,
    zoneCount: zones?.value ?? 0,
    taskCount: tasks?.value ?? 0,
    siteCount: sites?.value ?? 0,
    activeAmcCount: activeAmcs?.value ?? 0,
  };
}

export default getInstanceStats;
