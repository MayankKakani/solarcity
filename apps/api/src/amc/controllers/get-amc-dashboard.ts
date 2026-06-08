import { count, eq, sum } from "drizzle-orm";
import db from "../../database";
import {
  amcServiceTable,
  amcTable,
  siteTable,
  taskTable,
} from "../../database/schema";

async function getAmcDashboard(workspaceId: string) {
  const amcsResult = await db
    .select({
      id: amcTable.id,
      siteId: amcTable.siteId,
      siteName: siteTable.name,
      siteCode: siteTable.siteCode,
      bundleId: amcTable.bundleId,
      startDate: amcTable.startDate,
      endDate: amcTable.endDate,
      durationYears: amcTable.durationYears,
      status: amcTable.status,
      contractReference: amcTable.contractReference,
      notes: amcTable.notes,
      createdAt: amcTable.createdAt,
    })
    .from(amcTable)
    .innerJoin(siteTable, eq(amcTable.siteId, siteTable.id))
    .where(eq(siteTable.workspaceId, workspaceId))
    .orderBy(siteTable.name);

  if (amcsResult.length === 0) return [];

  // Sum of service prices per AMC (all AMCs, filter in memory)
  const valueRows = await db
    .select({
      amcId: amcServiceTable.amcId,
      totalValue: sum(amcServiceTable.price),
    })
    .from(amcServiceTable)
    .groupBy(amcServiceTable.amcId);

  const valueMap = new Map<string, number>();
  for (const row of valueRows) {
    valueMap.set(row.amcId, Number(row.totalValue ?? 0));
  }

  // Sum of annualLimit per AMC (= total expected visits per year)
  const limitRows = await db
    .select({
      amcId: amcServiceTable.amcId,
      totalLimit: sum(amcServiceTable.annualLimit),
    })
    .from(amcServiceTable)
    .groupBy(amcServiceTable.amcId);

  const limitMap = new Map<string, number>();
  for (const row of limitRows) {
    limitMap.set(row.amcId, Number(row.totalLimit ?? 0));
  }

  // Completed (done) tasks per AMC
  const completedRows = await db
    .select({ amcId: amcServiceTable.amcId, completedCount: count() })
    .from(taskTable)
    .innerJoin(amcServiceTable, eq(taskTable.amcServiceId, amcServiceTable.id))
    .where(eq(taskTable.status, "done"))
    .groupBy(amcServiceTable.amcId);

  const completedMap = new Map<string, number>();
  for (const row of completedRows) {
    completedMap.set(row.amcId, Number(row.completedCount ?? 0));
  }

  const now = new Date();

  return amcsResult.map((amc) => {
    const daysToExpiry =
      amc.status === "active"
        ? Math.ceil(
            (new Date(amc.endDate).getTime() - now.getTime()) /
              (1000 * 60 * 60 * 24),
          )
        : null;

    return {
      ...amc,
      totalValue: valueMap.get(amc.id) ?? 0,
      visitsTotalLimit: limitMap.get(amc.id) ?? 0,
      visitsCompleted: completedMap.get(amc.id) ?? 0,
      daysToExpiry,
      expiryUrgency:
        daysToExpiry === null
          ? "none"
          : daysToExpiry <= 7
            ? "critical"
            : daysToExpiry <= 30
              ? "warning"
              : "ok",
    };
  });
}

export default getAmcDashboard;
