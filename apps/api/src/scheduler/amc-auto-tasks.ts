import db from "../database";
import { amcAutoTaskTable } from "../database/schema";
import resolveZoneForSite from "../site/controllers/resolve-zone";
import createTask from "../task/controllers/create-task";
import { computePeriodKey } from "../utils/amc-year";

export async function createAmcAutoTasks(): Promise<void> {
  const now = new Date();

  const activeAmcs = await db.query.amcTable.findMany({
    where: (t, { and: and_, eq: eq_, lte: lte_ }) =>
      and_(eq_(t.status, "active"), lte_(t.startDate, now)),
    with: {
      site: { columns: { id: true, workspaceId: true, name: true } },
      services: {
        with: {
          serviceMaster: { columns: { id: true, name: true } },
        },
      },
    },
  });

  for (const amc of activeAmcs) {
    // Skip if AMC has not started yet or has expired
    if (now < amc.startDate || now > amc.endDate) continue;

    for (const service of amc.services) {
      const periodKey = computePeriodKey(now, service.frequency);

      // Check if auto-task already created for this period
      const existing = await db.query.amcAutoTaskTable.findFirst({
        where: (t, { and: and_, eq: eq_ }) =>
          and_(eq_(t.amcServiceId, service.id), eq_(t.periodKey, periodKey)),
        columns: { id: true },
      });

      if (existing) continue;

      // Resolve the zone for this site via geospatial lookup
      const zoneResult = await resolveZoneForSite(
        amc.siteId,
        amc.site.workspaceId,
      );

      if (!zoneResult.zoneId) {
        console.warn(
          `[AMC auto-task] No zone found for site ${amc.siteId} (${zoneResult.reason}), skipping.`,
        );
        continue;
      }

      // Find workspace owner to act as task creator
      const owner = await db.query.workspaceUserTable.findFirst({
        where: (t, { and: and_, eq: eq_ }) =>
          and_(eq_(t.workspaceId, amc.site.workspaceId), eq_(t.role, "owner")),
        columns: { userId: true },
      });

      if (!owner) continue;

      const taskTitle = `[AMC] ${service.serviceMaster.name} — ${periodKey}`;

      let createdTaskResult: Awaited<ReturnType<typeof createTask>>;
      try {
        createdTaskResult = await createTask({
          zoneId: zoneResult.zoneId,
          currentUserId: owner.userId,
          title: taskTitle,
          status: "to-do",
          siteId: amc.siteId,
          amcServiceId: service.id,
        });
      } catch (err) {
        console.error(
          `[AMC auto-task] Failed to create task for service ${service.id}, period ${periodKey}:`,
          err,
        );
        continue;
      }

      // Record the auto-task to prevent duplicates
      await db
        .insert(amcAutoTaskTable)
        .values({
          amcServiceId: service.id,
          periodKey,
          taskId: createdTaskResult.id,
        })
        .onConflictDoNothing();
    }
  }
}
